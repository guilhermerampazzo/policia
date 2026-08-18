-- AlterTable
ALTER TABLE "User" ADD COLUMN     "acessoAte" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Flashcard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "erroId" TEXT NOT NULL,
    "pergunta" TEXT NOT NULL,
    "resposta" TEXT NOT NULL,
    "repeticoes" INTEGER NOT NULL DEFAULT 0,
    "intervalo" INTEGER NOT NULL DEFAULT 1,
    "proximaRevisao" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revisadoEm" TIMESTAMP(3),

    CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Flashcard_erroId_key" ON "Flashcard"("erroId");

-- CreateIndex
CREATE INDEX "Flashcard_userId_proximaRevisao_idx" ON "Flashcard"("userId", "proximaRevisao");

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_erroId_fkey" FOREIGN KEY ("erroId") REFERENCES "Erro"("id") ON DELETE CASCADE ON UPDATE CASCADE;
