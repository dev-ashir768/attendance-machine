# ZKTeco Attendance Management System

A comprehensive attendance management system built with Node.js, Express, Prisma, and MySQL for ZKTeco biometric devices.

## Features

- 🔐 **Secure Authentication**: JWT-based user authentication with role-based access control
- 👥 **User Management**: Create and manage employee accounts with device assignments
- 📊 **Attendance Tracking**: Real-time check-in/check-out processing from ZKTeco devices
- 📈 **Reporting**: Comprehensive attendance reports with filtering and pagination
- 🔌 **Device Integration**: Direct integration with ZKTeco ADMS protocol
- 🛡️ **Rate Limiting**: Built-in protection against abuse
- ✅ **Input Validation**: Zod-based request validation

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env` file and configure your database:
```env
PORT=3000
DATABASE_URL="mysql://username:password@host:port/database"
JWT_SECRET="your-secret-key"
API_KEY="device-api-key"
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed admin user
npm run seed:admin
```

### 4. Start Development Server
```bash
npm run dev
```

## Authentication

The system uses JWT-based authentication. After seeding, you can login with:

- **Username**: `admin`
- **Password**: `admin123`

### Login API
```bash
POST /api/v1/users/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

Response includes JWT token for subsequent requests.

## API Endpoints

### Authentication
- `POST /api/v1/users/login` - User login

### User Management (Requires JWT)
- `GET /api/v1/users` - Get all users
- `POST /api/v1/users` - Create new user
- `POST /api/v1/users/{userId}/devices` - Assign user to device

### Attendance Management (Requires JWT)
- `GET /api/v1/attendance/summary` - Get attendance statistics
- `GET /api/v1/attendance/history` - Get daily attendance records
- `GET /api/v1/attendance/sessions` - Get individual check-in/check-out sessions

### Device Webhooks (Requires API Key)
- `POST /api/v1/attendance/check-in` - Process check-in from device
- `POST /api/v1/attendance/check-out` - Process check-out from device

## Device Integration

### ZKTeco ADMS Protocol
The system supports direct integration with ZKTeco devices using the ADMS protocol:

- **Endpoint**: `/iclock/cdata`
- **Method**: POST
- **Content-Type**: `text/plain`
- **Format**: `USER_ID\tTIMESTAMP\tPUNCH_TYPE\tVERIFY_MODE`

Example device data:
```
1	2026-04-08 09:00:00	0	1
1	2026-04-08 17:00:00	1	1
```

## Testing with Postman

1. Import `Dashboard_Postman_Collection.json`
2. Run the "Admin Login" request first
3. JWT token will be automatically saved for subsequent requests
4. Test other endpoints with proper authentication

## Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`
- **Role**: ADMIN

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: 100 requests per minute
- **Input Validation**: Comprehensive request validation
- **API Key Protection**: Device endpoints secured with API keys

## Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run seed:admin` - Create default admin user
- `npm run poll:k60` - Poll K60 device for attendance data

### Project Structure
```
src/
├── app.ts                 # Main application
├── config/
│   └── env.ts            # Environment configuration
├── middlewares/          # Express middlewares
├── modules/
│   ├── attendance/       # Attendance management
│   ├── users/           # User management
│   └── iclock/          # Device integration
├── routes/               # API routes
├── scripts/             # Utility scripts
└── utils/               # Utilities (Prisma client)
```

## License

MIT License