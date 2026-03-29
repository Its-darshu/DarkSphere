# 🚀 DarkSphere - Ready to Deploy to Vercel!

## ✅ SETUP COMPLETE!

Your database is connected and synced with Supabase! ✨

---

## 📋 What's Already Done:

✅ All security fixes applied (16/16)  
✅ Supabase database connected  
✅ Schema pushed to database  
✅ Prisma client generated  
✅ All environment variables configured  

---

## 🚀 Deploy to Vercel (5 Steps - 10 minutes)

### Step 1: Push to GitHub
```bash
cd /home/jocky/Project/DarkSphere
git push origin main
```

### Step 2: Go to Vercel
```
1. Open: https://vercel.com
2. Click "Sign Up" (use GitHub login)
3. Click "Import Project"
4. Select your DarkSphere repository
```

### Step 3: Configure Environment Variables
In Vercel dashboard, add these **5 environment variables**:

```bash
DATABASE_URL
postgresql://postgres:darsphere006@db.vpymxqqjnaasgvauqybl.supabase.co:5432/postgres

NEXT_PUBLIC_SUPABASE_URL
https://vpymxqqjnaasgvauqybl.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweW14cXFqbmFhc2d2YXVxeWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDUwMDYsImV4cCI6MjA4OTY4MTAwNn0.h1rxr9U4piKsHp8gS4M-Tiu8uJIdLzQCXWATGNj9kNU

SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweW14cXFqbmFhc2d2YXVxeWJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDEwNTAwNiwiZXhwIjoyMDg5NjgxMDA2fQ.qfJnj1QKEh5vQLvyYfTGRu8wo52GdmkQll5yamovOBE

NODE_ENV
production
```

### Step 4: Deploy!
```
Click "Deploy" button
Wait 2-3 minutes
✨ Your app will be live!
```

### Step 5: Apply Database Constraints
After first deploy, run this in Supabase SQL Editor:

```sql
-- Add CHECK constraints for data integrity
ALTER TABLE "likes" ADD CONSTRAINT "likes_target_check"
  CHECK (
    ("postId" IS NOT NULL AND "commentId" IS NULL) OR
    ("postId" IS NULL AND "commentId" IS NOT NULL)
  );

ALTER TABLE "follows" ADD CONSTRAINT "follows_no_self_follow"
  CHECK ("followerId" != "followingId");
```

---

## 🎉 You're Live!

Your app will be at: `https://darksphere-[random].vercel.app`

---

## 🧪 Test Your Deployed App

1. Sign up for a new account
2. Create a post
3. Like and comment
4. Test all features!

---

## 💡 Optional: Custom Domain

In Vercel:
1. Go to Settings → Domains
2. Add your domain (e.g., darksphere.com)
3. Update DNS records
4. Done! Free SSL included

---

## 🆘 Troubleshooting

**Build fails?**
- Check environment variables are set
- Verify DATABASE_URL is correct

**Can't connect to database?**
- Check Supabase project is active
- Verify DATABASE_URL format

**App loads but errors?**
- Check browser console
- Check Vercel deployment logs

---

## 📊 Your Stack

✅ Frontend: Next.js 14 (Vercel Serverless)  
✅ Database: Supabase PostgreSQL  
✅ Auth: JWT + HTTP-only cookies  
✅ Cost: $0/month (free tier)  

---

Ready to deploy? Just run:
```bash
git push origin main
```

Then go to vercel.com! 🚀
