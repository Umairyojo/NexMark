# Nexmark (Smart Bookmark App)

Nexmark is a NEXT-Generation bookmark manager built with Next.js App Router and Supabase.
It uses Google OAuth only to Sigin, stores private bookmarks per user, and syncs changes in real time across multiple tabs.

## Project Overview

This app fulfills the concerns:

- secure authentication (Google OAuth)
- database-level privacy (RLS)
- real-time changes over multiple tabs
- private to each user and secured
- UI/UX Friendly

## Core Features

- Google OAuth login with Supabase Auth
- Private bookmarks (user A cannot access user B data as mentioned)
- Add bookmark (`title + url`)
- Delete bookmark
- Real-time bookmark list sync between tabs
- Real-time bookmark count added
- Responsive UI with global brand and logo with simple visual theme

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 
- Supabase
- Vercel (deployment)

## Architecture

High-level flow:

1. User signs in with Google through Supabase OAuth.
2. Session is managed via middleware and Supabase SSR helpers.
3. Dashboard reads and mutates `public.bookmarks`.
4. RLS policies enforce row ownership (`auth.uid() = user_id`).
5. Realtime subscriptions + BroadcastChannel keep UI synced across tabs.

Security layers:

- App route protection (`/dashboard`)
- Database protection (RLS policies)
- User-scoped queries (`user_id`)

## Key Project Structure

```txt
src/
  app/
    auth/
      actions.ts
      callback/route.ts
      error/page.tsx
    dashboard/page.tsx
    globals.css
    layout.tsx
    page.tsx
  components/
    global-logo.tsx
    liquid-background.tsx
    stat-card.tsx
  features/
    bookmarks/components/
      bookmarks-live-list.tsx
      live-bookmark-count.tsx
  lib/
    supabase/
      client.ts
      config.ts
      middleware.ts
      server.ts
  types/
    database.ts

supabase/sql/
  01_bookmarks_schema.sql
  02_bookmarks_rls.sql
  03_enable_realtime.sql
  04_realtime_tuning.sql
```

## Local Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Create environment file

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3) Run SQL in Supabase (in this order)

Open Supabase SQL Editor and run:

1. `supabase/sql/01_bookmarks_schema.sql`
2. `supabase/sql/02_bookmarks_rls.sql`
3. `supabase/sql/03_enable_realtime.sql`
4. `supabase/sql/04_realtime_tuning.sql`

### 4) Configure Google OAuth

In Supabase:

- enable Google provider in Auth settings
- set local Site URL: `http://localhost:3000`

In Google Cloud:

- create OAuth web credentials
- add Supabase callback URL:
  `https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`

### 5) Start app

```bash
npm run dev
```

Open: `http://localhost:3000`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Problems Faced and Solutions

### 1) Vercel build TypeScript failures in Supabase queries

Problem:

- local dev worked, but `next build` failed in strict typing around query/filter chains.

Fix:

- simplified query patterns (`filter(...)`)
- removed fragile select-string parsing in critical places
- added safe runtime-focused typing where needed
- hardened env typing in `src/lib/supabase/config.ts`

### 2) Cookie mutation runtime error on server-rendered pages

Problem:

- Next.js error: cookies can only be modified in Server Actions/Route Handlers.

Fix:

- wrapped cookie writes in `src/lib/supabase/server.ts` with safe try/catch
- kept refresh writes handled in middleware

### 3) Realtime delay/inconsistency across tabs

Problem:

- list updates could lag, especially on delete events.

Fix:

- enabled realtime publication (`03_enable_realtime.sql`)
- set replica identity full (`04_realtime_tuning.sql`)

### 4) Minor Fixable changes during UI Improvements

Problem:

- low contrast made fields look borderless.

Fix:

- improved shared `.field` styles with stronger border, hover, and focus states.

## Notes

---

Built as a real deployment-focused learning project with production-style constraints.
