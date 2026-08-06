export interface ItemEdital {
  titulo: string;
  disciplina: string;
  recorrencia: string; // ex: "9 de 10 provas"
  recorrenciaNum: number; // 0..1
}

export interface Edital {
  id: string;
  nome: string;
  banca: string;
  items: ItemEdital[];
}

export const EDITAIS: Edital[] = [
  {
    id: "pcsp-2026",
    nome: "PC-SP · Escrivão 2026",
    banca: "Vunesp",
    items: [
      { titulo: "Crimes contra a Administração Pública", disciplina: "Direito Penal", recorrencia: "9 de 10 provas", recorrenciaNum: 0.9 },
      { titulo: "Falsidade ideológica e documental", disciplina: "Direito Penal", recorrencia: "8 de 10 provas", recorrenciaNum: 0.8 },
      { titulo: "Teoria do crime — fato típico", disciplina: "Direito Penal", recorrencia: "7 de 10 provas", recorrenciaNum: 0.7 },
      { titulo: "Pacto de São José da Costa Rica", disciplina: "Direitos Humanos", recorrencia: "6 de 10 provas", recorrenciaNum: 0.6 },
      { titulo: "Sistema Interamericano de proteção", disciplina: "Direitos Humanos", recorrencia: "5 de 10 provas", recorrenciaNum: 0.5 },
      { titulo: "Interpretação de texto — coesão e coerência", disciplina: "Português", recorrencia: "10 de 10 provas", recorrenciaNum: 1.0 },
      { titulo: "Concordância verbal e nominal", disciplina: "Português", recorrencia: "8 de 10 provas", recorrenciaNum: 0.8 },
      { titulo: "Proposições compostas", disciplina: "Raciocínio Lógico", recorrencia: "9 de 10 provas", recorrenciaNum: 0.9 },
      { titulo: "Lei Maria da Penha", disciplina: "Legislação Especial", recorrencia: "6 de 10 provas", recorrenciaNum: 0.6 },
      { titulo: "Responsabilidade do fornecedor", disciplina: "Direito do Consumidor", recorrencia: "4 de 10 provas", recorrenciaNum: 0.4 },
    ],
  },
  {
    id: "prf-agente",
    nome: "PRF · Agente 2025",
    banca: "CESPE",
    items: [
      { titulo: "Crimes contra a Administração Pública", disciplina: "Direito Penal", recorrencia: "10 de 10 provas", recorrenciaNum: 1.0 },
      { titulo: "Teoria do crime — fato típico", disciplina: "Direito Penal", recorrencia: "9 de 10 provas", recorrenciaNum: 0.9 },
      { titulo: "Declaração Universal — art. 5º", disciplina: "Direitos Humanos", recorrencia: "8 de 10 provas", recorrenciaNum: 0.8 },
      { titulo: "Proposições compostas", disciplina: "Raciocínio Lógico", recorrencia: "9 de 10 provas", recorrenciaNum: 0.9 },
      { titulo: "Crimes de trânsito — CTB", disciplina: "Legislação Especial", recorrencia: "7 de 10 provas", recorrenciaNum: 0.7 },
      { titulo: "Interpretação de texto — coesão e coerência", disciplina: "Português", recorrencia: "10 de 10 provas", recorrenciaNum: 1.0 },
      { titulo: "Regência verbal e crase", disciplina: "Português", recorrencia: "7 de 10 provas", recorrenciaNum: 0.7 },
    ],
  },
  {
    id: "pmsp-soldado",
    nome: "PM-SP · Soldado 2026",
    banca: "Vunesp",
    items: [
      { titulo: "Falsidade ideológica e documental", disciplina: "Direito Penal", recorrencia: "8 de 10 provas", recorrenciaNum: 0.8 },
      { titulo: "Estatuto do Desarmamento", disciplina: "Legislação Especial", recorrencia: "7 de 10 provas", recorrenciaNum: 0.7 },
      { titulo: "Práticas abusivas e publicidade enganosa", disciplina: "Direito do Consumidor", recorrencia: "5 de 10 provas", recorrenciaNum: 0.5 },
      { titulo: "Declaração Universal — art. 5º", disciplina: "Direitos Humanos", recorrencia: "6 de 10 provas", recorrenciaNum: 0.6 },
      { titulo: "Equivalências lógicas", disciplina: "Raciocínio Lógico", recorrencia: "8 de 10 provas", recorrenciaNum: 0.8 },
      { titulo: "Pontuação", disciplina: "Português", recorrencia: "7 de 10 provas", recorrenciaNum: 0.7 },
    ],
  },
];
