# Local Development Setup

Quick guide to run JokeSphere locally.

## Prerequisites

- **Node.js** 18+ ([download here](https://nodejs.org))
- **PostgreSQL** 12+ ([download here](https://www.postgresql.org/download/) or use Docker)

## Option 1: Local PostgreSQL

### 1. Install PostgreSQL
- **macOS**: `brew install postgresql`
- **Windows**: Download installer from postgresql.org
- **Linux**: `sudo apt-get install postgresql`

### 2. Start PostgreSQL
```bash
# macOS/Linux
brew services start postgresql

# Windows: PostgreSQL runs as a service by default

# Or start with Docker:
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:16
```

### 3. Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Inside psql:
CREATE DATABASE jokesphere;
\q
```

### 4. Update .env.local
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/jokesphere"
NODE_ENV="development"
```

## Option 2: Docker

Quick start with Docker Compose:

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: jokesphere
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Then run:
```bash
docker-compose up -d
```

Update `.env.local`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/jokesphere"
```

## Setup JokeSphere

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database
```bash
npm run db:push
```

This creates all tables and relationships.

### 3. Start Development Server
```bash
npm run dev
```

Open http://localhost:3000

## Manage Database

### View Database
```bash
npx prisma studio
```

Opens http://localhost:5555 with interactive database editor.

### Reset Database (⚠️ Deletes all data)
```bash
npx prisma migrate reset
```

### Check Database
```bash
psql -U postgres -d jokesphere

# List tables:
\dt

# View jokes:
SELECT id, content, "createdAt" FROM jokes LIMIT 5;

# Exit:
\q
```

## Troubleshooting

### Connection Refused
- Make sure PostgreSQL is running: `pg_isready`
- Check DATABASE_URL is correct
- Try: `psql -U postgres` to verify connection

### Prisma Migration Failed
```bash
# View the error:
npm run db:push -- --skip-generate

# Or reset:
npx prisma migrate reset
```

### Port 5432 Already in Use
```bash
# Unix/Linux/macOS:
lsof -ti:5432 | xargs kill -9

# Windows (PowerShell):
Get-NetTCPConnection -LocalPort 5432 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }

# Windows (Command Prompt):
netstat -ano | findstr :5432
# Note the PID from output, then:
taskkill /PID <PID> /F

# Or use different port in DATABASE_URL
```

## Development Tips

- **Hot reload**: Changes to files auto-reload at localhost:3000
- **API testing**: Use curl, Postman, or your browser
- **Database errors**: Check browser console AND terminal

## Next Steps

1. Post a joke at http://localhost:3000
2. Vote on jokes
3. Browse previous days
4. Check data in Prisma Studio
5. Customize styling and features

## Ready to Deploy?

When ready, see `VERCEL-POSTGRES-SETUP.md` for production deployment.
