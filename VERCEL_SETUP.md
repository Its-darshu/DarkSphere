# 🚀 Vercel Deployment Setup for Existing Project

## ⚠️ IMPORTANT: You have a previous Vercel deployment

Since you already deployed this repo before, follow these steps to reconfigure:

---

## 🔧 Step 1: Clear Old Vercel Configuration

### Option A: From Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Find your DarkSphere project
3. Go to **Settings → Environment Variables**
4. **DELETE all old environment variables**
5. Continue to Step 2 below

### Option B: Unlink and Reimport
1. Go to https://vercel.com/dashboard
2. Find your DarkSphere project
3. Go to **Settings → General → Delete Project**
4. Confirm deletion
5. Go back to dashboard → **Add New → Project**
6. Import your GitHub repository again

---

## 🔑 Step 2: Set Fresh Environment Variables

In Vercel dashboard → Your Project → Settings → Environment Variables

Add these 5 variables (get fresh values from Supabase):

```
DATABASE_URL
→ Get from: Supabase Dashboard → Settings → Database → Connection string (Transaction mode)

NEXT_PUBLIC_SUPABASE_URL
→ Get from: Supabase Dashboard → Settings → API → Project URL

NEXT_PUBLIC_SUPABASE_ANON_KEY
→ Get from: Supabase Dashboard → Settings → API → anon public key

SUPABASE_SERVICE_ROLE_KEY
→ Get from: Supabase Dashboard → Settings → API → service_role key (Secret!)

NODE_ENV
→ Set to: production
```

**IMPORTANT:** Make sure to select "Production", "Preview", and "Development" for each variable!

---

## 🚀 Step 3: Push Code & Deploy

```bash
# Stage deployment files
git add DEPLOYMENT_READY.md VERCEL_SETUP.md

# Commit
git commit -m "docs: Add secure deployment guide"

# Push to trigger deployment
git push origin main
```

Vercel will auto-deploy after push!

---

## ✅ Step 4: Verify Deployment

1. Check Vercel dashboard for build status
2. Click on deployment URL when ready
3. Test your app:
   - Try to sign up
   - Try to log in
   - Create a test post

---

## 🔒 Security Notes

✅ `.env` is in .gitignore (local keys safe)
✅ No keys committed to git
✅ Keys only stored in Vercel dashboard
✅ Service role key never exposed to client

---

## 🆘 If Build Fails

### Check these in order:

1. **All 5 environment variables set?**
   - Vercel → Settings → Environment Variables
   - Should see all 5 listed

2. **Variables applied to Production/Preview/Development?**
   - Each variable should have checkmarks for all three

3. **DATABASE_URL format correct?**
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

4. **Supabase project active?**
   - Check https://supabase.com/dashboard
   - Ensure project is not paused

5. **Try redeploying:**
   - Vercel → Deployments → Latest → Three dots → Redeploy

---

## 🎯 Next Steps After Deployment

1. **Apply database constraints** (if not already done):
   - Go to Supabase → SQL Editor
   - Run the constraint SQL from DEPLOYMENT_READY.md

2. **Test all features:**
   - Sign up / Sign in
   - Create posts
   - Like and comment
   - Follow users

3. **Optional: Add custom domain**
   - Vercel → Settings → Domains
   - Add your domain (e.g., darksphere.com)

---

## 📊 Your Deployment

- **Platform:** Vercel (Serverless)
- **Database:** Supabase PostgreSQL
- **Region:** Auto (closest to users)
- **Cost:** $0/month (free tier)
- **Auto-deploy:** On git push

---

Ready to deploy! 🚀

```bash
git push origin main
```

Then check Vercel dashboard for deployment status!
