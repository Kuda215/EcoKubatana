---
name: feature-from-mockup
description: >-
  Implement EcoKubatana screens from design mockups in prompt/ (PDF screen
  pack). Use when the user references mockups, screen designs, or asks to match
  the EcoKubatana-Screen-Mockups PDF.
paths:
  - "prompt/**/*"
  - "src/components/**/*"
  - "src/**/*.css"
---

# Feature From Mockup

## Prompt patterns

- “Build this screen from the mockup”
- “Match the PDF / prompt designs”
- References to `prompt/EcoKubatana-Screen-Mockups*.pdf`

## How to execute

1. Inspect the mockup PDF under `prompt/` (extract text/structure; note screen name, primary CTA, nav placement, data fields).
2. Map screen → existing route/component in `App.jsx` / `Sidebar.jsx`. Prefer evolving an existing page over adding a parallel orphan route.
3. Apply `ui-climate-design` for visuals (variables, spacing, motion).
4. If the mockup implies live data, plan an `edge-api-slice` (and SQL if needed) — do not leave permanent fake arrays unless the prompt says UI-only.
5. Keep first viewport / section purpose aligned with the mockup; don’t dump every admin control onto a member screen.
6. Reuse sounds/assets in `public/` when the mockup implies audio feedback.
7. Call out gaps: mockup shows X but backend lacks Y.

## Verify

- Route reachable from Sidebar/topbar as in mockup
- Layout plausible at mobile and desktop widths
- `npm run build`

## Done when

Screen matches mockup intent with design-system tokens; data wiring status is explicit.
