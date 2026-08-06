# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

static HTML/CSS/JS (prototype only, no backend/build step) — [inferred: user explicitly asked for "apenas as telas", not a working system, with simple in-page navigation between static screens]

## Users

- **Mentor (owner/operator):** Guilherme's client, a public servant (UFRA) and mentor who coaches candidates for **police/law-enforcement public exams (concursos policiais)**. He personally produces study material and wants a private, branded platform for his own mentees only — not a product resold to other mentors.
- **Mentee/student (aluno):** candidates studying for police exam boards, following a mentor-assigned study plan, needing daily focus, error tracking, and spaced review before test day.

## Product Purpose

A mentoring platform where the mentor defines each student's study goals/calendar, feeds structured content per topic, and the student executes a focused daily study routine. Success = student always knows exactly what to study today, never loses track of pending/failed goals, and builds a growing personal "error notebook" that becomes the core review tool before the exam.

## Positioning

Not a generic multi-tenant SaaS for mentors (deliberately rejected reselling to other mentors) — a **single-brand, single-mentor ecosystem** ("Forja") where the mentor's own AI-assisted content pipeline (turning a raw exam notice into a verticalized syllabus + prioritized goals) is the differentiator, not just task/goal tracking (which he already gets for free via Trello).

## Operating Context

- Content sources: video lessons, PDFs, prior "Estratégia Concursos"-style material the mentor already owns/produces.
- Recurring ritual: mentor sets weekly goals per subject → student studies daily assigned topic → student logs mistakes into a per-subject/topic error notebook → system schedules spaced revisions (e.g. +10/+15 days) → pre-exam week is pure error-notebook + question-drilling review.
- Mentor also manually reviews raw exam notices ("editais") to build a verticalized syllabus and prioritize subjects by historical recurrence for that board/role.

## Capabilities and Constraints

Confirmed feature set requested by the mentor (see conversation transcript, `transcricoes.txt`):
- Student profile/dashboard: today's task front and center, no clutter, visible alert for overdue/pending goals from prior days, visual "completed" state per goal.
- Content per goal: video lesson and/or PDF, student's choice; optional AI-generated summary.
- **Error notebook (caderno de erros):** built organically per subject/topic as the student studies; system schedules and notifies spaced revisions; becomes the primary pre-exam review tool.
- Mentor panel: view all students' access/progress and each student's individual profile.
- Mentor "AI ecosystem": generate a structured content package for a topic (recurrence pattern, how the board tends to phrase questions) and push it straight into a student's goal.
- Automated "Edital Verticalizado" tool: convert a raw exam notice into a verticalized syllabus, diff it against previously studied content (what's new vs. no-longer-needed), rank subjects by recurrence over the last 3–5 years for that board, and auto-draft goals (mentor can fine-tune before publishing).
- Student↔mentor chat per doubt/topic; optional student forum.
- PDF/report export of what's structured in the platform.
- Multiple AI models pluggable into the system (mentor referenced Claude and Gemini) — cost/limits model still undecided by the mentor himself.

Undecided/open (do not fabricate): pricing/plan structure, number of student profiles per mentor, exact AI usage limits, real integrations — none of these are needed for a visual prototype.

## Brand Commitments

- Name: **Forja** (full logo reads "Mentoria Forja") — anvil/flame mark, orange (#F5A035–#E8590C range) on black, plus a secondary hexagonal "FJ" shield mark (black/orange on light, silver/orange on dark).
- Assets on hand: `arquivos/logo horizontal.jpeg`, `arquivos/logo para fundos claros.jpeg`, `arquivos/logo para fundos escuros.jpeg`, `arquivos/foto mentor.jpeg` (mentor portrait, dark dramatic studio lighting already fits a bold/authoritative tone).
- Reference for tone/inspiration: Instagram `@mentoria_forja_concursos` (police-exam mentoring niche — tone should read disciplined, martial, high-intensity, not soft/generic edtech).

## Evidence on Hand

- `transcricoes.txt` — full transcript of the discovery calls with the mentor describing every feature above.
- `arquivos/` — real logo files and a real mentor photo (must be used, not placeholders).
- No existing codebase, no existing DESIGN.md — this is a from-scratch prototype.
- No real student testimonials/pricing/case studies exist — none should be invented as fact; illustrative placeholder copy for a prototype is acceptable but must not be presented as real evidence later.

## Product Principles

1. Discipline over cuteness — this serves police-exam candidates; tone is intense, focused, martial ("forja" = forge), not playful edtech.
2. One task in view — the student dashboard always foregrounds today's single priority, never a wall of widgets.
3. The error notebook is the spine of the product — every other screen should visibly feed it or draw from it.
4. Mentor's voice, not a marketplace — the platform is a personal instrument for one mentor's method, never generic/white-label in feel.
5. Built for real content — screens must look populated with plausible police-exam subjects (legislação, direito penal, direitos humanos, raciocínio lógico, português, etc.), not lorem ipsum.

## Accessibility & Inclusion

No specific requirement established beyond standard web contrast/legibility; screens should hold up under the dark, high-contrast brand palette.
