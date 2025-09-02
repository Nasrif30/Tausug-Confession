#  Tausug Confession Platform

A safe and secure platform for the Tausug community to share stories, confessions, and connect with others while maintaining privacy and cultural sensitivity.

## ✨ Features

### 🔐 User Features
- **User Authentication**: Secure login/registration system
- **Profile Management**: Customizable user profiles with avatar support
- **Story Creation**: Write and publish confessions with chapters
- **Content Management**: Edit, delete, and organize your stories
- **Bookmarks**: Save and organize your favorite stories
- **User Dashboard**: Track your story statistics and engagement

### 🎭 Content Features
- **Multi-chapter Stories**: Create detailed narratives with multiple chapters
- **Categories**: Organize content by themes (family, love, friendship, etc.)
- **Tags System**: Easy content discovery and organization
- **Search & Filter**: Find stories by title, description, or category
- **Sorting Options**: Sort by newest, most popular, or most viewed

### 🛡️ Admin Features
- **User Management**: Monitor and manage user accounts
- **Content Moderation**: Review and moderate user-generated content
- **Analytics Dashboard**: Track platform statistics and user engagement
- **Report Management**: Handle user reports and violations
- **Ban System**: Manage problematic users and content

## 🚀 Tech Stack

### Frontend
- **React.js** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hot Toast** - User notifications
- **Heroicons** - Beautiful SVG icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **JWT** - Secure authentication
- **Supabase** - Backend-as-a-Service (Database & Auth)

### Database
- **PostgreSQL** - Reliable relational database
- **Row Level Security** - Advanced data protection
- **Real-time subscriptions** - Live updates

## 📱 Live Demo

- **Frontend**: [Coming Soon - Vercel Deployment]
- **Backend**: [Coming Soon - Railway/Heroku Deployment]

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file with Supabase credentials
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=3600
```

## 📊 Database Schema

The platform uses a comprehensive database schema with the following main tables:
- `profiles` - User profiles and authentication
- `confessions` - Main story content
- `chapters` - Story chapters and content
- `comments` - User comments and discussions
- `likes` - User engagement tracking
- `bookmarks` - User content saving
- `reports` - Content moderation system

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/build`
4. Configure environment variables

### Backend (Railway/Heroku)
1. Deploy to Railway or Heroku
2. Set environment variables
3. Configure database connections
4. Set up CORS for frontend domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Creator

**NAS KILABOT** - Developer and creator of the Tausug Confession Platform

## 🙏 Acknowledgments

- Tausug community for inspiration and support
- Open source community for amazing tools and libraries
- Supabase team for excellent backend services

## 📞 Support

For support and inquiries, please contact the platform administrator or create an issue in this repository.

---

**Built with ❤️ for the Tausug Community**
