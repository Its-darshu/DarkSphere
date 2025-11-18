# 🐳 Docker Deployment Guide

## ✅ **Docker Files Created:**

- `backend/Dockerfile` - Backend container image
- `backend/.dockerignore` - Excludes unnecessary files
- `docker-compose.yml` - Local testing setup

---

## 🏠 **Local Testing with Docker:**

### **Build and run locally:**

```powershell
# Build the image
cd f:\darksphere\backend
docker build -t darksphere-backend .

# Run the container
docker run -p 5000:5000 --env-file .env darksphere-backend
```

### **Or use Docker Compose (easier):**

```powershell
cd f:\darksphere
docker-compose up
```

This automatically:
- Builds the backend image
- Mounts volumes for persistent storage
- Exposes port 5000
- Uses your `.env` file

---

## 🚀 **Free Hosting Options with Docker:**

### **Option 1: Render.com (RECOMMENDED - Easiest)**

**Free Tier:**
- ✅ 750 hours/month free
- ✅ Persistent disk (1GB free)
- ✅ Auto-deploy from GitHub
- ⚠️ Sleeps after 15 min inactivity (wakes on request)

**Steps:**

1. Go to https://render.com
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Connect `Its-darshu/DarkSphere` repository
5. Configure:
   - **Name:** darksphere-backend
   - **Root Directory:** `backend`
   - **Environment:** Docker
   - **Plan:** Free
   - **Region:** Choose closest to you

6. Add environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   REGISTRATION_PASSCODE=your_passcode
   ADMIN_EMAIL=your@gmail.com
   MAX_IMAGE_SIZE_MB=5
   FIREBASE_SERVICE_ACCOUNT=<paste entire JSON>
   ```

7. **Add Persistent Disk:**
   - Scroll to "Disk"
   - Click "Add Disk"
   - **Name:** uploads
   - **Mount Path:** `/app/public`
   - **Size:** 1GB (free)

8. Click "Create Web Service"

9. Get your URL: `https://darksphere-backend.onrender.com`

---

### **Option 2: Fly.io (More Control)**

**Free Tier:**
- ✅ 3GB persistent volumes free
- ✅ 160GB bandwidth/month
- ✅ Better performance (no sleep)
- ⚠️ Requires Fly CLI

**Steps:**

1. Install Fly CLI:
   ```powershell
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. Sign up:
   ```powershell
   fly auth signup
   ```

3. Create app:
   ```powershell
   cd f:\darksphere\backend
   fly launch --name darksphere-backend --no-deploy
   ```

4. Edit `fly.toml` (created automatically):
   ```toml
   [mounts]
     source = "uploads_vol"
     destination = "/app/public"
   ```

5. Create volume:
   ```powershell
   fly volumes create uploads_vol --size 1
   ```

6. Set secrets:
   ```powershell
   fly secrets set NODE_ENV=production
   fly secrets set CORS_ORIGIN=https://your-vercel-app.vercel.app
   fly secrets set REGISTRATION_PASSCODE=your_passcode
   fly secrets set ADMIN_EMAIL=your@gmail.com
   fly secrets set FIREBASE_SERVICE_ACCOUNT='<paste JSON>'
   ```

7. Deploy:
   ```powershell
   fly deploy
   ```

8. Get URL: `https://darksphere-backend.fly.dev`

---

### **Option 3: Koyeb (Alternative)**

**Free Tier:**
- ✅ No sleep
- ✅ Persistent volumes
- ✅ Simple deployment
- ⚠️ Smaller free tier limits

Similar to Render, but requires credit card for verification (no charges).

---

## 🎯 **Recommended Path: Render.com**

**Why Render?**
- ✅ No CLI needed - all web UI
- ✅ Auto-deploy from GitHub pushes
- ✅ Persistent disk included
- ✅ Free HTTPS
- ✅ No credit card required
- ⚠️ Only downside: sleeps after inactivity (but free!)

**Steps Summary:**
1. Sign up at Render.com with GitHub
2. New Web Service → Select DarkSphere repo
3. Root directory: `backend`
4. Environment: Docker
5. Add disk: `/app/public` (1GB)
6. Add environment variables
7. Deploy!

---

## 🔄 **After Backend Deployment:**

### **Update Frontend:**

1. Get your backend URL (e.g., `https://darksphere-backend.onrender.com`)

2. Update Vercel environment variable:
   ```powershell
   cd f:\darksphere\frontend
   vercel env rm VITE_API_URL production
   vercel env add VITE_API_URL production
   # When prompted, enter: https://darksphere-backend.onrender.com
   ```

3. Redeploy frontend:
   ```powershell
   vercel --prod
   ```

### **Update Backend CORS:**

In Render dashboard (or Fly secrets), update:
```
CORS_ORIGIN=https://darksphere-4zipa8es8-darshan99806-gmailcoms-projects.vercel.app
```

---

## 🧪 **Test Your Deployment:**

1. Visit your backend health endpoint:
   ```
   https://your-backend-url.onrender.com/health
   ```
   Should return: `{"status":"ok",...}`

2. Visit your frontend:
   ```
   https://your-vercel-url.vercel.app
   ```

3. Test full flow:
   - Sign in with Google
   - Create a post with an image
   - Verify image uploads and displays

---

## 💰 **Total Cost: $0**

- ✅ Frontend: Vercel (free)
- ✅ Backend: Render.com (free)
- ✅ Database: Firestore (free tier)
- ✅ Auth: Firebase Auth (free)
- ✅ Storage: Local disk on Render (free 1GB)

**Perfect for personal projects!** 🎉

---

## 📦 **Your Docker Setup:**

All files are ready:
- `backend/Dockerfile` - Production-ready container
- `backend/.dockerignore` - Optimized build
- `docker-compose.yml` - Local testing

**Next step: Deploy to Render.com!**
