# 🔍 Production Google OAuth Debugging Guide

## Current Issue
Getting "Authentication Error - Internal server error" on production after:
- ✅ Added Google OAuth redirect URIs
- ✅ Added environment variables to Vercel
- ✅ Deployed to production

## 🐛 Debug Steps

### Step 1: Check Browser Console Logs

1. Open production site: https://darksphere.vercel.app/signin
2. Press F12 to open DevTools
3. Go to **Console** tab
4. Click "Continue with Google"
5. Complete Google sign-in
6. Watch for logs starting with `[Callback]` and `[Google Auth]`

**What to look for:**
- `[Callback] Session: Not found` = Supabase isn't creating session
- `[Google Auth] Invalid token` = Token verification failing
- Any other error messages

### Step 2: Check Vercel Function Logs

1. Go to https://vercel.com/dashboard
2. Click your project
3. Go to **Deployments**
4. Click on the latest deployment
5. Click **Functions** tab
6. Look for `/api/auth/google` logs

**What to look for:**
- `[Google Auth] No token provided`
- `[Google Auth] Invalid token`
- Database connection errors
- Any error stack traces

### Step 3: Verify Supabase Redirect URL Configuration

**Critical:** The URL with `#` at the end suggests Supabase redirect issue!

1. Go to: https://supabase.com/dashboard/project/vpymxqqjnaasgvauqybl/auth/url-configuration

2. **Check these settings:**

   **Site URL:** (Should be ONE of these)
   ```
   https://darksphere.vercel.app
   ```
   
   **Redirect URLs:** (Should include)
   ```
   https://darksphere.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   http://localhost:3001/auth/callback
   ```

3. **IMPORTANT:** Make sure there are NO extra characters:
   - ❌ `https://darksphere.vercel.app/auth/callback#`
   - ❌ `https://darksphere.vercel.app/auth/callback/`
   - ✅ `https://darksphere.vercel.app/auth/callback`

### Step 4: Check Google Cloud Console Again

The `#` might be coming from Google Cloud Console redirect URI!

1. Go to: https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client
3. **Check "Authorized redirect URIs"** - make sure there's NO `#`:
   ```
   ✅ https://darksphere.vercel.app/auth/callback
   ❌ https://darksphere.vercel.app/auth/callback#
   ```

### Step 5: Force Redeploy

Environment variables might not have propagated:

1. In Vercel Dashboard → Deployments
2. Click "..." on latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete
5. Try again

### Step 6: Test with Clear Browser Data

1. Open **Incognito/Private window**
2. Go to: https://darksphere.vercel.app/signin
3. Try Google Sign-In
4. This eliminates cached OAuth tokens

## 🔍 Common Causes

### Cause 1: Supabase URL Configuration Wrong
**Symptom:** URL ends with `#`
**Fix:** Remove the `#` from redirect URL in Supabase Dashboard

### Cause 2: Environment Variables Not Applied
**Symptom:** "Internal server error" with no specific logs
**Fix:** Redeploy after adding environment variables

### Cause 3: NEXTAUTH_SECRET Not Set
**Symptom:** JWT signing fails
**Fix:** Add `NEXTAUTH_SECRET` to Vercel environment variables

### Cause 4: Database Connection Issue
**Symptom:** Error creating/finding user
**Fix:** Check `DATABASE_URL` is correct for production

### Cause 5: Supabase Token Verification Failing
**Symptom:** "Invalid Google token" error
**Fix:** Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct

## 📋 Quick Verification Checklist

Run through this checklist:

### Supabase Dashboard
- [ ] Go to Authentication → Providers → Google
- [ ] Google provider is **Enabled**
- [ ] Client ID is filled in
- [ ] Client Secret is filled in
- [ ] Go to Authentication → URL Configuration
- [ ] Site URL = `https://darksphere.vercel.app` (no trailing slash)
- [ ] Redirect URLs include `https://darksphere.vercel.app/auth/callback`
- [ ] **NO** redirect URLs have `#` at the end

### Google Cloud Console
- [ ] Go to APIs & Services → Credentials
- [ ] Edit OAuth 2.0 Client
- [ ] Authorized redirect URIs include:
  - `https://darksphere.vercel.app/auth/callback` (no `#`)
  - `https://vpymxqqjnaasgvauqybl.supabase.co/auth/v1/callback`
- [ ] Authorized JavaScript origins include:
  - `https://darksphere.vercel.app`
  - `https://vpymxqqjnaasgvauqybl.supabase.co`
- [ ] Click **Save**

### Vercel Environment Variables
- [ ] `DATABASE_URL` = Your Supabase PostgreSQL connection string
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://vpymxqqjnaasgvauqybl.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = Your service role key
- [ ] `NODE_ENV` = `production`
- [ ] `NEXTAUTH_SECRET` = `HsZ3Zrqj7n8Iu0n+C4eN6x2Fgb02C/H9rBtO8tobfvw=`
- [ ] `NEXTAUTH_URL` = `https://darksphere.vercel.app`
- [ ] All variables have **Production** checked

### After All Changes
- [ ] Redeployed the app
- [ ] Waited 2-3 minutes for deployment
- [ ] Tested in incognito/private window

## 🆘 If Still Not Working

### Get the Actual Error Message

Add this to your production URL to see detailed errors:

1. Open: https://darksphere.vercel.app/signin
2. Open Browser DevTools (F12) → Console tab
3. Click "Continue with Google"
4. Sign in with Google
5. **Copy the entire console output**
6. Share it with me

### Check Vercel Logs

1. Go to Vercel Dashboard → Deployments → [Latest] → Functions
2. Find the `/api/auth/google` function
3. Look for error logs
4. Copy the error messages

## 💡 Most Likely Issues

Based on the `#` in the URL, the issue is probably:

1. **Supabase redirect URL has a `#`** - Remove it from Supabase Dashboard
2. **Google OAuth redirect URI has a `#`** - Remove it from Google Cloud Console
3. **Site URL in Supabase is wrong** - Should be `https://darksphere.vercel.app`

## 🎯 Next Steps

1. **Check Supabase** redirect URLs first (most likely cause)
2. **Open browser console** to see actual error
3. **Share the console logs** with me
4. I can pinpoint the exact issue

---

The `#` at the end of the URL is the key clue! This suggests the OAuth redirect
is not completing properly. Fix the redirect URLs first!
