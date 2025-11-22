# Social Activity Feed API

A comprehensive social activity feed backend built with Node.js, Express, MongoDB, and JWT authentication. Features user management, posts, likes, follows, blocks, and a real-time activity feed with role-based access control.

## Features

- ✅ **User Authentication**: JWT-based auth with refresh tokens
- ✅ **User Management**: Create profiles, follow/unfollow, block/unblock users
- ✅ **Posts**: Create, update, delete posts with image uploads
- ✅ **Likes**: Like/unlike posts with activity tracking
- ✅ **Activity Feed**: Real-time activity feed respecting user blocks
- ✅ **Role-Based Access Control**: User, Admin, Owner roles with specific permissions
- ✅ **Admin Panel**: Manage users, posts, likes, and system statistics
- ✅ **Caching**: Redis caching for performance optimization
- ✅ **Rate Limiting**: Prevent abuse with request rate limiting
- ✅ **Image Uploads**: Cloudinary integration for profile pictures and post images
- ✅ **Security**: Helmet, CORS, input validation, password hashing

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JWT (Access + Refresh tokens)
- **Caching**: Redis (optional)
- **File Storage**: Cloudinary
- **Validation**: express-validator
- **Security**: Helmet, bcryptjs, CORS
- **Rate Limiting**: express-rate-limit

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Redis (optional)
- Cloudinary account (for image uploads)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd social-activity-feed-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Copy `.env.example` to `.env` and fill in your configuration:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Server
NODE_ENV=development
PORT=5000
APP_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb://localhost:27017/social-feed
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/social-feed

# JWT
JWT_SECRET=your_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Start the server

#### Development (with auto-reload)

```bash
npm run dev
```

#### Production

```bash
npm start
```

The server will start on `http://localhost:5000`

## Using Docker

### Docker Compose (MongoDB + Redis + App)

```bash
docker-compose up -d
```

This will start:
- MongoDB on `localhost:27017`
- Redis on `localhost:6379`
- Express App on `localhost:5000`

### Docker Image

```bash
docker build -t social-feed-api .
docker run -p 5000:5000 --env-file .env social-feed-api
```

## API Documentation

### Authentication Endpoints

#### Signup
```
POST /api/auth/signup
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}

Response (201):
{
  "message": "User registered successfully",
  "user": { /* user object */ },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response (200):
{
  "message": "Login successful",
  "user": { /* user object */ },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### Refresh Token
```
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "refresh_token"
}

Response (200):
{
  "message": "Token refreshed successfully",
  "accessToken": "new_jwt_token"
}
```

### Posts Endpoints

#### Create Post
```
POST /api/posts
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

{
  "content": "This is my first post!",
  "image": <file>  // optional
}

Response (201):
{
  "message": "Post created successfully",
  "post": { /* post object */ }
}
```

#### Get Feed
```
GET /api/posts?page=1&limit=20
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Posts retrieved successfully",
  "posts": [ /* post objects */ ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

#### Get Post by ID
```
GET /api/posts/:id
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Post retrieved successfully",
  "post": { /* post object */ }
}
```

#### Update Post
```
PUT /api/posts/:id
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "content": "Updated content"
}

Response (200):
{
  "message": "Post updated successfully",
  "post": { /* updated post */ }
}
```

#### Delete Post
```
DELETE /api/posts/:id
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Post deleted successfully"
}
```

#### Get User Posts
```
GET /api/posts/user/:username?page=1&limit=20
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "User posts retrieved successfully",
  "posts": [ /* user's posts */ ],
  "pagination": { /* pagination object */ }
}
```

### User Endpoints

#### Get User Profile
```
GET /api/users/:username
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "User profile retrieved successfully",
  "user": {
    "_id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Software developer",
    "profilePicture": "url",
    "followersCount": 150,
    "followingCount": 75,
    "postsCount": 42,
    "followers": [ /* follower objects */ ],
    "following": [ /* following objects */ ]
  }
}
```

#### Get My Profile
```
GET /api/users/me
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "User profile retrieved successfully",
  "user": { /* current user's profile */ }
}
```

#### Update Profile
```
PUT /api/users/profile
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio",
  "profilePicture": <file>  // optional
}

Response (200):
{
  "message": "Profile updated successfully",
  "user": { /* updated user */ }
}
```

#### Follow User
```
POST /api/users/:userId/follow
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "User followed successfully"
}
```

#### Unfollow User
```
DELETE /api/users/:userId/follow
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "User unfollowed successfully"
}
```

#### Block User
```
POST /api/users/:userId/block
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "User blocked successfully"
}
```

#### Unblock User
```
DELETE /api/users/:userId/block
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "User unblocked successfully"
}
```

#### Get User Followers
```
GET /api/users/:username/followers?page=1&limit=20
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Followers retrieved successfully",
  "followers": [ /* follower objects */ ],
  "pagination": { /* pagination */ }
}
```

#### Get User Following
```
GET /api/users/:username/following?page=1&limit=20
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Following list retrieved successfully",
  "following": [ /* following objects */ ],
  "pagination": { /* pagination */ }
}
```

### Likes Endpoints

#### Like Post
```
POST /api/likes/:postId
Authorization: Bearer <accessToken>

Response (201):
{
  "message": "Post liked successfully",
  "like": { /* like object */ }
}
```

#### Unlike Post
```
DELETE /api/likes/:postId
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Post unliked successfully"
}
```

#### Get Post Likes
```
GET /api/likes/:postId?page=1&limit=20
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Post likes retrieved successfully",
  "likes": [ /* like objects with user info */ ],
  "pagination": { /* pagination */ }
}
```

### Activity Feed Endpoints

#### Get Personalized Feed
```
GET /api/activities/feed?page=1&limit=20
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Activity feed retrieved successfully",
  "activities": [
    {
      "_id": "activity_id",
      "actor": { /* user who performed action */ },
      "type": "post_created|user_followed|post_liked|etc",
      "target": { /* post/user that was acted upon */ },
      "description": "User action description",
      "createdAt": "2024-01-20T10:30:00Z"
    }
  ],
  "pagination": { /* pagination */ }
}
```

#### Get Public Feed
```
GET /api/activities/feed/public?page=1&limit=20
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Public activity feed retrieved successfully",
  "activities": [ /* all activities */ ],
  "pagination": { /* pagination */ }
}
```

#### Get User Activities
```
GET /api/activities/:username?page=1&limit=20
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "User activity feed retrieved successfully",
  "activities": [ /* user's activities */ ],
  "pagination": { /* pagination */ }
}
```

### Admin Endpoints

#### Delete User (Admin/Owner only)
```
DELETE /api/admin/users/:userId
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "User deleted successfully"
}
```

#### Delete Post (Admin/Owner only)
```
DELETE /api/admin/posts/:postId
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Post deleted successfully"
}
```

#### Delete Like (Admin/Owner only)
```
DELETE /api/admin/likes/:likeId
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Like deleted successfully"
}
```

#### Promote to Admin (Owner only)
```
PUT /api/admin/users/:userId/promote
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "User promoted to admin successfully",
  "user": { /* updated user with admin role */ }
}
```

#### Demote from Admin (Owner only)
```
PUT /api/admin/users/:userId/demote
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "User demoted from admin successfully",
  "user": { /* updated user with user role */ }
}
```

#### Get All Users (Admin/Owner only)
```
GET /api/admin/users?page=1&limit=20&role=user&isActive=true
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Users retrieved successfully",
  "users": [ /* user objects */ ],
  "pagination": { /* pagination */ }
}
```

#### Get All Posts (Admin/Owner only)
```
GET /api/admin/posts?page=1&limit=20&isDeleted=false
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Posts retrieved successfully",
  "posts": [ /* post objects */ ],
  "pagination": { /* pagination */ }
}
```

#### Get System Statistics (Admin/Owner only)
```
GET /api/admin/stats
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "System statistics retrieved successfully",
  "stats": {
    "totalUsers": 1250,
    "activeUsers": 1100,
    "inactiveUsers": 150,
    "totalPosts": 5420,
    "deletedPosts": 120,
    "totalLikes": 45000,
    "totalActivities": 65000,
    "adminCount": 5,
    "ownerCount": 1,
    "regularUsersCount": 1244
  }
}
```

## Role-Based Access Control

### User Permissions
- ✅ Create posts
- ✅ Delete own posts
- ✅ Like/unlike posts
- ✅ Follow/unfollow users
- ✅ Block/unblock users

### Admin Permissions
- ✅ All user permissions
- ✅ Delete any post
- ✅ Delete any like
- ✅ Delete user accounts
- ❌ Cannot manage other admins

### Owner Permissions
- ✅ All admin permissions
- ✅ Promote users to admin
- ✅ Demote admins to users
- ✅ Full system management

## Error Handling

All errors return appropriate HTTP status codes with descriptive messages:

```json
{
  "message": "Error description"
}
```

### Common Error Codes

- `400`: Bad Request (invalid input)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `409`: Conflict (duplicate resource)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

## Deployment

### Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set MONGODB_ATLAS_URI=your_mongodb_uri
# ... set other variables

# Deploy
git push heroku main
```

### Deploy to DigitalOcean App Platform

1. Connect your GitHub repository
2. Set environment variables in the dashboard
3. Deploy automatically on push

### Deploy to AWS EC2

```bash
# Connect to instance
ssh -i key.pem ec2-user@your-instance-ip

# Install Node.js and npm
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs

# Clone repo
git clone your-repo-url
cd social-activity-feed-api

# Install dependencies
npm install

# Set environment variables
nano .env

# Start app
npm start

# Keep running with PM2
sudo npm install -g pm2
pm2 start src/server.js --name "social-feed-api"
pm2 startup
pm2 save
```

## Performance Optimization

- **Redis Caching**: Feed caching reduces database queries
- **Database Indexing**: Optimized queries with MongoDB indexes
- **Pagination**: Efficient data retrieval with limit and offset
- **Rate Limiting**: Prevent abuse and DDoS attacks
- **Lazy Loading**: Load images on demand

## Security Best Practices

- ✅ Password hashing with bcryptjs
- ✅ JWT token-based authentication
- ✅ Refresh token rotation
- ✅ Input validation and sanitization
- ✅ CORS protection
- ✅ Helmet for HTTP headers
- ✅ Rate limiting
- ✅ SQL injection prevention (MongoDB)

## Project Structure

```
social-activity-feed-api/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/      # Business logic
│   ├── models/          # Database schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── validators/      # Input validation
│   ├── utils/           # Utility functions
│   └── server.js        # Main entry point
├── .env.example         # Environment variables template
├── .gitignore           # Git ignore rules
├── docker-compose.yml   # Docker compose configuration
├── Dockerfile           # Docker image definition
├── package.json         # Dependencies
└── README.md           # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For support, email support@example.com or open an issue on GitHub.

## Changelog

### Version 1.0.0 (Initial Release)
- User authentication with JWT
- Post management (CRUD)
- User interactions (follow, block)
- Activity feed
- Admin panel
- Role-based access control
