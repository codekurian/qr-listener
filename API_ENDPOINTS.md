# QR Listener API Endpoints

This document outlines all available API endpoints for the QR Listener application.

## Base URLs
- **QR Generation Service**: `http://localhost:8080/api/qr`
- **QR Management Service**: `http://localhost:8080/api/admin`
- **QR Redirect Service**: `http://localhost:8080/api/qr`

## 1. Generate QR Code

### Create a new QR code
```http
POST /api/qr/generate
Content-Type: application/json

{
  "targetUrl": "https://example.com/page",
  "description": "Product page QR code",
  "createdBy": "admin@graceshoppee.tech",
  "prefix": "ECO"
}
```

**Response:**
```json
{
  "id": 1,
  "qrId": "ECO-12345678",
  "targetUrl": "https://example.com/page",
  "description": "Product page QR code",
  "imageUrl": "/api/qr/ECO-12345678/image",
  "downloadUrl": "/api/qr/ECO-12345678/download",
  "createdAt": "2023-10-01T10:00:00"
}
```

### Get QR code image
```http
GET /api/qr/{qrId}/image?size=256&format=PNG
```

### Download QR code
```http
GET /api/qr/{qrId}/download?size=512
```

## 2. View QR Codes

### Get all QR codes (paginated)
```http
GET /api/admin/qr-codes?page=0&size=10&sortBy=createdAt&sortDirection=desc
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "qrId": "ECO-12345678",
      "targetUrl": "https://example.com/page",
      "description": "Product page QR code",
      "createdBy": "admin@graceshoppee.tech",
      "createdAt": "2023-10-01T10:00:00",
      "updatedAt": "2023-10-01T10:00:00",
      "isActive": true,
      "imageUrl": "/api/qr/ECO-12345678/image",
      "downloadUrl": "/api/qr/ECO-12345678/download"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true,
  "hasNext": false,
  "hasPrevious": false
}
```

### Get QR code by ID
```http
GET /api/admin/qr-codes/{id}
```

### Get QR code by QR ID
```http
GET /api/admin/qr-codes/qr-id/{qrId}
```

### Update QR code
```http
PUT /api/admin/qr-codes/{id}
Content-Type: application/json

{
  "targetUrl": "https://updated-example.com/page",
  "description": "Updated description",
  "isActive": true
}
```

### Delete QR code
```http
DELETE /api/admin/qr-codes/{id}
```

### Get recent QR codes
```http
GET /api/admin/qr-codes/recent?limit=5
```

### Get QR code statistics
```http
GET /api/admin/qr-codes/stats
```

**Response:**
```json
{
  "totalQrCodes": 150,
  "activeQrCodes": 150
}
```

## 3. Search QR Codes

### Search QR codes
```http
POST /api/admin/qr-codes/search
Content-Type: application/json

{
  "search": "ECO",
  "page": 0,
  "size": 10,
  "sortBy": "createdAt",
  "sortDirection": "desc",
  "createdBy": "admin@graceshoppee.tech"
}
```

**Search Parameters:**
- `search`: Search term (searches in qrId and description)
- `page`: Page number (default: 0)
- `size`: Page size (default: 10)
- `sortBy`: Sort field (default: createdAt)
- `sortDirection`: Sort direction (asc/desc, default: desc)
- `createdBy`: Filter by creator

## 4. QR Code Redirect

### Redirect QR code
```http
GET /api/qr/redirect?qr_id={qrId}
```

**Response:**
```json
{
  "success": true,
  "targetUrl": "https://example.com/page",
  "qrId": "ECO-12345678",
  "redirectUrl": "https://example.com/page"
}
```

## 5. Health Checks

### QR Generation Service Health
```http
GET /api/qr/health
```

### QR Management Service Health
```http
GET /api/admin/health
```

## Request/Response Examples

### Generate QR Code Request
```json
{
  "targetUrl": "https://graceshoppee.tech/products/eco-friendly-bag",
  "description": "Eco-friendly bag product page",
  "createdBy": "admin@graceshoppee.tech",
  "prefix": "ECO"
}
```

### Search Request
```json
{
  "search": "ECO",
  "page": 0,
  "size": 20,
  "sortBy": "createdAt",
  "sortDirection": "desc"
}
```

### Update Request
```json
{
  "targetUrl": "https://graceshoppee.tech/products/eco-friendly-bag-v2",
  "description": "Updated eco-friendly bag product page",
  "isActive": true
}
```

## Error Responses

### 404 Not Found
```json
{
  "error": "QR code not found",
  "message": "QR code not found with ID: 999"
}
```

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "message": "Target URL is required"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Failed to generate QR code image"
}
```

## Authentication

Currently, the API does not require authentication for demo purposes. In production, you would add:
- JWT tokens
- API keys
- OAuth2 authentication

## Rate Limiting

The API includes basic rate limiting:
- QR generation: 10 requests/second
- QR redirect: 20 requests/second
- Admin operations: 5 requests/second

## CORS

The API supports CORS for the frontend domain:
- Allowed origins: `https://graceshoppee.tech`, `http://localhost:3000`
- Allowed methods: GET, POST, PUT, DELETE
- Allowed headers: Content-Type, Authorization

