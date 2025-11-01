# QR Listener Backend

Single Spring Boot application for QR code management and redirection.

## Structure

```
backend/
└── qr-listener-backend/          # Single Spring Boot application
    ├── pom.xml                   # Maven configuration
    └── src/main/java/com/qr/     # Source code
        ├── QrListenerApplication.java    # Main application class
        ├── controller/                   # REST controllers
        ├── dto/                         # Data transfer objects
        ├── entity/                      # JPA entities
        ├── repository/                 # Data access layer
        ├── service/                     # Business logic
        └── redirect/                    # Redirect functionality
```

## Features

- **QR Code Generation** - Create QR codes with custom styling
- **QR Code Management** - CRUD operations, search, filtering
- **QR Code Redirect** - Handle QR code scans and redirects
- **Analytics & Logging** - Track redirect events
- **Statistics** - Get usage statistics and metrics

## Running the Application

```bash
cd backend/qr-listener-backend
mvn spring-boot:run
```

The application will start on port 8080.

## API Endpoints

- Health Check: `GET /api/qr/health`
- Redirect Health: `GET /api/qr/redirect/health`
- Generate QR: `POST /api/qr/generate`
- List QR Codes: `GET /api/admin/qr-codes`
- Search QR Codes: `POST /api/admin/qr-codes/search`

## Database

The application uses PostgreSQL and will automatically create the required tables on startup.
