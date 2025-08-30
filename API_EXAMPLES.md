# API Usage Examples

This document provides practical examples of how to use the Therapy Chatbot API.

## Authentication

### Register a New User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@company.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "department": "Engineering",
    "jobTitle": "Software Developer"
  }'
```

Response:
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john.doe@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "department": "Engineering",
    "jobTitle": "Software Developer",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@company.com",
    "password": "SecurePassword123!"
  }'
```

## Chat Interactions

### Start a Conversation

```bash
curl -X POST http://localhost:3000/api/v1/chat/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "content": "I have been feeling really stressed at work lately. I am having trouble sleeping and feel overwhelmed with my workload."
  }'
```

Response:
```json
{
  "userMessage": {
    "id": "msg-123",
    "content": "I have been feeling really stressed at work lately...",
    "type": "user",
    "moodAnalysis": {
      "level": 2,
      "confidence": 0.85,
      "keywords": ["stressed", "trouble sleeping", "overwhelmed"],
      "sentiment": "negative",
      "emotions": ["stress", "anxiety", "fatigue"]
    },
    "createdAt": "2024-01-15T10:35:00.000Z"
  },
  "assistantMessage": {
    "id": "msg-124",
    "content": "I hear that you're going through a really challenging time with work stress, and I want you to know that what you're experiencing is valid and more common than you might think...",
    "type": "assistant",
    "createdAt": "2024-01-15T10:35:01.000Z"
  },
  "moodAnalysis": {
    "level": 2,
    "confidence": 0.85,
    "keywords": ["stressed", "trouble sleeping", "overwhelmed"],
    "sentiment": "negative",
    "emotions": ["stress", "anxiety", "fatigue"]
  }
}
```

### Continue Conversation in Same Session

```bash
curl -X POST http://localhost:3000/api/v1/chat/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "content": "Thank you for understanding. What can I do to manage this stress better?",
    "sessionId": "session-123"
  }'
```

### Get Chat Sessions

```bash
curl -X GET http://localhost:3000/api/v1/chat/sessions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Session Messages

```bash
curl -X GET http://localhost:3000/api/v1/chat/sessions/session-123/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Professional Recommendations

### Get AI-Powered Recommendations

```bash
curl -X GET http://localhost:3000/api/v1/professionals/recommendations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "recommendation": {
    "type": "psychologist",
    "reason": "Based on your recent stress levels and sleep difficulties, a psychologist specializing in cognitive behavioral therapy would be most beneficial for developing coping strategies.",
    "urgency": "medium",
    "specializations": ["workplace stress", "anxiety", "sleep disorders", "cognitive behavioral therapy"]
  },
  "professionals": [
    {
      "id": "prof-123",
      "name": "Dr. Sarah Johnson",
      "email": "sarah.johnson@mindcare.com",
      "type": "psychologist",
      "specializations": ["anxiety", "depression", "workplace stress", "cognitive behavioral therapy"],
      "location": "New York, NY",
      "rating": 4.8,
      "reviewCount": 127,
      "isAvailable": true
    }
  ]
}
```

### Search Professionals

```bash
curl -X GET "http://localhost:3000/api/v1/professionals/search?q=anxiety" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Professionals by Type

```bash
curl -X GET http://localhost:3000/api/v1/professionals/by-type/psychologist \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Rate a Professional

```bash
curl -X POST http://localhost:3000/api/v1/professionals/prof-123/rate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "rating": 5,
    "review": "Dr. Johnson was incredibly helpful with my workplace stress. Highly recommend!"
  }'
```

## Habit Management

### Get Personalized Habit Suggestions

```bash
curl -X GET http://localhost:3000/api/v1/habits/suggestions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
[
  {
    "id": "meditation",
    "title": "Daily Meditation",
    "description": "Practice mindfulness meditation for 10-15 minutes each morning to reduce stress and improve focus",
    "category": "mental_health",
    "difficulty": "easy",
    "estimatedTime": "10-15 minutes",
    "benefits": ["Reduced stress", "Better focus", "Improved emotional regulation"]
  },
  {
    "id": "deep_breathing",
    "title": "Deep Breathing Exercises",
    "description": "Practice deep breathing techniques during work breaks to manage immediate stress",
    "category": "stress_management",
    "difficulty": "easy",
    "estimatedTime": "5 minutes",
    "benefits": ["Immediate stress relief", "Better oxygen flow", "Improved focus"]
  }
]
```

### Create a New Habit

```bash
curl -X POST http://localhost:3000/api/v1/habits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Morning Meditation",
    "description": "Practice 10 minutes of mindfulness meditation every morning",
    "category": "mental_health",
    "difficulty": "easy",
    "estimatedTime": "10 minutes",
    "benefits": ["Reduced stress", "Better focus", "Improved mood"]
  }'
```

### Mark Habit as Complete

```bash
curl -X PATCH http://localhost:3000/api/v1/habits/habit-123/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "isCompleted": true,
    "notes": "Felt great after the meditation session!"
  }'
```

### Get Habit Statistics

```bash
curl -X GET http://localhost:3000/api/v1/habits/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "totalHabits": 5,
  "completedHabits": 3,
  "completionRate": 60.0,
  "streakStats": {
    "maxStreak": 7,
    "currentStreaks": 2
  },
  "categoryBreakdown": {
    "mental_health": 2,
    "physical_health": 1,
    "stress_management": 2
  }
}
```

### Get User Habits

```bash
curl -X GET http://localhost:3000/api/v1/habits \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Habits by Category

```bash
curl -X GET http://localhost:3000/api/v1/habits/category/mental_health \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Mood Tracking

### Get Mood History

```bash
curl -X GET "http://localhost:3000/api/v1/chat/mood-history?days=30" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
[
  {
    "id": "mood-123",
    "level": 2,
    "confidence": 0.85,
    "keywords": ["stressed", "overwhelmed"],
    "sentiment": "negative",
    "emotions": ["stress", "anxiety"],
    "createdAt": "2024-01-15T10:35:00.000Z"
  },
  {
    "id": "mood-124",
    "level": 3,
    "confidence": 0.72,
    "keywords": ["okay", "managing"],
    "sentiment": "neutral",
    "emotions": ["calm", "focused"],
    "createdAt": "2024-01-16T09:20:00.000Z"
  }
]
```

## Error Handling

### Authentication Error

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid credentials"
}
```

### Validation Error

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request"
}
```

### Rate Limiting

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

## WebSocket Integration (Future Enhancement)

For real-time chat functionality, you can connect to the WebSocket endpoint:

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

socket.on('message', (data) => {
  console.log('Received message:', data);
});

socket.emit('sendMessage', {
  content: 'Hello, I need some help with stress management',
  sessionId: 'session-123'
});
```

## Testing with Postman

Import the following collection to test all endpoints:

1. Create a new Postman collection
2. Add environment variables:
   - `baseUrl`: `http://localhost:3000/api/v1`
   - `token`: Your JWT token after login
3. Use `{{baseUrl}}` and `{{token}}` in your requests

## Rate Limiting

The API implements rate limiting:
- 10 requests per minute per IP address
- Authentication endpoints: 5 requests per minute
- Chat endpoints: 20 requests per minute

## Best Practices

1. **Always include proper error handling** in your client applications
2. **Store JWT tokens securely** (not in localStorage for production)
3. **Implement retry logic** for failed requests
4. **Use appropriate HTTP methods** for different operations
5. **Include proper Content-Type headers** for JSON requests
6. **Handle rate limiting** gracefully with exponential backoff