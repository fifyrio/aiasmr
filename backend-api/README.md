# AIASMR Backend API

A robust Express.js backend API server for the AI ASMR video generation mobile application. This API provides secure endpoints for user authentication, video generation via KIE API, credit management, and comprehensive user management.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with secure token management
- **Video Generation**: Integration with KIE Runway API for AI video generation
- **Credit Management**: Complete credit system with transactions, purchases, and refunds
- **Rate Limiting**: Comprehensive rate limiting for API protection
- **Input Validation**: Robust validation using Joi schemas
- **Error Handling**: Centralized error handling with detailed logging
- **Database Integration**: Supabase PostgreSQL integration with optimized queries
- **File Storage**: Cloudflare R2 integration for video and thumbnail storage
- **Logging**: Structured logging with Winston
- **Security**: Helmet.js, CORS, input sanitization, and best practices

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project
- KIE API access
- Cloudflare R2 storage account

## 🛠 Installation

1. **Clone the repository and navigate to backend directory:**
   ```bash
   cd backend-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Fill in all required environment variables in `.env`:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   
   # KIE API Configuration
   KIE_API_KEY=your_kie_api_key
   KIE_BASE_URL=https://api.kie.ai/api/v1
   
   # Cloudflare R2 Configuration
   R2_ACCOUNT_ID=your_account_id
   R2_ACCESS_KEY_ID=your_access_key
   R2_SECRET_ACCESS_KEY=your_secret_key
   R2_BUCKET_NAME=your_bucket_name
   R2_ENDPOINT=https://your_endpoint.r2.cloudflarestorage.com
   
   # Supabase Configuration
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key
   
   # Application Configuration
   BASE_URL=http://localhost:3000
   CALLBACK_URL=http://localhost:3000/api/kie-callback
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer <token>
```

### Video Generation Endpoints

#### Generate Video
```http
POST /api/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "ASMR soap cutting video with satisfying sounds",
  "triggers": ["soap", "cutting"],
  "duration": 5,
  "quality": "720p",
  "aspectRatio": "16:9",
  "imageUrl": "https://example.com/reference.jpg"
}
```

#### Check Generation Status
```http
GET /api/generate/status/:taskId
Authorization: Bearer <token>
```

### Video Management Endpoints

#### Get User Videos
```http
GET /api/videos?page=1&limit=20
Authorization: Bearer <token>
```

#### Get Video Details
```http
GET /api/videos/:videoId
Authorization: Bearer <token>
```

#### Delete Video
```http
DELETE /api/videos/:videoId
Authorization: Bearer <token>
```

### Credits Endpoints

#### Get Credit Balance
```http
GET /api/credits/balance
Authorization: Bearer <token>
```

#### Get Credit History
```http
GET /api/credits/history?page=1&limit=50
Authorization: Bearer <token>
```

#### Purchase Credits
```http
POST /api/credits/purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "package": "standard",
  "paymentMethod": "stripe",
  "amount": 250
}
```

### User Management Endpoints

#### Get User Profile
```http
GET /api/user/profile
Authorization: Bearer <token>
```

#### Update User Profile
```http
PUT /api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe"
}
```

#### Get User Statistics
```http
GET /api/user/statistics
Authorization: Bearer <token>
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Multiple rate limiting strategies:
  - General API: 100 requests/minute/IP
  - Authentication: 10 attempts/hour/IP
  - Video Generation: 5 requests/hour/user
  - Credits Purchase: 10 purchases/day/user
- **Input Validation**: Comprehensive validation with Joi
- **Input Sanitization**: XSS protection and data cleaning
- **CORS**: Configurable cross-origin resource sharing
- **Helmet.js**: Security headers and best practices
- **Password Security**: bcrypt hashing with salt rounds

## 🏗 Architecture

### Project Structure
```
backend-api/
├── src/
│   ├── routes/           # API route definitions
│   │   ├── auth.js       # Authentication routes
│   │   ├── generate.js   # Video generation routes
│   │   ├── videos.js     # Video management routes
│   │   ├── credits.js    # Credits management routes
│   │   └── user.js       # User management routes
│   ├── services/         # Business logic services
│   │   ├── auth-service.js      # Authentication service
│   │   ├── kie-client.js        # KIE API client
│   │   ├── credits-manager.js   # Credits management
│   │   └── video-processor.js   # Video processing (planned)
│   ├── middleware/       # Express middleware
│   │   ├── auth.js              # JWT authentication
│   │   ├── rate-limit.js        # Rate limiting
│   │   ├── validation.js        # Input validation
│   │   └── error-handler.js     # Error handling
│   ├── config/           # Configuration files
│   │   ├── database.js          # Database configuration
│   │   ├── environment.js       # Environment management
│   │   └── constants.js         # Application constants
│   └── utils/            # Utility functions
│       ├── logger.js            # Winston logger
│       └── helpers.js           # Helper functions
├── server.js             # Server entry point
├── package.json          # Dependencies and scripts
└── .env.example          # Environment variables template
```

### Database Schema

The API uses Supabase PostgreSQL with the following key tables:

- **`user_profiles`**: User information and credits
- **`videos`**: Video records and metadata  
- **`credit_transactions`**: Credit usage/refund tracking
- **`subscriptions`**: User subscription management
- **`orders`**: Payment and purchase records

## 🚀 Deployment

### Option 1: Vercel (Recommended)

1. Create `vercel.json` in the backend-api directory:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/server.js"
       }
     ]
   }
   ```

2. Deploy to Vercel:
   ```bash
   npx vercel --prod
   ```

### Option 2: Railway

1. Connect your repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main branch

### Option 3: Docker

1. Create `Dockerfile`:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. Build and run:
   ```bash
   docker build -t aiasmr-backend .
   docker run -p 3000:3000 --env-file .env aiasmr-backend
   ```

## 🔧 Development

### Available Scripts

- **`npm run dev`**: Start development server with nodemon
- **`npm start`**: Start production server
- **`npm run lint`**: Run ESLint
- **`npm run lint:fix`**: Fix ESLint issues
- **`npm test`**: Run tests (when implemented)

### Development Guidelines

1. **Code Style**: Follow ESLint configuration
2. **Error Handling**: Always use try-catch and proper error responses
3. **Logging**: Use the Winston logger, not console.log
4. **Validation**: Validate all inputs using Joi schemas
5. **Security**: Never expose sensitive data in responses
6. **Testing**: Write tests for new endpoints and services

## 📊 Monitoring and Logging

The API includes comprehensive logging with Winston:

- **Error Logs**: All errors with stack traces
- **Request Logs**: API requests with response times
- **Security Logs**: Authentication attempts and rate limiting
- **Business Logs**: Credit transactions and video operations

### Log Levels
- **Error**: System errors and exceptions
- **Warn**: Warning conditions (rate limits, validation failures)
- **Info**: General information (successful operations)
- **Debug**: Detailed information for troubleshooting

## 🛡 Rate Limiting

The API implements multiple rate limiting strategies:

| Endpoint Type | Limit | Window | Key |
|---------------|--------|---------|-----|
| General API | 100 requests | 1 minute | IP address |
| Authentication | 10 attempts | 1 hour | IP address |
| Video Generation | 5 requests | 1 hour | User ID |
| Credits Purchase | 10 purchases | 1 day | User ID |
| Sensitive Endpoints | 3 requests | 15 minutes | User ID/IP |

## ⚡ Performance

- **Connection Pooling**: Efficient database connections
- **Caching**: Response caching where appropriate
- **Compression**: Gzip compression for responses
- **Request Parsing**: Optimized body parsing limits

## 🐛 Troubleshooting

### Common Issues

1. **Environment Variables**: Ensure all required variables are set
2. **Database Connection**: Check Supabase URL and service key
3. **KIE API**: Verify API key and base URL
4. **Port Conflicts**: Change PORT in .env if 3000 is occupied

### Debug Mode

Enable debug mode for detailed logging:
```env
DEBUG_MODE=true
LOG_LEVEL=debug
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ for the AI ASMR community**