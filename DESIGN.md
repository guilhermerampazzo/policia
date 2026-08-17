# Design

<!-- impeccable:design-schema 1 -->

## World

**Forja** now has two intentional surface worlds sharing the same brand assets:

- **Landing (Persuade):** mantém a direção existente de fotografia full-screen + gradientes,
  descrita em `src/app/page.tsx` e `src/app/landing.css`.
- **Painéis autenticados (Operate):** **"sala de comando cinematográfica"** — catálogo de
  treino sob luz baixa, com hero contextual, rails horizontais de conteúdo, cards arredondados
  com capas fotográficas, overlays para legibilidade e brasa como estado de ação.

A referência de catálogo audiovisual é estrutural, não uma cópia de Netflix: o produto continua
sendo uma mentoria policial, e cada tela privilegia a tarefa, o próximo estudo, a pendência ou
a decisão do mentor.

Cena dos painéis: aluno e mentor usando a Forja à noite, em uma sala escura iluminada por
brasa e imagens de treino. Fundo quase-preto (`#08090d`), painéis azul-grafite, branco quente,
linhas sutis e gradientes de fotografia. O app usa cantos 16–22px e profundidade por sombra
suave; a landing preserva os tokens e composição próprios dela.

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

- `.shell/.topbar/.sidebar/.main` — app layout cinematográfico; topbar com identidade,
  perfil e estado ativo; sidebar com mini-hero fotográfico, navegação ativa e faixa horizontal
  responsiva abaixo de 900px.
- `.page-context-bar` — trilha curta de contexto por papel e página.
- `.card/.card-ember/.card-hover`, `.tag` (ok/warn/danger/ember), `.btn/.btn-op`,
  `.progress`, `.avatar`, `.hex`, `.table`, `.input/.select/.textarea`, `.chip-opt`,
  `.stat-num` — primitives compartilhadas, com raios, contraste, estados e superfícies do app.
- Rails `nf-*` no painel do aluno: hero da meta, trilhas horizontais, capas fotográficas,
  overlays, revisão agendada, semana e foco.
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
