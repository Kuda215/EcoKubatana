---
name: sql-rls-schema
description: >-
  Author or fix Postgres schemas, RLS policies, triggers, RPCs, and seed data
  for EcoKubatana on Supabase. Use for new tables, infinite recursion in
  policies, seed scripts, or numbered database/*.sql migrations.
paths:
  - "database/**/*.sql"
  - "DATABASE_SETUP.md"
  - "FIX_RECURSION_GUIDE.md"
  - "QUICK_FIX_RECURSION.md"
---

# SQL + RLS Schema

## Prompt patterns

- “Create table / schema / seed data”
- “infinite recursion detected in policy for relation profiles”
- “RLS / admin policy / trigger on signup”
- Numbered migration-style SQL delivery

## Conventions in this repo

1. Put scripts in `database/` with numeric prefixes; document run order.
2. Known order pattern: `00_fix_*` first, then feature schemas, seeds, verify (`99_verify_setup.sql`).
3. Prefer `is_admin()` SECURITY DEFINER helper over self-referencing `profiles` policies (recursion trap).
4. Qualify tables with `public.` and set `search_path` on functions that run as triggers.
5. Edge functions often use the **service role** — RPCs must not assume `auth.uid()` is set inside service-role calls (see `11_incidents_verify_fix.sql` lesson).
6. Always enable RLS; write explicit policies for select/insert/update/delete by role.

## How to execute

1. Search existing tables/policies in `database/` before creating duplicates.
2. If fixing recursion: start from `00_fix_profiles_recursion.sql` patterns; drop conflicting policies first.
3. Pair schema + seed when the UI needs demo data.
4. Update or add a short run-order note in `FIX_RECURSION_GUIDE.md` / `DATABASE_SETUP.md` when order matters.
5. Do not invent ORM layers; this project is raw SQL + edge functions.

## Verify

- SQL runs clean in Supabase SQL Editor (or note exact error)
- `99_verify_setup.sql` still meaningful, or extend it
- React/API callers still match column names

## Done when

Schema change is ordered, RLS-safe, and documented for paste-run setup.
