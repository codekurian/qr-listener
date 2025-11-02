# Unified Docker Architecture
## QR Listener + Content Publisher on Same Setup

---

## ✅ **Yes, Both Applications Can Share the Same Docker Setup!**

This document shows how to integrate both applications efficiently.

---

## 🏗️ **Recommended Architecture**

### **Option 1: Shared Infrastructure (Recommended)**

```
┌──────────────────────────────────────────────────────────────┐
│                    graceshoppee.tech                        │
│                      (Single Domain)                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │                    Nginx                            │   │
│  │              (Port 8080/8443)                       │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │ Routes:                                       │  │   │
│  │  │ /api/qr/*      → QR Backend                   │  │   │
│  │  │ /api/content/* → Content Backend             │  │   │
│  │  │ /admin         → QR Frontend (Admin)          │  │   │
│  │  │ /p/*           → Content Frontend (Public)   │  │   │
│  │  │ /              → QR Frontend (Dashboard)     │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────┘   │
│         │                    │                    │          │
│  ┌──────┴──────┐    ┌────────┴────────┐   ┌──────┴──────┐  │
│  │QR Frontend  │    │Content Frontend │   │    Nginx    │  │
│  │(Port 3000)  │    │  (Port 3001)    │   │            │  │
│  └─────────────┘    └─────────────────┘   └────────────┘  │
│         │                    │                             │
│  ┌──────┴──────────┐  ┌──────┴──────────┐                 │
│  │QR Backend       │  │Content Backend  │                 │
│  │(Port 8080)      │  │(Port 8082)      │                 │
│  └─────────────────┘  └─────────────────┘                 │
│         │                    │                             │
│         └─────────┬──────────┘                             │
│                   │                                        │
│  ┌────────────────┴────────────────┐                       │
│  │        PostgreSQL               │                       │
│  │    (Port 5432)                  │                       │
│  │  ┌────────────┬─────────────┐   │                       │
│  │  │qr_listener │content_pub  │   │                       │
│  │  │_prod       │_prod        │   │                       │
│  │  └────────────┴─────────────┘   │                       │
│  └─────────────────────────────────┘                       │
│                                                              │
│  ┌────────────────────────────────┐                         │
│  │         Redis                  │                         │
│  │      (Port 6379)               │                         │
│  └────────────────────────────────┘                         │
│                                                              │
│  ┌────────────────────────────────┐                         │
│  │   Image Storage Volume         │                         │
│  │   (Content Publisher images)    │                         │
│  └────────────────────────────────┘                         │
└──────────────────────────────────────────────────────────────┘
```

---

## 📝 **Updated Docker Compose Configuration**

```yaml
version: '3.8'

services:
  # Shared Database
  db:
    image: postgres:15-alpine
    container_name: qr-listener-postgres-prod
    environment:
      POSTGRES_DB: qr_listener_prod
      POSTGRES_USER: qr_user_prod
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db-prod.sql:/docker-entrypoint-initdb.d/init-db-prod.sql
      - ./scripts/init-content-db.sql:/docker-entrypoint-initdb.d/init-content-db.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # Shared Redis
  redis:
    image: redis:7-alpine
    container_name: qr-listener-redis-prod
    ports:
      - "6379:6379"
    restart: unless-stopped

  # QR Listener Backend
  qr-backend:
    image: openjdk:17-jdk-slim
    container_name: qr-listener-backend-prod
    working_dir: /app
    command: sh -c "apt-get update && apt-get install -y maven && mvn clean package -DskipTests && java -Xmx512m -Xms256m -jar target/qr-listener-backend-1.0.0.jar --spring.profiles.active=prod"
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/qr_listener_prod
      SPRING_DATASOURCE_USERNAME: qr_user_prod
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      SPRING_REDIS_HOST: redis
      SPRING_REDIS_PORT: 6379
      SERVER_PORT: 8080
    ports:
      - "8081:8080"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    volumes:
      - ./backend/qr-listener-backend:/app
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  # Content Publisher Backend
  content-backend:
    image: openjdk:17-jdk-slim
    container_name: content-publisher-backend-prod
    working_dir: /app
    command: sh -c "apt-get update && apt-get install -y maven && mvn clean package -DskipTests && java -Xmx512m -Xms256m -jar target/content-publisher-backend-1.0.0.jar --spring.profiles.active=prod"
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/content_pub_prod
      SPRING_DATASOURCE_USERNAME: qr_user_prod
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      SPRING_REDIS_HOST: redis
      SPRING_REDIS_PORT: 6379
      SERVER_PORT: 8082
      IMAGE_STORAGE_PATH: /app/images
    ports:
      - "8082:8082"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    volumes:
      - ./backend/content-publisher-backend:/app
      - content_images:/app/images
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  # QR Listener Frontend (Admin Panel)
  qr-frontend:
    image: node:18-alpine
    container_name: qr-listener-frontend-prod
    working_dir: /app
    command: sh -c "npm install && npm run build && npm start"
    environment:
      NEXT_PUBLIC_API_BASE_URL: http://graceshoppee.tech:8080
      PORT: 3000
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - qr-backend
    restart: unless-stopped
    volumes:
      - ./frontend:/app

  # Content Publisher Frontend
  content-frontend:
    image: node:18-alpine
    container_name: content-publisher-frontend-prod
    working_dir: /app
    command: sh -c "npm install && npm run build && npm start"
    environment:
      NEXT_PUBLIC_API_BASE_URL: http://graceshoppee.tech:8080
      NEXT_PUBLIC_CONTENT_API_URL: http://graceshoppee.tech:8080/api/content
      PORT: 3001
      NODE_ENV: production
    ports:
      - "3001:3001"
    depends_on:
      - content-backend
    restart: unless-stopped
    volumes:
      - ./content-publisher-frontend:/app

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: qr-listener-nginx-prod
    volumes:
      - ./nginx-config.conf:/etc/nginx/conf.d/default.conf:ro
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
      - content_images:/usr/share/nginx/html/images:ro
    ports:
      - "8080:80"
      - "8443:443"
    depends_on:
      - qr-frontend
      - content-frontend
      - qr-backend
      - content-backend
    restart: unless-stopped

  # SSL Certificates
  certbot:
    image: certbot/certbot
    container_name: qr-listener-certbot-prod
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    command: certonly --webroot -w /var/www/certbot --email ${CERTBOT_EMAIL} --agree-tos --no-eff-email -d ${DOMAIN} -d ${WWW_DOMAIN}
    depends_on:
      nginx:
        condition: service_started

volumes:
  postgres_data:
    name: qr_listener_postgres_data
  content_images:
    name: content_publisher_images
```

---

## 🌐 **Nginx Routing Configuration**

```nginx
server {
    listen 80;
    server_name graceshoppee.tech www.graceshoppee.tech localhost;

    # Increase timeouts
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
    send_timeout 300s;

    # QR Listener API
    location /api/qr/ {
        proxy_pass http://qr-backend:8080/api/qr/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }

    # QR Listener Admin API
    location /api/admin/ {
        proxy_pass http://qr-backend:8080/api/admin/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }

    # Content Publisher API
    location /api/content/ {
        proxy_pass http://content-backend:8082/api/content/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        
        # For file uploads
        client_max_body_size 50M;
        proxy_request_buffering off;
    }

    # Content Publisher Admin API
    location /api/content-admin/ {
        proxy_pass http://content-backend:8082/api/content-admin/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }

    # Static images for Content Publisher
    location /images/ {
        alias /usr/share/nginx/html/images/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Content Publisher Public Pages (e.g., /p/john-jane-doe)
    location /p/ {
        proxy_pass http://content-frontend:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Support Next.js dynamic routes
        proxy_cache_bypass $http_upgrade;
    }

    # Content Publisher Admin (e.g., /content-admin)
    location /content-admin/ {
        proxy_pass http://content-frontend:3001/content-admin;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # QR Listener Admin (e.g., /admin, /dashboard)
    location ~ ^/(admin|dashboard|generate|qr-codes|analytics|settings) {
        proxy_pass http://qr-frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Support Next.js dynamic routes
        proxy_cache_bypass $http_upgrade;
    }

    # Default: QR Listener Frontend
    location / {
        proxy_pass http://qr-frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Support Next.js dynamic routes
        proxy_cache_bypass $http_upgrade;
    }

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Favicon
    location = /favicon.ico {
        access_log off;
        log_not_found off;
    }
}
```

---

## 📊 **Database Schema Strategy**

### **Option A: Separate Databases (Recommended)**
- `qr_listener_prod` - QR codes, redirects, logs
- `content_pub_prod` - Publications, photos, stories

### **Option B: Shared Database with Schemas**
- Single database with separate schemas:
  - `qr_listener` schema
  - `content_publisher` schema

### **Database Initialization Script**

```sql
-- scripts/init-content-db.sql
-- Create database for Content Publisher
CREATE DATABASE content_pub_prod;

-- Connect to new database
\c content_pub_prod;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Publications table
CREATE TABLE IF NOT EXISTS publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(500),
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('single', 'couple', 'family')),
    story TEXT,
    cover_image_url VARCHAR(1000),
    special_date DATE,
    published BOOLEAN DEFAULT false,
    password_protected BOOLEAN DEFAULT false,
    password_hash VARCHAR(255),
    view_count INT DEFAULT 0,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    file_path VARCHAR(1000) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    width INT,
    height INT,
    is_cover BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Publication tags (many-to-many)
CREATE TABLE IF NOT EXISTS publication_tags (
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (publication_id, tag_id)
);

-- Analytics table
CREATE TABLE IF NOT EXISTS publication_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    view_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer VARCHAR(500)
);

-- Indexes
CREATE INDEX idx_publications_slug ON publications(slug);
CREATE INDEX idx_publications_published ON publications(published);
CREATE INDEX idx_photos_publication ON photos(publication_id);
CREATE INDEX idx_photos_cover ON photos(publication_id, is_cover);
CREATE INDEX idx_analytics_publication ON publication_analytics(publication_id);
CREATE INDEX idx_analytics_date ON publication_analytics(view_date);
```

---

## 🗂️ **Directory Structure**

```
qr-listener-docker/
├── backend/
│   ├── qr-listener-backend/       # Existing QR backend
│   └── content-publisher-backend/ # New Content backend
├── frontend/
│   ├── qr-listener-admin/          # Existing QR admin
│   └── content-publisher/          # New Content frontend
├── scripts/
│   ├── init-db-prod.sql           # QR database init
│   └── init-content-db.sql        # Content database init
├── docker-compose.yml              # Unified compose file
├── nginx-config.conf               # Updated routing
└── .env                            # Environment variables
```

---

## 🔑 **Key Benefits**

### ✅ **Advantages:**
1. **Shared Infrastructure**
   - One database server
   - One Redis instance
   - One Nginx reverse proxy
   - Reduced resource usage

2. **Single Deployment**
   - One `docker-compose up` command
   - Unified logging
   - Easier monitoring

3. **Cost Effective**
   - Less memory/CPU usage
   - Single SSL certificate
   - Shared volumes

4. **Unified Domain**
   - Same domain, different paths
   - Consistent branding
   - Single SSL certificate

### ⚠️ **Considerations:**
1. **Resource Limits**
   - Both apps share same resources
   - Need to monitor memory/CPU
   - Set appropriate resource limits

2. **Scaling**
   - Can scale individual services if needed
   - Database can become bottleneck
   - Consider read replicas if traffic grows

3. **Isolation**
   - Less isolation than separate setups
   - Database backup includes both
   - One app failure doesn't affect the other

---

## 🚀 **Deployment Steps**

### 1. **Update Existing Setup**

```bash
# Stop current deployment
docker-compose down

# Backup database
docker exec qr-listener-postgres-prod pg_dump -U qr_user_prod qr_listener_prod > backup.sql

# Update docker-compose.yml (add new services)
# Update nginx-config.conf (add new routes)

# Start updated deployment
docker-compose up -d
```

### 2. **Database Migration**

```bash
# Run content publisher database init
docker exec qr-listener-postgres-prod psql -U qr_user_prod -f /docker-entrypoint-initdb.d/init-content-db.sql
```

### 3. **Verify Services**

```bash
# Check all services are running
docker-compose ps

# Test QR Listener API
curl http://localhost:8080/api/qr/health

# Test Content Publisher API
curl http://localhost:8080/api/content/health

# Test Nginx routing
curl http://localhost:8080/
curl http://localhost:8080/p/test-slug
```

---

## 📈 **Resource Planning**

### **Memory Requirements:**
- QR Backend: 512MB - 1GB
- Content Backend: 512MB - 1GB
- QR Frontend: 256MB - 512MB
- Content Frontend: 256MB - 512MB
- Database: 512MB - 1GB
- Redis: 128MB - 256MB
- Nginx: 64MB - 128MB

**Total: ~3-5GB RAM recommended**

### **Storage Requirements:**
- Database: Depends on data
- Image storage: ~10GB for 1000 photos
- Code volumes: ~1GB

---

## 🔄 **Alternative: Subdomain Approach**

If you prefer complete separation, use subdomains:

- `graceshoppee.tech` - QR Listener
- `content.graceshoppee.tech` - Content Publisher

This requires:
- Separate Nginx configs
- DNS configuration
- Optional: Separate SSL certificates

---

## ✅ **Recommendation**

**Use Option 1 (Shared Infrastructure)** because:
1. Simpler deployment
2. Cost-effective
3. Easy to manage
4. Both apps are related services
5. Can migrate to separate setup later if needed

---

Would you like me to:
1. Create the complete Docker Compose file?
2. Set up the database initialization scripts?
3. Create the Content Publisher backend structure?
4. Update Nginx configuration with proper routing?

