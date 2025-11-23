# API Documentation

Complete API documentation for Social Activity Feed

## Base URL

```
http://localhost:5000/api](https://social-activity-io60.onrender.com/api
```

## Authentication

All protected endpoints require the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

Access tokens expire in 15 minutes. Use refresh tokens to get new access tokens.

## Response Format

All responses follow this format:

### Success Response (2xx)

```json
{
  "message": "Success message",
  "data": {}
}
```

### Error Response (4xx, 5xx)

```json
{
  "message": "Error description",
  "errors": []
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input parameters |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Pagination

Query parameters for paginated endpoints:

- `page` (default: 1) - Page number
- `limit` (default: 20, max: 100) - Items per page

Response includes pagination metadata:

```json
{
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

---

## Endpoints

### Authentication Endpoints

#### POST /auth/signup

Create a new user account.

**Request:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** `201 Created`

```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "createdAt": "2024-01-20T10:30:00Z"
  },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

**Validation Rules:**

- Username: 3-50 characters, unique
- Email: Valid email format, unique
- Password: Min 6 chars, 1 uppercase, 1 number
- FirstName/LastName: Max 100 characters

#### POST /auth/login

Authenticate user and get tokens.

**Request:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`

```json
{
  "message": "Login successful",
  "user": { /* user object */ },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### POST /auth/refresh-token

Refresh access token using refresh token.

**Request:**

```json
{
  "refreshToken": "refresh_token"
}
```

**Response:** `200 OK`

```json
{
  "message": "Token refreshed successfully",
  "accessToken": "new_jwt_token"
}
```

#### POST /auth/logout

Logout user and invalidate refresh token.

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Request:**

```json
{
  "refreshToken": "refresh_token"
}
```

**Response:** `200 OK`

```json
{
  "message": "Logged out successfully"
}
```

---

### Post Endpoints

#### POST /posts

Create a new post with optional image.

**Headers:**

```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Request:**

```
POST /posts HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="content"

This is my first post!
------WebKitFormBoundary
Content-Disposition: form-data; name="image"; filename="image.jpg"

[binary image data]
------WebKitFormBoundary--
```

**Response:** `201 Created`

```json
{
  "message": "Post created successfully",
  "post": {
    "_id": "post_id",
    "author": {
      "_id": "user_id",
      "username": "john_doe",
      "profilePicture": "url"
    },
    "content": "This is my first post!",
    "image": "cloudinary_url",
    "likes": [],
    "likesCount": 0,
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

**Validation:**

- Content: 1-5000 characters, required
- Image: Optional, max 5MB, image files only

#### GET /posts

Get all posts (activity feed) with pagination.

**Query Parameters:**

- `page`: Integer (default: 1)
- `limit`: Integer 1-100 (default: 20)

**Response:** `200 OK`

```json
{
  "message": "Posts retrieved successfully",
  "posts": [
    {
      "_id": "post_id",
      "author": { /* user object */ },
      "content": "Post content",
      "image": "url",
      "likesCount": 5,
      "isLikedByMe": false,
      "createdAt": "2024-01-20T10:30:00Z"
    }
  ],
  "pagination": { /* pagination object */ }
}
```

#### GET /posts/:id

Get single post by ID.

**Response:** `200 OK`

```json
{
  "message": "Post retrieved successfully",
  "post": { /* post object */ }
}
```

#### PUT /posts/:id

Update post content.

**Request:**

```json
{
  "content": "Updated content"
}
```

**Response:** `200 OK`

```json
{
  "message": "Post updated successfully",
  "post": { /* updated post */ }
}
```

**Authorization:**

- Author can update own posts
- Admins/Owners can update any post

#### DELETE /posts/:id

Delete a post (soft delete).

**Response:** `200 OK`

```json
{
  "message": "Post deleted successfully"
}
```

**Authorization:**

- Author can delete own posts
- Admins/Owners can delete any post

#### GET /posts/user/:username

Get all posts by specific user.

**Query Parameters:**

- `page`: Integer (default: 1)
- `limit`: Integer 1-100 (default: 20)

**Response:** `200 OK`

```json
{
  "message": "User posts retrieved successfully",
  "posts": [ /* user's posts */ ],
  "pagination": { /* pagination */ }
}
```

---

### Like Endpoints

#### POST /likes/:postId

Like a post.

**Response:** `201 Created`

```json
{
  "message": "Post liked successfully",
  "like": {
    "_id": "like_id",
    "user": "user_id",
    "post": "post_id",
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

**Errors:**

- `404`: Post not found or deleted
- `409`: Already liked this post

#### DELETE /likes/:postId

Unlike a post.

**Response:** `200 OK`

```json
{
  "message": "Post unliked successfully"
}
```

#### GET /likes/:postId

Get all likes for a post.

**Query Parameters:**

- `page`: Integer (default: 1)
- `limit`: Integer 1-100 (default: 20)

**Response:** `200 OK`

```json
{
  "message": "Post likes retrieved successfully",
  "likes": [
    {
      "_id": "like_id",
      "user": {
        "_id": "user_id",
        "username": "john_doe",
        "profilePicture": "url"
      },
      "post": "post_id",
      "createdAt": "2024-01-20T10:30:00Z"
    }
  ],
  "pagination": { /* pagination */ }
}
```

---

### User Endpoints

#### GET /users/me

Get current user profile.

**Response:** `200 OK`

```json
{
  "message": "User profile retrieved successfully",
  "user": {
    "_id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "bio": "Software developer",
    "profilePicture": "url",
    "role": "user",
    "followersCount": 150,
    "followingCount": 75,
    "postsCount": 42,
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

#### GET /users/:username

Get user profile by username.

**Response:** `200 OK`

```json
{
  "message": "User profile retrieved successfully",
  "user": { /* user object */ }
}
```

#### PUT /users/profile

Update user profile.

**Headers:**

```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Request:**

```
firstName=John&lastName=Doe&bio=Updated+bio&profilePicture=[file]
```

**Response:** `200 OK`

```json
{
  "message": "Profile updated successfully",
  "user": { /* updated user */ }
}
```

**Validation:**

- firstName: Max 100 characters
- lastName: Max 100 characters
- bio: Max 500 characters
- profilePicture: Optional, max 5MB

#### POST /users/:userId/follow

Follow a user.

**Response:** `200 OK`

```json
{
  "message": "User followed successfully"
}
```

**Errors:**

- `400`: Cannot follow yourself
- `404`: User not found
- `409`: Already following

#### DELETE /users/:userId/follow

Unfollow a user.

**Response:** `200 OK`

```json
{
  "message": "User unfollowed successfully"
}
```

#### POST /users/:userId/block

Block a user.

**Response:** `200 OK`

```json
{
  "message": "User blocked successfully"
}
```

**Effects:**

- Blocks user's posts from appearing in your feed
- Removes any following relationship
- User cannot see your activity

#### DELETE /users/:userId/block

Unblock a user.

**Response:** `200 OK`

```json
{
  "message": "User unblocked successfully"
}
```

#### GET /users/:username/followers

Get user's followers.

**Query Parameters:**

- `page`: Integer (default: 1)
- `limit`: Integer 1-100 (default: 20)

**Response:** `200 OK`

```json
{
  "message": "Followers retrieved successfully",
  "followers": [ /* follower user objects */ ],
  "pagination": { /* pagination */ }
}
```

#### GET /users/:username/following

Get users that user is following.

**Query Parameters:**

- `page`: Integer (default: 1)
- `limit`: Integer 1-100 (default: 20)

**Response:** `200 OK`

```json
{
  "message": "Following list retrieved successfully",
  "following": [ /* user objects being followed */ ],
  "pagination": { /* pagination */ }
}
```

---

### Activity Feed Endpoints

#### GET /activities/feed

Get personalized activity feed (activities from followed users).

**Query Parameters:**

- `page`: Integer (default: 1)
- `limit`: Integer 1-100 (default: 20)

**Response:** `200 OK`

```json
{
  "message": "Activity feed retrieved successfully",
  "activities": [
    {
      "_id": "activity_id",
      "actor": {
        "_id": "user_id",
        "username": "john_doe",
        "profilePicture": "url"
      },
      "type": "post_created|user_followed|post_liked|etc",
      "target": { /* post or user object */ },
      "targetUser": { /* user object if applicable */ },
      "description": "John Doe made a post",
      "createdAt": "2024-01-20T10:30:00Z"
    }
  ],
  "pagination": { /* pagination */ }
}
```

**Activity Types:**

- `post_created`: User created a post
- `post_deleted`: Post was deleted
- `user_followed`: User followed another user
- `user_unfollowed`: User unfollowed another user
- `post_liked`: User liked a post
- `post_unliked`: User unliked a post
- `user_blocked`: User blocked another user
- `user_unblocked`: User unblocked another user
- `user_deleted`: User account was deleted

#### GET /activities/feed/public

Get public activity feed (all activities in system).

**Query Parameters:**

- `page`: Integer (default: 1)
- `limit`: Integer 1-100 (default: 20)

**Response:** `200 OK`

```json
{
  "message": "Public activity feed retrieved successfully",
  "activities": [ /* all activities */ ],
  "pagination": { /* pagination */ }
}
```

#### GET /activities/:username

Get specific user's activity feed.

**Query Parameters:**

- `page`: Integer (default: 1)
- `limit`: Integer 1-100 (default: 20)

**Response:** `200 OK`

```json
{
  "message": "User activity feed retrieved successfully",
  "activities": [ /* user's activities */ ],
  "pagination": { /* pagination */ }
}
```

---

### Admin Endpoints

**All admin endpoints require Admin or Owner role.**

#### DELETE /admin/users/:userId

Delete a user account (soft delete).

**Request:**

```json
{
  "reason": "Violating terms of service"
}
```

**Response:** `200 OK`

```json
{
  "message": "User deleted successfully"
}
```

**Authorization:**

- Admin/Owner only

#### DELETE /admin/posts/:postId

Delete a post.

**Request:**

```json
{
  "reason": "Inappropriate content"
}
```

**Response:** `200 OK`

```json
{
  "message": "Post deleted successfully"
}
```

#### DELETE /admin/likes/:likeId

Delete a like.

**Request:**

```json
{
  "reason": "Spam activity"
}
```

**Response:** `200 OK`

```json
{
  "message": "Like deleted successfully"
}
```

#### PUT /admin/users/:userId/promote

Promote user to admin role.

**Response:** `200 OK`

```json
{
  "message": "User promoted to admin successfully",
  "user": { /* user with admin role */ }
}
```

**Authorization:**

- Owner only

#### PUT /admin/users/:userId/demote

Demote admin to user role.

**Response:** `200 OK`

```json
{
  "message": "User demoted from admin successfully",
  "user": { /* user with user role */ }
}
```

**Authorization:**

- Owner only
- Cannot demote an owner

#### GET /admin/users

Get all users with optional filters.

**Query Parameters:**

- `page`: Integer (default: 1)
- `limit`: Integer 1-100 (default: 20)
- `role`: String (user|admin|owner)
- `isActive`: Boolean (true|false)

**Response:** `200 OK`

```json
{
  "message": "Users retrieved successfully",
  "users": [ /* user objects */ ],
  "pagination": { /* pagination */ }
}
```

#### GET /admin/posts

Get all posts with optional filters.

**Query Parameters:**

- `page`: Integer (default: 1)
- `limit`: Integer 1-100 (default: 20)
- `isDeleted`: Boolean (true|false)

**Response:** `200 OK`

```json
{
  "message": "Posts retrieved successfully",
  "posts": [ /* post objects */ ],
  "pagination": { /* pagination */ }
}
```

#### GET /admin/stats

Get system statistics.

**Response:** `200 OK`

```json
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

---

## Rate Limiting

Requests are rate limited to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes
- **Auth endpoints**: 5 requests per 15 minutes

Rate limit headers in response:

```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1705756200
```

When limit exceeded: `429 Too Many Requests`

---

## Data Models

### User

```json
{
  "_id": "ObjectId",
  "username": "string",
  "email": "string",
  "password": "hashed_string",
  "firstName": "string",
  "lastName": "string",
  "bio": "string",
  "profilePicture": "string (url)",
  "role": "user|admin|owner",
  "isActive": "boolean",
  "followers": ["userId"],
  "following": ["userId"],
  "blockedUsers": ["userId"],
  "blockedBy": ["userId"],
  "lastLogin": "Date",
  "refreshTokens": [{"token": "string", "expiresAt": "Date"}],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Post

```json
{
  "_id": "ObjectId",
  "author": "userId",
  "content": "string",
  "image": "string (url)",
  "likes": ["userId"],
  "likesCount": "number",
  "comments": [
    {
      "author": "userId",
      "content": "string",
      "createdAt": "Date"
    }
  ],
  "isDeleted": "boolean",
  "deletedBy": "userId",
  "deletedReason": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Like

```json
{
  "_id": "ObjectId",
  "user": "userId",
  "post": "postId",
  "deletedBy": "userId",
  "deletedReason": "string",
  "isDeleted": "boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Activity

```json
{
  "_id": "ObjectId",
  "actor": "userId",
  "type": "activity_type",
  "target": "objectId",
  "targetUser": "userId",
  "description": "string",
  "metadata": "object",
  "createdAt": "Date"
}
```

---

## Best Practices

1. **Error Handling**: Always check for errors in response
2. **Token Management**: Store refresh tokens securely
3. **Pagination**: Use pagination for large datasets
4. **Caching**: Cache frequently accessed data client-side
5. **Rate Limiting**: Respect rate limit headers
6. **Security**: Never expose passwords or sensitive tokens
7. **HTTPS**: Always use HTTPS in production

---

## Support

For API issues or questions:

- Check documentation
- Review error messages
- Check Postman collection
- Open GitHub issue
- Email: support@example.com
