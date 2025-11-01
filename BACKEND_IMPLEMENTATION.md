# QR Listener Backend Implementation

## ✅ **Fully Implemented Features**

### 1. **Generate QR Code** 
- **Endpoint**: `POST /api/qr/generate`
- **Features**:
  - Creates unique QR IDs with custom prefixes
  - On-the-fly QR code image generation (no file storage)
  - Database storage of QR code mappings
  - Customizable QR code styling (size, format, colors)
  - Download functionality

### 2. **View QR Codes**
- **Endpoints**: 
  - `GET /api/admin/qr-codes` - Paginated list
  - `GET /api/admin/qr-codes/{id}` - Get by ID
  - `GET /api/admin/qr-codes/qr-id/{qrId}` - Get by QR ID
- **Features**:
  - Paginated results with sorting
  - Filter by creator
  - Active/inactive status tracking
  - Image and download URLs

### 3. **Search QR Codes**
- **Endpoint**: `POST /api/admin/qr-codes/search`
- **Features**:
  - Search by QR ID or description
  - Paginated search results
  - Sort by any field
  - Filter by creator
  - Case-insensitive search

### 4. **QR Code Management**
- **Endpoints**:
  - `PUT /api/admin/qr-codes/{id}` - Update QR code
  - `DELETE /api/admin/qr-codes/{id}` - Delete QR code
  - `GET /api/admin/qr-codes/recent` - Get recent QR codes
  - `GET /api/admin/qr-codes/stats` - Get statistics
- **Features**:
  - Update target URL and description
  - Soft delete (mark as inactive)
  - Recent QR codes with limit
  - Statistics (total, active counts)

### 5. **QR Code Images**
- **Endpoints**:
  - `GET /api/qr/{qrId}/image` - Get QR code image
  - `GET /api/qr/{qrId}/download` - Download QR code
- **Features**:
  - On-the-fly generation (no file storage)
  - Customizable size and format
  - Caching headers for performance
  - ETag support for browser caching

### 6. **QR Code Redirect**
- **Endpoint**: `GET /api/qr/redirect?qr_id={qrId}`
- **Features**:
  - Redirects to target URL
  - Logs redirect events
  - Error handling for invalid QR codes
  - IP and user agent tracking

## 🏗️ **Architecture**

### **Services**
1. **QR Generation Service** (`qr-generation-service`)
   - QR code creation and image generation
   - On-the-fly image processing
   - Unique ID generation

2. **QR Management Service** (`qr-generation-service`)
   - CRUD operations for QR codes
   - Search and filtering
   - Statistics and analytics

3. **QR Redirect Service** (`qr-redirect-service`)
   - QR code redirection
   - Redirect logging
   - Analytics tracking

### **Database Schema**
```sql
-- QR Codes table
CREATE TABLE qr_codes (
    id BIGSERIAL PRIMARY KEY,
    qr_id VARCHAR(50) UNIQUE NOT NULL,
    target_url TEXT NOT NULL,
    description TEXT,
    created_by VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QR Redirect Logs table
CREATE TABLE qr_redirect_logs (
    id BIGSERIAL PRIMARY KEY,
    qr_id VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    target_url TEXT,
    success BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 **Key Features**

### **On-the-Fly QR Generation**
- No file storage required
- QR codes generated dynamically
- Cached for performance
- Customizable styling

### **Unique QR ID System**
- Custom prefixes (e.g., "ECO-12345678")
- Collision detection
- Database uniqueness constraints

### **Comprehensive Search**
- Full-text search across QR ID and description
- Paginated results
- Multiple sort options
- Creator filtering

### **Analytics & Logging**
- Redirect event logging
- IP address tracking
- User agent recording
- Success/failure tracking

### **Performance Optimizations**
- Database indexing
- Query optimization
- Caching headers
- Pagination support

## 📊 **API Response Examples**

### **Generate QR Code Response**
```json
{
  "id": 1,
  "qrId": "ECO-12345678",
  "targetUrl": "https://graceshoppee.tech/products/eco-bag",
  "description": "Eco-friendly bag product page",
  "imageUrl": "/api/qr/ECO-12345678/image",
  "downloadUrl": "/api/qr/ECO-12345678/download",
  "createdAt": "2023-10-01T10:00:00"
}
```

### **Search Response**
```json
{
  "content": [
    {
      "id": 1,
      "qrId": "ECO-12345678",
      "targetUrl": "https://graceshoppee.tech/products/eco-bag",
      "description": "Eco-friendly bag product page",
      "createdBy": "admin@graceshoppee.tech",
      "createdAt": "2023-10-01T10:00:00",
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

## 🔧 **Configuration**

### **Database Configuration**
- PostgreSQL with connection pooling
- Optimized for 512MB RAM servers
- Automatic schema creation
- Connection limits configured

### **Caching**
- QR code image caching
- ETag support
- Cache-Control headers
- Redis integration ready

### **Security**
- CORS configuration
- Input validation
- SQL injection prevention
- Rate limiting ready

## 🧪 **Testing**

### **Test Script**
```bash
./scripts/test-backend-api.sh
```

### **Manual Testing**
1. Start the backend services
2. Run the test script
3. Verify all endpoints work
4. Check database entries
5. Test QR code generation

## 📈 **Performance**

### **Optimizations**
- Database indexing on frequently queried fields
- Pagination for large datasets
- Caching for QR code images
- Connection pooling
- Query optimization

### **Scalability**
- Stateless service design
- Horizontal scaling ready
- Database connection pooling
- Caching layer support

## 🔄 **Workflow**

### **QR Code Creation Flow**
1. User submits QR generation request
2. System generates unique QR ID
3. QR code mapping saved to database
4. QR code image generated on-the-fly
5. Response with image and download URLs

### **QR Code Usage Flow**
1. User scans QR code (contains QR ID)
2. System looks up QR ID in database
3. Redirects to target URL
4. Logs redirect event
5. Tracks analytics data

## ✅ **Status: Production Ready**

The backend implementation is complete and production-ready with:
- ✅ All CRUD operations
- ✅ Search and filtering
- ✅ QR code generation
- ✅ Redirect functionality
- ✅ Analytics tracking
- ✅ Performance optimizations
- ✅ Error handling
- ✅ Input validation
- ✅ Database optimization

