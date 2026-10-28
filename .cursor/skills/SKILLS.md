# EcoKubatana Agent Skills Catalog

Skills distilled from the prompt patterns and delivery chats used to build this repo.
Any agent (or a single agent) should load **ecokubatana-router** first, then the matching skill(s).

## How agents execute code in this repo

| Step | Command / action |
|------|------------------|
| Install | `npm install` |
| Dev server | `npm run dev` (Vite, usually `:5173`) |
| Lint | `npm run lint` (oxlint) |
| Build | `npm run build` |
| Preview | `npm run preview` |
| Env | Copy `.env.example` → `.env` with `VITE_SUPABASE_*` |
| SQL | Paste numbered files from `database/` into Supabase SQL Editor in order |
| Edge functions | Deploy from `supabase/functions/<name>/` via Dashboard or `supabase functions deploy <name>` |
| Local fallback | App runs in local/admin mode when Supabase keys are missing (`LOCAL_MODE.md`) |
| SPA deploy | Keep `vercel.json` rewrite so React Router owns all paths |

**Stack:** React 19 + Vite 8 + React Router 7 + pure CSS variables + Supabase (Auth, Postgres RLS, Storage, Edge Functions/Deno) + OpenAI + optional Twilio + i18next (en/sn/nd).

**Delivery habit from chats:** ship one vertical slice end-to-end, leave an explicit “prototype-scope / not rolled out” note, and hand the human a short checklist doc when setup steps are required.

## Skill map (prompt signal → skill)

| When the user prompt sounds like… | Load |
|-----------------------------------|------|
| Long/vague coding ask; “just do X”; “don’t wander”; plan/PRD distill | `lean-coder` |
| Redesign UI, design system, animations, climate look, CSS polish | `ui-climate-design` |
| Auth, login/register, roles, `.env` keys, local mode | `supabase-auth-local` |
| Schema, RLS, recursion, triggers, seed SQL | `sql-rls-schema` |
| Edge function, API wrapper, wire hardcoded UI to live data | `edge-api-slice` |
| AI chat, voice report, Whisper/TTS, photo assessment, translate cache | `ai-climate-features` |
| Language switch, Shona/Ndebele, i18n, FAQ translation | `i18n-southern-africa` |
| Admin portal, verify/reject, help requests, alerts workflow, real stats | `admin-ops-wire` |
| Infinite recursion, registration broken, Vercel 404, auth.uid null | `ship-debug-fix` |
| Build from `prompt/` mockups / screen PDF | `feature-from-mockup` |
| Wellbeing share, anonymous posts, report/hide moderation | `wellbeing-moderation` |
| Write START_HERE / checklist / setup handoff docs | `docs-handoff` |
| Unclear which of the above | `ecokubatana-router` |

## Multi-agent vs one agent

- **One agent:** start with `ecokubatana-router` + `lean-coder`, then chain 1–2 domain skills.
- **Multiple agents:** assign one domain skill per agent; keep `lean-coder` shared; only one agent owns SQL/RLS and one owns edge-function deploy surface to avoid collisions.

## Source prompts / chat themes (repo evidence)

1. Climate UI redesign + design system docs  
2. Supabase auth setup with local-mode fallback and key guides  
3. Incidents + community SQL, RLS, edge CRUD, `src/lib/api.js`  
4. Hardcoded Admin/Knowledge/Alerts → real DB + workflows  
5. OpenAI assistant, voice-first report, vision incident analysis  
6. EN/SN/ND UI chrome + cached content translation  
7. Wellbeing anonymous sharing + admin moderation  
8. Production fixes (RLS recursion, profile trigger `search_path`, Vercel SPA rewrite)  
9. Mockup-driven screen work from `prompt/EcoKubatana-Screen-Mockups*.pdf`
