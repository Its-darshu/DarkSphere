# 🚂 Railway Backend Deployment

## 📝 **Environment Variables to Add in Railway:**

Go to your Railway project → Variables tab → Add these:

```
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://your-app.vercel.app
REGISTRATION_PASSCODE=your_secret_passcode_here
ADMIN_EMAIL=your@gmail.com
MAX_IMAGE_SIZE_MB=5
```

⚠️ **IMPORTANT:** After Vercel deployment, come back and update `CORS_ORIGIN` with your actual Vercel URL!

---

## 📁 **Upload Firebase Service Account:**

### **Method 1: As Environment Variable (Easier)**

1. Open your `backend/firebase-service-account.json` file
2. Copy the entire JSON content
3. In Railway Variables, add:
   ```
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...entire json...}
   ```

### **Method 2: As File (Advanced)**

Railway doesn't support file uploads directly, so use Method 1.

---

## ⚙️ **Railway Settings:**

- **Root Directory:** `backend`
- **Start Command:** `npm start` (auto-detected)
- **Build Command:** `npm install` (auto-detected)
- **Health Check:** `/health` (optional)

---

## 🔗 **After Deployment:**

Railway will give you a URL like:
```
https://darksphere-backend-production-xxxx.up.railway.app
```

**Save this URL!** You'll need it for Vercel.

---

## ✅ **Verify Backend is Working:**

Visit: `https://your-railway-url.up.railway.app/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-11-09T...",
  "environment": "production"
}
```

---

## 💾 **Persistent Storage (Optional):**

If you want images to persist across restarts:

1. Go to your Railway service
2. Click "Settings" → "Volumes"
3. Add volume:
   - **Mount Path:** `/app/backend/public`
   - **Size:** 1GB (or more)

This ensures uploaded images aren't lost when Railway restarts your container.

---

## 🚨 **Common Issues:**

### **Error: Cannot find module 'firebase-admin'**
- Railway is still installing dependencies
- Wait 2-3 minutes and check logs

### **Error: CORS blocked**
- Update `CORS_ORIGIN` variable with your Vercel URL
- Restart the service

### **Images not loading**
- Check if `API_URL` variable is set
- Verify Railway domain is correct

---

## 💰 **Cost:**

- ✅ **FREE** - $5 credit + 500 hours/month
- Perfect for development and small apps
- Upgrade later if needed
