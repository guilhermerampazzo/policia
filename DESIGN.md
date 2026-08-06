# Design

<!-- impeccable:design-schema 1 -->

## World

**Forja v2** — single world across landing and app: **"campo de treino sob cronômetro"**.
Near-black training ground (`#08090b`), chalk-white type, ember (`#f37e1f`) as the
"active effort" accent, hairline rules as track lines, Space Mono as chronometer/HUD
readouts. The landing is a Persuade surface (conversion copy, pain → method → proof →
urgency); the app is an Operate surface (scanable, dense, same tokens).

## Type

- **Inter** everywhere (pinned by the client — display headlines, body, UI). Display
  headlines are uppercase, weight 800, tight tracking (−0.02em), max ~4.6rem.
- **Space Mono** for HUD/chronometer: kickers, tags, numbers, timestamps, mono labels.

## Color tokens

Defined in `src/app/globals.css` `:root` (app) — landing reuses them (`src/app/landing.css`).

- `--ink-0..3`, `--ink-line`, `--ink-line-strong` — near-black grounds/panels.
- `--ember-300..800` — brand accent: CTAs, active states, "effort" digits.
- `--paper-*`, `--steel-*` — reserved for light-shell surfaces.
- `--ok/--warn/--danger` — status (progress, overdue, doubts).

## Components (Operate shell)

- `.shell/.topbar/.sidebar/.main` — app layout; sidebar collapses to horizontal nav <900px.
- `.card/.card-ember/.card-hover`, `.tag` (ok/warn/danger/ember), `.btn/.btn-op`,
  `.progress`, `.avatar`, `.hex` (FJ shield motif), `.table`, `.input/.select/.textarea`,
  `.chip-opt`, `.stat-num`.
- Charts via Recharts; mind-map image rendered server-side (`src/lib/mindmapImage.ts`,
  resvg + Inter) in "caderno" style (paper beige bg, pink boxes, maroon titles, sticker
  edge, arrows) with download; interactive React Flow version optional.

## Landing (Persuade — "fotografia full-screen + gradientes")

Contract in `src/app/page.tsx` (THESIS/OWN-WORLD/STORY/FIRST VIEWPORT/FORM; seed `3b4a3405`).

- **Hero:** foto tática em **tela cheia** (duotone) coberta por scrims em gradiente (base→cima,
  esquerda→direita) que se fundem na página quase-preta; headline + sub + CTAs sobrepostos à
  imagem alinhados à base; pill de prova em mono (fundo escuro translúcido). **Sem janelas
  simuladas, sem HUD/cronômetro.**
- **Faixas de imagem:** seções full-bleed (pista, estudo) com gradiente e frase-statement
  sobreposta, intercalando os blocos escuros — transição de degradê contínua entre seções
  (glows de brasa no topo dos blocos escuros).
- **Pain:** numbered rows of student pains (no icon cards).
- **Method:** 3 movements (Anamnese → Semana adaptativa → Revisão espaçada) as editorial rows.
- **Product proof:** real app screenshots (`public/img/screens/`, captured from the running
  app) full-bleed with captions; mobile uses focused crops (object-fit cover).
- **Edital:** verticalized-syllabus table with recurrence bars (real dataset in `src/lib/edital.ts`).
- **Mentor, urgency (ember band), FAQ, footer.**
- **Motion:** staggered hero entrance, scroll reveals (progressive — content SSR-visible, JS
  only hides/reveals), reduced-motion respected.

## Imagery

`public/img/` — real Unsplash stock (tactical, training, study, desk) + real mentor
portrait + app screenshots. Placeholders to be swapped for the mentor's own photography.
