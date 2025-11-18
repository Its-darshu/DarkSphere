# 🚀 Deployment Guide - DarkSphere

## ⚠️ **Important: Your App Needs Split Deployment**

Your app uses **local file storage** which requires a persistent server. Vercel is serverless and won't work for the backend.

---

## ✅ **Recommended Architecture:**

```
Frontend (Vercel) ← API calls → Backend (Railway/Render)
                                      ↓
                                Local Storage + Firestore
```

---

## 📦 **Deployment Options:**

### **Option 1: Vercel + Railway (Recommended - FREE)**

#### **Frontend → Vercel:**
1. Go to https://vercel.com
2. Import your GitHub repository
3. **Set Root Directory:** `frontend`
4. **Framework Preset:** Vite
5. Add environment variables:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=darksphere-369.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=darksphere-369
   VITE_FIREBASE_STORAGE_BUCKET=darksphere-369.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_API_URL=https://your-backend.up.railway.app
   ```
6. Deploy!

#### **Backend → Railway:**
1. Go to https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Select your DarkSphere repository
4. **Set Root Directory:** `backend`
5. Add environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   CORS_ORIGIN=https://your-frontend.vercel.app
   REGISTRATION_PASSCODE=your_secret_passcode
   ADMIN_EMAIL=your@gmail.com
   MAX_IMAGE_SIZE_MB=5
   API_URL=${{RAILWAY_PUBLIC_DOMAIN}}
   ```
6. Upload `firebase-service-account.json` as a file (or paste as env variable)
7. Deploy!
8. Railway provides: `https://your-backend.up.railway.app`

---

### **Option 2: Render (Frontend + Backend - FREE)**

1. Go to https://render.com
2. Create **Static Site** for frontend:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   
3. Create **Web Service** for backend:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add environment variables
   - Enable persistent disk at `/backend/public` (for images)

---

### **Option 3: Heroku (Paid - But Reliable)**

1. Create two apps:
   - `darksphere-frontend`
   - `darksphere-backend`
   
2. Backend needs buildpack:
   ```bash
   heroku buildpacks:add heroku/nodejs
   ```

3. Add persistent storage addon (needed for images)

---

## 🔧 **If You Want to Use Vercel for Everything:**

### **You MUST switch from local storage to cloud storage!**

Choose one:
- **Cloudinary** (25GB free) - Easiest
- **AWS S3** (Pay as you go)
- **Firebase Storage** (Requires billing)
- **DigitalOcean Spaces** ($5/month)

Then modify `backend/src/routes/upload.js` to upload to cloud instead of local disk.

---

## 📝 **Quick Deploy Commands:**

### **Deploy to Vercel (Frontend Only):**
```bash
cd frontend
npm install -g vercel
vercel --prod
```

### **Deploy to Railway (Backend):**
```bash
cd backend
railway login
railway init
railway up
```

---

## ✅ **After Deployment:**

1. **Update CORS_ORIGIN** in backend with your Vercel URL
2. **Update VITE_API_URL** in frontend with your Railway URL
3. **Test the full flow**:
   - Sign in with Google
   - Create a post
   - Upload an image
   - Check if images load

---

## 🚨 **Current Vercel Error:**

```
Error: No Next.js version detected
```

**This is because:**
- Vercel expects Next.js by default
- You have Vite + React
- You need to configure Vercel properly

**Solution:**
- Set **Root Directory** to `frontend` in Vercel dashboard
- Or deploy only frontend to Vercel
- Deploy backend elsewhere (Railway/Render)

---

## 💡 **Pro Tips:**

1. **Free Tier Limits:**
   - Railway: 500 hours/month, $5 credit
   - Render: Spins down after inactivity
   - Vercel: Unlimited for frontend

2. **Performance:**
   - Backend on Railway (fast)
   - Frontend on Vercel (CDN, super fast)
   - Images served from backend (slower than CDN)

3. **Scaling:**
   - Start with Railway + Vercel
   - Later migrate to Cloudinary for images
   - Keep backend on Railway or upgrade

---

## 🎯 **Recommended for Beginners:**

**Frontend:** Vercel ✅  
**Backend:** Railway ✅  
**Database:** Firestore ✅ (already set up)  
**Images:** Local storage on Railway ✅

**Total Cost: $0** 🎉
