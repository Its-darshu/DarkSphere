# 🚀 Fix Google OAuth on Production (Vercel)

## ❌ THE PROBLEM

Google Sign-In works on **localhost** but fails on **production** with:
```
Authentication Error
Internal server error
```

## 🔍 ROOT CAUSE

Your production domain is **NOT** in the Google Cloud Console allowed redirect URLs!

When a user signs in with Google on production:
1. User clicks "Continue with Google"
2. Google redirects to sign in
3. User completes Google auth
4. ❌ **Google tries to redirect to `https://your-app.vercel.app/auth/callback`**
5. ❌ **But this URL is NOT in your Google OAuth allowed list!**
6. Result: "Internal server error"

---

## ✅ THE FIX (5 minutes)

### Step 1: Find Your Production URL

Your Vercel production URL is one of these:
- `https://dark-sphere.vercel.app` (or similar)
- `https://your-project-name.vercel.app`
- Or your custom domain if you added one

**To find it:**
1. Go to https://vercel.com/dashboard
2. Click on your project
3. Look at the "Domains" section
4. Copy the `.vercel.app` URL

### Step 2: Add Production URL to Google Cloud Console

1. **Go to Google Cloud Console:**
   - https://console.cloud.google.com/apis/credentials

2. **Find your OAuth 2.0 Client:**
   - Client ID: `674125979191-5crvemccuoimiq5gd96tq3rtmvjih9.apps.googleusercontent.com`
   - Click the **pencil icon** to EDIT

3. **Add Production Redirect URIs:**
   
   In "Authorized redirect URIs", ADD:
   ```
   https://YOUR-APP.vercel.app/auth/callback
   https://vpymxqqjnaasgvauqybl.supabase.co/auth/v1/callback
   ```
   
   **IMPORTANT:** Replace `YOUR-APP` with your actual Vercel project name!

4. **Add Production JavaScript Origins:**
   
   In "Authorized JavaScript origins", ADD:
   ```
   https://YOUR-APP.vercel.app
   https://vpymxqqjnaasgvauqybl.supabase.co
   ```

5. **Click SAVE**

### Step 3: Add Production URL to Supabase

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard/project/vpymxqqjnaasgvauqybl

2. **Navigate to Authentication → URL Configuration**

3. **Add Redirect URLs:**
   ```
   https://YOUR-APP.vercel.app/auth/callback
   ```

4. **Update Site URL (if needed):**
   ```
   https://YOUR-APP.vercel.app
   ```

5. **Click Save**

### Step 4: Verify Vercel Environment Variables

Make sure ALL environment variables are set in Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables

2. **Verify these are set for Production:**
   - ✅ `DATABASE_URL`
   - ✅ `NEXT_PUBLIC_SUPABASE_URL`
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`
   - ✅ `NEXTAUTH_SECRET`
   - ✅ `NEXTAUTH_URL` = `https://YOUR-APP.vercel.app`
   - ✅ `NODE_ENV` = `production`

3. **IMPORTANT:** Make sure each variable has checkmarks for:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### Step 5: Redeploy

1. **Option A: Push a new commit**
   ```bash
   git commit --allow-empty -m "Trigger redeploy for Google OAuth fix"
   git push origin main
   ```

2. **Option B: Redeploy in Vercel Dashboard**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

### Step 6: Wait & Test

1. **Wait 2-3 minutes** for:
   - Google to propagate OAuth changes
   - Vercel to complete deployment

2. **Test Google Sign-In:**
   - Go to your production URL: `https://YOUR-APP.vercel.app`
   - Click "Continue with Google"
   - Should work now! ✅

---

## 📋 COMPLETE CHECKLIST

Before testing, verify ALL of these:

### Google Cloud Console
- [ ] Production redirect URI added: `https://YOUR-APP.vercel.app/auth/callback`
- [ ] Supabase redirect URI added: `https://vpymxqqjnaasgvauqybl.supabase.co/auth/v1/callback`
- [ ] Production JavaScript origin added: `https://YOUR-APP.vercel.app`
- [ ] Supabase JavaScript origin added: `https://vpymxqqjnaasgvauqybl.supabase.co`
- [ ] Changes SAVED in Google Console

### Supabase Dashboard
- [ ] Redirect URL added: `https://YOUR-APP.vercel.app/auth/callback`
- [ ] Site URL set: `https://YOUR-APP.vercel.app`
- [ ] Google provider is ENABLED
- [ ] Client ID and Secret are filled in

### Vercel Dashboard
- [ ] All 7 environment variables are set
- [ ] Each variable has "Production" checked
- [ ] `NEXTAUTH_URL` matches your production domain
- [ ] Latest deployment is successful

---

## 🎯 QUICK REFERENCE: Your URLs

### For Google Cloud Console:

**Authorized redirect URIs:**
```
http://localhost:3000/auth/callback
http://localhost:3001/auth/callback
https://YOUR-APP.vercel.app/auth/callback
https://vpymxqqjnaasgvauqybl.supabase.co/auth/v1/callback
```

**Authorized JavaScript origins:**
```
http://localhost:3000
http://localhost:3001
https://YOUR-APP.vercel.app
https://vpymxqqjnaasgvauqybl.supabase.co
```

### For Supabase:

**Redirect URLs:**
```
http://localhost:3000/auth/callback
http://localhost:3001/auth/callback
https://YOUR-APP.vercel.app/auth/callback
```

**Site URL:**
```
https://YOUR-APP.vercel.app
```

---

## 🔍 HOW TO FIND YOUR VERCEL URL

**Method 1: From Terminal**
```bash
vercel ls
```

**Method 2: From Dashboard**
1. Go to https://vercel.com/dashboard
2. Click your project
3. Look at "Production Deployment"
4. Copy the domain (e.g., `dark-sphere-abc123.vercel.app`)

**Method 3: From Git**
Check the last deployment comment on your GitHub repo - Vercel usually posts the URL there.

---

## 🆘 TROUBLESHOOTING

### Error: "redirect_uri_mismatch"
**Fix:** The production URL in Google Cloud Console doesn't match exactly.
- Check for typos
- Make sure there's no trailing slash: `/auth/callback` ✅ not `/auth/callback/` ❌
- URL must be exact: `https://your-app.vercel.app/auth/callback`

### Error: "Invalid redirect URL"
**Fix:** Supabase doesn't allow that redirect URL.
- Add it to Supabase → Authentication → URL Configuration → Redirect URLs

### Error: "Origin not allowed"
**Fix:** The JavaScript origin is not allowed.
- Add `https://YOUR-APP.vercel.app` to Google Cloud Console → Authorized JavaScript origins

### Still getting "Internal server error"
**Check:**
1. Open browser DevTools (F12) → Console tab
2. Look for errors starting with `[Callback]` or `[Google Auth]`
3. Check Vercel deployment logs: Dashboard → Deployments → Click on deployment → View Function Logs

---

## 🔐 SECURITY NOTES

### Production vs Development

**Development (localhost):**
- Uses `http://localhost:3000`
- Less secure (http, not https)
- For testing only

**Production (Vercel):**
- Uses `https://your-app.vercel.app`
- Secure (https required)
- For real users

### Environment Variables

⚠️ **NEVER commit these to GitHub:**
- `NEXTAUTH_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

✅ **Set them in Vercel Dashboard only**

### Custom Domains

If you add a custom domain (e.g., `darksphere.com`):
1. Add it to Google Cloud Console redirect URIs
2. Add it to Supabase redirect URLs
3. Update `NEXTAUTH_URL` in Vercel to use custom domain

---

## 🚀 EXPECTED BEHAVIOR AFTER FIX

**Before fix:**
1. User clicks "Continue with Google"
2. Google sign-in page loads
3. User signs in
4. ❌ "Authentication Error - Internal server error"

**After fix:**
1. User clicks "Continue with Google"
2. Google sign-in page loads
3. User signs in
4. ✅ Redirects to `/auth/callback`
5. ✅ User is logged in
6. ✅ Redirects to `/profile/username`

---

## 📞 NEXT STEPS

**Tell me:**
1. What's your Vercel production URL? (e.g., `https://dark-sphere.vercel.app`)
2. Have you added it to Google Cloud Console?
3. Have you added it to Supabase?

I can create a custom script to verify your production setup!

---

## ✨ TL;DR

**The fix:**
1. Find your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Add `https://your-app.vercel.app/auth/callback` to Google Cloud Console redirect URIs
3. Add `https://your-app.vercel.app/auth/callback` to Supabase redirect URLs
4. Add `https://your-app.vercel.app` to both as JavaScript origins
5. Set `NEXTAUTH_URL=https://your-app.vercel.app` in Vercel environment variables
6. Redeploy
7. Test

**That's it!** 🎉
