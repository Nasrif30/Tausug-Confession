const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up environment files for Tausug Confession Platform...\n');

// Backend .env
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const backendEnvContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRE=30d

# Supabase Configuration
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
`;

// Frontend .env
const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
const frontendEnvContent = `# API Configuration
REACT_APP_API_URL=http://localhost:5000

# Google OAuth (optional)
REACT_APP_GOOGLE_CLIENT_ID=your-google-oauth-client-id-here
`;

try {
  // Create backend .env
  if (!fs.existsSync(backendEnvPath)) {
    fs.writeFileSync(backendEnvPath, backendEnvContent);
    console.log('✅ Created backend/.env file');
  } else {
    console.log('⚠️  backend/.env already exists');
  }

  // Create frontend .env
  if (!fs.existsSync(frontendEnvPath)) {
    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    console.log('✅ Created frontend/.env file');
  } else {
    console.log('⚠️  frontend/.env already exists');
  }

  console.log('\n📝 Next steps:');
  console.log('1. Update backend/.env with your actual Supabase credentials');
  console.log('2. Update frontend/.env with your Google OAuth client ID (if using Google auth)');
  console.log('3. Start your backend server: cd backend && npm start');
  console.log('4. Start your frontend: cd frontend && npm start');
  console.log('\n🔧 The CORS issue should now be resolved!');

} catch (error) {
  console.error('❌ Error creating environment files:', error.message);
  console.log('\n📝 Manual setup required:');
  console.log('1. Create backend/.env with the content shown above');
  console.log('2. Create frontend/.env with the content shown above');
}
