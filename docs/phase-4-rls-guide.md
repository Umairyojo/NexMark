# Phase 4 RLS Guide

## SQL execution order

Run these files in Supabase SQL Editor:

1. `supabase/sql/01_bookmarks_schema.sql`
2. `supabase/sql/02_bookmarks_rls.sql`

## Expected security behavior

- Authenticated user can read only rows where `user_id = auth.uid()`
- Authenticated user can insert only rows where `user_id = auth.uid()`
- Authenticated user can delete only rows where `user_id = auth.uid()`
- Anonymous users cannot access bookmarks rows

## Why this is critical

The frontend can be bypassed. RLS enforces privacy at the database layer itself, so User A cannot read or delete User B data even if someone calls the API directly.
