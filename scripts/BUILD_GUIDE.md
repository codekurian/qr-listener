# Build Scripts Guide

This guide explains how to use the build scripts for local development and production deployment.

## Scripts Overview

### 1. `build-local.sh` - Local Development Build
Builds the entire application for local development and testing.

### 2. `build-production.sh` - Production Deployment Package
Creates a complete zip package ready for deployment to A2 Hosting.

---

## Local Development Build

### Usage
```bash
./scripts/build-local.sh
```

### What it does:
1. ✅ Builds the Spring Boot backend (Maven)
2. ✅ Installs frontend dependencies (npm)
3. ✅ Optionally builds frontend for production (with `--production` flag)

### Options:
- **Default**: Builds backend and installs frontend dependencies
- **`--production`**: Also builds the frontend production bundle

### Example:
```bash
# Basic build (backend + dependencies)
./scripts/build-local.sh

# Full production build
./scripts/build-local.sh --production
```

### After Building:
1. Start database (if using Docker):
   ```bash
   docker-compose up -d
   ```

2. Start backend:
   ```bash
   cd backend/qr-listener-backend
   mvn spring-boot:run
   ```

3. Start frontend (in another terminal):
   ```bash
   cd frontend
   npm run dev
   ```

4. Access:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Publisher Dashboard: http://localhost:3000/publisher/dashboard

---

## Production Deployment Package

### Usage
```bash
./scripts/build-production.sh
```

### What it does:
1. ✅ Copies backend source code (excludes compiled files)
2. ✅ Copies frontend source code (excludes node_modules, .next)
3. ✅ Creates Docker Compose configuration
4. ✅ Creates Nginx configuration
5. ✅ Creates startup and monitoring scripts
6. ✅ Packages everything into a zip file

### Output:
- **Location**: `deployment/qr-listener-production_YYYYMMDD_HHMMSS.zip`
- **Contents**: Complete deployment package ready for A2 Hosting

### Package Includes:
- ✅ Backend source code (Spring Boot)
- ✅ Frontend source code (Next.js)
- ✅ Docker Compose configuration
- ✅ Nginx reverse proxy config
- ✅ Database initialization scripts
- ✅ Startup script (preserves data)
- ✅ Monitoring script
- ✅ Environment configuration
- ✅ Complete documentation

### Features Included:
- ✅ QR Code Management
- ✅ **Content Publisher** (NEW!)
  - Publication wizard
  - Photo upload
  - Rich text editor
  - Public viewing
  - Social sharing

### Deploy to A2 Hosting:

1. **Upload the zip file** via FileZilla to your server

2. **Extract on server**:
   ```bash
   unzip qr-listener-production_*.zip
   cd qr-listener-production_*
   ```

3. **Make scripts executable**:
   ```bash
   chmod +x *.sh
   ```

4. **Start the application**:
   ```bash
   ./startup.sh
   ```

5. **Access your application**:
   - Main Site: http://graceshoppee.tech:8080
   - Admin Dashboard: http://graceshoppee.tech:8080/dashboard
   - Content Publisher: http://graceshoppee.tech:8080/publisher/dashboard

### Data Preservation:
⚠️ **Important**: The deployment package preserves your existing data!
- Database volumes persist across deployments
- QR codes are preserved
- Publications are preserved
- All existing data is safe

---

## Quick Reference

### Build for Local Development
```bash
./scripts/build-local.sh
```

### Build Production Package
```bash
./scripts/build-production.sh
```

### Check Script Permissions
If scripts are not executable:
```bash
chmod +x scripts/build-local.sh
chmod +x scripts/build-production.sh
```

---

## Troubleshooting

### Local Build Issues

**Maven not found:**
```bash
# Install Maven or use Maven wrapper
cd backend/qr-listener-backend
./mvnw clean install
```

**npm not found:**
```bash
# Install Node.js and npm
# Then run: npm install
```

### Production Package Issues

**Permission denied:**
```bash
chmod +x scripts/build-production.sh
```

**Zip file not created:**
- Check if `deployment/` directory exists
- Ensure you have write permissions
- Check disk space

---

## Notes

- The production package builds everything from source in Docker containers
- No pre-compiled binaries are included (builds happen on the server)
- All sensitive data (passwords, etc.) should be updated in `.env` files
- The startup script automatically handles database volume creation/preservation

