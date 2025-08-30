# Deployment Guide

This guide covers different deployment options for the Therapy Chatbot application.

## Local Development

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- OpenAI API Key

### Quick Start
```bash
# Clone and setup
git clone <repository-url>
cd therapy-chatbot
chmod +x setup.sh
./setup.sh
```

### Manual Setup
```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your OpenAI API key

# Start services
docker-compose up -d

# Seed database
npm run seed

# Start development server
npm run start:dev
```

## Production Deployment

### Docker Production Build

1. **Create production environment file**
```bash
cp .env.example .env.production
```

2. **Update production values**
```env
NODE_ENV=production
DATABASE_HOST=your-production-db-host
DATABASE_PASSWORD=secure-production-password
JWT_SECRET=your-super-secure-jwt-secret
OPENAI_API_KEY=your-openai-api-key
```

3. **Build and deploy**
```bash
# Build production image
docker build -t therapy-chatbot:latest .

# Run with production compose
docker-compose -f docker-compose.prod.yml up -d
```

### AWS Deployment

#### Using AWS ECS with Fargate

1. **Create ECR repository**
```bash
aws ecr create-repository --repository-name therapy-chatbot
```

2. **Build and push image**
```bash
# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and tag
docker build -t therapy-chatbot .
docker tag therapy-chatbot:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/therapy-chatbot:latest

# Push
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/therapy-chatbot:latest
```

3. **Create ECS task definition**
```json
{
  "family": "therapy-chatbot",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "therapy-chatbot",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/therapy-chatbot:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "DATABASE_HOST",
          "value": "your-rds-endpoint"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:therapy-chatbot-db-password"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:therapy-chatbot-jwt-secret"
        },
        {
          "name": "OPENAI_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:therapy-chatbot-openai-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/therapy-chatbot",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

4. **Set up RDS PostgreSQL**
```bash
aws rds create-db-instance \
  --db-instance-identifier therapy-chatbot-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username therapy_user \
  --master-user-password <secure-password> \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxxxxx
```

5. **Set up ElastiCache Redis**
```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id therapy-chatbot-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

#### Using AWS Lambda (Serverless)

1. **Install Serverless Framework**
```bash
npm install -g serverless
npm install --save-dev serverless-offline
```

2. **Create serverless.yml**
```yaml
service: therapy-chatbot

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    NODE_ENV: production
    DATABASE_HOST: ${env:DATABASE_HOST}
    DATABASE_PASSWORD: ${env:DATABASE_PASSWORD}
    JWT_SECRET: ${env:JWT_SECRET}
    OPENAI_API_KEY: ${env:OPENAI_API_KEY}

functions:
  app:
    handler: dist/lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true

plugins:
  - serverless-offline

package:
  exclude:
    - node_modules/**
    - src/**
    - test/**
```

3. **Create Lambda handler**
```typescript
// src/lambda.ts
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as express from 'express';
import { Handler, Context } from 'aws-lambda';
import * as awsServerlessExpress from 'aws-serverless-express';

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    const expressApp = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
    app.enableCors();
    await app.init();
    cachedServer = awsServerlessExpress.createServer(expressApp);
  }
  return cachedServer;
}

export const handler: Handler = async (event: any, context: Context) => {
  const server = await bootstrap();
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};
```

### Google Cloud Platform

#### Using Cloud Run

1. **Create Dockerfile for production**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 8080
CMD ["node", "dist/main.js"]
```

2. **Build and deploy**
```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/therapy-chatbot

# Deploy to Cloud Run
gcloud run deploy therapy-chatbot \
  --image gcr.io/PROJECT_ID/therapy-chatbot \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-env-vars DATABASE_HOST=your-cloud-sql-ip
```

### Kubernetes Deployment

1. **Create Kubernetes manifests**

**deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: therapy-chatbot
spec:
  replicas: 3
  selector:
    matchLabels:
      app: therapy-chatbot
  template:
    metadata:
      labels:
        app: therapy-chatbot
    spec:
      containers:
      - name: therapy-chatbot
        image: therapy-chatbot:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_HOST
          valueFrom:
            secretKeyRef:
              name: therapy-chatbot-secrets
              key: database-host
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: therapy-chatbot-secrets
              key: database-password
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: therapy-chatbot-secrets
              key: jwt-secret
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: therapy-chatbot-secrets
              key: openai-api-key
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

**service.yaml**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: therapy-chatbot-service
spec:
  selector:
    app: therapy-chatbot
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

**secrets.yaml**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: therapy-chatbot-secrets
type: Opaque
data:
  database-host: <base64-encoded-host>
  database-password: <base64-encoded-password>
  jwt-secret: <base64-encoded-jwt-secret>
  openai-api-key: <base64-encoded-openai-key>
```

2. **Deploy to Kubernetes**
```bash
kubectl apply -f secrets.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

## Environment Configuration

### Production Environment Variables

```env
# Application
NODE_ENV=production
PORT=3000

# Database
DATABASE_HOST=your-production-db-host
DATABASE_PORT=5432
DATABASE_USERNAME=therapy_user
DATABASE_PASSWORD=secure-production-password
DATABASE_NAME=therapy_chatbot

# Redis
REDIS_HOST=your-production-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=secure-redis-password

# Security
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters
JWT_EXPIRES_IN=24h

# AI
OPENAI_API_KEY=your-openai-api-key

# Monitoring
LOG_LEVEL=info
```

## Database Migration

### Production Migration Strategy

1. **Backup existing database**
```bash
pg_dump -h production-host -U therapy_user therapy_chatbot > backup.sql
```

2. **Run migrations**
```bash
npm run typeorm:migration:run
```

3. **Verify migration**
```bash
npm run typeorm:migration:show
```

## Monitoring and Logging

### Application Monitoring

1. **Health Check Endpoint**
```typescript
// Add to app.controller.ts
@Get('health')
healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
}
```

2. **Prometheus Metrics**
```bash
npm install @prometheus-io/client
```

### Logging Configuration

```typescript
// Add to main.ts
import { Logger } from '@nestjs/common';

const logger = new Logger('Bootstrap');
logger.log(`Application is running on: ${await app.getUrl()}`);
```

## Security Considerations

### Production Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure JWT secrets (32+ characters)
- [ ] Enable CORS with specific origins
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up proper logging
- [ ] Use security headers (Helmet.js)
- [ ] Validate all inputs
- [ ] Use parameterized queries
- [ ] Enable database SSL
- [ ] Set up monitoring and alerts

### SSL/TLS Configuration

```typescript
// For HTTPS in production
const httpsOptions = {
  key: fs.readFileSync('./secrets/private-key.pem'),
  cert: fs.readFileSync('./secrets/public-certificate.pem'),
};
const app = await NestFactory.create(AppModule, {
  httpsOptions,
});
```

## Performance Optimization

### Production Optimizations

1. **Enable compression**
```typescript
import * as compression from 'compression';
app.use(compression());
```

2. **Database connection pooling**
```typescript
// In database config
{
  type: 'postgres',
  // ... other config
  extra: {
    max: 20,
    min: 5,
    acquire: 30000,
    idle: 10000,
  },
}
```

3. **Redis caching strategy**
```typescript
// Cache frequently accessed data
await this.redisService.cacheData('professionals:all', professionals, 3600);
```

## Backup and Recovery

### Database Backup

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h $DATABASE_HOST -U $DATABASE_USERNAME $DATABASE_NAME > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
```

### Redis Backup

```bash
# Redis backup
redis-cli --rdb dump.rdb
aws s3 cp dump.rdb s3://your-backup-bucket/redis/
```

## Troubleshooting

### Common Issues

1. **Database connection issues**
   - Check network connectivity
   - Verify credentials
   - Check firewall rules

2. **Redis connection issues**
   - Verify Redis is running
   - Check connection string
   - Verify network access

3. **OpenAI API issues**
   - Check API key validity
   - Verify rate limits
   - Check API status

### Debugging

```bash
# Enable debug logging
NODE_ENV=development LOG_LEVEL=debug npm start

# Check container logs
docker logs therapy-chatbot-app

# Database connection test
npm run typeorm:query "SELECT 1"
```

## Scaling Considerations

### Horizontal Scaling

- Use load balancer (ALB, NGINX)
- Implement session affinity if needed
- Use Redis for shared state
- Consider database read replicas

### Vertical Scaling

- Monitor CPU and memory usage
- Adjust container resources
- Optimize database queries
- Implement caching strategies

This deployment guide provides comprehensive instructions for deploying the Therapy Chatbot in various environments. Choose the deployment method that best fits your infrastructure and requirements.