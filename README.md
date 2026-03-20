# JokeSphere 😂

A modern joke-sharing platform with daily rankings, built with Next.js 14 and PostgreSQL.

## Features

- ✨ **Share Jokes** - Post your funniest jokes with optional author names
- 👍 **Vote System** - Upvote/downvote jokes to help the best ones rise to the top
- 📅 **Daily Rankings** - Fresh leaderboard every day (jokes reset daily)
- 📱 **Responsive Design** - Works great on desktop, tablet, and mobile
- 🚀 **Simple & Fast** - Built with Next.js for optimal performance

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database (local or cloud)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Database

Create a `.env.local` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/jokesphere"
```

For **Vercel Postgres** (recommended for production):
1. Go to https://vercel.com/storage/postgres
2. Create a database and copy the connection string
3. Paste it in `.env.local` as `DATABASE_URL`

### 3. Initialize Database

```bash
npm run db:push
```

This command will:
- Create all necessary tables
- Set up relationships and indexes

### 4. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── jokes/route.ts      # GET/POST jokes
│   │   └── votes/route.ts       # POST votes
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── components/
│   ├── JokeCard.tsx             # A single joke card
│   └── PostJokeForm.tsx         # Form to post jokes
├── prisma/
│   └── schema.prisma            # Database schema
├── .env.example                 # Environment template
├── next.config.js               # Next.js config
├── tailwind.config.js           # Tailwind config
└── package.json
```

## How It Works

### Daily Rankings

- Each day starts fresh with a new ranking
- Jokes are sorted by vote count (upvotes - downvotes)
- Newest jokes within the same score appear first
- Vote data is tracked by date to enable daily reset

### Database Schema

- **Users**: Stores author information (optional)
- **Jokes**: Contains joke content, author, and timestamps
- **Votes**: Tracks upvotes/downvotes per joke per day

## API Endpoints

### Get Jokes
```bash
GET /api/jokes?date=2024-03-21
```

Returns all jokes for a specific date, sorted by popularity.

### Post Joke
```bash
POST /api/jokes
Content-Type: application/json

{
  "content": "Why did the joke go to school?",
  "authorName": "John"
}
```

### Vote on Joke
```bash
POST /api/votes
Content-Type: application/json

{
  "jokeId": "xyz123",
  "value": 1  // 1 for upvote, -1 for downvote
}
```

## Deployment on Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initialize JokeSphere"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Add `DATABASE_URL` environment variable

3. **Deploy**
   - Vercel will automatically detect Next.js
   - Click Deploy

## Customization

### Styling
- Edit `app/globals.css` for global styles
- Modify `tailwind.config.js` for theme colors
- Update components for custom designs

### Database
- Edit `prisma/schema.prisma` to add fields
- Run `npm run db:push` to sync changes

### Features
- Add comments to jokes
- Implement user authentication
- Add joke categories/tags
- Create user profiles

## Troubleshooting

### Database Connection Failed
- Check `DATABASE_URL` in `.env.local`
- Ensure PostgreSQL is running
- Verify network access (for cloud databases)

### Prisma Issues
```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### Development Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Performance Tips

- Votes are cached by date for quick retrieval
- Database queries include proper indexes
- Tailwind CSS is optimized for production
- Images are automatically optimized by Next.js

## Keep in Mind

- Votes are tracked by IP/browser (via user-agent)
- Daily jokes are automatically separated by date
- Old votes are preserved for analytics
- The platform is designed for casual use

## License

MIT

## Support

Created to share laughs with friends! 😄

Made with ❤️ for the joke-loving community.
