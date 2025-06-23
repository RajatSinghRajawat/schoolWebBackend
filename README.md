# Student Onboarding API

A RESTful API for student onboarding system with user authentication and OTP verification.

## Features

- User Registration and Authentication
- OTP Verification System (Required for Registration)
- JWT Token-based Authentication
- Protected Routes
- User Profile Management
- Test Mode for Development
- Flexible Login (Email or Mobile Number)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd StudentOnboarding
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=3000
JWT_SECRET=your_jwt_secret_key
```

4. Start the development server:
```bash
npm run dev
```

## API Documentation

### Authentication

#### OTP Verification (Required before Registration)
1. Send OTP to mobile number:
```http
POST /api/otp/send
Content-Type: application/json

{
  "mobile_num": "1234567890"
}
```

2. Verify OTP:
```http
POST /api/otp/verify
Content-Type: application/json

{
  "mobile_num": "1234567890",
  "otp": "123456"
}
```

#### Register a New User (Requires OTP Verification)
```http
POST /api/users/register
Content-Type: application/json

{
  "firstName": "John",
  "middleName": "Middle", // Optional
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "mobile_num": "1234567890" // Must be verified with OTP
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "status": "pending"
  }
}
```

Error Response (if OTP not verified):
```json
{
  "success": false,
  "message": "Please verify your mobile number with OTP first"
}
```

#### Login (Email or Mobile Number)
You can login using either email or mobile number:

1. Login with Email:
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

2. Login with Mobile Number:
```http
POST /api/users/login
Content-Type: application/json

{
  "mobile_num": "1234567890",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token",
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "mobile_num": "1234567890"
    }
  }
}
```

Error Responses:
```json
// When neither email nor mobile number is provided
{
  "success": false,
  "message": "Please provide either email or mobile number"
}

// When credentials are invalid
{
  "success": false,
  "message": "Invalid credentials"
}

// When account is not active
{
  "success": false,
  "message": "User account is not active"
}
```

#### Logout
```http
POST /api/users/logout
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### User Profile

#### Get Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "firstName": "John",
    "middleName": "Middle",
    "lastName": "Doe",
    "email": "john@example.com",
    "mobile_num": "1234567890",
    "status": "active"
  }
}
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "middleName": "New Middle", // Optional
  "lastName": "Doe"
}
```

Response:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "firstName": "John",
    "middleName": "New Middle",
    "lastName": "Doe"
  }
}
```

### OTP Verification

#### Send OTP
```http
POST /api/otp/send
Content-Type: application/json

{
  "mobile_num": "1234567890"
}
```

Response:
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "mobile_num": "1234567890",
    "otp": "123456" // Only in test mode
  }
}
```

#### Verify OTP
```http
POST /api/otp/verify
Content-Type: application/json

{
  "mobile_num": "1234567890",
  "otp": "123456"
}
```

Response:
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

## Test Mode

The API includes a test mode for development purposes:

- Test Mobile Number: 1234567890
- Test OTP: 123456

In test mode:
- Only the test mobile number is accepted
- OTP is always 123456
- OTPs are logged to console instead of being sent via SMS

## Error Responses

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message"
}
```

Common HTTP Status Codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Security

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Protected routes require valid JWT token
- OTPs expire after 5 minutes
- Input validation on all endpoints
- Mobile number verification required before registration
- Flexible authentication (email or mobile number)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 