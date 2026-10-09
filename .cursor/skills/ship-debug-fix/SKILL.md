---
name: ship-debug-fix
description: >-
  Diagnose and fix EcoKubatana production/setup failures seen in past chats:
  profiles RLS infinite recursion, registration trigger search_path bugs,
  admin RPC auth.uid() null under service role, Vercel SPA 404s on refresh.
  Use when something that used to work is broken or deploy/routing fails.
---

# Ship / Debug / Fix

## Prompt patterns

- Error JSON with `42P17` / “infinite recursion detected in policy”
- “Registration fails” / new users have no profile
- “Verify button does nothing” / admin RPC fails for everyone
- “404 on refresh” / direct link to `/alerts` on Vercel
- “Invalid API key” (also involve `supabase-auth-local`)

## Known failure → fix map (from this repo’s history)

| Symptom | Likely cause | Fix locus |
|---------|--------------|-----------|
| RLS infinite recursion on `profiles` | Self-referencing policy | `database/00_fix_profiles_recursion.sql`, `is_admin()` |
| Signup broken | Trigger function unqualified `profiles` / missing `search_path` | `database/13_fix_create_profile_for_new_user.sql` |
| verify/reject/resolve always fail | RPC checks `auth.uid()` while edge uses service role (uid null) | `database/11_incidents_verify_fix.sql` + edge auth that passes user id/role |
| Vercel 404 on client routes | No SPA rewrite | `vercel.json` rewrite to `index.html`; use `navigate()` not `window.location.href` for in-app links |
| Env not loading | Missing `VITE_` prefix or no restart | `.env` + restart Vite |

## How to execute

1. Reproduce from the actual error message/logs — quote it in the plan.
2. Search repo docs (`FIX_RECURSION_GUIDE.md`, `QUICK_FIX*.md`) and SQL for an existing fix before inventing a new one.
3. Prefer the smallest SQL/policy patch; drop duplicate policies rather than stacking more.
4. After SQL fixes, tell the human the exact file order to re-run.
5. For frontend routing: keep React Router as source of truth; preserve `vercel.json`.
6. Do not expand into features while fixing — list “Noticed, not changed.”

## Verify

- Exact failing action succeeds once
- Adjacent auth/admin paths still work
- `npm run build` if frontend touched

## Done when

Root cause named, fix applied or exact SQL handoff given, and verification path stated.
