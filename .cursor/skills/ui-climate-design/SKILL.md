---
name: ui-climate-design
description: >-
  Implement or polish EcoKubatana UI using the climate design system (CSS
  variables, gradients, micro-animations, responsive layouts). Use when the
  prompt asks for redesign, visual polish, dashboard charts, sidebar, cards,
  hackathon-ready UI, or design-system work. Paths: CSS and React presentation.
paths:
  - "src/**/*.css"
  - "src/components/**/*.jsx"
  - "index.html"
  - "DESIGN_SYSTEM.md"
  - "UI_REDESIGN.md"
---

# UI Climate Design

## Prompt patterns this skill matches

- “Make it look modern / stand out for the hackathon”
- “Redesign the dashboard / sidebar / cards”
- “Use the design system / climate colors / animations”
- Visual polish without inventing a new product direction

## Source of truth

1. `DESIGN_SYSTEM.md` and `src/index.css` CSS variables
2. Existing component CSS: `App.css`, `Dashboard.css`, `Sidebar.css`, `PageStyles.css`, `Login.css`
3. Do **not** introduce Inter-alternative stacks unless asked; keep Inter if already in `index.html`
4. Preserve climate palette: primary green `#00d9a3`, forest dark, ocean blue, coral orange, solar yellow — extend via variables, don’t freestyle hex in one-off components

## How to execute

1. Distill GOAL with `lean-coder`.
2. Locate the target component + its CSS file (prefer editing existing CSS over new files).
3. Reuse existing utility classes, gradients, radii, shadows, and keyframes from `index.css`.
4. Prefer CSS animations/transitions over new animation libraries.
5. Keep one job per section; match existing card/hover patterns rather than inventing new card systems.
6. Check responsive breakpoints already used (≈480 / 640 / 768 / 1024 / 1200).
7. Verify: `npm run dev` visual check + `npm run build`.

## Do not

- Replace the entire design language mid-task
- Add heavy UI kits (MUI, Tailwind) unless explicitly requested
- Put new features in the hero/dashboard without wiring data (that’s `edge-api-slice` / `admin-ops-wire`)

## Done when

Visual change matches ACCEPTANCE; no unused CSS files; build passes.
