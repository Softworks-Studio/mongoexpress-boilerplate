# 🚀 Express-MongoDB TypeScript Boilerplate

A production-ready boilerplate for building scalable Node.js applications with Express.js and MongoDB. Features TypeScript support, comprehensive security measures, and enterprise-level architecture.

![GitHub](https://img.shields.io/github/license/Softworks-Studio/mongoexpress-boilerplate)
![Node](https://img.shields.io/badge/node-%3E%3D%2016.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-%5E5.6.3-blue)

## ✨ Features

- 🔒 **Enterprise Security** - CSRF protection, rate limiting, helmet security
- 📝 **TypeScript Support** - Full type safety and modern JavaScript features
- 🎯 **MongoDB Integration** - Mongoose ODM with connection retry mechanism
- 🚦 **Advanced Error Handling** - Centralized error handling with logging
- 💾 **Caching System** - Built-in caching middleware for performance
- 📊 **Logging System** - Winston logger with daily rotate file
- 🔄 **API Response Handler** - Standardized API response format

## 📋 Prerequisites

- Node.js >= 16.0.0
- MongoDB instance (local or Atlas)
- npm or yarn package manager

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/Softworks-Studio/mongoexpress-boilerplate.git

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
MONGO_URL="your-mongodb-connection-string"
NODE_ENV="development"
SECRET="your-secret-key"
DB_MAX_RETRIES=3
DB_RETRY_DELAY_MS=1000
```

### Running the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── api/
│   └── v1/
│       ├── controllers/    # Request handlers
│       ├── database/       # Database models and connection
│       ├── helpers/        # Utility functions
│       ├── middlewares/    # Express middlewares
│       ├── routes/         # API routes
│       └── utils/          # Utility modules
├── config/                 # Configuration files
└── index.ts               # Application entry point
```

## 🛠 Core Components

### Database Connection

The boilerplate includes a robust MongoDB connection handler with retry mechanism:

```typescript:src/api/v1/database/connect.ts
startLine: 17
endLine: 38
```

### Security Middleware

Comprehensive security features are implemented through the CoreMiddleware:

```typescript:src/api/v1/middlewares/core/CoreMiddleware.ts
startLine: 14
endLine: 82
```

## 🔧 Usage Guide

### Configuration Constants

You can modify the application constants in `src/config/constants.ts`:

```typescript
export const CONSTANTS = {
    PORT: process.env.PORT || 3000,
    PROJECT_NAME: 'mongoexpress-boilerplate',
    API_VERSION: 'v1',
    API_PREFIX: '/api',
    CORS: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
    RATE_LIMIT: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
    },
}
```

### Creating a New Route

1. Create a new controller in `src/api/v1/controllers`
2. Create a new route file in `src/api/v1/routes`
3. Add the route to `src/api/v1/routes/index.ts`

Example:

```typescript
// src/api/v1/controllers/UserController.ts
import { Request, Response } from 'express';
import { catchError } from '../helpers/catch/CatchErrorHelper';
import { handleResponse } from '../helpers/response/HandleResponseHelper';

export const getUsers = catchError(async (req: Request, res: Response) => {
  // Your logic here
  return handleResponse(res, 200, 'Users retrieved successfully', users);
});
```

### Creating a New Model

Follow the example model structure:

```typescript:src/api/v1/database/example/ExampleUserModelDatabase.ts
startLine: 1
endLine: 57
```

## 🔒 Security Features

- CSRF Protection
- Rate Limiting
- Helmet Security Headers
- MongoDB Sanitization
- XSS Protection
- HPP (HTTP Parameter Pollution)
- Compression

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 💬 Support

Need help? Contact our support team at support@softworks.studio

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Express.js Team
- Mongoose Team
- All contributors who help improve this boilerplate

---

Made with ❤️ by Softworks Team
