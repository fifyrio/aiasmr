# Backend API Deployment Guide

This guide provides step-by-step instructions for deploying the AI ASMR Backend API to various platforms.

## 🚀 Quick Start

### Prerequisites

1. **Environment Setup**
   - Node.js 18+ installed
   - All environment variables configured
   - Database (Supabase) set up
   - External services (KIE API, R2 storage) configured

2. **Required Environment Variables**
   ```bash
   # Copy and fill out the environment file
   cp .env.example .env
   # Edit .env with your actual values
   ```

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run API tests
npm run test:api

# Check health
curl http://localhost:3000/api/health
```

## 🌐 Production Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides excellent Node.js support with automatic scaling and global CDN.

#### Step 1: Prepare for Deployment

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
    },
    {
      "src": "/health",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "server.js": {
      "maxDuration": 300
    }
  }
}
```

2. Install Vercel CLI:
```bash
npm install -g vercel
```

#### Step 2: Deploy

```bash
# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Step 3: Configure Environment Variables

In the Vercel dashboard:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add all required variables:

```
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-in-production
KIE_API_KEY=your_kie_api_key
KIE_BASE_URL=https://api.kie.ai/api/v1
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=https://your_endpoint.r2.cloudflarestorage.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
BASE_URL=https://your-app.vercel.app
CALLBACK_URL=https://your-app.vercel.app/api/kie-callback
```

### Option 2: Railway

Railway offers simple deployments with automatic CI/CD from Git.

#### Step 1: Prepare Railway Config

Create `railway.toml`:
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
```

#### Step 2: Deploy

1. Connect your repository to Railway
2. Configure environment variables in Railway dashboard
3. Deploy automatically triggers on push to main branch

### Option 3: Render

Render provides free hosting tier with easy setup.

#### Step 1: Create `render.yaml`

```yaml
services:
  - type: web
    name: aiasmr-backend-api
    env: node
    plan: starter
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        generateValue: true
      # Add other environment variables
    healthCheckPath: /api/health
```

#### Step 2: Deploy

1. Connect your GitHub repository to Render
2. Configure environment variables
3. Deploy automatically from the dashboard

### Option 4: Docker Deployment

For containerized deployments on any platform.

#### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create temp directory for video processing
RUN mkdir -p /app/temp

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

#### Step 2: Build and Deploy

```bash
# Build image
docker build -t aiasmr-backend-api .

# Run locally
docker run -p 3000:3000 --env-file .env aiasmr-backend-api

# Push to registry (Docker Hub, AWS ECR, etc.)
docker tag aiasmr-backend-api your-registry/aiasmr-backend-api
docker push your-registry/aiasmr-backend-api
```

#### Step 3: Kubernetes Deployment (Optional)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aiasmr-backend-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: aiasmr-backend-api
  template:
    metadata:
      labels:
        app: aiasmr-backend-api
    spec:
      containers:
      - name: api
        image: your-registry/aiasmr-backend-api
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        # Add other environment variables from secrets
        livenessProbe:
          httpGet:
            path: /api/health/live
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: aiasmr-backend-api-service
spec:
  selector:
    app: aiasmr-backend-api
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## 🔧 Post-Deployment Setup

### 1. Verify Deployment

```bash
# Check health
curl https://your-api-url.com/api/health

# Detailed health check
curl https://your-api-url.com/api/health/detailed

# Test authentication
curl -X POST https://your-api-url.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123!"}'
```

### 2. Configure Monitoring

#### Application Monitoring

Set up monitoring for:
- API response times
- Error rates
- Database connection health
- External service availability

#### Log Management

Configure structured logging:
```javascript
// In production, consider using external log aggregation
const winston = require('winston');
const { Loggly } = require('winston-loggly-bulk');

if (process.env.NODE_ENV === 'production') {
  logger.add(new Loggly({
    token: process.env.LOGGLY_TOKEN,
    subdomain: process.env.LOGGLY_SUBDOMAIN,
    tags: ["aiasmr-backend-api"],
    json: true
  }));
}
```

### 3. Set Up Alerts

Configure alerts for:
- API downtime
- High error rates
- Database connection issues
- Credit system failures
- Video generation failures

### 4. Performance Optimization

#### Enable Compression
The API includes gzip compression by default.

#### Database Connection Pooling
Supabase handles connection pooling automatically.

#### Caching Strategy
Consider implementing Redis caching for:
- User sessions
- Credit balances
- Video status queries

```javascript
// Optional Redis integration
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache user credits
const getCachedCredits = async (userId) => {
  const cached = await client.get(`credits:${userId}`);
  if (cached) return JSON.parse(cached);
  
  const credits = await getUserCredits(userId);
  await client.setex(`credits:${userId}`, 300, JSON.stringify(credits));
  return credits;
};
```

## 🚨 Security Considerations

### 1. Environment Variables

- Use strong, unique JWT secrets
- Rotate API keys regularly
- Never commit secrets to version control
- Use platform-specific secret management

### 2. Rate Limiting

The API includes comprehensive rate limiting:
- General API: 100 requests/minute/IP
- Authentication: 10 attempts/hour/IP
- Video Generation: 5 requests/hour/user

### 3. HTTPS

Ensure all deployments use HTTPS:
- Most platforms (Vercel, Railway, Render) provide HTTPS by default
- For custom deployments, use Let's Encrypt or similar

### 4. CORS Configuration

Update CORS settings for your frontend domains:
```javascript
app.use(cors({
  origin: [
    'https://your-mobile-app.com',
    'https://your-web-app.com'
  ],
  credentials: true
}));
```

## 📊 Monitoring and Maintenance

### Daily Monitoring

- Check API health endpoints
- Monitor error logs
- Verify video generation success rates
- Review credit transactions

### Weekly Maintenance

- Review performance metrics
- Check database query performance
- Update dependencies (security patches)
- Analyze user feedback

### Monthly Reviews

- Review and rotate secrets
- Analyze usage patterns
- Plan capacity scaling
- Update documentation

## 🔍 Troubleshooting

### Common Issues

1. **Environment Variable Missing**
   ```
   Error: Missing required environment variables: JWT_SECRET
   ```
   **Solution**: Verify all required environment variables are set

2. **Database Connection Failed**
   ```
   Error: Failed to connect to Supabase
   ```
   **Solution**: Check SUPABASE_URL and SUPABASE_SERVICE_KEY

3. **KIE API Authentication Failed**
   ```
   Error: Invalid API key, please check configuration
   ```
   **Solution**: Verify KIE_API_KEY is correct and active

4. **R2 Storage Upload Failed**
   ```
   Error: Access denied for R2 storage
   ```
   **Solution**: Check R2 credentials and bucket permissions

### Debug Mode

Enable debug logging:
```bash
DEBUG_MODE=true LOG_LEVEL=debug npm start
```

### Health Check Endpoints

- `/api/health` - Basic health check
- `/api/health/detailed` - Detailed service status
- `/api/health/ready` - Kubernetes readiness probe
- `/api/health/live` - Kubernetes liveness probe

## 📞 Support

For deployment issues:
1. Check the logs for specific error messages
2. Verify all environment variables are set correctly
3. Test individual services using the health endpoints
4. Review the API documentation for endpoint usage

---

**Next Steps**: After successful deployment, proceed with mobile app integration using the deployed API endpoints.