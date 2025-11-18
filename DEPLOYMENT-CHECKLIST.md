# 🚀 DEPLOYMENT CHECKLIST

## ✅ **Step-by-Step Deployment Guide**

Follow these steps in order:

---

## 🚂 **PART 1: Deploy Backend to Railway**

### **1. Go to Railway**
🔗 https://railway.app

### **2. Create New Project**
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose: `Its-darshu/DarkSphere`

### **3. Configure Service**
- **Root Directory:** `backend`
- **Start Command:** `npm start` (auto-detected)

### **4. Add Environment Variables**

Click "Variables" tab and add:

```
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://placeholder.vercel.app
REGISTRATION_PASSCODE=YourSecretPasscode123
ADMIN_EMAIL=your@gmail.com
MAX_IMAGE_SIZE_MB=5
FIREBASE_SERVICE_ACCOUNT={"type":"service_account", paste entire firebase-service-account.json content here}
```

⚠️ **For FIREBASE_SERVICE_ACCOUNT:**
1. Open `f:\darksphere\backend\firebase-service-account.json`
2. Copy the ENTIRE JSON content
3. Paste it as the value (it's one long line)

### **5. Deploy**
- Railway automatically deploys
- Wait 2-3 minutes

### **6. Get Your Backend URL**
- Click "Settings" → "Domains"
- Copy the URL (looks like: `https://darksphere-backend-production-xxxx.up.railway.app`)
- **SAVE THIS URL!** You need it for Vercel

### **7. Test Backend**
Visit: `https://your-railway-url.up.railway.app/health`

Should show:
```json
{"status":"ok","timestamp":"...","environment":"production"}
```

✅ **Backend Done!**

---

## ⚡ **PART 2: Deploy Frontend to Vercel**

### **1. Go to Vercel**
🔗 https://vercel.com

### **2. Import Project**
- Click "Add New Project"
- Import: `Its-darshu/DarkSphere`

### **3. Configure Build Settings**

⚠️ **MOST IMPORTANT:**
- **Root Directory:** `frontend` ← Type this!
- **Framework Preset:** Vite
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `dist` (auto-detected)

### **4. Add Environment Variables**

Open `f:\darksphere\frontend\.env` file and copy these values:

```
VITE_FIREBASE_API_KEY=<from your .env file>
VITE_FIREBASE_AUTH_DOMAIN=darksphere-369.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=darksphere-369
VITE_FIREBASE_STORAGE_BUCKET=darksphere-369.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=<from your .env file>
VITE_FIREBASE_APP_ID=<from your .env file>
VITE_API_URL=<PASTE YOUR RAILWAY URL HERE>
```

⚠️ **Use the Railway URL from Part 1, Step 6!**

### **5. Deploy**
- Click "Deploy"
- Wait 2-3 minutes
- Get your Vercel URL: `https://darksphere-xxx.vercel.app`

✅ **Frontend Done!**

---

## 🔄 **PART 3: Connect Frontend & Backend**

### **1. Update Railway CORS**
- Go back to Railway
- Click "Variables"
- Update `CORS_ORIGIN`:
  ```
  CORS_ORIGIN=https://your-actual-vercel-url.vercel.app
  ```
- Railway will auto-redeploy (1-2 minutes)

### **2. Update Firebase Auth Domains**
- Go to: https://console.firebase.google.com
- Select "darksphere-369" project
- Click "Authentication" → "Settings" → "Authorized domains"
- Click "Add domain"
- Add your Vercel domain: `your-app.vercel.app` (without https://)

✅ **Connected!**

---

## 🎯 **PART 4: Test Your Live App**

### **1. Visit Your Vercel URL**
`https://your-app.vercel.app`

### **2. Test Sign In**
- Click "Sign in with Google"
- Sign in with your Google account
- Enter registration passcode (the one you set in Railway)
- Should see the feed page

### **3. Test Post Creation**
- Click "+" button
- Write some text
- Upload an image
- Click "Post"
- Should see your post in the feed

### **4. Test Image Display**
- Your uploaded image should display
- Right-click image → "Open image in new tab"
- URL should be: `https://railway-url.up.railway.app/uploads/posts/xxx.jpg`

✅ **App is Live!** 🎉

---

## 📋 **Quick Reference**

### **Your URLs:**
- **Frontend:** `https://__________.vercel.app`
- **Backend:** `https://__________.up.railway.app`
- **GitHub:** `https://github.com/Its-darshu/DarkSphere`

### **Files You Need:**
- ✅ `frontend/.env` - For Vercel environment variables
- ✅ `backend/firebase-service-account.json` - For Railway

### **Credentials You Need:**
- ✅ GitHub account (to import repo)
- ✅ Railway account (free, sign in with GitHub)
- ✅ Vercel account (free, sign in with GitHub)
- ✅ Firebase credentials (already have)

---

## 🚨 **Troubleshooting**

### **Railway build fails:**
- Check logs in Railway dashboard
- Verify `FIREBASE_SERVICE_ACCOUNT` is valid JSON
- Make sure root directory is set to `backend`

### **Vercel build fails:**
- Check root directory is set to `frontend`
- Verify all `VITE_*` environment variables are set
- Check build logs for missing dependencies

### **CORS errors:**
- Update `CORS_ORIGIN` in Railway with exact Vercel URL
- Include `https://` and no trailing slash
- Wait for Railway to redeploy

### **Images not loading:**
- Check browser console for errors
- Verify `VITE_API_URL` points to Railway
- Test: `https://railway-url.up.railway.app/health`

### **Google Sign-In fails:**
- Add Vercel domain to Firebase authorized domains
- Use your admin email in Railway `ADMIN_EMAIL` variable

---

## 💰 **Costs**

- **Railway:** FREE ($5 credit + 500 hours/month)
- **Vercel:** FREE (Hobby plan, unlimited)
- **Firebase:** FREE (Spark plan)

**Total: $0** 🎉

---

## 🎊 **You're Done!**

Your app is now live on the internet! Share your Vercel URL with friends! 🌍
