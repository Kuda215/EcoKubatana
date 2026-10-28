---
name: i18n-southern-africa
description: >-
  Extend EcoKubatana multi-language support (English, Shona, Ndebele) for UI
  chrome and/or stored-content translation. Use when prompts mention language
  switch, Shona, Ndebele, i18n, Settings language dropdown, or translating FAQs
  and other DB content.
paths:
  - "src/i18n/**/*"
  - "src/components/Settings.jsx"
  - "src/components/Sidebar.jsx"
  - "src/App.jsx"
  - "database/15_translations.sql"
  - "supabase/functions/translate/**/*"
---

# i18n (EN / SN / ND)

## Prompt patterns

- “Add Shona / Ndebele / language support”
- “Settings language dropdown doesn’t work”
- “Translate sidebar / page titles / FAQs”

## Architecture

1. **UI chrome:** `react-i18next` via `src/i18n/index.js` + `locales/{en,sn,nd}.json`
2. **Persistence:** `localStorage` key `ecokubatana_language`
3. **Supported now:** `en`, `sn`, `nd` — other Settings codes fall back to English until locale files exist
4. **Stored content:** `translations` table + `translate` edge function (OpenAI), cache so the same row/language is not translated twice

## How to execute

1. Add keys to **all three** locale files together; keep key paths consistent (`pageTitles.*`, nav labels, buttons).
2. Wire components with `useTranslation()` / `t('...')` — mirror Sidebar and App title mapping.
3. Settings dropdown must call `i18n.changeLanguage` and write `ecokubatana_language`.
4. For DB content: prove one slice end-to-end (FAQs already did) before rolling to incidents/alerts/community.
5. Loading/failure → show English source text; never blank the UI.
6. Do not invent full translations for every page unless requested — state remaining unwired pages.

## Verify

- Switch language in Settings → Sidebar + titles update and survive refresh
- FAQ (or target content) returns cached translation on second load
- `npm run build`

## Done when

Requested surface is bilingual/trilingual; fallback behavior is safe; scope note lists unwired pages.
