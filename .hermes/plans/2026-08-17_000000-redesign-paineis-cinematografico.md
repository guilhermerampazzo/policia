# Redesign dos painéis Forja — sala de comando cinematográfica

> **For Hermes:** execute este plano no projeto existente, preservando produto, dados, rotas e comportamento.

**Goal:** Refazer o design de todas as telas autenticadas de mentor e aluno em uma linguagem inspirada em catálogos cinematográficos: dark premium, hero contextual, rails de cards arredondados com imagens, gradientes e foco operacional — sem alterar a landing page.

**Architecture:** Manter a arquitetura Next.js/Prisma e as páginas/rotas atuais. Concentrar a maior parte da mudança no `AppShell`, tokens e CSS compartilhados, complementando páginas que precisam de hero/capas específicas. Não duplicar lógica de negócio nem mudar contratos das APIs.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, CSS global, imagens locais existentes em `public/img` e logo existente.

---

## Direção visual

- Produto: Forja, mentoria de concursos policiais.
- Modo: Operate — a interface precisa continuar rápida de escanear e executar tarefas.
- Cena: aluno/mentor usando um painel escuro à noite, com imagens de treino e estudo como contexto, não como decoração vazia.
- Linguagem: hero contextual + rails de conteúdo + cards de capa + gradientes cinematográficos + cantos 16–22px + navegação lateral compacta.
- Paleta: quase-preto/azul-grafite, branco quente, brasa Forja como ação/seleção, verde/gold/vermelho apenas para estados semânticos.
- Tipo: Inter para UI; Space Mono apenas para métricas, datas e pequenos metadados.
- Não mexer: landing (`src/app/page.tsx`, `src/app/landing.css`) e comportamento de backend.

## Arquivos previstos

- Modificar: `src/components/AppShell.tsx`
- Modificar: `src/app/globals.css`
- Modificar: todas as páginas em `src/app/admin/**/page.tsx` e `src/app/aluno/**/page.tsx` somente quando necessário para inserir composição contextual, classes de capa ou refinamentos de hierarquia.
- Não modificar: `src/app/page.tsx`, `src/app/landing.css`, rotas API, Prisma, regras de autenticação.
- Usar: `public/img/hero-tactical.jpg`, `track.jpg`, `treino.jpg`, `estudo.jpg`, `plano.jpg`, `relatorio.jpg`, `mentor.jpeg` e logos existentes.

## Etapas

1. Auditar shell, páginas autenticadas, classes existentes e assets locais.
2. Criar tokens app-only e substituir o shell por topbar compacto + sidebar com navegação ativa visualmente forte, identidade do usuário e área de contexto.
3. Criar primitives CSS reutilizáveis: `cinema-page`, `cinema-hero`, `cinema-rail`, `cinema-card`, `cinema-cover`, `cinema-panel`, estados, tabelas, formulários e responsividade.
4. Recompor dashboard do aluno com hero da meta do dia, trilhas “Continue estudando”/“Revisões”, semana e pomodoro mantendo todas as ações atuais.
5. Recompor visão geral e telas do mentor para catálogo de alunos, risco, planejamento, edital, mapas, simulações, chat e redações.
6. Aplicar a mesma linguagem às telas internas de aluno: caderno, simulado, relatório, mapas, chat, fórum, redações, perfil e onboarding.
7. Verificar que a landing permanece visualmente e estruturalmente intacta.
8. Rodar typecheck/build Docker e abrir rotas autenticadas para validar redirects, renderização e overflow.
9. Rodar o detector Impeccable uma única vez nos alvos alterados e corrigir achados mecânicos relevantes.
10. Fazer uma rodada visual desktop/mobile, corrigir problemas encontrados e documentar o novo mundo em `DESIGN.md`.

## Critérios de aceite

- Todas as rotas autenticadas de mentor e aluno mantêm conteúdo, links, formulários e ações funcionando.
- Nenhuma alteração em landing page.
- O primeiro viewport de cada painel mostra contexto, tarefa/prioridade e ação principal sem depender de uma tabela extensa.
- Cards de conteúdo usam imagens locais, overlay/gradiente legível e raios consistentes; não há imagens quebradas.
- Sidebar colapsa em telas menores, sem overflow horizontal.
- Estados de foco/hover/erro/sucesso permanecem legíveis e acessíveis.
- `npm run typecheck` ou build Docker termina sem erros.
- Rotas públicas `GET /` e `/entrar` continuam respondendo 200; rotas protegidas continuam redirecionando sem sessão.

## Riscos e decisões

- O projeto não tem testes visuais automatizados; usar screenshots/inspeção no navegador e smoke tests HTTP.
- Não adicionar dependência externa apenas para o visual; imagens locais reduzem risco de URLs instáveis. Imagens da internet só entram se um asset local não cobrir uma necessidade real.
- A referência é inspiração de composição, não cópia de marca, textos ou layout exato de Netflix.
