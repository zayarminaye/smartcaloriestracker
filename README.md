# Myanmar Smart Calorie Tracker

AI-powered calorie tracking app for Myanmar food with Gemini AI integration.

## Features

- 🎯 **Smart Input**: Type dish name in Myanmar → AI extracts ingredients
- 🧠 **Gemini AI**: Superior Burmese language understanding
- 📊 **180+ Foods**: Comprehensive Myanmar food database
- 🎨 **Beautiful UI**: Mobile-first, responsive design
- ⚡ **One-Click Templates**: Popular dishes (Mohinga, Chicken Curry, etc.)
- 📱 **PWA Ready**: Install as mobile app

## Tech Stack

- Next.js 15 + React + TypeScript
- Supabase (PostgreSQL)
- Google Gemini AI
- TailwindCSS
- Vercel

## Quick Deploy

### 1. Setup Supabase

```bash
# 1. Create project at supabase.com
# 2. Run migration: Copy supabase/migrations/20250115000001_init_schema.sql to SQL Editor
# 3. Get API keys from Settings → API
```

### 2. Setup Gemini AI

```bash
# Get API key from ai.google.dev
```

### 3. Deploy to Vercel

```bash
# 1. Import repo at vercel.com
# 2. Add environment variables:
#    - NEXT_PUBLIC_SUPABASE_URL
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY
#    - SUPABASE_SERVICE_ROLE_KEY
#    - GEMINI_API_KEY
# 3. Click Deploy
```

### 4. Seed Database

```bash
npm install
npm run db:seed
```

## Local Development

```bash
# 1. Clone repo
git clone <repo-url>
cd smartcaloriestracker

# 2. Install dependencies
npm install

# 3. Create .env.local with your keys
cp .env.example .env.local

# 4. Run dev server
npm run dev
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

## Key Innovations

1. **Minimal Input**: Users type "ကြက်သား နဲ့ အာလူး ဟင်း" → AI does the rest
2. **Three-Tier System**: Database Match → AI Estimate → User Contribution
3. **Myanmar-First**: Optimized for Burmese text, fonts, and cultural context
4. **Scalable Database**: 12 tables, RLS security, triggers, indexes

## Database Schema

- `ingredients` - 180+ Myanmar foods
- `cooking_methods` - Calorie multipliers
- `dish_templates` - One-click meal logging
- `meals` & `meal_items` - User tracking
- `daily_summaries` - Analytics
- `users` - Profiles & gamification

## Roadmap

- [x] MVP with basic tracking
- [x] Gemini AI integration
- [x] Smart dish input
- [ ] Photo recognition
- [ ] Voice input
- [ ] Barcode scanner
- [ ] React Native mobile app

## License

MIT

---

Built with ❤️ for Myanmar 🇲🇲
