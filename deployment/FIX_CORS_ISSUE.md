# Fix CORS Issue on A2 Hosting

## Problem
Frontend on port 3000 is making requests to backend on port 8080, causing CORS errors.

## Solution: Restart Backend with CORS Fix

The CORS configuration has been updated to allow the `X-User-Id` header. You need to restart the backend to apply the fix.

### Option 1: Quick Fix (Restart Backend)

```bash
cd /app/qr-listener-production_20251101_200154

# Restart backend (will rebuild with CORS fix)
docker-compose restart backend

# Wait for backend to restart (about 2-3 minutes)
docker logs -f qr-listener-backend-prod

# Once you see "Started QrListenerApplication", test again
```

### Option 2: Access Through Nginx (Recommended)

Instead of accessing the frontend directly on port 3000, access it through Nginx on port 8080:

**Use these URLs:**
- ✅ http://graceshoppee.tech:8080 (through Nginx - no CORS issues)
- ❌ http://graceshoppee.tech:3000 (direct frontend - CORS issues)

When accessing through Nginx on port 8080:
- Frontend and backend are on the same origin (port 8080)
- No CORS issues
- All API requests go through Nginx proxy

### Option 3: Rebuild and Deploy Updated Package

If the restart doesn't work, upload the new package:
- `deployment/qr-listener-production_20251101_200644.zip`

## Verify Fix

After restarting backend:

```bash
# Test CORS preflight
curl -X OPTIONS http://localhost:8080/api/publisher/publications \
  -H "Origin: http://graceshoppee.tech:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: x-user-id" \
  -v

# Should see headers:
# Access-Control-Allow-Origin: http://graceshoppee.tech:3000
# Access-Control-Allow-Headers: x-user-id
```

## Best Practice

**Always access the application through Nginx on port 8080:**
- Frontend: http://graceshoppee.tech:8080
- API calls will automatically go through Nginx proxy
- No CORS issues
- Better security and performance

