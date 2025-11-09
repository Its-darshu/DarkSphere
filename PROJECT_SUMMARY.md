# 🌐 DarkSphere - Project Complete!

## ✅ What's Been Built

A full-stack social platform with Firebase backend, featuring:

### Core Features Implemented

#### Authentication & Access Control
- ✅ Google Sign-In integration
- ✅ Passcode-gated registration (only users with valid passcode can register)
- ✅ JWT token verification on all protected routes
- ✅ Role-based access control (user/admin)
- ✅ Account disable functionality

#### Content Sharing
- ✅ Create text posts with optional images
- ✅ Image upload with automatic thumbnail generation
- ✅ Category system (various themes)
- ✅ Paginated content feed
- ✅ Category filtering
- ✅ Featured posts system

#### User Features
- ✅ Profile management (display name, profile picture)
- ✅ Image uploads (posts and avatars)
- ✅ View own posts
- ✅ Delete own posts
- ✅ Flag inappropriate content

#### Admin Dashboard
- ✅ User management (view all users)
- ✅ Disable/enable user accounts
- ✅ Delete user accounts
- ✅ View flagged content
- ✅ Moderate flagged posts (dismiss or delete)
- ✅ Audit logs for all admin actions
- ✅ Admin badge/indicator

#### Security & Content Moderation
- ✅ Profanity filter (automatic blocking)
- ✅ Rate limiting on API endpoints
- ✅ Input validation and sanitization
- ✅ Firestore security rules (RBAC)
- ✅ Cloud Storage security rules
- ✅ Image type and size validation
- ✅ Content flagging/reporting system
- ✅ Audit trail for admin actions

#### UI/UX Features
- ✅ Responsive design (mobile & desktop)
- ✅ Dark mode toggle
- ✅ Floating "+" button for quick post creation
- ✅ Modal-based post composer
- ✅ Image preview in composer
- ✅ Clean card-based feed layout
- ✅ Loading states and error handling
- ✅ Toast notifications
- ✅ User avatars throughout

## 📁 Project Structure

```
darksphere/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.js    # Firebase Admin SDK setup
│   │   ├── middleware/
│   │   │   ├── auth.js        # JWT verification
│   │   │   ├── admin.js       # Admin role check
│   │   │   └── upload.js      # Image upload handling
│   │   ├── routes/
│   │   │   ├── auth.js        # Registration & passcode
│   │   │   ├── users.js       # User profile management
│   │   │   ├── posts.js       # Post CRUD
│   │   │   ├── upload.js      # Image uploads
│   │   │   └── admin.js       # Admin endpoints
│   │   ├── utils/
│   │   │   ├── validation.js  # Input validation
│   │   │   ├── imageProcessing.js  # Thumbnails
│   │   │   └── profanityFilter.js  # Content filter
│   │   └── server.js          # Express app
│   ├── .env                    # Backend config (create from .env.example)
│   ├── firebase-service-account.json  # (add your own)
│   └── package.json
│
├── frontend/                   # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── GoogleSignIn.jsx
│   │   │   │   └── PasscodeModal.jsx
│   │   │   ├── posts/
│   │   │   │   ├── PostFeed.jsx
│   │   │   │   ├── PostCard.jsx
│   │   │   │   └── PostComposer.jsx
│   │   │   ├── admin/          # Admin components
│   │   │   └── common/
│   │   │       ├── Header.jsx
│   │   │       └── FloatingButton.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx  # Firebase auth state
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Feed.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── config/
│   │   │   └── firebase.js     # Firebase client config
│   │   ├── utils/
│   │   │   └── api.js          # Axios instance
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                     # Firebase config (create from .env.example)
│   └── package.json
│
├── firestore.rules              # Firestore security rules
├── storage.rules                # Cloud Storage security rules
├── README.md                    # Full documentation
├── SETUP.md                     # Quick setup guide
└── setup.ps1                    # Automated setup script
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Firebase project with Auth, Firestore, and Storage enabled
- Firebase service account JSON file

### Quick Setup

1. **Run automated setup:**
   ```powershell
   cd darksphere
   npm install
   npm run setup
   ```

2. **Configure environment:**
   - Edit `backend/.env` (passcode, admin email, etc.)
   - Edit `frontend/.env` (Firebase web config)

3. **Deploy Firebase rules:**
   ```powershell
   firebase login
   firebase init
   firebase deploy --only firestore:rules,storage
   ```

4. **Start development servers:**
   
   Terminal 1:
   ```powershell
   cd backend
   npm run dev
   ```
   
   Terminal 2:
   ```powershell
   cd frontend
   npm run dev
   ```

5. **Open http://localhost:5173**

## 🔐 Admin Access

1. Sign in with Google using the email you set as `ADMIN_EMAIL` in backend/.env
2. Enter the passcode you set as `REGISTRATION_PASSCODE`
3. You'll be registered as an admin
4. Access admin dashboard from the header menu

## 📊 API Endpoints

### Authentication
- `POST /api/auth/verify-passcode` - Check passcode validity
- `POST /api/auth/register` - Complete registration
- `POST /api/auth/verify-token` - Verify Firebase token

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update profile
- `GET /api/users/:uid` - Get public profile

### Posts
- `GET /api/posts` - Get post feed (paginated, filterable)
- `POST /api/posts` - Create post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/flag` - Report post

### Upload
- `POST /api/upload/image` - Upload post image
- `POST /api/upload/avatar` - Upload profile picture

### Admin (requires admin role)
- `GET /api/admin/users` - List all users
- `POST /api/admin/users/:uid/disable` - Disable/enable user
- `DELETE /api/admin/users/:uid` - Delete user
- `GET /api/admin/flags` - Get flagged content
- `POST /api/admin/flags/:id/resolve` - Resolve flag
- `GET /api/admin/audit` - Get audit logs

## 🎨 Features Showcase

### For Users
1. **Sign in with Google** - One-click authentication
2. **Enter passcode** - Access control for exclusive community
3. **Browse posts** - Filter by category, see featured content
4. **Share content** - Text + optional images with thumbnails
5. **Manage profile** - Update name and avatar
6. **Report content** - Flag inappropriate posts

### For Admins
1. **User management** - View, disable, or delete accounts
2. **Content moderation** - Review and act on flagged posts
3. **Audit trail** - See all admin actions with timestamps
4. **Dashboard** - Centralized admin interface

## 🛡️ Security Features

- ✅ Firebase Authentication (Google Sign-In)
- ✅ Passcode gating on registration
- ✅ JWT token verification on all protected routes
- ✅ Firestore security rules enforcing RBAC
- ✅ Cloud Storage access rules
- ✅ Profanity filtering
- ✅ Rate limiting (15 min windows)
- ✅ Input validation and sanitization
- ✅ Image type/size validation
- ✅ Secure password hashing (for passcode)
- ✅ Admin audit logging

## 🔥 Tech Stack

**Frontend:**
- React 18
- Vite
- Firebase SDK (Auth, Firestore, Storage)
- React Router
- Axios
- Modern CSS with CSS Variables

**Backend:**
- Node.js + Express
- Firebase Admin SDK
- Sharp (image processing)
- Multer (file uploads)
- Bad-words (profanity filter)
- Helmet (security headers)
- Express Rate Limit

**Infrastructure:**
- Firebase Authentication
- Cloud Firestore (NoSQL database)
- Cloud Storage (images)
- Firebase Hosting (for production)

## 📝 Environment Variables

### Backend (.env)
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

### Frontend (.env)
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc
VITE_API_URL=http://localhost:5000
```

## 🐛 Troubleshooting

See `SETUP.md` for common issues and solutions.

## 🚀 Production Deployment

### Backend
- Deploy to Cloud Run, App Engine, or any Node.js host
- Set environment variables
- Upload service account key securely

### Frontend
```powershell
cd frontend
npm run build
firebase deploy --only hosting
```

### Security Rules
```powershell
firebase deploy --only firestore:rules,storage
```

## 📚 Documentation

- `README.md` - Full project documentation
- `SETUP.md` - Quick setup guide
- Firestore rules comments - Security logic
- Code comments - Implementation details

## ✨ Future Enhancements (Optional)

- [ ] Like/reaction system
- [ ] Comments on posts
- [ ] User follow system
- [ ] Trending algorithm
- [ ] Post search
- [ ] Email notifications
- [ ] Social sharing buttons
- [ ] User reputation system
- [ ] Bookmarks/favorites

## 📄 License

MIT

---

**Ready to deploy! All core requirements met. 🎉**
