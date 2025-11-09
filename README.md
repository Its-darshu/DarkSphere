# DarkSphere 🌐

A secured, user-friendly social platform with passcode-gated registration, Firebase authentication, and admin moderation.

## Features

- ✅ **Passcode-gated Registration**: Access restricted to approved users
- 🔐 **Firebase Google Authentication**: Easy sign-in with Google accounts
- 📸 **Image Support**: Upload and share images with automatic thumbnails
- 👥 **User Profiles**: Manage profile picture and account settings
- 🛡️ **Admin Dashboard**: User management, content moderation, and audit logs
- 🌙 **Dark Mode**: Comfortable viewing experience
- 📱 **Responsive Design**: Works seamlessly on mobile and desktop
- 🏷️ **Categories**: Organize posts by themes

## Tech Stack

### Frontend
- React 18 with Vite
- Firebase SDK (Auth, Firestore, Storage)
- React Router for navigation
- Modern CSS with dark mode support

### Backend
- Node.js with Express
- Firebase Admin SDK
- Image processing (Sharp for thumbnails)
- REST API with JWT validation

### Infrastructure
- Firebase Authentication (Google Sign-In)
- Cloud Firestore (NoSQL database)
- Cloud Storage (image and thumbnail storage)

## Prerequisites

- Node.js 18+ and npm
- Firebase account with a project created
- Google Cloud project with billing enabled (for Cloud Storage)

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Google Analytics (optional)

### 2. Enable Authentication
1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Google** provider
3. Add authorized domains (localhost for development)

### 3. Create Firestore Database
1. Go to **Firestore Database** > **Create database**
2. Start in **production mode** (we'll add security rules)
3. Choose a location close to your users

### 4. Enable Cloud Storage
1. Go to **Storage** > **Get started**
2. Start in **production mode**
3. Choose the same location as Firestore

### 5. Generate Service Account Key
1. Go to **Project Settings** > **Service accounts**
2. Click **Generate new private key**
3. Save the JSON file as `backend/firebase-service-account.json`
4. **IMPORTANT**: Add this file to `.gitignore`

### 6. Get Web App Config
1. Go to **Project Settings** > **General**
2. Scroll to **Your apps** > Add **Web app**
3. Copy the Firebase configuration object

## Installation

### Backend Setup

```powershell
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development

# Firebase Admin SDK uses firebase-service-account.json
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json

# Passcode for registration (change this!)
REGISTRATION_PASSCODE=your-secret-passcode-here

# Admin user email (will be granted admin role)
ADMIN_EMAIL=your-email@gmail.com

# CORS origin
CORS_ORIGIN=http://localhost:5173
```

### Frontend Setup

```powershell
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_API_URL=http://localhost:5000
```

## Running the Application

### Start Backend (Terminal 1)
```powershell
cd backend
npm run dev
```

### Start Frontend (Terminal 2)
```powershell
cd frontend
npm run dev
```

Visit http://localhost:5173

## Project Structure

```
darksphere/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.js          # Firebase Admin initialization
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT verification
│   │   │   ├── admin.js              # Admin role check
│   │   │   └── upload.js             # Image upload middleware
│   │   ├── routes/
│   │   │   ├── auth.js               # Registration with passcode
│   │   │   ├── users.js              # User management
│   │   │   ├── posts.js              # Post CRUD
│   │   │   ├── upload.js             # Image upload
│   │   │   └── admin.js              # Admin endpoints
│   │   ├── utils/
│   │   │   ├── validation.js         # Input validation
│   │   │   ├── imageProcessing.js    # Thumbnail generation
│   │   │   └── profanityFilter.js    # Content filtering
│   │   └── server.js                 # Express app
│   ├── uploads/                      # Temp local uploads
│   ├── firebase-service-account.json # (gitignored)
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── GoogleSignIn.jsx
│   │   │   │   └── PasscodeModal.jsx
│   │   │   ├── posts/
│   │   │   │   ├── PostFeed.jsx
│   │   │   │   ├── PostCard.jsx
│   │   │   │   └── PostComposer.jsx
│   │   │   ├── profile/
│   │   │   ├── admin/
│   │   │   │   └── PasscodeManager.jsx
│   │   │   └── common/
│   │   │       ├── Header.jsx
│   │   │       └── FloatingButton.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx       # Firebase auth state
│   │   ├── config/
│   │   │   └── firebase.js           # Firebase client config
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Feed.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── utils/
│   │   │   └── api.js                # Axios instance
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── package.json
│
├── firestore.rules                   # Firestore security rules
├── storage.rules                     # Cloud Storage rules
└── README.md
```

## Firestore Data Models

### Collections

#### users
```javascript
{
  uid: string,              // Firebase Auth UID
  email: string,
  displayName: string,
  photoURL: string,         // Cloud Storage URL
  role: 'user' | 'admin',
  disabled: boolean,
  passcodeUsed: string,     // Hashed passcode used at registration
  createdAt: timestamp,
  lastActivity: timestamp
}
```

#### posts
```javascript
{
  id: string,
  userId: string,           // Reference to users
  text: string,
  imageUrl: string,         // Cloud Storage URL
  thumbnailUrl: string,     // Thumbnail URL
  category: string,
  approved: boolean,
  featured: boolean,
  createdAt: timestamp,
  moderatedBy: string,      // Admin UID (if moderated)
  flagCount: number
}
```

#### flags
```javascript
{
  postId: string,
  reportedBy: string,       // User UID
  reason: string,
  status: 'open' | 'resolved',
  resolvedBy: string,       // Admin UID
  createdAt: timestamp,
  resolvedAt: timestamp
}
```

#### audit_logs
```javascript
{
  adminUid: string,
  action: string,           // 'user_deleted', 'user_disabled', 'post_deleted'
  targetType: string,       // 'user', 'post'
  targetId: string,
  details: object,
  createdAt: timestamp
}
```

#### passcodes
```javascript
{
  hash: string,             // Hashed passcode
  active: boolean,
  createdAt: timestamp
}
```

## API Endpoints

### Authentication
- `POST /api/auth/verify-passcode` - Verify passcode before registration
- `POST /api/auth/register` - Complete registration after Google Sign-In
- `POST /api/auth/verify-token` - Verify Firebase ID token

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile
- `POST /api/users/upload-avatar` - Upload profile picture

### Posts
- `GET /api/posts` - Get posts feed (with pagination)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post
- `DELETE /api/posts/:id` - Delete own post (or admin)
- `POST /api/posts/:id/flag` - Report post

### Upload
- `POST /api/upload/image` - Upload image (returns URLs)

### Admin
- `GET /api/admin/users` - List all users
- `POST /api/admin/users/:uid/disable` - Disable user
- `DELETE /api/admin/users/:uid` - Delete user
- `GET /api/admin/users/:uid/posts` - Get user's posts
- `GET /api/admin/flags` - Get flagged content
- `POST /api/admin/flags/:id/resolve` - Resolve flag
- `GET /api/admin/audit` - Get audit logs

## Security Features

- ✅ Firebase Authentication with Google Sign-In
- ✅ Passcode gating for registration (server-side validation)
- ✅ Firebase ID token verification on all protected routes
- ✅ Role-based access control (user/admin)
- ✅ Firestore security rules enforcing permissions
- ✅ Image validation (type, size limits)
- ✅ Profanity filtering
- ✅ Rate limiting on sensitive endpoints
- ✅ Admin audit logging
- ✅ CORS configuration

## Content Moderation

- **Automated**: Profanity filter checks text on submission
- **Reporting**: Users can flag inappropriate content
- **Admin Review**: Admins can view flagged content and take action
- **Audit Trail**: All admin actions are logged

## Deployment

### Backend (Cloud Functions or Cloud Run)
1. Set environment variables in hosting platform
2. Upload service account key securely
3. Configure CORS for production domain

### Frontend (Firebase Hosting)
```powershell
npm run build
firebase deploy --only hosting
```

### Firestore Security Rules
```powershell
firebase deploy --only firestore:rules
```

### Storage Security Rules
```powershell
firebase deploy --only storage
```

## Environment Variables Reference

### Backend Required
- `PORT` - Server port
- `NODE_ENV` - Environment (development/production)
- `REGISTRATION_PASSCODE` - Secret passcode for registration
- `ADMIN_EMAIL` - Email to grant admin role
- `CORS_ORIGIN` - Allowed frontend origin

### Frontend Required
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Auth domain
- `VITE_FIREBASE_PROJECT_ID` - Project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Messaging sender ID
- `VITE_FIREBASE_APP_ID` - App ID
- `VITE_API_URL` - Backend API URL

## Troubleshooting

### Firebase Authentication Error
- Check that Google provider is enabled in Firebase Console
- Verify authorized domains include your frontend domain

### Image Upload Fails
- Ensure Cloud Storage is enabled
- Check storage rules allow authenticated writes
- Verify service account has Storage Admin role

### Passcode Not Working
- Verify `REGISTRATION_PASSCODE` in backend `.env`
- Check backend logs for validation errors

### Admin Dashboard Not Accessible
- Ensure your email matches `ADMIN_EMAIL` in backend `.env`
- Re-login after setting admin role

## License

MIT

## Support

For issues and questions, please create an issue in the repository.
