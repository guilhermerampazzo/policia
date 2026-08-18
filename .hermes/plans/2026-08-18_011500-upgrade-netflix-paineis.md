# Upgrade Netflix dos painéis Forja

**Objetivo:** aproximar radicalmente mentor e aluno de um catálogo audiovisual de preparação policial, mantendo a paleta Forja e a landing intocada.

## Direção

- Primeiro viewport com hero fotográfico contextual, título forte e dois CTAs.
- Rails horizontais com capas e overlays: arsenal do mentor, alunos em atenção, revisões, metas e ferramentas.
- Imagens devem sugerir operação policial, estudo, mentor e planejamento; remover leitura de academia.
- KPIs continuam existindo, mas descem na hierarquia visual e viram informação de suporte.
- Manter rotas, dados, APIs, formulários e ações existentes.

## Arquivos

- `src/app/admin/page.tsx`: hero + rails de ferramentas/alunos sem remover SimPanel e tabela.
- `src/components/AppShell.tsx`: trocar imagem genérica da sidebar por asset tático.
- `src/app/aluno/page.tsx`: revisar capas para priorizar assets táticos/mentor e evitar academia.
- `src/app/globals.css`: primitives de hero, rails, capas, botões, filtros e estados.
- `DESIGN.md`: registrar a evolução do mundo autenticado.

## Validação

- Docker build.
- Smoke test de todas as rotas autenticadas.
- Verificação visual desktop e mobile.
- Landing sem alteração de markup/classes de shell.
