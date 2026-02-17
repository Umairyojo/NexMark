# Database Schema (Phase 2)

## Core idea

Supabase already has a built-in users table: `auth.users`.
We do not create our own users table.

Our app data will live in `public.bookmarks`, and each bookmark belongs to exactly one auth user.

## Relationship

- One `auth.users` row -> many `public.bookmarks` rows
- `public.bookmarks.user_id` references `auth.users.id`

## Planned bookmarks columns

- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to `auth.users.id`)
- `title` (TEXT, required)
- `url` (TEXT, required)
- `created_at` (TIMESTAMPTZ, default now in UTC)

## Why this structure

- Keeps data ownership explicit (`user_id`)
- Works naturally with Row Level Security policies later
- Supports fast per-user queries with an index on `user_id`
