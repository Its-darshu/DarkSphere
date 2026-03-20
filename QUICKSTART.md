# 🚀 JokeSphere - Quick Start Guide

Your joke-sharing platform is ready! Here's what was rebuilt:

## What You Got

✅ **Modern Next.js 14 App** - React frontend + API backend in one project
✅ **PostgreSQL Database** - Structured data with Prisma ORM
✅ **Daily Auto-Ranking** - Jokes reset and rank fresh each day
✅ **Vote System** - Upvote/downvote jokes to rate them
✅ **Beautiful UI** - Dark theme, responsive design, smooth animations
✅ **Zero Firestore** - No Firebase dependency

## 3 Ways to Get Started

### 🏃 Fastest: Use Vercel Postgres (Production-Ready)

```bash
# 1. Install
npm install

# 2. Push to GitHub (if not already)
git add .
git commit -m "Rebuild: JokeSphere with Next.js and PostgreSQL"
git push origin main

# 3. Go to https://vercel.com → Import repository
# 4. Follow VERCEL-POSTGRES-SETUP.md to add database
# 5. Deploy! ✨
```

**Done in 5 minutes** ⏱️

---

### 💻 Local First: PostgreSQL on Your Machine

For development:

```bash
# 1. Follow LOCAL-SETUP.md to install PostgreSQL
# 2. Create database: createdb jokesphere
# 3. Set up .env.local:
   DATABASE_URL="postgresql://postgres:password@localhost:5432/jokesphere"

# 4. Install and run:
npm install
npm run db:push
npm run dev

# 5. Open http://localhost:3000
```

---

### 🐳 Docker: Everything Containerized

```bash
# Create docker-compose.yml (see LOCAL-SETUP.md)
docker-compose up -d

# Then:
npm install
npm run db:push
npm run dev
```

---

## Project Structure

```
JokeSphere/
├── app/
│   ├── api/jokes/route.ts      ← GET/POST jokes
│   ├── api/votes/route.ts      ← Vote submission
│   ├── page.tsx                 ← Main feed
│   └── globals.css              ← Styling
├── components/
│   ├── JokeCard.tsx             ← Individual joke
│   └── PostJokeForm.tsx         ← Post form
├── prisma/
│   └── schema.prisma            ← Database design
├── .env.local                   ← Your secrets
├── README.md                    ← Full documentation
├── LOCAL-SETUP.md               ← Local dev guide
└── VERCEL-POSTGRES-SETUP.md     ← Production guide
```

---

## Features Included

| Feature | Status |
|---------|--------|
| Post jokes | ✅ |
| Vote system (upvote/downvote) | ✅ |
| Daily rankings (auto-reset) | ✅ |
| Browse past days | ✅ |
| Author names (optional) | ✅ |
| Responsive design | ✅ |
| Dark theme | ✅ |
| Share jokes | ✅ |

---

## Database Schema

```
Users
├── id, name, email, timestamps

Jokes
├── id, content, authorId
├── createdAt (for daily grouping)
└── votes → Vote[]

Votes (One per user per joke per day)
├── jokeId, userId, value (1 or -1)
├── voteDate (YYYY-MM-DD for daily reset)
└── timestamps
```

**Why this design?**
- Votes tracked by date → automatic daily reset
- No manual cleanup needed
- Preserves history for analytics
- Simple, reliable ranking

---

## How Ranking Works

1. **User votes on a joke** → stored with today's date
2. **Feed loads** → jokes sorted by today's vote count
3. **Midnight UTC** → new day means new vote tracking
4. **Yesterday's jokes** → still viewable via date picker (with old votes)
5. **Votes are re-voteable** → users can change their vote each day

---

## Next Steps

### Immediate (Choose One)
- [ ] **Deploy to Vercel** → See VERCEL-POSTGRES-SETUP.md
- [ ] **Run Locally** → See LOCAL-SETUP.md
- [ ] **Use Docker** → See LOCAL-SETUP.md (Docker section)

### After Deployment
- [ ] Test posting a joke
- [ ] Test upvoting/downvoting
- [ ] Navigate between days
- [ ] Share link with friends
- [ ] Customize styling (see README.md)

### Future Enhancements
- Add comments on jokes
- User authentication
- Joke categories/tags
- Leaderboard for best authors
- Search functionality
- Share to social media

---

## Common Commands

```bash
# Development
npm run dev                  # Start dev server
npx prisma studio          # View/edit database

# Database
npm run db:push             # Sync schema with database
npx prisma migrate reset    # ⚠️ Reset all data

# Building
npm run build               # Production build
npm start                   # Run production build

# Deployment
git push origin main        # Trigger Vercel auto-deploy
```

---

## Troubleshooting Quick Links

- **Can't connect to database?** → Check DATABASE_URL in .env.local
- **Database tables not created?** → Run `npm run db:push`
- **Hot reload not working?** → Clear `.next` folder, restart dev server
- **Can't post jokes?** → Check browser console for errors
- **Vercel deployment failing?** → Make sure DATABASE_URL is set in Vercel dashboard

---

## Files You Might Want to Customize

```
app/globals.css             ← Change colors, fonts
tailwind.config.js          ← Theme customization
components/JokeCard.tsx     ← Joke card appearance
app/page.tsx                ← Feed layout
prisma/schema.prisma        ← Add new database fields
```

---

## Questions?

- **Next.js Issues** → nextjs.org/docs
- **Database Help** → prisma.io/docs
- **Vercel Deployment** → vercel.com/docs
- **Need SQL Help** → postgresql.org/docs

---

## What's Different From Old Version?

**Old** → Separate backend (Express) + frontend (React) + Firebase

**New** → Single Next.js 14 app + PostgreSQL (much simpler!) ✨

Benefits:
- 1 codebase instead of 3
- No Firebase authentication overhead
- Easier deployment to Vercel
- Better performance
- Easier to customize

---

## Ready? 🎯

Pick one:

1. **Quick & Easy**: Go to VERCEL-POSTGRES-SETUP.md
2. **Local Testing**: Go to LOCAL-SETUP.md
3. **Want to read more?**: Check README.md

Good luck! 🚀

Questions? Check the setup guides or the README!
