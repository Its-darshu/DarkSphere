# ⚡ Vercel Frontend Deployment

## 📝 **Deployment Steps:**

1. Go to https://vercel.com
2. Click **"Add New Project"**
3. **Import Git Repository** → Select **`Its-darshu/DarkSphere`**

---

## ⚙️ **Configure Project:**

### **Root Directory:**
```
frontend
```
⚠️ **VERY IMPORTANT!** Set this in the "Root Directory" field!

### **Framework Preset:**
```
Vite
```

### **Build Settings (Auto-detected):**
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

---

## 🔐 **Environment Variables:**

Click **"Environment Variables"** and add these:

### **From your `frontend/.env` file:**

```
VITE_FIREBASE_API_KEY=AIzaSyBKNbZ_YOUR_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=darksphere-369.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=darksphere-369
VITE_FIREBASE_STORAGE_BUCKET=darksphere-369.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

### **Backend URL (from Railway):**

```
VITE_API_URL=https://your-railway-backend-url.up.railway.app
```

⚠️ **Get this URL from Railway first!** Then add it here.

---

## 🚀 **Deploy:**

1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Vercel gives you a URL: `https://darksphere-xxx.vercel.app`

---

## 🔄 **Update Railway CORS:**

After Vercel deployment:

1. Copy your Vercel URL: `https://your-app.vercel.app`
2. Go back to Railway
3. Update environment variable:
   ```
   CORS_ORIGIN=https://your-app.vercel.app
   ```
4. Railway will auto-redeploy

---

## ✅ **Test Your App:**

1. Visit your Vercel URL
2. Click "Sign in with Google"
3. Enter registration passcode
4. Create a post with an image
5. Verify image uploads and displays

---

## 🎯 **Your URLs:**

**Frontend (Vercel):**
```
https://darksphere-xxx.vercel.app
```

**Backend (Railway):**
```
https://darksphere-backend-production-xxx.up.railway.app
```

**API Endpoint Examples:**
```
https://railway-url/api/posts
https://railway-url/api/auth/verify-token
https://railway-url/uploads/posts/image.jpg
```

---

## 🚨 **Common Issues:**

### **Build Failed - "Cannot find module 'vite'"**
- Vercel is installing dependencies
- Check build logs
- Verify `frontend` root directory is set

### **Blank page after deployment**
- Check browser console for errors
- Verify all environment variables are set
- Check if `VITE_API_URL` is correct

### **API calls fail (CORS error)**
- Update `CORS_ORIGIN` in Railway
- Make sure Vercel URL matches exactly
- Include `https://` in the URL

### **Google Sign-In not working**
- Add Vercel domain to Firebase Auth:
  - Go to Firebase Console
  - Authentication → Settings → Authorized domains
  - Add: `your-app.vercel.app`

---

## 🔄 **Auto-Deploy (Continuous Deployment):**

Both Vercel and Railway automatically deploy when you push to GitHub!

```bash
git add .
git commit -m "Update feature"
git push
```

- ✅ Vercel rebuilds frontend
- ✅ Railway rebuilds backend
- ✅ Changes live in 2-3 minutes

---

## 💰 **Cost:**

- ✅ **FREE** - Vercel Hobby plan
- Unlimited bandwidth
- Automatic HTTPS
- Global CDN
- Perfect for personal projects

---

## 🎉 **After Successful Deployment:**

Your app is LIVE on the internet! 🌍

Share your URL:
```
https://darksphere-xxx.vercel.app
```
