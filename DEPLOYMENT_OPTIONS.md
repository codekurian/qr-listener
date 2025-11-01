# QR Listener Deployment Options

You have **3 deployment options** for your A2 Hosting server. Choose the one that best fits your needs:

## 🐳 **Option 1: Docker Deployment (Recommended)**

### **Prerequisites:**
- Docker and Docker Compose installed on your server

### **Quick Setup:**
```bash
# 1. Install Docker (if not already installed)
sudo ./scripts/install-docker-on-server.sh

# 2. Run the deployment
./quick-setup.sh
```

### **Pros:**
- ✅ Isolated environment
- ✅ Easy to manage and update
- ✅ Consistent across environments
- ✅ Built-in health checks
- ✅ Easy rollbacks

### **Cons:**
- ❌ Requires Docker installation
- ❌ Slightly more resource usage

---

## 🖥️ **Option 2: Traditional Server Deployment**

### **Prerequisites:**
- Java 17, Node.js, PostgreSQL, Nginx

### **Quick Setup:**
```bash
# Run the traditional deployment script
sudo ./scripts/traditional-deployment.sh
```

### **Pros:**
- ✅ No Docker required
- ✅ Direct system integration
- ✅ Lower resource usage
- ✅ Familiar to traditional hosting

### **Cons:**
- ❌ More complex setup
- ❌ Potential dependency conflicts
- ❌ Harder to manage updates

---

## 🔧 **Option 3: Manual Installation**

### **Step-by-Step Manual Setup:**

#### **1. Install Prerequisites**
```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Java 17
sudo apt-get install -y openjdk-17-jdk

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Install Nginx
sudo apt-get install -y nginx

# Install Maven
sudo apt-get install -y maven
```

#### **2. Setup Database**
```bash
# Create database and user
sudo -u postgres psql -c "CREATE DATABASE qr_listener_prod;"
sudo -u postgres psql -c "CREATE USER qr_user_prod WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE qr_listener_prod TO qr_user_prod;"
```

#### **3. Deploy Application**
```bash
# Extract your deployment package
unzip qr-listener-deployment_*.zip
cd qr-listener-deployment_*

# Build backend
cd backend/qr-listener-backend
mvn clean package -DskipTests

# Build frontend
cd ../../frontend
npm install
npm run build
```

#### **4. Configure Services**
```bash
# Create systemd services
sudo cp deployment/qr-backend.service /etc/systemd/system/
sudo cp deployment/qr-frontend.service /etc/systemd/system/

# Configure Nginx
sudo cp deployment/nginx-config.conf /etc/nginx/sites-available/graceshoppee.tech
sudo ln -s /etc/nginx/sites-available/graceshoppee.tech /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Start services
sudo systemctl daemon-reload
sudo systemctl start qr-backend qr-frontend nginx
sudo systemctl enable qr-backend qr-frontend nginx
```

---

## 🚀 **Quick Start Commands**

### **For Docker Deployment:**
```bash
# Install Docker
sudo ./scripts/install-docker-on-server.sh

# Deploy with Docker
./quick-setup.sh
```

### **For Traditional Deployment:**
```bash
# Deploy without Docker
sudo ./scripts/traditional-deployment.sh
```

### **For Manual Deployment:**
Follow the step-by-step instructions in Option 3 above.

---

## 🔍 **Troubleshooting**

### **Check Service Status:**
```bash
# Docker deployment
docker-compose -f docker-compose.prod.yml ps

# Traditional deployment
systemctl status qr-backend qr-frontend nginx
```

### **View Logs:**
```bash
# Docker deployment
docker-compose -f docker-compose.prod.yml logs -f

# Traditional deployment
journalctl -u qr-backend -f
journalctl -u qr-frontend -f
```

### **Restart Services:**
```bash
# Docker deployment
docker-compose -f docker-compose.prod.yml restart

# Traditional deployment
systemctl restart qr-backend qr-frontend
```

---

## 📞 **Need Help?**

1. **Docker Issues**: Check if Docker is properly installed
2. **Permission Issues**: Ensure you're running with appropriate permissions
3. **Port Conflicts**: Check if ports 80, 443, 3000, 8080 are available
4. **Database Issues**: Verify PostgreSQL is running and accessible

---

## 🎯 **Recommendation**

**For A2 Hosting, I recommend Option 1 (Docker)** because:
- It's the most reliable and maintainable
- Easy to update and rollback
- Isolated from system dependencies
- Built-in health monitoring

If Docker installation fails, fall back to **Option 2 (Traditional)** which is also fully automated.
