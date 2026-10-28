---
name: ecokubatana-router
description: >-
  Route EcoKubatana work to the right project skill(s). Use at the start of any
  task in this repo, when the prompt is multi-part, or when it is unclear which
  domain skill applies. Also use when coordinating multiple agents.
---

# EcoKubatana Router

You are the dispatcher for EcoKubatana agent skills. Do not implement until you have named the skill(s) you will follow.

## 1. Distill (always)

Apply `lean-coder` Phase 1 mentally. Produce a one-line GOAL and list which domain skills apply.

## 2. Pick skills

Read `.cursor/skills/SKILLS.md`. Choose:

- Exactly one **primary** domain skill
- Zero or more **support** skills (usually `docs-handoff` or `ship-debug-fix`)

If the prompt spans unrelated surfaces (e.g. UI polish + RLS fix), split into ordered mini-goals and run them sequentially (or assign to separate agents).

## 3. Execution contract for this repo

Before coding, confirm the path:

1. Search existing patterns in `src/components/`, `src/lib/api.js`, `supabase/functions/`, `database/`.
2. Prefer extending an existing edge function + API object over inventing a parallel client.
3. Prefer numbered SQL files under `database/` over ad-hoc undocumented migrations.
4. Match CSS variables from `src/index.css` / `DESIGN_SYSTEM.md` — do not introduce a new palette.
5. Verify with the narrowest command: `npm run lint`, `npm run build`, or a targeted manual path via `npm run dev`.
6. If the human must run SQL or set secrets, add or update a short handoff section using `docs-handoff`.

## 4. Multi-agent split (when requested)

| Agent | Owns | Do not touch |
|-------|------|--------------|
| UI | `src/components/*`, CSS, `index.html` | SQL, edge secrets |
| Data | `database/*.sql` | React styling |
| API | `supabase/functions/*`, `src/lib/api.js` | Unrelated pages |
| AI | `ai-assistant`, `incident-analysis`, `translate`, VoiceReport | Unrelated admin tabs |
| i18n | `src/i18n/*`, Settings language wiring | Backend schema unless translations table |
| Fix | `ship-debug-fix` only | Features |

Each agent must state GOAL + files + acceptance before editing.

## 5. Output before first edit

```
GOAL: ...
PRIMARY SKILL: ...
SUPPORT: ...
CONTEXT FILES: ...
PLAN: 1-5 bullets
```

Then execute under those skills. Do not load every skill at once.
