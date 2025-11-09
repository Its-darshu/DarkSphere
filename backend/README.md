# DarkSphere Backend API

Express.js backend for the DarkSphere social platform with Firebase integration.

## Features

- Firebase Authentication with Google Sign-In
- Passcode-gated user registration
- Post creation with image uploads
- User profile management
- Admin dashboard endpoints
- Content moderation (flagging system)
- Audit logging
- Rate limiting
- Image processing (thumbnails & optimization)
- Profanity filtering

## Tech Stack

- **Express.js** - Web framework
- **Firebase Admin SDK** - Authentication & Firestore
- **Multer** - File upload handling
- **Sharp** - Image processing
- **Helmet** - Security headers
- **bcrypt** - Password hashing
- **bad-words** - Profanity filter

## Setup

### Prerequisites

- Node.js 18+
- Firebase project with Firestore and Storage enabled
- Firebase service account JSON file

### Installation

```bash
npm install
```

### Configuration

Create `.env` file:

```env
PORT=5000
NODE_ENV=development
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
REGISTRATION_PASSCODE=your-secret-passcode
ADMIN_EMAIL=admin@example.com
CORS_ORIGIN=http://localhost:5173
MAX_IMAGE_SIZE_MB=5
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/jpg
```

Place your `firebase-service-account.json` in the backend directory.

### Run

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

### Authentication (`/api/auth`)

- `POST /verify-passcode` - Verify registration passcode
- `POST /register` - Complete user registration
- `POST /verify-token` - Verify Firebase ID token

### Users (`/api/users`)

- `GET /me` - Get current user profile
- `PUT /me` - Update current user profile
- `GET /:uid` - Get public user profile

### Posts (`/api/posts`)

- `GET /` - Get posts feed (with pagination & filters)
- `GET /:id` - Get single post
- `POST /` - Create new post
- `DELETE /:id` - Delete post (owner or admin)
- `POST /:id/flag` - Flag post as inappropriate

### Upload (`/api/upload`)

- `POST /image` - Upload post image (returns imageUrl & thumbnailUrl)
- `POST /avatar` - Upload user avatar

### Admin (`/api/admin`)

All admin routes require admin role.

- `GET /users` - List all users
- `POST /users/:uid/disable` - Disable/enable user
- `DELETE /users/:uid` - Delete user & their posts
- `GET /users/:uid/posts` - Get user's posts
- `GET /flags` - Get flagged content
- `POST /flags/:id/resolve` - Resolve flag (dismiss or delete)
- `GET /audit` - Get audit logs

## Security

- JWT token verification on all protected routes
- Role-based access control (user/admin)
- Rate limiting (100 requests per 15 min)
- Strict auth rate limiting (10 requests per 15 min)
- Helmet security headers
- Input validation & sanitization
- Profanity filtering
- Image type & size validation
- CORS configuration

## File Structure

```
backend/
├── src/
│   ├── config/
│   │   └── firebase.js          # Firebase Admin initialization
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   ├── admin.js              # Admin role check
│   │   └── upload.js             # File upload config
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── users.js              # User management
│   │   ├── posts.js              # Post CRUD
│   │   ├── upload.js             # Image uploads
│   │   └── admin.js              # Admin endpoints
│   ├── utils/
│   │   ├── validation.js         # Input validation
│   │   ├── imageProcessing.js    # Thumbnail generation
│   │   └── profanityFilter.js    # Content filtering
│   └── server.js                 # Express app
├── uploads/                      # Temp file storage
├── .env                          # Environment variables
├── .env.example                  # Example config
├── firebase-service-account.json # (gitignored)
└── package.json
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to Firebase service account | ./firebase-service-account.json |
| `REGISTRATION_PASSCODE` | Secret passcode for registration | - |
| `ADMIN_EMAIL` | Email to grant admin role | - |
| `CORS_ORIGIN` | Allowed frontend origin | http://localhost:5173 |
| `MAX_IMAGE_SIZE_MB` | Max image size in MB | 5 |
| `ALLOWED_IMAGE_TYPES` | Allowed MIME types (comma-separated) | image/jpeg,image/png,image/jpg |

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `413` - Payload Too Large (file size)
- `500` - Internal Server Error

## Development

### Testing Endpoints

Use tools like Postman or curl with Firebase ID token in Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

### Logs

All errors are logged to console with details for debugging.

## Production Deployment

1. Set `NODE_ENV=production`
2. Use process manager (PM2, systemd)
3. Set up proper logging
4. Configure firewall rules
5. Use HTTPS proxy (nginx, Apache)
6. Set secure CORS_ORIGIN
7. Store service account key securely
8. Monitor server resources

## License

MIT
