# 🚀 QR Listener Deployment Guide for graceshoppee.tech

## 📋 Prerequisites

### 1. A2 Hosting Account Setup
- ✅ Domain: `graceshoppee.tech` (purchased)
- ✅ A2 Hosting account with cPanel access
- ✅ SSH access enabled
- ✅ Node.js support (Node.js 18+)
- ✅ Java support (Java 17+)
- ✅ PostgreSQL database

### 2. Local Development Environment
- ✅ Backend: Spring Boot (Java 17+)
- ✅ Frontend: Next.js 14
- ✅ Database: PostgreSQL 15
- ✅ All services running locally

## 🛠️ Step-by-Step Deployment Process

### **Phase 1: A2 Hosting Server Preparation**

#### Step 1.1: Access Your A2 Hosting cPanel
1. Log into your A2 Hosting account
2. Navigate to cPanel
3. Note down your server details:
   - Server IP address
   - SSH credentials
   - Database credentials

#### Step 1.2: Enable Required Services
1. **Enable SSH Access** (if not already enabled)
   - Go to "SSH Access" in cPanel
   - Generate SSH keys or enable password authentication

2. **Enable Java Support**
   - Go to "Java" section in cPanel
   - Enable Java 17 or higher
   - Note the Java path (usually `/usr/bin/java`)

3. **Enable Node.js Support**
   - Go to "Node.js" section in cPanel
   - Install Node.js 18+ (LTS version)
   - Note the Node.js path

4. **Create PostgreSQL Database**
   - Go to "PostgreSQL Databases" in cPanel
   - Create database: `qr_listener_prod`
   - Create user: `qr_user_prod`
   - Set password and grant all privileges
   - Note the connection details

### **Phase 2: Backend Deployment**

#### Step 2.1: Prepare Backend for Production
```bash
# 1. Update application.yml for production
# 2. Create production build
# 3. Package as JAR file
```

#### Step 2.2: Upload Backend to Server
```bash
# Using SCP or SFTP
scp -r backend/qr-listener-backend user@graceshoppee.tech:/home/user/qr-listener-backend
```

#### Step 2.3: Configure Production Database
```bash
# SSH into your server
ssh user@graceshoppee.tech

# Update database configuration
cd /home/user/qr-listener-backend/src/main/resources
nano application.yml
```

#### Step 2.4: Build and Run Backend
```bash
# On the server
cd /home/user/qr-listener-backend
mvn clean package -DskipTests
java -jar target/qr-listener-backend-1.0.0.jar --spring.profiles.active=prod
```

### **Phase 3: Frontend Deployment**

#### Step 3.1: Prepare Frontend for Production
```bash
# Update API endpoints to production
# Build for production
# Create optimized build
```

#### Step 3.2: Upload Frontend to Server
```bash
# Upload frontend files
scp -r frontend user@graceshoppee.tech:/home/user/qr-listener-frontend
```

#### Step 3.3: Build and Serve Frontend
```bash
# On the server
cd /home/user/qr-listener-frontend
npm install
npm run build
npm start
```

### **Phase 4: Domain Configuration**

#### Step 4.1: DNS Configuration
1. **Point Domain to A2 Hosting**
   - Update DNS records in your domain registrar
   - Set A record: `graceshoppee.tech` → Your A2 Hosting IP
   - Set CNAME: `www.graceshoppee.tech` → `graceshoppee.tech`

#### Step 4.2: SSL Certificate Setup
1. **Enable SSL in cPanel**
   - Go to "SSL/TLS" in cPanel
   - Enable "Let's Encrypt" SSL certificate
   - Force HTTPS redirect

### **Phase 5: Reverse Proxy Setup (Nginx)**

#### Step 5.1: Configure Nginx
```nginx
# /etc/nginx/sites-available/graceshoppee.tech
server {
    listen 80;
    server_name graceshoppee.tech www.graceshoppee.tech;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name graceshoppee.tech www.graceshoppee.tech;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    
    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **Phase 6: Process Management**

#### Step 6.1: Create Systemd Services

**Backend Service** (`/etc/systemd/system/qr-backend.service`):
```ini
[Unit]
Description=QR Listener Backend
After=network.target

[Service]
Type=simple
User=user
WorkingDirectory=/home/user/qr-listener-backend
ExecStart=/usr/bin/java -jar target/qr-listener-backend-1.0.0.jar --spring.profiles.active=prod
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Frontend Service** (`/etc/systemd/system/qr-frontend.service`):
```ini
[Unit]
Description=QR Listener Frontend
After=network.target

[Service]
Type=simple
User=user
WorkingDirectory=/home/user/qr-listener-frontend
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### Step 6.2: Enable and Start Services
```bash
sudo systemctl daemon-reload
sudo systemctl enable qr-backend qr-frontend
sudo systemctl start qr-backend qr-frontend
sudo systemctl status qr-backend qr-frontend
```

### **Phase 7: Monitoring and Maintenance**

#### Step 7.1: Set Up Logging
```bash
# View logs
sudo journalctl -u qr-backend -f
sudo journalctl -u qr-frontend -f

# Check service status
sudo systemctl status qr-backend
sudo systemctl status qr-frontend
```

#### Step 7.2: Database Backups
```bash
# Create backup script
#!/bin/bash
pg_dump -h localhost -U qr_user_prod qr_listener_prod > /home/user/backups/qr_backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Step 7.3: SSL Certificate Renewal
```bash
# Set up automatic renewal
crontab -e
# Add: 0 2 * * * /usr/bin/certbot renew --quiet
```

## 🔧 **Production Configuration Files**

### Backend Production Config (`application-prod.yml`):
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/qr_listener_prod
    username: qr_user_prod
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
  profiles:
    active: prod

server:
  port: 8080
  servlet:
    context-path: /

logging:
  level:
    com.qr: INFO
    org.springframework: WARN
  file:
    name: /home/user/logs/qr-backend.log
```

### Frontend Production Config (`.env.production`):
```env
NEXT_PUBLIC_API_BASE_URL=https://graceshoppee.tech/api
NODE_ENV=production
PORT=3000
```

## 🚨 **Important Security Considerations**

1. **Environment Variables**: Store sensitive data in environment variables
2. **Database Security**: Use strong passwords and limit database access
3. **SSL/TLS**: Always use HTTPS in production
4. **Firewall**: Configure firewall to only allow necessary ports
5. **Regular Updates**: Keep all dependencies updated
6. **Backups**: Set up automated database backups

## 📊 **Performance Optimization**

1. **Database Indexing**: Add indexes for frequently queried columns
2. **Caching**: Implement Redis for session management
3. **CDN**: Use CloudFlare or similar for static assets
4. **Monitoring**: Set up application monitoring (New Relic, DataDog)

## 🔄 **Deployment Checklist

- [ ] A2 Hosting account setup complete
- [ ] SSH access enabled
- [ ] Java 17+ installed
- [ ] Node.js 18+ installed
- [ ] PostgreSQL database created
- [ ] Backend code uploaded and configured
- [ ] Frontend code uploaded and configured
- [ ] Domain DNS configured
- [ ] SSL certificate installed
- [ ] Nginx reverse proxy configured
- [ ] Systemd services created and enabled
- [ ] Database backups configured
- [ ] Monitoring setup
- [ ] Security hardening completed

## 📞 **Support and Troubleshooting**

### Common Issues:
1. **Port Conflicts**: Ensure ports 80, 443, 3000, 8080 are available
2. **Permission Issues**: Check file permissions and user ownership
3. **Database Connection**: Verify database credentials and network access
4. **SSL Issues**: Ensure SSL certificate is properly installed
5. **Service Failures**: Check logs with `journalctl -u service-name`

### Useful Commands:
```bash
# Check service status
sudo systemctl status qr-backend qr-frontend

# Restart services
sudo systemctl restart qr-backend qr-frontend

# View logs
sudo journalctl -u qr-backend -f
sudo journalctl -u qr-frontend -f

# Check ports
sudo netstat -tlnp | grep :8080
sudo netstat -tlnp | grep :3000

# Test database connection
psql -h localhost -U qr_user_prod -d qr_listener_prod
```

---

**🎯 Final Result**: Your QR Listener application will be accessible at:
- **Frontend**: https://graceshoppee.tech
- **Backend API**: https://graceshoppee.tech/api
- **Admin Panel**: https://graceshoppee.tech/dashboard
