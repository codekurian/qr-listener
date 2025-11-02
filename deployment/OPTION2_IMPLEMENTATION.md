# Option 2 Implementation: All Traffic Through Nginx (Port 8080)

## ✅ Changes Implemented

### 1. API Client Configuration (`frontend/src/lib/api/publications.ts`)
- **Smart URL Detection**: Automatically uses relative URLs when accessed through Nginx on port 8080
- **Same Origin**: When frontend and API are on the same origin (port 8080), uses relative URLs (no CORS)
- **Fallback**: Uses environment variable or defaults for other scenarios

**How it works:**
```typescript
// Detects if accessing through Nginx (port 8080)
// Uses relative URLs (empty string) = same origin = no CORS
// Falls back to env var for other scenarios
```

### 2. Nginx Configuration (`nginx-config.conf`)
- ✅ Added `X-User-Id` and `x-user-id` to CORS allowed headers
- ✅ Added `PATCH` method to allowed methods
- ✅ Added `Access-Control-Allow-Credentials: true`
- ✅ Handles preflight OPTIONS requests correctly

### 3. Content Wizard URLs (`frontend/src/components/publisher/ContentWizard.tsx`)
- ✅ Uses `window.location.origin` for publication URLs
- ✅ Automatically uses correct port (8080) when accessed through Nginx
- ✅ Shows correct URLs in UI

### 4. Image URL Handling
- ✅ Photo URLs use relative paths when on same origin
- ✅ Automatically resolves to correct domain and port

## 🎯 How It Works

### When Accessed Through Nginx (Port 8080):
1. **Frontend**: http://graceshoppee.tech:8080 (served by Nginx)
2. **API Calls**: `/api/...` (relative URLs - same origin)
3. **Result**: ✅ No CORS issues (same origin)

### When Accessed Directly (Port 3000):
1. **Frontend**: http://graceshoppee.tech:3000 (direct access)
2. **API Calls**: Falls back to `NEXT_PUBLIC_API_BASE_URL` (http://graceshoppee.tech:8080)
3. **Result**: ⚠️ CORS handled by Nginx and backend headers

## 📋 URLs Configuration

### Production Environment Variables:
```bash
NEXT_PUBLIC_API_BASE_URL=http://graceshoppee.tech:8080
NEXT_PUBLIC_BASE_URL=http://graceshoppee.tech:8080
```

### Docker Compose Frontend:
```yaml
environment:
  NEXT_PUBLIC_API_BASE_URL: http://graceshoppee.tech:8080
  PORT: 3000
```

## ✅ Verification Checklist

After deployment:

1. **Access through Nginx** (port 8080):
   - ✅ http://graceshoppee.tech:8080
   - ✅ API calls use relative URLs
   - ✅ No CORS errors in browser console

2. **Check API calls**:
   ```javascript
   // In browser console on http://graceshoppee.tech:8080
   fetch('/api/publisher/publications/stats')
   // Should work without CORS errors
   ```

3. **Verify publication URLs**:
   - Created publication URLs should use port 8080
   - Copy link button should copy correct URL

4. **Test Content Publisher**:
   - Create publication → ✅ Works
   - Upload photos → ✅ Works
   - Publish → ✅ Works
   - View public page → ✅ Works

## 🚀 Deployment Instructions

### Option A: Update Existing Deployment

1. **Stop containers**:
   ```bash
   cd /app/qr-listener-production_20251101_200154
   docker-compose stop frontend backend nginx
   ```

2. **Upload new package**:
   - `deployment/qr-listener-production_20251101_202134.zip`

3. **Extract and deploy**:
   ```bash
   cd /app
   unzip -o qr-listener-production_20251101_202134.zip
   cd qr-listener-production_20251101_202134
   chmod +x *.sh
   ./startup.sh
   ```

### Option B: Quick Fix (Update Files Only)

If you want to update without full redeployment:

```bash
cd /app/qr-listener-production_20251101_200154

# Update frontend
docker cp frontend/src/lib/api/publications.ts qr-listener-frontend-prod:/app/src/lib/api/
docker cp frontend/src/components/publisher/ContentWizard.tsx qr-listener-frontend-prod:/app/src/components/publisher/

# Restart frontend (will rebuild)
docker-compose restart frontend

# Update Nginx config
docker cp nginx-config.conf qr-listener-nginx-prod:/etc/nginx/conf.d/default.conf
docker exec qr-listener-nginx-prod nginx -s reload

# Restart backend (for CORS fix)
docker-compose restart backend
```

## 🎯 Expected Behavior

### ✅ Correct Access Pattern:
- **URL**: http://graceshoppee.tech:8080
- **Frontend**: Loads from Nginx (proxy to frontend:3000)
- **API Calls**: Use relative URLs `/api/...` → proxied to backend:8080
- **Result**: Same origin = No CORS issues

### ❌ Wrong Access Pattern:
- **URL**: http://graceshoppee.tech:3000
- **Frontend**: Direct access
- **API Calls**: Cross-origin to port 8080
- **Result**: CORS issues (though handled by headers)

## 📝 Notes

- **All URLs default to port 8080** when accessed through Nginx
- **Relative URLs eliminate CORS** for same-origin requests
- **Backward compatible** with direct port 3000 access (uses env vars)
- **CORS headers in Nginx** provide fallback for cross-origin requests

