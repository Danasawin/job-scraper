# Tech Jobs Aggregator

Automated job aggregator for Developer, Data Engineer, DevOps, DevSecOps, and Cloud Engineer positions.

## Features

- **Multi-Agent Scraping**: Separate agents for LinkedIn, JobDB, and JobThai
- **Daily Auto-Updates**: Vercel Cron job runs daily at 6 AM UTC
- **Level Filtering**: Entry, Junior, and Mid-level positions only
- **Search & Filter**: Find jobs by keyword, level, or source
- **Real-time Stats**: Live dashboard showing job counts and updates

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase PostgreSQL (Free Tier)
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Hosting**: Vercel (Free Tier)

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd job-aggregator
npm install
```

### 2. Database Setup (Supabase)

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Get your database connection string from Settings > Database
3. Copy `.env.example` to `.env.local` and fill in:
   - `DATABASE_URL` - Connection pooler URL
   - `DIRECT_URL` - Direct connection URL
   - `CRON_SECRET` - Random secret for cron job auth

### 3. Initialize Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000`

## Deployment

### Vercel Setup

1. Push code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables in Project Settings
4. Deploy!

The cron job is automatically configured via `vercel.json`.

### Manual Scrape Trigger

```bash
# Trigger full scrape
curl -X POST https://your-app.vercel.app/api/scrape \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Multi-Agent Architecture

```
src/agents/
├── base-scraper.ts      # Abstract base class
├── linkedin-scraper.ts  # LinkedIn agent
├── jobdb-scraper.ts     # JobDB agent
├── jobthai-scraper.ts   # JobThai agent
└── orchestrator.ts      # Coordinates all agents
```

Each agent:
- Extends `BaseScraper`
- Implements `scrape()` method
- Filters for target keywords
- Detects job level automatically
- Respects rate limits

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/jobs` | GET | List jobs with filters |
| `/api/jobs/[id]` | GET | Get single job |
| `/api/stats` | GET | Dashboard statistics |
| `/api/cron/scrape` | GET | Daily cron endpoint |
| `/api/scrape` | POST | Manual trigger |

## Environment Variables

```env
# Required
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
CRON_SECRET="random-secret-string"

# Optional (for better LinkedIn access)
LINKEDIN_EMAIL=""
LINKEDIN_PASSWORD=""
```

## Troubleshooting

### Scraping Issues
- Job sites may block scraping - this is normal
- The app gracefully handles failures
- Check `/api/stats` for scrape logs

### Database Connection
- Ensure IP is allowed in Supabase settings
- Use connection pooler for serverless

## License

MIT
