"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PASSOS = ["Disponibilidade", "Dificuldades", "Objetivo"];

const DIAS = [
  { v: 0, l: "Dom" },
  { v: 1, l: "Seg" },
  { v: 2, l: "Ter" },
  { v: 3, l: "Qua" },
  { v: 4, l: "Qui" },
  { v: 5, l: "Sex" },
  { v: 6, l: "Sáb" },
];

const FORMATOS = [
  { v: "video", l: "Videoaula" },
  { v: "pdf", l: "Material em PDF" },
  { v: "questoes", l: "Só questões" },
  { v: "misto", l: "Misto" },
];

export default function OnboardingForm({
  user,
  anamnese,
  disciplinas,
}: {
  user: { name: string; concursoAlvo: string | null; banca: string | null; dataProva: Date | null };
  anamnese: {
    horasPorDia: number;
    diasDisponiveis: number[];
    dificuldades: string[];
    formatoPreferido: string;
    objetivo: string;
  } | null;
  disciplinas: string[];
}) {
  const router = useRouter();
  const [passo, setPasso] = useState(0);
  const [horas, setHoras] = useState(anamnese?.horasPorDia ?? 3);
  const [dias, setDias] = useState<number[]>(anamnese?.diasDisponiveis ?? [1, 2, 3, 4, 5]);
  const [dificuldades, setDificuldades] = useState<string[]>(anamnese?.dificuldades ?? []);
  const [formato, setFormato] = useState(anamnese?.formatoPreferido ?? "video");
  const [objetivo, setObjetivo] = useState(anamnese?.objetivo ?? "PC-SP · Escrivão 2026");
  const [concurso, setConcurso] = useState(user.concursoAlvo ?? "PC-SP · Escrivão");
  const [banca, setBanca] = useState(user.banca ?? "Vunesp");
  const [dataProva, setDataProva] = useState(
    anamnese ? "" : user.dataProva ? new Date(user.dataProva).toISOString().slice(0, 10) : "",
  );
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  function toggleDia(v: number) {
    setDias((d) => (d.includes(v) ? d.filter((x) => x !== v) : [...d, v].sort()));
  }
  function toggleDificuldade(nome: string) {
    setDificuldades((d) => (d.includes(nome) ? d.filter((x) => x !== nome) : [...d, nome]));
  }

  async function salvar() {
    setEnviando(true);
    setErro("");
    try {
      const res = await fetch("/api/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concursoAlvo: concurso,
          banca,
          dataProva: dataProva || null,
          anamnese: {
            horasPorDia: horas,
            diasDisponiveis: dias,
            dificuldades,
            formatoPreferido: formato,
            objetivo,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Falha ao salvar.");
      router.push("/aluno");
      router.refresh();
    } catch (e) {
      setErro((e as Error).message);
      setEnviando(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <img src="/logo/logo-horizontal.jpeg" alt="Forja" style={{ height: 32, margin: "0 auto 16px" }} />
        <span className="eyebrow" style={{ justifyContent: "center" }}>Anamnese do aluno</span>
        <h1 style={{ fontSize: "1.8rem", marginTop: 10 }}>Antes de planejar, o sistema pergunta.</h1>
        <p style={{ color: "var(--ink-dim)", marginTop: 8, fontSize: ".92rem" }}>
          {user.name}, são 3 perguntas rápidas — o plano da semana é construído a partir delas.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 26 }}>
        {PASSOS.map((p, i) => (
          <span key={p} className="tag" style={i <= passo ? { color: "var(--ember-300)", borderColor: "var(--line-ember)" } : undefined}>
            {i + 1}. {p}
          </span>
        ))}
      </div>

      <div className="card" style={{ padding: 30 }}>
        {passo === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div>
              <label className="label" style={{ marginBottom: 10 }}>Quantas horas por dia você consegue estudar?</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[1, 2, 3, 4, 5, 6, 8].map((h) => (
                  <button key={h} type="button" className={`chip-opt ${horas === h ? "active" : ""}`} onClick={() => setHoras(h)}>
                    {h}h
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label" style={{ marginBottom: 10 }}>Quais dias da semana você estuda?</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {DIAS.map((d) => (
                  <button key={d.v} type="button" className={`chip-opt ${dias.includes(d.v) ? "active" : ""}`} onClick={() => toggleDia(d.v)}>
                    {d.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {passo === 1 && (
          <div>
            <label className="label" style={{ marginBottom: 10 }}>
              Quais disciplinas você sente mais dificuldade? <span style={{ color: "var(--ink-faint)", fontWeight: 400 }}>(o sistema dá mais peso a elas)</span>
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {disciplinas.map((nome) => (
                <button key={nome} type="button" className={`chip-opt ${dificuldades.includes(nome) ? "active" : ""}`} onClick={() => toggleDificuldade(nome)}>
                  {nome}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 22 }}>
              <label className="label" style={{ marginBottom: 10 }}>Formato de conteúdo preferido</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {FORMATOS.map((f) => (
                  <button key={f.v} type="button" className={`chip-opt ${formato === f.v ? "active" : ""}`} onClick={() => setFormato(f.v)}>
                    {f.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {passo === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="field">
              <label className="label">Concurso alvo</label>
              <input className="input" value={concurso} onChange={(e) => setConcurso(e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Banca</label>
              <input className="input" value={banca} onChange={(e) => setBanca(e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Data da prova (opcional)</label>
              <input className="input" type="date" value={dataProva} onChange={(e) => setDataProva(e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Seu objetivo nesta mentoria</label>
              <input className="input" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} />
            </div>
          </div>
        )}

        {erro && <p style={{ color: "var(--danger)", fontSize: ".84rem", marginTop: 14 }}>{erro}</p>}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, gap: 12 }}>
          {passo > 0 ? (
            <button className="btn btn-line" onClick={() => setPasso((p) => p - 1)}>← Voltar</button>
          ) : (
            <Link href="/aluno" className="btn btn-line">Pular por enquanto</Link>
          )}
          {passo < 2 ? (
            <button className="btn btn-ember" onClick={() => setPasso((p) => p + 1)}>Continuar →</button>
          ) : (
            <button className="btn btn-ember" disabled={enviando} onClick={salvar}>
              {enviando ? "Salvando…" : "Planejar minha semana"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
