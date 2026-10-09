---
name: supabase-auth-local
description: >-
  Set up or fix EcoKubatana authentication with Supabase, profiles/roles, and
  local-mode fallback when keys are missing. Use for login/register, sessions,
  admin role gates, .env keys, or “works without Supabase” requests.
paths:
  - "src/contexts/AuthContext.jsx"
  - "src/lib/supabaseClient.js"
  - "src/components/Login.*"
  - ".env.example"
  - "START_HERE.md"
  - "LOCAL_MODE.md"
  - "ADD_KEYS.md"
---

# Supabase Auth + Local Mode

## Prompt patterns

- “Add auth / login / register / roles”
- “Invalid API key” / “add Supabase keys”
- “Let me test without Supabase” / local mode
- Admin portal access denied / role must be `admin`

## Architecture to follow

```
Login.jsx → AuthContext.jsx → supabaseClient.js → Supabase Auth + profiles
```

- Env vars **must** be `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- `isSupabaseConfigured` gates real vs local behavior
- Roles: `member` | `volunteer` | `admin` (lowercase `admin` for portal)
- Profile created via DB trigger (`database/13_fix_create_profile_for_new_user.sql` and related)

## How to execute

1. Confirm whether keys exist; if not, preserve/teach local mode (`LOCAL_MODE.md`) instead of hard-failing the whole app.
2. Edit auth only in `supabaseClient.js`, `AuthContext.jsx`, `Login.jsx`.
3. Protect routes/UI with `useAuth()` (`isAuthenticated`, `isAdmin`) — mirror existing Admin Portal gating in `App.jsx`.
4. Never put the service role key in the Vite app; anon key only on the client.
5. If registration fails, check profile trigger `search_path` / `public.` qualification (`ship-debug-fix`).
6. After `.env` changes: restart `npm run dev`.
7. Human handoff: point to `START_HERE.md` / `ADD_KEYS.md` or update via `docs-handoff`.

## Verify

- Register → profile row appears (Supabase mode)
- Refresh keeps session
- Admin role reaches `/admin`
- Local mode still usable without keys

## Done when

Auth path works for the requested mode; no service-role leakage; docs match reality.
