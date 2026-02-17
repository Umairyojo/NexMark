-- Smart Bookmark App
-- Phase 2 schema draft
-- We will execute this in Phase 4 before adding RLS policies.

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  url text not null check (url ~ '^https?://'),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists bookmarks_user_id_created_at_idx
  on public.bookmarks (user_id, created_at desc);
