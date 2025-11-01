# QR Listener - QR Code Redirect Service

A simple QR code redirect service with an admin panel for managing QR codes and redirects.

## Features

- **QR Code Generation**: Create QR codes that redirect to specific URLs
- **Admin Panel**: Web-based interface for managing QR codes
- **Analytics**: Track QR code scans and redirects
- **Search**: Find QR codes by ID or description
- **Authentication**: Optional Google OAuth and demo mode

## Tech Stack

- **Backend**: Java Spring Boot
- **Frontend**: Next.js (React/TypeScript)
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS
- **Icons**: Heroicons

## Quick Start

### 1. Database Setup (PostgreSQL Only)

For a 512MB server (recommended):
```bash
chmod +x scripts/setup-db-postgres-only.sh
./scripts/setup-db-postgres-only.sh
```

For local development:
```bash
chmod +x scripts/setup-db-local.sh
./scripts/setup-db-local.sh
```

### 2. Start Services

```bash
# Start database
docker-compose up -d

# Start frontend (in frontend directory)
cd frontend
npm install
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Database**: localhost:5432
- **Demo Mode**: Click "Demo Mode (Skip Authentication)" to access the admin panel

## Project Structure

```
qr-listener/
├── backend/                    # Spring Boot backend services
│   ├── qr-generation-service/  # QR code generation API
│   └── qr-redirect-service/    # QR redirect handling API
├── frontend/                   # Next.js admin panel
│   ├── src/app/               # Pages (dashboard, generate, etc.)
│   ├── src/components/         # React components
│   └── src/config/            # App configuration
├── scripts/                   # Database setup scripts
├── docker-compose.yml         # Docker services
└── README.md                  # This file
```

## Configuration

### Frontend Configuration

The frontend supports different modes:

**Demo Mode (No Authentication)**:
```bash
NEXT_PUBLIC_AUTH_ENABLED=false
NEXT_PUBLIC_SKIP_AUTH=true
NEXT_PUBLIC_DEMO_MODE=true
```

**Development Mode (With Authentication)**:
```bash
NEXT_PUBLIC_AUTH_ENABLED=true
NEXT_PUBLIC_SKIP_AUTH=false
NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true
```

### Database Configuration

The PostgreSQL-only setup is optimized for 512MB RAM servers:
- PostgreSQL: 400MB memory limit
- No Redis (saves memory)
- Optimized for low-memory environments

## API Endpoints

- `GET /api/qr/redirect?qr_id=XXX` - Redirect QR code
- `POST /api/generate/qr` - Generate new QR code
- `GET /api/admin/qr-codes` - List all QR codes
- `GET /api/analytics/stats` - Get analytics data

## Environment Variables

Copy `env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/qr_listener

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXTAUTH_URL=http://localhost:3000
```

## Development

### Backend
```bash
cd backend/qr-redirect-service
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deployment

For production deployment on `graceshoppee.tech`:

1. Set up PostgreSQL database
2. Configure environment variables
3. Build and deploy with Docker
4. Configure Nginx reverse proxy

## Monitoring

Use the monitoring script to check system health:
```bash
./scripts/monitor-postgres-only.sh
```

## License

MIT License - feel free to use and modify as needed.