-- AlterTable
ALTER TABLE "Questao" ADD COLUMN "topicoId" TEXT;

-- AlterTable
ALTER TABLE "Erro" ADD COLUMN "questaoId" TEXT;

-- AlterTable
ALTER TABLE "PomodoroSessao" ADD COLUMN "topicoId" TEXT;

-- CreateTable
CREATE TABLE "ConteudoEstrategico" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "erroId" TEXT NOT NULL,
    "resumo" TEXT NOT NULL,
    "pontosChave" TEXT[],
    "armadilhas" TEXT[],
    "planoRevisao" TEXT NOT NULL,
    "origem" TEXT NOT NULL DEFAULT 'fallback',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConteudoEstrategico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConteudoEstrategico_erroId_key" ON "ConteudoEstrategico"("erroId");

-- CreateIndex
CREATE INDEX "ConteudoEstrategico_userId_idx" ON "ConteudoEstrategico"("userId");

-- CreateIndex
CREATE INDEX "Erro_userId_questaoId_idx" ON "Erro"("userId", "questaoId");

-- CreateIndex
CREATE INDEX "PomodoroSessao_userId_topicoId_idx" ON "PomodoroSessao"("userId", "topicoId");

-- CreateIndex
CREATE INDEX "Questao_topicoId_idx" ON "Questao"("topicoId");

-- CreateIndex
CREATE INDEX "Tentativa_userId_questaoId_idx" ON "Tentativa"("userId", "questaoId");

-- AddForeignKey
ALTER TABLE "Questao" ADD CONSTRAINT "Questao_topicoId_fkey" FOREIGN KEY ("topicoId") REFERENCES "Topico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Erro" ADD CONSTRAINT "Erro_questaoId_fkey" FOREIGN KEY ("questaoId") REFERENCES "Questao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PomodoroSessao" ADD CONSTRAINT "PomodoroSessao_topicoId_fkey" FOREIGN KEY ("topicoId") REFERENCES "Topico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConteudoEstrategico" ADD CONSTRAINT "ConteudoEstrategico_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConteudoEstrategico" ADD CONSTRAINT "ConteudoEstrategico_erroId_fkey" FOREIGN KEY ("erroId") REFERENCES "Erro"("id") ON DELETE CASCADE ON UPDATE CASCADE;