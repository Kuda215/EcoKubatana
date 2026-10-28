---
name: docs-handoff
description: >-
  Write short, actionable setup/handoff docs in the EcoKubatana style
  (START_HERE, checklists, ordered SQL steps, delivered-files summaries). Use
  when the human must run Supabase SQL, add keys, deploy edge functions, or when
  the prompt asks for setup guides after a feature lands.
paths:
  - "*.md"
  - "database/**/*.sql"
---

# Docs Handoff

## Prompt patterns

- “Write a setup guide / checklist”
- “What do I run in Supabase?”
- After shipping schema or edge functions that need human steps

## Doc style observed in this repo

- Lead with the blocker (“Invalid API key?”) and the fastest fix
- Numbered steps with exact file paths to copy-paste
- PowerShell and bash both appear historically — prefer OS-agnostic npm commands; include shell-specific only when necessary
- Separate **Quick** vs **Detailed** when both exist
- End with “success looks like” observable checks
- Keep emoji section headers consistent with existing guides if editing them; don’t invent a new doc brand

## How to execute

1. Prefer updating an existing guide (`START_HERE.md`, `CHECKLIST.md`, `DATABASE_SETUP.md`, `DELIVERED_FILES.md`) over adding near-duplicates.
2. If a new doc is required, link it from `START_HERE.md`.
3. Include: prerequisites, exact file order, deploy commands, verify steps, common failures.
4. Never put real secrets in markdown; reference `.env.example` keys only.
5. Mirror `lean-coder` brevity — checklists over essays.

## Verify

- Every referenced path exists in the repo
- SQL order matches `database/` prefixes
- Commands match `package.json` scripts

## Done when

A teammate can complete setup without reading the PR diff.
