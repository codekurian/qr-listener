# 🚀 Quick Deployment Checklist for graceshoppee.tech

## ✅ **Pre-Deployment Checklist**

### 1. **A2 Hosting Account Setup**
- [ ] Log into A2 Hosting cPanel
- [ ] Enable SSH access
- [ ] Enable Java 17+ support
- [ ] Enable Node.js 18+ support
- [ ] Create PostgreSQL database: `qr_listener_prod`
- [ ] Create database user: `qr_user_prod`
- [ ] Note down all credentials

### 2. **Domain Configuration**
- [ ] Point `graceshoppee.tech` to your A2 Hosting IP
- [ ] Point `www.graceshoppee.tech` to your A2 Hosting IP
- [ ] Wait for DNS propagation (up to 24 hours)

## 🛠️ **Deployment Steps**

### **Step 1: Server Preparation**
```bash
# SSH into your A2 Hosting server
ssh user@graceshoppee.tech

# Run the deployment script
chmod +x deployment/deploy.sh
./deployment/deploy.sh
```

### **Step 2: Upload Application Files**
```bash
# From your local machine, upload backend
scp -r backend/qr-listener-backend user@graceshoppee.tech:/home/user/

# Upload frontend
scp -r frontend user@graceshoppee.tech:/home/user/qr-listener-frontend

# Upload deployment files
scp -r deployment user@graceshoppee.tech:/home/user/
```

### **Step 3: Configure Production Settings**
```bash
# On the server, update database password
nano /home/user/qr-listener-backend/src/main/resources/application-prod.yml
# Change: password: ${DB_PASSWORD:your_secure_password_here}

# Update frontend environment
nano /home/user/qr-listener-frontend/env.production
# Update API URL and other settings
```

### **Step 4: Build and Deploy**
```bash
# Build backend
cd /home/user/qr-listener-backend
mvn clean package -DskipTests

# Build frontend
cd /home/user/qr-listener-frontend
npm install
npm run build

# Start services
sudo systemctl enable qr-backend qr-frontend
sudo systemctl start qr-backend qr-frontend
```

### **Step 5: Verify Deployment**
```bash
# Check service status
sudo systemctl status qr-backend qr-frontend

# Check logs
sudo journalctl -u qr-backend -f
sudo journalctl -u qr-frontend -f

# Test endpoints
curl https://graceshoppee.tech/api/qr/health
curl https://graceshoppee.tech
```

## 🔧 **Configuration Files to Update**

### **Backend Configuration** (`application-prod.yml`)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/qr_listener_prod
    username: qr_user_prod
    password: YOUR_SECURE_PASSWORD_HERE
```

### **Frontend Configuration** (`env.production`)
```env
NEXT_PUBLIC_API_BASE_URL=https://graceshoppee.tech/api
NODE_ENV=production
PORT=3000
```

### **Systemd Services**
- Backend: `/etc/systemd/system/qr-backend.service`
- Frontend: `/etc/systemd/system/qr-frontend.service`

## 🚨 **Important Security Steps**

1. **Change Default Passwords**
   - Database password
   - System user passwords
   - Application secrets

2. **Configure Firewall**
   ```bash
   sudo ufw allow 22    # SSH
   sudo ufw allow 80   # HTTP
   sudo ufw allow 443  # HTTPS
   sudo ufw enable
   ```

3. **Set Up SSL Certificate**
   ```bash
   sudo certbot --nginx -d graceshoppee.tech -d www.graceshoppee.tech
   ```

## 📊 **Monitoring Commands**

```bash
# Check service status
sudo systemctl status qr-backend qr-frontend

# View logs
sudo journalctl -u qr-backend -f
sudo journalctl -u qr-frontend -f

# Check ports
sudo netstat -tlnp | grep :8080
sudo netstat -tlnp | grep :3000

# Test database
psql -h localhost -U qr_user_prod -d qr_listener_prod

# Check Nginx status
sudo systemctl status nginx
sudo nginx -t
```

## 🔄 **Maintenance Tasks**

### **Daily**
- [ ] Check service status
- [ ] Monitor logs for errors
- [ ] Verify SSL certificate

### **Weekly**
- [ ] Update system packages
- [ ] Check disk space
- [ ] Review security logs

### **Monthly**
- [ ] Update application dependencies
- [ ] Review and rotate logs
- [ ] Test backup restoration

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **Services won't start**
   ```bash
   sudo journalctl -u qr-backend -f
   sudo journalctl -u qr-frontend -f
   ```

2. **Database connection issues**
   ```bash
   sudo systemctl status postgresql
   psql -h localhost -U qr_user_prod -d qr_listener_prod
   ```

3. **SSL certificate issues**
   ```bash
   sudo certbot certificates
   sudo certbot renew --dry-run
   ```

4. **Port conflicts**
   ```bash
   sudo netstat -tlnp | grep :8080
   sudo netstat -tlnp | grep :3000
   ```

## 📞 **Support Resources**

- **A2 Hosting Support**: https://www.a2hosting.com/support
- **Domain DNS**: Check in your domain registrar's control panel
- **SSL Certificate**: Let's Encrypt documentation
- **Application Logs**: `/home/user/logs/`

---

**🎯 Final URLs:**
- **Website**: https://graceshoppee.tech
- **API**: https://graceshoppee.tech/api
- **Admin**: https://graceshoppee.tech/dashboard
