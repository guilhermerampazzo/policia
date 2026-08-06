# Forja v2 — Plataforma de mentoria para concursos policiais

Rebuild da Forja: **plataforma dinâmica e premium** (Next.js + PostgreSQL + Docker), com
fluxo real e **semana adaptativa** — se o aluno erra bastante em Direito Penal, a semana
seguinte recebe mais conteúdo de Direito Penal (seguindo a sequência do currículo).

> **Prévia de demonstração:** o sistema não é autônomo nesta fase (sem dados reais de uso).
> Os botões de **simulação** injetam dados plausíveis para demonstrar o fluxo completo.

---

## Funcionalidades

### Aluno (`/aluno`)
- **Anamnese no primeiro acesso** (horas/dia, dias disponíveis, dificuldades, formato, objetivo) → alimenta o motor adaptativo
- **Painel do dia**: meta única, pendências, semana adaptada, XP/sequência, revisão agendada
- **Pomodoro nativo** (25/5 configurável) — sessões viram horas no relatório
- **Caderno de erros** com revisão espaçada automática (+10/+15/30 dias)
- **Simulado** rápido (questões seedadas) — cada resposta alimenta o motor
- **Relatório de progressão** (acertos por disciplina, horas/semana, metas/semana, erros, tendência)
- **Mapas mentais** gerados pelo mentor (visualização interativa)
- Chat com mentor · Fórum · Redações · Perfil completo + revisão da anamnese

### Mentor (`/admin`)
- **Visão geral**: KPIs, alunos em risco, ranking de força (XP)
- **Perfil completo do aluno**: anamnese, semana, erros, pesos do motor, relatório, simulações
- **Planejamento adaptativo**: pesos calculados (erros recentes × 0,3 máx +1,2 · dificuldade declarada +0,6) + semana gerada
- **Edital verticalizado (IA)**: edital bruto → verticalizado, diff com conteúdo estudado, priorização por recorrência da banca → publicar metas
- **Gerador de mapas mentais**: contexto colado → IA estrutura **ou** modo manual determinístico
- **Simulações da prévia**: histórico, erros, regenerar semana, avançar semana, questões, pomodoro, anamnese
- Chat das dúvidas · Correção de redações

## IA (opcional)
- Dois clientes **compatíveis com a API OpenAI**, configuráveis via `.env`:
  - **Mapa mental** → `MINDMAP_BASE_URL` / `MINDMAP_API_KEY` / `MINDMAP_MODEL`
  - **Resumo de conteúdo** → `DEEPSEEK_BASE_URL` / `DEEPSEEK_API_KEY` / `DEEPSEEK_MODEL`
- Sem chave configurada, os modos **determinísticos** funcionam (mapa manual, resumo com aviso) — a demo nunca quebra.
- **Mapas mentais são gerados como IMAGEM (PNG)** no estilo de caderno de estudo (fundo claro, nó central em vinho,
  ramos em caixas rosadas, sub-itens com bullets, linhas de conexão) — com botão de **download**. A versão interativa
  (React Flow) continua disponível como extra. A IA devolve a estrutura (JSON) e o app rasteriza a imagem com a fonte Inter.

---

## Como rodar

### 1. Ambiente (Docker)
```bash
cp .env.example .env     # ajuste as senhas
docker compose up -d --build
# app em http://localhost:10333
```

- Única porta exposta: **10333** (configurável via `PORT_EXTERNA` no `.env`).
- Postgres roda **sem porta exposta** (rede interna `forja`), volume nomeado `pgdata`.
- No boot: `prisma migrate deploy` + seed idempotente → app.

### Credenciais do seed
| Perfil | E-mail | Senha |
|---|---|---|
| Mentor (admin) | `admin@forja.com` | `forja1234` |
| Aluno | `aluno@forja.com` | `forja1234` |

### 2. Desenvolvimento local (sem Docker)
```bash
npm install
cp .env.example .env
# aponte DATABASE_URL para um Postgres local
npx prisma migrate dev     # cria o schema + migrações
npx prisma db seed         # popula a demo
npm run dev                # http://localhost:3000
```

---

## Subir no aaPanel

1. **Envie o projeto** para o servidor (git ou upload) e instale o **Docker / Docker Compose** pelo "App Store" do aaPanel.
2. **Crie o `.env`** a partir de `.env.example` (senhas fortes para `SESSION_PASSWORD`, `POSTGRES_PASSWORD` e `SEED_*`).
3. **Docker → Compose (ou terminal):**
   ```bash
   docker compose up -d --build
   ```
4. **Site (Nginx) → crie um site** com seu domínio (SSL Let's Encrypt), proxy reverso para:
   ```
   http://127.0.0.1:10333
   ```
   - WebSocket/streaming não são usados — proxy HTTP simples resolve.
5. **Backup do banco** (cron diário, exemplo):
   ```bash
   docker exec policial-db-1 pg_dump -U forja forja | gzip > /www/backup/forja-$(date +%F).sql.gz
   ```

### Comandos úteis
```bash
docker compose logs -f app          # logs da aplicação
docker compose down                 # para tudo (dados do banco ficam no volume)
docker compose down -v              # para e apaga o banco (cuidado)
docker exec -it policial-app-1 sh   # shell dentro do container
```

---

## Estrutura
```
src/
  app/
    page.tsx            # landing premium
    entrar/             # login (+ atalhos de prévia)
    aluno/…             # painel, caderno, simulado, relatório, mapas, chat, fórum, redações, perfil, onboarding
    admin/…             # visão geral, alunos, planejamento, edital, mapas, simulações, chat, redações
    api/…               # rotas de API (auth, metas, erros, pomodoro, tentativas, chat, forum, redação, simulações, edital, mapas, resumo)
  components/           # UI (shell, charts, pomodoro, mindmap, simulação, etc.)
  lib/
    adaptive.ts         # motor adaptativo (pesos + distribuição de dias)
    sim.ts              # simulações da prévia
    ai.ts               # clientes de IA (mapa mental + resumo)
    mindmap.ts          # estrutura/layout do mapa (interativo)
    mindmapImage.ts     # renderiza o mapa como imagem PNG (estilo caderno)
    points.ts           # XP, sequência, nível
prisma/
  schema.prisma         # modelo de dados
  seed.ts               # dados de demonstração (idempotente)
  migrations/           # migrações (aplicadas no boot do container)
Dockerfile · docker-compose.yml · docker-entrypoint.sh
```

## Decisões técnicas
- **Next.js 15** (App Router, standalone) — front + API no mesmo processo, 1 container
- **PostgreSQL 16** + **Prisma 6** (migrate deploy + seed no entrypoint)
- **iron-session** (cookie criptografado) · **bcryptjs** · **zod**
- **Recharts** (relatórios) · **@xyflow/react** (mapas mentais) · Tailwind v4 (utilitários)
- Design system próprio em `src/app/globals.css` (tokens Forja, dark premium, Inter/Space Mono)
