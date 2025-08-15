# 🚀 GitHub Image Manager - Transform GitHub into a CDN

A powerful RESTful API and web application that transforms GitHub repositories into a high-performance CDN (Content Delivery Network) for images. Upload images through a beautiful web interface and get instant HTTPS URLs that can be used in any web project worldwide.

## ✨ Features

- 🔐 **GitHub OAuth Authentication** - Secure login using GitHub accounts
- 🗂️ **Repository Management** - Create and manage GitHub repositories
- 📸 **Image Upload** - Drag & drop image uploads with optimization
- 🖼️ **Image Management** - View, organize, and delete images
- 🚀 **RESTful API** - Full API for programmatic access
- 💾 **GitHub Storage** - Images stored directly in GitHub repositories
- 🎨 **Modern UI** - Beautiful, responsive React frontend with Tailwind CSS
- 🔒 **Security** - Rate limiting, CORS, and authentication middleware
- 🌐 **Global CDN** - Leverage GitHub's worldwide infrastructure for fast image delivery
- 🔗 **Direct URLs** - Get `https://raw.githubusercontent.com/` URLs instantly
- 📱 **Public Access** - CDN URLs are publicly accessible (no authentication required)
- ⚡ **Auto-Optimization** - Automatic resizing and WebP conversion for optimal performance

## Technology Stack

### Backend
- **Node.js** with Express.js
- **GitHub OAuth** via Passport.js
- **GitHub API** integration via Octokit.js
- **SQLite** database for metadata storage
- **Sharp.js** for image processing and optimization
- **Multer** for file upload handling

### Frontend
- **React 18** with modern hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API communication

## Prerequisites

Before running this project, you need:

1. **Node.js** (v16 or higher)
2. **GitHub Account** with OAuth app credentials
3. **Git** installed on your system

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd github-image-api
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: GitHub Image Manager
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:5000/auth/github/callback`
4. Copy the **Client ID** and **Client Secret**

### 4. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` with your GitHub OAuth credentials:
   ```env
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_CALLBACK_URL=http://localhost:5000/auth/github/callback
   SESSION_SECRET=your_random_session_secret
   PORT=5000
   NODE_ENV=development
   DB_PATH=./database.sqlite
   ```

### 5. Start the Application

```bash
# Start backend server (in one terminal)
npm run dev

# Start frontend (in another terminal)
npm run client
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## API Endpoints

### Authentication
- `GET /auth/github` - GitHub OAuth login
- `GET /auth/github/callback` - OAuth callback
- `GET /auth/logout` - Logout user
- `GET /auth/user` - Get current user info
- `GET /auth/status` - Check authentication status

### Repositories
- `GET /api/repositories` - Get user's repositories
- `POST /api/repositories` - Create new repository
- `GET /api/repositories/:id` - Get repository details

### Images
- `GET /api/repositories/:id/images` - Get repository images
- `POST /api/repositories/:id/images` - Upload image
- `GET /api/images/:id` - Get image details
- `DELETE /api/repositories/:id/images/:imageId` - Delete image

### 🚀 CDN Endpoints (Public Access - No Authentication Required)
- `GET /api/repositories/:id/cdn` - Get all CDN URLs for a repository
- `GET /api/images/:id/cdn` - Get CDN URL for a specific image

## Usage

### 1. Authentication
- Visit the application and click "Continue with GitHub"
- Authorize the application to access your GitHub account
- You'll be redirected back to the dashboard

### 2. Creating Repositories
- Click "New Repository" on the dashboard
- Enter repository name, description, and privacy settings
- Click "Create Repository"

### 3. Uploading Images
- Navigate to a repository
- Click "Upload Image"
- Drag & drop or select image files
- Images are automatically optimized and stored in GitHub

### 4. Managing Images
- View all images in a repository
- Click on images to see details
- Delete images when no longer needed
- Access raw image URLs for external use

### 5. 🚀 Using as a CDN
- Get direct HTTPS URLs for any uploaded image
- Use CDN URLs in HTML, CSS, JavaScript, React, etc.
- Images are served globally via GitHub's infrastructure
- No authentication required for CDN access
- Perfect for web projects, mobile apps, and APIs

#### CDN URL Format
```
https://raw.githubusercontent.com/{username}/{repository}/main/images/{filename}
```

#### Example Usage
```html
<!-- HTML -->
<img src="https://raw.githubusercontent.com/username/repo/main/images/logo.png" alt="Logo">

<!-- CSS -->
.hero { background-image: url('https://raw.githubusercontent.com/username/repo/main/images/hero-bg.png'); }

<!-- JavaScript -->
const img = new Image();
img.src = 'https://raw.githubusercontent.com/username/repo/main/images/dynamic.png';
```

## Image Processing

The application automatically:
- Converts images to WebP format for better compression
- Resizes large images to max 1920x1080 pixels
- Maintains aspect ratio during resizing
- Optimizes file sizes while preserving quality

## 🌐 CDN Benefits

### For Developers
- **Fast Development**: No need to set up separate image hosting
- **Version Control**: Track image changes with Git
- **Collaboration**: Team members can upload images through the interface
- **Backup**: All images are backed up on GitHub

### For Projects
- **Performance**: GitHub's global CDN ensures fast loading worldwide
- **Reliability**: GitHub's 99.9% uptime guarantee
- **Scalability**: Handle unlimited images and traffic
- **Cost**: Free hosting for public repositories

### For Clients
- **Professional**: Clean, professional URLs
- **Accessible**: No login required to access images
- **Fast**: Global CDN ensures fast loading worldwide
- **Reliable**: GitHub's enterprise-grade infrastructure

## Security Features

- **OAuth 2.0** authentication via GitHub
- **Session management** with secure cookies
- **Rate limiting** to prevent abuse
- **CORS protection** for cross-origin requests
- **Input validation** and sanitization
- **File type restrictions** (images only)
- **File size limits** (10MB max)

## Database Schema

The SQLite database stores:
- **Users**: GitHub user information and access tokens
- **Repositories**: Repository metadata and GitHub IDs
- **Images**: Image metadata, file paths, and GitHub URLs

## Deployment

### Production Considerations

1. **Environment Variables**: Set production values for all environment variables
2. **HTTPS**: Use HTTPS in production for secure OAuth
3. **Database**: Consider using PostgreSQL or MySQL for production
4. **File Storage**: Consider using cloud storage for better performance
5. **Load Balancing**: Use a reverse proxy like Nginx
6. **Monitoring**: Add logging and monitoring solutions

### Deployment Options

- **Heroku**: Easy deployment with Git integration
- **Vercel**: Great for frontend deployment
- **AWS/GCP**: Full control over infrastructure
- **Docker**: Containerized deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues:
1. Check the console for error messages
2. Verify your GitHub OAuth credentials
3. Ensure all dependencies are installed
4. Check that ports 3000 and 5000 are available

## Roadmap

- [x] 🚀 **CDN Integration** - Transform GitHub into a global CDN ✅
- [ ] Image galleries and collections
- [ ] Bulk image operations
- [ ] Image search and filtering
- [ ] Webhook support for repository events
- [ ] Mobile app development
- [ ] Advanced image editing tools
- [ ] Team collaboration features
- [ ] Custom domain support
- [ ] Image analytics and usage tracking

---

Built with ❤️ using Node.js, React, and the GitHub API

