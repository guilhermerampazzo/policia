# Implementação FORJA — expansão funcional

## Brief do cliente

- Encerramento de acesso por aluno/perfil com data individual.
- Flashcards gerados a partir do caderno de erros.
- Linha de progresso do edital.
- Gráfico de erros e acertos por disciplina.
- Identificar conteúdo da questão errada e elaborar conteúdo estratégico.
- Cômputo de horas estudadas por disciplina.
- Comunicar a sigla FORJA: Foco, Organização, Resiliência, Jornada e Ação.
- Caderno de erros, flashcards, PDFs/resumos simplificados com informações estratégicas e gamificação.

## Direção de produto

- Painéis autenticados seguem o mundo Netflix/policial já implementado: hero, rails, capas policiais, cards arredondados, CTAs de ação e paleta Forja preservada.
- Landing (`src/app/page.tsx`) permanece intocada.
- Produto continua funcional e SSR-first; fallback determinístico quando IA não estiver configurada.
- Backend deve ser implementável e testável sem depender de uma chave de IA para a demo.

## Separação de execução

- Backend/dados/API: OpenCode Go, `opencode-go/deepseek-v4-flash`, variante high.
- Frontend/UX: Codex com GPT 5.6 Luna High via provider OpenAI Codex.

## Critérios de aceite

- `docker compose up -d --build` conclui sem erro.
- Migrações e seed são idempotentes.
- Admin consegue definir/revisar data de acesso individual.
- Aluno expirado não acessa painéis nem APIs de aluno e recebe estado de acesso encerrado.
- Flashcards são criados a partir de erros, persistidos e revisáveis.
- Questões erradas alimentam erro + conteúdo estratégico sem duplicação por tentativa.
- Relatório mostra acertos/erros e horas por disciplina.
- Edital mostra progresso calculado de forma explicável a partir de tópicos/metas.
- Gamificação existente continua funcionando e recebe os novos eventos sem duplicar XP.
- Smoke test de rotas admin/aluno e validação visual desktop/mobile.
