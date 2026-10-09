---
name: admin-ops-wire
description: >-
  Wire Admin Portal and operator workflows to real data: overview stats,
  incident verify/reject/resolve, alerts propose/publish/reject, help requests,
  notification bell. Use when prompts mention admin tabs, real stats, moderation
  actions, or replacing hardcoded admin numbers.
paths:
  - "src/components/AdminPortal.jsx"
  - "src/App.jsx"
  - "src/lib/api.js"
  - "supabase/functions/alerts/**/*"
  - "supabase/functions/incidents/**/*"
  - "database/05_alerts_schema.sql"
  - "database/06_alerts_status.sql"
  - "database/09_help_requests_schema.sql"
  - "database/12_notification_state.sql"
---

# Admin Ops Wiring

## Prompt patterns

- “Admin stats are fake / hardcoded”
- “Verify / reject incidents from admin”
- “Help requests tab / request help button”
- “Alerts workflow / publish / SMS”
- “Bell icon unread count”

## Product workflows already established

| Flow | Who | Behavior |
|------|-----|----------|
| Incidents verify/reject/resolve | admin | Via incidents API / fixed RPCs |
| Alerts | any user proposes; admin publishes/rejects | Area targeting; optional Twilio SMS/WhatsApp |
| Help requests | user submits; admin respond/resolve | Call-back link in admin |
| Notifications | per-user last-seen | Bell dropdown + unread count |
| Overview stats | admin | Members, volunteers, active incidents, pending reports, alerts sent |

## How to execute

1. Prefer extending `AdminPortal.jsx` tabs and `api.js` over new admin apps.
2. Gate with `isAdmin` from `AuthContext`; mirror existing Access Denied UX.
3. Load stats from real endpoints; never reintroduce hardcoded showcase numbers unless local-demo fallback is explicit.
4. Admin actions must call the same APIs the edge functions expose; handle `{ success, error }`.
5. For alerts dispatch secrets (Twilio), keep them on the edge function — document required secrets in handoff.
6. Keep member-facing entry points working (Request Help modal in `App.jsx`, Propose alert paths).

## Verify

- Admin overview numbers change with DB state
- Verify/Reject updates incident status
- Help request appears in admin tab
- Bell unread clears when opened (persists last seen)

## Done when

Requested admin workflow is live-data-backed and role-gated.
