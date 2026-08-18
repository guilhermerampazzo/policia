import { PrismaClient, TipoConteudo, Dificuldade } from "@prisma/client";
import { hash } from "bcryptjs";
import { addDays, startOfDay, startOfWeek, weekStamp } from "../src/lib/dates";
import { planWeek } from "../src/lib/adaptive";
import { arvoreParaDataUri } from "../src/lib/mindmapImage";
import { flashcardConteudo } from "../src/lib/flashcard";
import type { ArvoreMental } from "../src/lib/ai";

const prisma = new PrismaClient();

const DISCIPLINAS = [
  { slug: "portugues", nome: "Português", cor: "#f37e1f" },
  { slug: "direito-penal", nome: "Direito Penal", cor: "#e0483e" },
  { slug: "direitos-humanos", nome: "Direitos Humanos", cor: "#4aa8e8" },
  { slug: "raciocinio-logico", nome: "Raciocínio Lógico", cor: "#9a7bf5" },
  { slug: "legislacao-especial", nome: "Legislação Especial", cor: "#3dd68c" },
  { slug: "direito-consumidor", nome: "Direito do Consumidor", cor: "#f5b84c" },
];

const TOPICOS: Record<string, string[]> = {
  portugues: [
    "Interpretação de texto — coesão e coerência",
    "Concordância verbal e nominal",
    "Regência verbal e crase",
    "Ortografia oficial",
    "Pontuação",
  ],
  "direito-penal": [
    "Princípios do Direito Penal",
    "Crimes contra a Administração Pública",
    "Crimes contra a fé pública",
    "Falsidade ideológica e documental",
    "Teoria do crime — fato típico",
    "Legítima defesa e excludentes",
  ],
  "direitos-humanos": [
    "Convenção Americana de Direitos Humanos",
    "Sistema Interamericano de proteção",
    "Declaração Universal — art. 5º",
    "Pacto de São José da Costa Rica",
  ],
  "raciocinio-logico": [
    "Proposições compostas",
    "Tabelas-verdade e conectivos",
    "Equivalências lógicas",
    "Negação de proposições",
    "Argumentação e validade",
  ],
  "legislacao-especial": [
    "Lei Maria da Penha",
    "Estatuto do Desarmamento",
    "Lei de Abuso de Autoridade",
    "Crimes de trânsito — CTB",
  ],
  "direito-consumidor": [
    "Código de Defesa do Consumidor — parte geral",
    "Responsabilidade do fornecedor",
    "Práticas abusivas e publicidade enganosa",
    "Contratos de consumo",
  ],
};

const QUESTOES: {
  disc: string;
  banca: string;
  dificuldade: Dificuldade;
  enun: string;
  alts: string[];
  gab: number;
  coment: string;
}[] = [
  {
    disc: "portugues",
    banca: "Vunesp",
    dificuldade: "MEDIA",
    enun: "Assinale a alternativa em que a concordância verbal está CORRETA.",
    alts: ["Haviam muitos candidatos na sala.", "Existem muitas dúvidas sobre o edital.", "Fazem três anos que ele estuda.", "Houveram novas questões no simulado."],
    gab: 1,
    coment: "O verbo 'existir' concorda com o sujeito 'muitas dúvidas'. 'Haver' impessoal e 'fazer' temporal não variam.",
  },
  {
    disc: "direito-penal",
    banca: "Vunesp",
    dificuldade: "MEDIA",
    enun: "Sobre a falsidade ideológica, é correto afirmar que:",
    alts: ["O documento é criado do zero, sem existência anterior.", "O documento é formalmente verdadeiro, mas o conteúdo é falso.", "A falsidade ideológica nunca admite forma tentada.", "Somente servidor público pratica este crime."],
    gab: 1,
    coment: "Na falsidade ideológica o documento é materialmente verdadeiro; a falsidade está no conteúdo.",
  },
  {
    disc: "direito-penal",
    banca: "CESPE",
    dificuldade: "DIFICIL",
    enun: "Quanto ao princípio da legalidade penal, assinale a alternativa correta:",
    alts: ["Permite analogia in malam partem.", "Exige lei anterior ao fato para incriminação.", "Admite crime por costume.", "Veda apenas leis estaduais."],
    gab: 1,
    coment: "Princípio da legalidade: não há crime sem lei anterior que o defina (art. 5º, XXXIX, CF).",
  },
  {
    disc: "raciocinio-logico",
    banca: "Vunesp",
    dificuldade: "FACIL",
    enun: "Qual é a negação da proposição 'se estudo, então passo'?",
    alts: ["Se não estudo, então não passo.", "Estudo e não passo.", "Não estudo ou passo.", "Não estudo e não passo."],
    gab: 1,
    coment: "A negação de 'P → Q' é 'P e ¬Q': mantém o antecedente e nega o consequente.",
  },
  {
    disc: "direitos-humanos",
    banca: "FGV",
    dificuldade: "MEDIA",
    enun: "O Pacto de São José da Costa Rica prevê que:",
    alts: ["A pena de morte pode ser restabelecida em qualquer hipótese.", "Ninguém pode ser submetido a tortura nem a penas cruéis.", "A prisão por dívida é sempre permitida.", "O direito de propriedade é ilimitado."],
    gab: 1,
    coment: "Art. 5º da CADH proíbe expressamente tortura e tratamentos cruéis.",
  },
  {
    disc: "direito-consumidor",
    banca: "FGV",
    dificuldade: "MEDIA",
    enun: "Pelo Código de Defesa do Consumidor, a responsabilidade do fornecedor por vício do produto é:",
    alts: ["Subjetiva, exigindo culpa comprovada.", "Objetiva, independente de culpa.", "Sempre solidária com o consumidor.", "Excluída se o defeito for aparente."],
    gab: 1,
    coment: "Art. 12/14 CDC: responsabilidade objetiva, bastando o nexo causal com o defeito/vício.",
  },
];

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@forja.com";
  const alunoEmail = process.env.SEED_ALUNO_EMAIL ?? "aluno@forja.com";
  const adminSenha = process.env.SEED_ADMIN_PASSWORD ?? "forja1234";
  const alunoSenha = process.env.SEED_ALUNO_PASSWORD ?? "forja1234";

  // ---------- usuários ----------
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Guilherme",
      role: "ADMIN",
      acessoAte: null,
      passwordHash: await hash(adminSenha, 10),
    },
  });

  const aluno = await prisma.user.upsert({
    where: { email: alunoEmail },
    update: { acessoAte: addDays(new Date(), 365) },
    create: {
      email: alunoEmail,
      name: "Rafael M.",
      role: "STUDENT",
      concursoAlvo: "PC-SP · Escrivão",
      banca: "Vunesp",
      dataProva: addDays(new Date(), 120),
      onboardingDone: true,
      acessoAte: addDays(new Date(), 365),
      passwordHash: await hash(alunoSenha, 10),
    },
  });

  // ---------- anamnese ----------
  await prisma.anamnese.upsert({
    where: { userId: aluno.id },
    update: {},
    create: {
      userId: aluno.id,
      horasPorDia: 3,
      diasDisponiveis: [1, 2, 3, 4, 5],
      dificuldades: ["Direito Penal", "Raciocínio Lógico"],
      formatoPreferido: "video",
      objetivo: "PC-SP Escrivão 2026",
    },
  });

  // ---------- disciplinas + tópicos ----------
  const disciplinas: Record<string, { id: string; nome: string; topicos: { id: string; titulo: string; cargaMin: number }[] }> = {};
  for (const [ordem, d] of DISCIPLINAS.entries()) {
    const disc = await prisma.disciplina.upsert({
      where: { slug: d.slug },
      update: { cor: d.cor, ordem },
      create: { slug: d.slug, nome: d.nome, cor: d.cor, ordem },
    });
    const topicos: { id: string; titulo: string; cargaMin: number }[] = [];
    for (const [ordemT, titulo] of TOPICOS[d.slug].entries()) {
      const topico = await prisma.topico.upsert({
        where: { id: `${disc.id}-t${ordemT}` },
        update: {},
        create: {
          id: `${disc.id}-t${ordemT}`,
          disciplinaId: disc.id,
          titulo,
          ordem: ordemT,
          tipo: ordemT % 2 === 0 ? TipoConteudo.VIDEO_PDF : TipoConteudo.QUESTOES,
          cargaMin: 45 + (ordemT % 3) * 15,
        },
      });
      topicos.push({ id: topico.id, titulo: topico.titulo, cargaMin: topico.cargaMin });
    }
    disciplinas[d.slug] = { id: disc.id, nome: d.nome, topicos };
  }

  // ---------- questões ----------
  if ((await prisma.questao.count()) === 0) {
    for (const q of QUESTOES) {
      const disc = disciplinas[q.disc];
      const topico = disc.topicos[0];
      await prisma.questao.create({
        data: {
          disciplinaId: disc.id,
          topicoId: topico.id,
          enunciado: q.enun,
          altA: q.alts[0] ?? "",
          altB: q.alts[1] ?? "",
          altC: q.alts[2] ?? "",
          altD: q.alts[3] ?? "",
          altE: q.alts[4] ?? "",
          gabarito: q.gab,
          dificuldade: q.dificuldade,
          banca: q.banca,
          comentario: q.coment,
        },
      });
    }
  }

  // ---------- histórico (semanas passadas) ----------
  if ((await prisma.meta.count({ where: { userId: aluno.id } })) === 0) {
    const rnd = mulberry(Date.now());
    for (let s = 4; s >= 1; s--) {
      const inicio = addDays(startOfWeek(new Date()), -7 * s);
      for (let i = 0; i < 5; i++) {
        const dia = addDays(inicio, i);
        const slug = DISCIPLINAS[Math.floor(rnd() * DISCIPLINAS.length)].slug;
        const topico = disciplinas[slug].topicos[Math.floor(rnd() * disciplinas[slug].topicos.length)];
        const ok = rnd() > 0.2;
        await prisma.meta.create({
          data: {
            userId: aluno.id,
            topicoId: topico.id,
            dia,
            semana: weekStamp(dia),
            status: ok ? "CONCLUIDA" : "ATRASADA",
            concluidaEm: ok ? addDays(dia, 1) : null,
            origem: "PLANEJADA",
          },
        });
        for (let p = 0; p < 1 + Math.floor(rnd() * 3); p++) {
          await prisma.pomodoroSessao.create({
            data: { userId: aluno.id, inicio: addDays(dia, 1), minutos: 25, tipo: "FOCO" },
          });
        }
      }
    }
    // tentativas recentes
    const todasQuestoes = await prisma.questao.findMany();
    for (let i = 0; i < 24; i++) {
      const q = todasQuestoes[Math.floor(rnd() * todasQuestoes.length)];
      if (!q) continue;
      await prisma.tentativa.create({
        data: {
          userId: aluno.id,
          questaoId: q.id,
          acerto: rnd() > 0.3,
          data: addDays(startOfDay(new Date()), -Math.floor(rnd() * 20)),
        },
      });
    }
  }

  // ---------- erros recentes (para o motor adaptativo) ----------
  const errosExistentes = await prisma.erro.count({ where: { userId: aluno.id } });
  if (errosExistentes === 0) {
    const rnd = mulberry(1234);
    const desenhos = [
      "Confundi os conceitos de coação e necessidade ao resolver a questão.",
      "Errei a distinção entre os crimes da banca na tabela de concurso.",
      "Caí na pegadinha do conectivo na tabela-verdade.",
      "Troquei o prazo recursal ao responder o simulado.",
      "Não diferenciei vício aparente de vício oculto no produto.",
      "Misturei os dispositivos ao revisar a jurisprudência.",
    ];
    const alvo = [
      ["direito-penal", 6],
      ["raciocinio-logico", 3],
      ["direito-consumidor", 1],
      ["portugues", 1],
    ] as const;
    for (const [slug, qtd] of alvo) {
      const disc = disciplinas[slug];
      for (let i = 0; i < qtd; i++) {
        const topico = disc.topicos[Math.floor(rnd() * disc.topicos.length)];
        const data = addDays(startOfDay(new Date()), -Math.floor(rnd() * 6));
        await prisma.erro.create({
          data: {
            userId: aluno.id,
            topicoId: topico.id,
            descricao: desenhos[Math.floor(rnd() * desenhos.length)],
            data,
            revisaoEm: addDays(startOfDay(new Date()), 1 + Math.floor(rnd() * 3)),
          },
        });
      }
    }
  }

  // ---------- flashcards derivados dos erros (idempotente) ----------
  const errosComContexto = await prisma.erro.findMany({
    where: { userId: aluno.id },
    include: { topico: { include: { disciplina: true } } },
  });
  for (const erro of errosComContexto) {
    await prisma.flashcard.upsert({
      where: { erroId: erro.id },
      update: {},
      create: {
        userId: aluno.id,
        erroId: erro.id,
        ...flashcardConteudo(erro),
        proximaRevisao: erro.revisaoEm,
      },
    });
  }

  // ---------- semana atual planejada (pesos já com os erros acima) ----------
  const metasSemanaAtual = await prisma.meta.count({
    where: { userId: aluno.id, dia: { gte: startOfWeek(new Date()), lt: addDays(startOfWeek(new Date()), 7) } },
  });
  if (metasSemanaAtual === 0) {
    const anamnese = await prisma.anamnese.findUnique({ where: { userId: aluno.id } });
    const pesos: Record<string, number> = {};
    const topicosPorDisc: Record<string, { id: string; titulo: string; cargaMin: number }[]> = {};
    const consumidos: Record<string, number> = {};
    for (const [slug, d] of Object.entries(disciplinas)) {
      pesos[d.id] = 1 + (slug === "direito-penal" ? 1.8 : slug === "raciocinio-logico" ? 0.9 : slug === "direito-consumidor" ? 0.3 : 0);
      topicosPorDisc[d.id] = d.topicos;
      consumidos[d.id] = await prisma.meta.count({ where: { userId: aluno.id, topico: { disciplinaId: d.id } } });
    }
    const revisoes = await prisma.erro.findMany({
      where: { userId: aluno.id, status: "PENDENTE", revisaoEm: { gte: startOfWeek(new Date()), lt: addDays(startOfWeek(new Date()), 7) } },
      select: { id: true, topicoId: true },
      orderBy: { revisaoEm: "asc" },
    });
    const plano = await planWeek({
      userId: aluno.id,
      start: startOfWeek(new Date()),
      diasDisponiveis: anamnese?.diasDisponiveis ?? [1, 2, 3, 4, 5],
      horasPorDia: anamnese?.horasPorDia ?? 3,
      pesos,
      topicosPorDisciplina: topicosPorDisc,
      consumidos,
      revisoes: revisoes.map((r) => ({ topicoId: r.topicoId, erroId: r.id, descricao: "" })),
    });
    for (const m of plano.metas) {
      await prisma.meta.create({
        data: {
          userId: aluno.id,
          topicoId: m.topicoId,
          dia: m.dia,
          semana: weekStamp(m.dia),
          origem: m.origem === "REVISAO" ? "REVISAO" : "PLANEJADA",
        },
      });
    }
  }

  // ---------- conteúdo extra para demonstração ----------
  if ((await prisma.conversa.count({ where: { alunoId: aluno.id } })) === 0) {
    const conv = await prisma.conversa.create({
      data: { alunoId: aluno.id, topico: "Crimes contra a fé pública", aberta: true },
    });
    await prisma.mensagem.createMany({
      data: [
        { conversaId: conv.id, autorId: aluno.id, texto: "Mentor, não entendi a diferença entre falsidade ideológica e falsificação de documento particular. Cai muito na Vunesp?" },
        { conversaId: conv.id, autorId: admin.id, texto: "Cai sim — 4 das últimas 6 provas. Na falsidade ideológica o documento é verdadeiro mas o conteúdo é falso; na falsificação o próprio documento é criado ou adulterado. Vou anexar 3 questões comentadas no seu caderno." },
        { conversaId: conv.id, autorId: aluno.id, texto: "Perfeito, isso resolve! Obrigado." },
      ],
    });
  }

  if ((await prisma.forumTopico.count()) === 0) {
    const topico = await prisma.forumTopico.create({
      data: { autorId: aluno.id, titulo: "Dica de revisão para Direito Penal na reta final", corpo: "Alguém mais usa a técnica de revisar só o caderno de erros na última semana? Está me ajudando muito." },
    });
    await prisma.forumComentario.create({
      data: { topicoId: topico.id, autorId: admin.id, texto: "É exatamente essa a metodologia da Forja — na última semana a revisão é 100% caderno de erros + questões." },
    });
  }

  if ((await prisma.redacao.count({ where: { userId: aluno.id } })) === 0) {
    await prisma.redacao.create({
      data: {
        userId: aluno.id,
        tema: "Reforma Tributária e seus impactos na arrecadação estadual",
        texto: "A reforma tributária promete simplificar o sistema... (texto ilustrativo da prévia)",
      },
    });
  }

  if ((await prisma.mapaMental.count()) === 0) {
    const arvoreSeed: ArvoreMental = {
      central: "Hierarquia das Normas",
      branches: [
        { label: "Constituição Federal", children: ["Fundamento de validade", "Núcleo intangível", "Rigidez constitucional"] },
        { label: "Princípio de Kelsen", children: ["Norma superior valida a inferior", "Pirâmide normativa"] },
        { label: "Normas complementares", children: ["Leis complementares", "Leis ordinárias", "Decretos e regulamentos"] },
        { label: "Força normativa", children: ["Validade formal", "Validade material"] },
        { label: "Conflitos", children: ["Revogação", "Incompatibilidade", "Subordinação hierárquica"] },
      ],
    };
    await prisma.mapaMental.create({
      data: {
        autorId: admin.id,
        disciplinaId: disciplinas["direito-penal"].id,
        titulo: "Hierarquia das Normas — Direito Penal",
        arvoreJson: JSON.stringify(arvoreSeed),
        imagemBase64: arvoreParaDataUri(arvoreSeed),
        publica: true,
      },
    });
  }

  console.log("Seed concluído.");
  console.log(`  Admin: ${adminEmail} / ${adminSenha}`);
  console.log(`  Aluno: ${alunoEmail} / ${alunoSenha}`);
}

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
