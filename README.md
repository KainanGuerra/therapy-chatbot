# Therapy Chatbot API

A comprehensive NestJS-based therapy chatbot designed for workplace wellness, featuring AI-powered mood analysis, professional recommendations, and habit tracking.

## Features

- 🤖 **AI-Powered Conversations**: Uses LangChain and OpenAI for intelligent, empathetic responses
- 📊 **Mood Analysis**: Real-time mood tracking and sentiment analysis
- 👨‍⚕️ **Professional Recommendations**: AI-driven suggestions for therapists, psychologists, and psychiatrists
- 🎯 **Habit Suggestions**: Personalized habit recommendations based on user context and mood
- 💾 **Context Storage**: Redis-based chat context management for seamless conversations
- 🔐 **Secure Authentication**: JWT-based authentication with user management
- 📈 **Analytics**: Comprehensive mood and habit tracking with statistics
- 🐳 **Docker Ready**: Complete Docker Compose setup for easy deployment

## Tech Stack

- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL with TypeORM
- **Cache/Context**: Redis
- **AI/ML**: LangChain, OpenAI GPT
- **Authentication**: JWT, Passport
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker, Docker Compose

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- OpenAI API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd therapy-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your-openai-api-key-here
   ```

4. **Start with Docker Compose**
   ```bash
   npm run docker:up
   ```

5. **Access the application**
   - API: http://localhost:3000
   - API Documentation: http://localhost:3000/api/docs
   - Redis Commander: http://localhost:8081

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login

### Chat
- `POST /api/v1/chat/sessions` - Create chat session
- `GET /api/v1/chat/sessions` - Get user sessions
- `POST /api/v1/chat/messages` - Send message to chatbot
- `GET /api/v1/chat/sessions/:id/messages` - Get session messages
- `GET /api/v1/chat/mood-history` - Get mood history

### Professionals
- `GET /api/v1/professionals` - List professionals
- `GET /api/v1/professionals/recommendations` - Get AI recommendations
- `GET /api/v1/professionals/search` - Search professionals
- `POST /api/v1/professionals/:id/rate` - Rate a professional

### Habits
- `GET /api/v1/habits` - Get user habits
- `POST /api/v1/habits` - Create new habit
- `GET /api/v1/habits/suggestions` - Get personalized suggestions
- `PATCH /api/v1/habits/:id/complete` - Mark habit complete
- `GET /api/v1/habits/stats` - Get habit statistics

## Architecture

### Core Components

1. **LangChain Service**: Handles AI processing for mood analysis, professional recommendations, and chat responses
2. **Redis Service**: Manages chat context storage and caching
3. **Chat Service**: Orchestrates conversations, mood tracking, and context management
4. **Professionals Service**: Manages therapist database and AI-powered recommendations
5. **Habits Service**: Provides personalized habit suggestions and tracking

### Data Flow

1. User sends message → Mood analysis → Context retrieval
2. AI generates response → Context update → Response delivery
3. Mood data → Professional recommendations → Habit suggestions

## Configuration

### Environment Variables

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=therapy_user
DATABASE_PASSWORD=therapy_password
DATABASE_NAME=therapy_chatbot

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# OpenAI
OPENAI_API_KEY=your-openai-api-key
```

### Docker Services

- **app**: NestJS application
- **postgres**: PostgreSQL database
- **redis**: Redis cache
- **redis-commander**: Redis management UI

## Development

### Running Locally

```bash
# Development mode
npm run start:dev

# Debug mode
npm run start:debug

# Production mode
npm run start:prod
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Database Management

```bash
# Generate migration
npm run typeorm:migration:generate -- -n MigrationName

# Run migrations
npm run typeorm:migration:run

# Revert migration
npm run typeorm:migration:revert
```

## Usage Examples

### Register and Login

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@company.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "department": "Engineering"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@company.com",
    "password": "SecurePass123!"
  }'
```

### Send Chat Message

```bash
curl -X POST http://localhost:3000/api/v1/chat/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "content": "I have been feeling really stressed at work lately..."
  }'
```

### Get Professional Recommendations

```bash
curl -X GET http://localhost:3000/api/v1/professionals/recommendations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## AI Features

### Mood Analysis
- Analyzes emotional state from text
- Provides mood level (1-5 scale)
- Identifies keywords and emotions
- Tracks sentiment over time

### Professional Recommendations
- AI-powered matching based on mood and context
- Considers user preferences and history
- Provides urgency levels and specializations
- Supports multiple professional types

### Habit Suggestions
- Personalized based on mood patterns
- Evidence-based recommendations
- Workplace-appropriate activities
- Difficulty and time estimates

## Security

- JWT authentication with secure tokens
- Input validation and sanitization
- Rate limiting to prevent abuse
- Helmet.js for security headers
- Environment-based configuration

## Monitoring

- Comprehensive logging
- Error tracking and handling
- Performance monitoring
- Health check endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/api/docs`