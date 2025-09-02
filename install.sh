#!/bin/bash

echo "🚀 Tausug Confession Platform - Installation Script"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo "✅ Backend dependencies installed"

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo "✅ Frontend dependencies installed"

# Create environment files
echo ""
echo "🔧 Setting up environment files..."

# Backend .env
cd ../backend
if [ ! -f .env ]; then
    echo "Creating backend .env file..."
    cat > .env << EOF
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRE=30d

# Supabase Configuration
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
    echo "✅ Backend .env file created"
    echo "⚠️  Please update the backend .env file with your actual values"
else
    echo "✅ Backend .env file already exists"
fi

# Frontend .env
cd ../frontend
if [ ! -f .env ]; then
    echo "Creating frontend .env file..."
    cat > .env << EOF
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SUPABASE_URL=your-supabase-project-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your-google-oauth-client-id

# Feature Flags
REACT_APP_ENABLE_GOOGLE_AUTH=true
REACT_APP_ENABLE_BADGES=true
REACT_APP_ENABLE_BOOKMARKS=true
EOF
    echo "✅ Frontend .env file created"
    echo "⚠️  Please update the frontend .env file with your actual values"
else
    echo "✅ Frontend .env file already exists"
fi

# Return to root
cd ..

echo ""
echo "🎉 Installation completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Set up your Supabase project and get your API keys"
echo "2. Configure Google OAuth in Google Cloud Console"
echo "3. Update the .env files with your actual values"
echo "4. Run the database schema from database/schema.sql"
echo "5. Start the development servers:"
echo "   - Backend: cd backend && npm run dev"
echo "   - Frontend: cd frontend && npm start"
echo ""
echo "📚 For detailed setup instructions, see the README.md file"
echo ""
echo "🚀 Happy coding!"
