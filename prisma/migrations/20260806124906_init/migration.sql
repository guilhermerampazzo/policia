-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STUDENT');

-- CreateEnum
CREATE TYPE "TipoConteudo" AS ENUM ('VIDEO', 'PDF', 'VIDEO_PDF', 'QUESTOES');

-- CreateEnum
CREATE TYPE "StatusMeta" AS ENUM ('PENDENTE', 'EM_CURSO', 'CONCLUIDA', 'ATRASADA');

-- CreateEnum
CREATE TYPE "OrigemMeta" AS ENUM ('PLANEJADA', 'MANUAL', 'REVISAO');

-- CreateEnum
CREATE TYPE "StatusRevisao" AS ENUM ('PENDENTE', 'REVISTO');

-- CreateEnum
CREATE TYPE "TipoPomodoro" AS ENUM ('FOCO', 'PAUSA');

-- CreateEnum
CREATE TYPE "Dificuldade" AS ENUM ('FACIL', 'MEDIA', 'DIFICIL');

-- CreateEnum
CREATE TYPE "StatusRedacao" AS ENUM ('PENDENTE', 'CORRIGIDA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "concursoAlvo" TEXT,
    "banca" TEXT,
    "dataProva" TIMESTAMP(3),
    "onboardingDone" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anamnese" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "horasPorDia" INTEGER NOT NULL,
    "diasDisponiveis" INTEGER[],
    "dificuldades" TEXT[],
    "formatoPreferido" TEXT NOT NULL,
    "objetivo" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Anamnese_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Disciplina" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "Disciplina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topico" (
    "id" TEXT NOT NULL,
    "disciplinaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "tipo" "TipoConteudo" NOT NULL DEFAULT 'VIDEO_PDF',
    "cargaMin" INTEGER NOT NULL DEFAULT 45,

    CONSTRAINT "Topico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meta" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicoId" TEXT NOT NULL,
    "dia" TIMESTAMP(3) NOT NULL,
    "semana" INTEGER NOT NULL,
    "status" "StatusMeta" NOT NULL DEFAULT 'PENDENTE',
    "origem" "OrigemMeta" NOT NULL DEFAULT 'PLANEJADA',
    "concluidaEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Erro" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicoId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revisaoEm" TIMESTAMP(3) NOT NULL,
    "status" "StatusRevisao" NOT NULL DEFAULT 'PENDENTE',
    "revisadoEm" TIMESTAMP(3),

    CONSTRAINT "Erro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PomodoroSessao" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "minutos" INTEGER NOT NULL,
    "tipo" "TipoPomodoro" NOT NULL DEFAULT 'FOCO',

    CONSTRAINT "PomodoroSessao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Questao" (
    "id" TEXT NOT NULL,
    "disciplinaId" TEXT NOT NULL,
    "enunciado" TEXT NOT NULL,
    "altA" TEXT NOT NULL,
    "altB" TEXT NOT NULL,
    "altC" TEXT NOT NULL,
    "altD" TEXT NOT NULL,
    "altE" TEXT NOT NULL,
    "gabarito" INTEGER NOT NULL,
    "dificuldade" "Dificuldade" NOT NULL DEFAULT 'MEDIA',
    "banca" TEXT NOT NULL,
    "comentario" TEXT,

    CONSTRAINT "Questao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tentativa" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questaoId" TEXT NOT NULL,
    "acerto" BOOLEAN NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tentativa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Redacao" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tema" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "nota" INTEGER,
    "status" "StatusRedacao" NOT NULL DEFAULT 'PENDENTE',
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Redacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapaMental" (
    "id" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "disciplinaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "arvoreJson" TEXT NOT NULL,
    "publica" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MapaMental_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversa" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "topico" TEXT NOT NULL,
    "aberta" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mensagem" (
    "id" TEXT NOT NULL,
    "conversaId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mensagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumTopico" (
    "id" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "corpo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumTopico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumComentario" (
    "id" TEXT NOT NULL,
    "topicoId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumComentario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Anamnese_userId_key" ON "Anamnese"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Disciplina_nome_key" ON "Disciplina"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Disciplina_slug_key" ON "Disciplina"("slug");

-- CreateIndex
CREATE INDEX "Meta_userId_dia_idx" ON "Meta"("userId", "dia");

-- CreateIndex
CREATE INDEX "Erro_userId_status_idx" ON "Erro"("userId", "status");

-- AddForeignKey
ALTER TABLE "Anamnese" ADD CONSTRAINT "Anamnese_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topico" ADD CONSTRAINT "Topico_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "Disciplina"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meta" ADD CONSTRAINT "Meta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meta" ADD CONSTRAINT "Meta_topicoId_fkey" FOREIGN KEY ("topicoId") REFERENCES "Topico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Erro" ADD CONSTRAINT "Erro_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Erro" ADD CONSTRAINT "Erro_topicoId_fkey" FOREIGN KEY ("topicoId") REFERENCES "Topico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PomodoroSessao" ADD CONSTRAINT "PomodoroSessao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questao" ADD CONSTRAINT "Questao_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "Disciplina"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tentativa" ADD CONSTRAINT "Tentativa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tentativa" ADD CONSTRAINT "Tentativa_questaoId_fkey" FOREIGN KEY ("questaoId") REFERENCES "Questao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redacao" ADD CONSTRAINT "Redacao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapaMental" ADD CONSTRAINT "MapaMental_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapaMental" ADD CONSTRAINT "MapaMental_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "Disciplina"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversa" ADD CONSTRAINT "Conversa_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_conversaId_fkey" FOREIGN KEY ("conversaId") REFERENCES "Conversa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumTopico" ADD CONSTRAINT "ForumTopico_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumComentario" ADD CONSTRAINT "ForumComentario_topicoId_fkey" FOREIGN KEY ("topicoId") REFERENCES "ForumTopico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumComentario" ADD CONSTRAINT "ForumComentario_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
