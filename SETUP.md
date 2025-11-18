# DarkSphere Setup Guide

## Quick Start

### 1. Firebase Project Setup

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Follow the setup wizard

2. **Enable Services**
   - **Authentication**: Enable Google Sign-In provider
   - **Firestore**: Create database in production mode
   - **Storage**: Enable Cloud Storage

3. **Get Credentials**
   - Download service account JSON (Project Settings > Service Accounts)
   - Get web app config (Project Settings > General > Add Web App)

### 2. Backend Setup

```powershell
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
REGISTRATION_PASSCODE=MySecretPass123
ADMIN_EMAIL=your-email@gmail.com
CORS_ORIGIN=http://localhost:5173
```

Place `firebase-service-account.json` in backend directory.

### 3. Frontend Setup

```powershell
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc
VITE_API_URL=http://localhost:5000
```

### 4. Deploy Security Rules

```powershell
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize project (select Firestore and Storage)
firebase init

# Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### 5. Run the Application

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

Visit http://localhost:5173

## First Time Setup

1. Sign in with Google using the email specified in `ADMIN_EMAIL`
2. Enter the `REGISTRATION_PASSCODE` when prompted
3. You'll be registered as an admin user
4. Share the passcode with users you want to give access

## Development Notes

- Backend runs on port 5000
- Frontend runs on port 5173
- Hot reload enabled for both
- Check browser console and terminal for errors

## Troubleshooting

**"Firebase not initialized"**
- Verify `firebase-service-account.json` exists
- Check file path in `.env`

**"Invalid passcode"**
- Verify `REGISTRATION_PASSCODE` matches in backend `.env`
- Passcode is case-sensitive

**"Permission denied" in Firestore**
- Deploy security rules: `firebase deploy --only firestore:rules`
- Wait 1-2 minutes for rules to propagate

**Images not uploading**
- Check Cloud Storage is enabled
- Deploy storage rules: `firebase deploy --only storage`
- Verify service account has Storage Admin role

## Production Deployment

See main README.md for production deployment instructions.
