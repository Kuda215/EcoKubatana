---
name: edge-api-slice
description: >-
  Build or extend a vertical slice: Supabase Edge Function (Deno) + src/lib/api.js
  wrapper + React component wiring from hardcoded UI to live data. Use when adding
  CRUD endpoints, replacing mock data, or connecting a page to the backend.
paths:
  - "supabase/functions/**/*"
  - "src/lib/api.js"
  - "src/components/**/*.jsx"
---

# Edge API Vertical Slice

## Prompt patterns

- “Wire X to the database / API”
- “Replace hardcoded list with real data”
- “Add endpoint for … / edge function”
- Incidents, community, alerts, FAQs, videos, help requests style features

## Canonical architecture

```
React component → src/lib/api.js → Edge Function (Deno) → Postgres (service role + auth check)
```

Existing functions: `incidents`, `community`, `alerts`, `ai-assistant`, `incident-analysis`, `translate`, `wellbeing-shares`.

## How to execute

1. Find a similar function under `supabase/functions/` and copy its CORS, auth, and `{ success, data/error }` response shape.
2. Auth pattern: read `Authorization` Bearer → `supabase.auth.getUser(token)` → load `profiles.role` when needed.
3. Add client methods on the matching object in `src/lib/api.js` (or a new export group) using `getAuthHeaders()` and `EDGE_FUNCTION_URL`.
4. Wire the component with `useEffect` load + action handlers; keep optimistic UI only where already patterned (e.g. likes).
5. Prefer extending an existing function’s path router over many tiny functions unless the domain is clearly separate.
6. Schema first if columns missing → hand off to `sql-rls-schema`.
7. Deploy note for human: Dashboard paste or `supabase functions deploy <name>`.

## Execution checks while coding

- CORS preflight `OPTIONS` handled
- No service role in the browser
- Errors return JSON the UI already understands (`success: false`)
- Filters/query params match what the component passes

## Verify

- `npm run build`
- Manual: list/create/update path for the feature
- Confirm function name matches URL path used in `api.js`

## Done when

One slice works end-to-end (UI → API → DB). State explicitly what is not rolled out yet.
