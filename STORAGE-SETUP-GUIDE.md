# 🔥 Complete Storage Setup for DarkSphere

## ✅ What's Already Configured:

### 1. **Firestore Database (Text/Posts Storage)** - ✅ DEPLOYED!
Your Firestore rules are now live! This stores:
- Posts (text content, metadata, timestamps)
- Users (profiles, roles, settings)
- Flags (reported content)
- Audit logs (admin actions)

**Rules deployed successfully!** ✅

---

## ⚠️ What You Need to Enable:

### 2. **Firebase Storage (Image Storage)** - ❌ NOT ENABLED YET

**Follow these steps:**

1. **Go to Firebase Console:**
   https://console.firebase.google.com/project/darksphere-369/storage

2. **Click "Get Started"**

3. **Choose "Start in Production Mode"** (we have custom rules ready)

4. **Select a location:** Choose the same region as your Firestore (probably `us-central1` or closest to you)

5. **Click "Done"**

6. **Then run this command:**
   ```powershell
   cd f:\darksphere
   firebase deploy --only storage
   ```

---

## 📊 **How Your Storage Architecture Works:**

### **Flow for Creating a Post with Image:**

```
User uploads image
    ↓
Frontend → /api/upload/image
    ↓
Backend receives image
    ↓
1. Saves temporarily to backend/uploads/
2. Optimizes image (Sharp library)
3. Creates thumbnail (300x300)
    ↓
4. Uploads BOTH to Firebase Storage:
   - /posts/{imageId} (full size)
   - /posts/thumbnails/{thumbId} (thumbnail)
    ↓
5. Gets public URLs
6. Deletes local temp files
    ↓
7. Returns URLs to frontend
    ↓
Frontend → POST /api/posts
    ↓
Backend saves to Firestore:
{
  userId: "abc123",
  text: "Check this out!",
  imageUrl: "https://storage.googleapis.com/...",
  thumbnailUrl: "https://storage.googleapis.com/...",
  createdAt: timestamp,
  approved: true,
  featured: false
}
    ↓
Post is live! ✅
```

---

## 🗄️ **Storage Locations:**

### **Images (Firebase Cloud Storage):**
```
/posts/
  ├── image-123.jpg          (Full size)
  └── thumbnails/
      └── thumb-image-123.jpg (300x300 thumbnail)

/avatars/
  └── user-123-avatar.jpg     (User profile pictures)
```

### **Text/Data (Firestore Database):**
```
/users/
  └── {userId}
      ├── email
      ├── displayName
      ├── photoURL
      ├── role
      └── ...

/posts/
  └── {postId}
      ├── userId
      ├── text
      ├── imageUrl         (Firebase Storage URL)
      ├── thumbnailUrl     (Firebase Storage URL)
      ├── category
      ├── createdAt
      └── ...

/flags/
  └── {flagId}
      ├── postId
      ├── reportedBy
      ├── reason
      └── status
```

---

## 🔐 **Security Rules (Already Created):**

### **Storage Rules:**
- ✅ Anyone can READ images (public)
- ✅ Only authenticated users can UPLOAD
- ✅ Max 5MB file size
- ✅ Only image types allowed
- ✅ Separate paths for posts and avatars

### **Firestore Rules:**
- ✅ Only authenticated users can read/write
- ✅ Users can only modify their own posts
- ✅ Admins have full access
- ✅ Role-based access control (RBAC)
- ✅ Audit logs are read-only

---

## 📝 **Backend Code Handling This:**

**Image Upload:** `backend/src/routes/upload.js`
- Multer receives file
- Sharp processes & optimizes
- Firebase Admin SDK uploads to Cloud Storage
- Returns public URLs

**Post Creation:** `backend/src/routes/posts.js`
- Receives post data + image URLs
- Validates content (profanity filter)
- Saves to Firestore
- Returns created post

**Image Processing:** `backend/src/utils/imageProcessing.js`
- `createThumbnail()` - Generates 300x300 thumbnails
- `optimizeImage()` - Reduces file size
- `deleteFile()` - Cleans up temp files

---

## 🚀 **Next Step:**

**Enable Firebase Storage** (2 minutes):
1. Visit: https://console.firebase.google.com/project/darksphere-369/storage
2. Click "Get Started"
3. Choose production mode
4. Select location
5. Run: `firebase deploy --only storage`

Then your app will be 100% ready for image uploads! 🎉
