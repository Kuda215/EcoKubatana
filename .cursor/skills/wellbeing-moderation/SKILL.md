---
name: wellbeing-moderation
description: >-
  Implement or extend anonymous wellbeing sharing and admin moderation (report,
  hide/unhide, unreport). Use for wellbeing community support features and
  safety moderation on shared experiences.
paths:
  - "src/components/Wellbeing.jsx"
  - "supabase/functions/wellbeing-shares/**/*"
  - "database/14_wellbeing_shares_schema.sql"
  - "src/lib/api.js"
  - "src/components/AdminPortal.jsx"
---

# Wellbeing Sharing + Moderation

## Prompt patterns

- “Anonymous wellbeing share”
- “Report inappropriate share”
- “Admin hide / unhide / review reported wellbeing”

## Product rules from prior delivery

- Users can share wellbeing experiences (treat as sensitive; prefer anonymity in UI copy)
- Users can report shares
- Admins can review reported content, unreport, hide, or unhide
- Keep supportive tone; this is not a public dunking feed

## How to execute

1. Follow existing `wellbeing-shares` edge function + SQL schema; extend rather than fork.
2. Member UI in `Wellbeing.jsx`; admin controls in `AdminPortal.jsx` (or dedicated admin section if already present).
3. Wire through `api.js` with auth headers.
4. Hidden content must not appear in the default member feed.
5. Pair with `sql-rls-schema` if policies missing; with `docs-handoff` if new SQL must be run.

## Verify

- Create share → appears for members
- Report → visible to admin queue
- Hide → removed from member feed; unhide restores
- `npm run build`

## Done when

Share + moderation loop works with RLS-safe API and clear admin affordances.
