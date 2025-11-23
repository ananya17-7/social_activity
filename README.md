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
- ✅ **Rate Limiting**: Prevent abuse with request rate limiting
- ✅ **Image Uploads**: Cloudinary integration for profile pictures and post images
- ✅ **Security**: Helmet, CORS, input validation, password hashing

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JWT (Access + Refresh tokens)
- **File Storage**: Cloudinary
- **Validation**: express-validator
- **Security**: Helmet, bcryptjs, CORS
- **Rate Limiting**: express-rate-limit

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Redis (optional)
- Cloudinary account (for image uploads)


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

