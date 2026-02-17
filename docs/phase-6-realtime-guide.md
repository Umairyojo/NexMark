# Phase 6 Realtime Guide

## Required SQL

Run `supabase/sql/03_enable_realtime.sql` in Supabase SQL Editor.
Then run `supabase/sql/04_realtime_tuning.sql`.

## Why this is needed

Realtime listens to changes from publication `supabase_realtime`.
If `public.bookmarks` is not in that publication, tab-to-tab sync will not trigger.
`REPLICA IDENTITY FULL` improves delete/update payload consistency.

## Expected behavior

1. Open dashboard in two tabs with same user.
2. Add bookmark in tab A -> tab B updates instantly.
3. Delete bookmark in tab B -> tab A updates instantly.
