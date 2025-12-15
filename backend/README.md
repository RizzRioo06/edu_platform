# Educational Enrollment Platform - Backend API

Production-ready REST API for an Educational Enrollment Platform built with Node.js, Express.js, PostgreSQL, and Prisma ORM.

## 🚀 Features

- **User Authentication**: Register and login with JWT-based authentication
- **Course Management**: Create, read, update, and delete courses
- **Batch Management**: Manage course batches with seat availability
- **Secure Enrollment**: Transaction-based enrollment to prevent overbooking
- **Role-Based Access Control**: Student, Instructor, and Admin roles
- **Production-Ready**: Error handling, validation, logging, and security middleware

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A secure secret key for JWT tokens
   - `PORT`: Server port (default: 3000)

4. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

5. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

## 🏃‍♂️ Running the Application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123",
  "role": "STUDENT"  // STUDENT, ADMIN, or INSTRUCTOR
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123"
}
```

### Course Endpoints

#### Create Course (Admin/Instructor only)
```http
POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Web Development Bootcamp",
  "description": "Learn full-stack web development",
  "price": 299.99,
  "organization_id": "org-123"
}
```

#### Get All Courses
```http
GET /api/courses
```

#### Get Course by ID
```http
GET /api/courses/:courseId
```

### Batch Endpoints

#### Create Batch (Admin/Instructor only)
```http
POST /api/batches
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseId": 1,
  "startDate": "2025-01-15T09:00:00Z",
  "maxSeats": 30
}
```

#### Get Available Batches
```http
GET /api/batches/available
```

### Enrollment Endpoints

#### Create Enrollment (Students)
```http
POST /api/enrollments
Authorization: Bearer <token>
Content-Type: application/json

{
  "batchId": 1
}
```

#### Get My Enrollments
```http
GET /api/enrollments/my-enrollments
Authorization: Bearer <token>
```

#### Update Enrollment Status (Admin/Instructor only)
```http
PATCH /api/enrollments/:enrollmentId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "CONFIRMED"  // PENDING or CONFIRMED
}
```

## 🔐 Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Helmet**: Security headers
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: express-validator for request validation
- **Error Handling**: Centralized error handling with custom error classes

## 🎯 Key Feature: Transaction-Based Enrollment

The enrollment system uses Prisma transactions to prevent race conditions and overbooking:

```javascript
// Atomic transaction ensures:
// 1. Batch seat check
// 2. Enrollment creation
// 3. Seat count increment
// All succeed or all fail together
```

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── app.js                 # Server entry point
│   ├── controllers/           # Request/response handlers
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── batchController.js
│   │   └── enrollmentController.js
│   ├── services/             # Business logic & database operations
│   │   ├── authService.js
│   │   ├── courseService.js
│   │   ├── batchService.js
│   │   └── enrollmentService.js
│   ├── routes/               # API route definitions
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── batchRoutes.js
│   │   └── enrollmentRoutes.js
│   ├── middlewares/          # Custom middleware
│   │   ├── auth.js
│   │   └── errorHandler.js
│   └── utils/                # Helper functions
│       ├── prisma.js
│       └── ApiError.js
├── prisma/
│   └── schema.prisma         # Database schema
├── package.json
└── .env.example
```

## 🗄️ Database Schema

- **User**: Authentication and user management
- **Course**: Course information
- **Batch**: Course batches with seat management
- **Enrollment**: Student enrollments with status tracking

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## 🛡️ Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "details": {}  // Optional additional details
}
```

## 📄 License

ISC

## 👤 Author

Your Name

---

Built with ❤️ using Node.js, Express, PostgreSQL, and Prisma
