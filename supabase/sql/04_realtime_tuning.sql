-- Smart Bookmark App
-- Phase 6 reliability tuning:
-- Include full old row for UPDATE/DELETE realtime payloads.

alter table public.bookmarks replica identity full;
