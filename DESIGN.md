# Design

<!-- impeccable:design-schema 1 -->

## World

**Forja** — military-forge / police-roster board. Near-black steel ground with an ember-orange
accent pulled directly from the real brand mark (`arquivos/logo *.jpeg`). Persuade surfaces
(landing) run full-bleed dark photographic scenes; Operate surfaces (dashboard, mentor panel,
error notebook, edital tool, chat) run a warm steel-desk light shell so daily task work stays
scannable, with the same ember accent carried through as the one color that means "attention/
brand" across both registers.

## Type

- Display: **Oswald** (condensed, uppercase, roster/ID-tag register) — all H1–H3, eyebrows use it at small sizes via mono instead.
- Body/UI: **Inter**.
- Data/system labels: **Space Mono** (eyebrows, tags, timestamps) — reads like a tactical HUD readout.

## Color tokens

Defined in `telas-html/assets/css/style.css` `:root`.

- `--ink-0/1/2/3` — near-black grounds and panels (Persuade).
- `--ember-400..900` — brand accent ramp, used for CTAs, active states, alerts, the "one meta of the day."
- `--paper-0/1/2`, `--steel-900/700/500/300` — warm steel-desk light shell (Operate).
- `--ok/--warn/--danger` — status tags (progress, overdue, doubts).

## Components

- `.proto-nav` / `.proto-nav-mobile` — prototype-only screen switcher, not part of the shipped product; hidden during screenshot capture (`scripts/shot.mjs`).
- `.hex` — hexagonal clip-path badge, echoes the real "FJ" shield mark.
- `.btn` (ember/ghost/dark) for Persuade; `.btn-op` (primary/line) for Operate — separate vocabularies on purpose, matching each surface's register.
- `.card` / `.card-dark` — Operate content blocks.
- `.tag` (+ ok/warn/danger/ember variants) — status pills used across dashboard, mentor panel, error notebook, edital tool.
- `.op-shell` / `.op-topbar` / `.op-side` / `.op-main` — shared Operate page shell (sidebar + topbar), collapses to a horizontal-scroll top nav under 900px; `.grid-2-300`, `.grid-2-wide`, `.week-grid`, `.scroll-x` handle the responsive/overflow rules for fixed-column layouts (data table, two-column tool screens, 7-day strip).

## Screens shipped

`telas-html/index.html` (landing), `dashboard-aluno.html`, `caderno-erros.html`,
`painel-mentor.html`, `edital-verticalizado.html`, `chat.html`. Static prototype only — no
backend, no real data. Desktop (1440×) and mobile (390×) screenshots captured to `telas/`
via Playwright (`scripts/shot.mjs`); no Claude-in-Chrome browser extension was connected this
session, so Playwright substituted for the requested "mcp playwrite" capture step.

## Known placeholders (replace before real use)

- All student names, progress numbers, chat transcripts, and edital contents are illustrative,
  not real data.
- Landing hero and "disciplina" section photos are real Unsplash stock (police/tactical),
  used as placeholder imagery per the brief's request to "pegue imagens da internet para
  utilizarmos neste primeiro momento" — swap for the mentor's own photography when available.
- Logo files used as-is from `arquivos/` (no background removal was needed or performed —
  all three variants already ship on solid, context-appropriate backgrounds).
