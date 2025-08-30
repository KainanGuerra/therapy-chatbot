#!/bin/bash

# Therapy Chatbot Setup Script
echo "🚀 Setting up Therapy Chatbot..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and add your OpenAI API key!"
    echo "   OPENAI_API_KEY=your-openai-api-key-here"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations (if any)
echo "🗄️  Running database migrations..."
npm run typeorm:migration:run 2>/dev/null || echo "No migrations to run"

# Seed database
echo "🌱 Seeding database with sample data..."
npm run seed

# Start the application
echo "🎉 Starting the application..."
npm run start:dev

echo ""
echo "✅ Setup complete!"
echo "🌐 API: http://localhost:3000"
echo "📚 Docs: http://localhost:3000/api/docs"
echo "🔍 Redis: http://localhost:8081"