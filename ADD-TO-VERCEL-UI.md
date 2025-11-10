# 🚨 URGENT: Add Environment Variables to Vercel

Your deployment failed because the environment variables are missing!

## Quick Fix - Add in Vercel Dashboard

1. Go to: https://vercel.com/darshan99806-gmailcoms-projects/dark-sphere/settings/environment-variables

2. **Add these 7 variables** (click "+ Add" for each):

### Variable 1: VITE_FIREBASE_API_KEY
```
AIzaSyBu65PEeiKhgPKdGIi_rscIiC2hVpYhul4
```

### Variable 2: VITE_FIREBASE_AUTH_DOMAIN
```
darksphere-369.firebaseapp.com
```

### Variable 3: VITE_FIREBASE_PROJECT_ID
```
darksphere-369
```

### Variable 4: VITE_FIREBASE_STORAGE_BUCKET
```
darksphere-369.firebasestorage.app
```

### Variable 5: VITE_FIREBASE_MESSAGING_SENDER_ID
```
674125979191
```

### Variable 6: VITE_FIREBASE_APP_ID
```
1:674125979191:web:0e6b6c5b40f00d352e69b2
```

### Variable 7: VITE_API_URL
```
/api
```

## 3. Redeploy

After adding all variables, go to **Deployments** tab and click **Redeploy** on the latest deployment.

---

## Alternative: Use Vercel CLI

```powershell
# Add environment variables via CLI
vercel env add VITE_FIREBASE_API_KEY production
# Paste: AIzaSyBu65PEeiKhgPKdGIi_rscIiC2hVpYhul4

vercel env add VITE_FIREBASE_AUTH_DOMAIN production
# Paste: darksphere-369.firebaseapp.com

vercel env add VITE_FIREBASE_PROJECT_ID production
# Paste: darksphere-369

vercel env add VITE_FIREBASE_STORAGE_BUCKET production
# Paste: darksphere-369.firebasestorage.app

vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
# Paste: 674125979191

vercel env add VITE_FIREBASE_APP_ID production
# Paste: 1:674125979191:web:0e6b6c5b40f00d352e69b2

vercel env add VITE_API_URL production
# Paste: /api

# Then redeploy
vercel --prod --force
```

---

## Why This Happened

- ✅ Your `.env` file has the correct values
- ❌ But Vercel doesn't read `.env` files for security
- ❌ You must add them manually in Vercel dashboard or via CLI
- ❌ Without `VITE_API_URL=/api`, it defaults to `http://localhost:5000`

## After Adding Variables

Your app will use `/api` for backend calls, which will work with your Vercel serverless functions! 🚀
