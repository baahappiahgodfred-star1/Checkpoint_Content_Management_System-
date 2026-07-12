# EduCMS - Educational Content Management System

## 📋 Project Overview

**EduCMS** is a comprehensive, full-featured Content Management System designed specifically for educational institutions. It enables seamless management of courses, articles, announcements, and student resources with advanced role-based access control, content versioning, and detailed analytics.

### Key Features

- ✅ **User Authentication & Authorization** - JWT-based authentication with role management
- ✅ **Role-Based Access Control** - Admin, Editor, Author, and Subscriber roles
- ✅ **Complete CRUD Operations** - Full management of posts, categories, tags, and comments
- ✅ **Media Management System** - Upload and organize media files
- ✅ **Content Versioning** - Draft and publish workflow
- ✅ **SEO Optimization Tools** - Meta tags, keywords, and slug management
- ✅ **Analytics Dashboard** - Track views and engagement
- ✅ **RESTful API** - Well-documented API endpoints
- ✅ **Responsive Admin Panel** - Modern, user-friendly interface
- ✅ **Advanced Search & Filtering** - Powerful content discovery

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL 13+ |
| **Caching** | Redis 6+ (optional) |
| **Authentication** | JWT (JSON Web Tokens) |
| **File Upload** | Multer |
| **Validation** | Express-validator |
| **Logging** | Winston |
| **Security** | Helmet, CORS, Rate Limiting |

## 📋 System Requirements

### Software Requirements
- Node.js v16 or higher
- PostgreSQL 13 or higher
- Redis 6 or higher (optional for caching)
- Git

### Hardware Requirements (Minimum)
- RAM: 4GB
- Storage: 10GB free space
- Processor: Dual-core 2.0 GHz

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/educms-backend.git
cd educms-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
API_VERSION=v1

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=educms_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production_min_32_chars
JWT_EXPIRE=7d

# Redis Configuration (Optional)
REDIS_ENABLED=false
REDIS_HOST=localhost
REDIS_PORT=6379

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Create PostgreSQL Database
```bash
createdb educms_db
```

### 5. Run Database Schema
```bash
psql -U postgres -d educms_db -f database-schema.sql
```

### 6. Start the Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start at `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "subscriber"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Posts Endpoints

#### Create Post
```
POST /posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Introduction to Web Development",
  "content": "This is a comprehensive guide...",
  "excerpt": "Learn web development basics",
  "category_id": 1,
  "meta_title": "Web Development Guide",
  "meta_description": "Learn web development",
  "tags": [1, 2, 3]
}
```

#### Get All Posts
```
GET /posts?page=1&limit=10&category_id=1&search=web
```

#### Get Post by ID
```
GET /posts/{id}
```

#### Update Post
```
PUT /posts/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

#### Delete Post
```
DELETE /posts/{id}
Authorization: Bearer {token}
```

### Categories Endpoints

#### Create Category
```
POST /categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Web Development",
  "description": "All about web development",
  "parent_id": null
}
```

#### Get All Categories
```
GET /categories
```

#### Get Category with Post Count
```
GET /categories/with-count
```

### Tags Endpoints

#### Create Tag
```
POST /tags
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "JavaScript",
  "description": "JavaScript programming language"
}
```

#### Get All Tags
```
GET /tags
```

### Comments Endpoints

#### Create Comment
```
POST /comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "post_id": 1,
  "content": "Great article!",
  "parent_id": null
}
```

#### Get Post Comments
```
GET /comments/post/{post_id}
```

#### Approve Comment
```
POST /comments/{id}/approve
Authorization: Bearer {token}
```

### Media Endpoints

#### Upload Media
```
POST /media/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary file]
alt_text: "Image description"
caption: "Image caption"
```

#### Get All Media
```
GET /media?page=1&limit=20&file_type=image
```

#### Delete Media
```
DELETE /media/{id}
Authorization: Bearer {token}
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt for secure password storage
- **CORS Protection** - Configured CORS headers
- **Helmet.js** - HTTP security headers
- **Rate Limiting** - Prevent abuse and DDoS attacks
- **Input Validation** - Express-validator for data validation
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - Input sanitization

## 📊 Database Schema

### Tables
- **users** - User accounts and profiles
- **posts** - Blog posts and articles
- **categories** - Content categories
- **tags** - Content tags
- **post_tags** - Many-to-many relationship between posts and tags
- **comments** - Post comments with moderation
- **media** - Uploaded media files
- **activity_log** - User activity tracking

## 🧪 Testing

Run tests with coverage:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 📦 Deployment

### Deploy to Heroku

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create new app
heroku create educms-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set JWT_SECRET=your_secret_key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate
```

### Deploy to Other Platforms

The application can be deployed to:
- AWS (EC2, Elastic Beanstalk)
- Google Cloud Platform (App Engine, Compute Engine)
- Azure (App Service)
- DigitalOcean (Droplets, App Platform)
- Render
- Fly.io

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Express.js community
- PostgreSQL documentation
- JWT best practices
- RESTful API design patterns

## 📞 Support

For support, email support@educms.com or open an issue on GitHub.

## 🗺️ Project Roadmap

- [ ] Add Frontend (React Admin Panel)
- [ ] Implement AWS S3 Integration
- [ ] Add Full-Text Search with Elasticsearch
- [ ] Implement Redis Caching
- [ ] Add Real-time Features with WebSockets
- [ ] Create Comprehensive Unit and Integration Tests
- [ ] Add Swagger API Documentation
- [ ] Implement Advanced Analytics Dashboard
- [ ] Add Email Notifications
- [ ] Create Mobile App

---

**Last Updated:** June 2026
**Version:** 1.0.0
