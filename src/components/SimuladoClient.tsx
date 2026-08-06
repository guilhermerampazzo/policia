"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "./icons";

interface Questao {
  id: string;
  enunciado: string;
  altA: string;
  altB: string;
  altC: string;
  altD: string;
  altE: string;
  disciplina: { nome: string; cor: string };
  banca: string;
  dificuldade: string;
}

const LETRAS = ["A", "B", "C", "D", "E"];

export default function SimuladoClient() {
  const [questoes, setQuestoes] = useState<Questao[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [escolhida, setEscolhida] = useState<number | null>(null);
  const [resultado, setResultado] = useState<{ acerto: boolean; gabarito: number; comentario: string | null } | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [enviado, setEnviado] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setIdx(0);
    setEscolhida(null);
    setResultado(null);
    setAcertos(0);
    setTotal(0);
    setEnviado(false);
    const res = await fetch("/api/simulado");
    const json = await res.json();
    setQuestoes(json.questoes ?? []);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const q = questoes?.[idx];
  const alts = q ? [q.altA, q.altB, q.altC, q.altD, q.altE].filter((a) => a.trim() !== "") : [];

  async function responder(a: number) {
    if (!q || enviado) return;
    setEscolhida(a);
    setEnviado(true);
    const res = await fetch("/api/tentativa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questaoId: q.id, alternativa: a }),
    });
    const json = await res.json();
    setResultado({ acerto: json.acerto, gabarito: json.gabarito, comentario: json.comentario });
    if (json.acerto) setAcertos((x) => x + 1);
    setTotal((x) => x + 1);
  }

  function proxima() {
    if (!questoes) return;
    if (idx + 1 < questoes.length) {
      setIdx((i) => i + 1);
      setEscolhida(null);
      setResultado(null);
      setEnviado(false);
    } else {
      // fim
      setIdx(-1);
    }
  }

  if (carregando) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 60, color: "var(--ink-faint)" }}>
        Carregando questões…
      </div>
    );
  }

  if (questoes && questoes.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 50 }}>
        <h3>Nenhuma questão disponível.</h3>
        <p style={{ color: "var(--ink-dim)", marginTop: 8 }}>Peça ao mentor para cadastrar questões de demonstração.</p>
      </div>
    );
  }

  if (idx === -1 && questoes) {
    const taxa = total > 0 ? Math.round((acertos / total) * 100) : 0;
    return (
      <div className="card" style={{ textAlign: "center", padding: 48 }}>
        <span className="hex" style={{ width: 56, height: 56, background: "linear-gradient(160deg,var(--ember-500),var(--ember-700))", color: "#fff", fontSize: "1.3rem" }}>
          {taxa}%
        </span>
        <h2 style={{ margin: "18px 0 6px" }}>Sessão concluída</h2>
        <p style={{ color: "var(--ink-dim)" }}>
          Você acertou <strong style={{ color: "var(--ink)" }}>{acertos}</strong> de <strong style={{ color: "var(--ink)" }}>{total}</strong> questões.
        </p>
        <p style={{ fontSize: ".84rem", color: "var(--ink-faint)", marginTop: 6 }}>
          As respostas alimentam a semana adaptativa e o relatório de progressão.
        </p>
        <button className="btn btn-ember" style={{ marginTop: 24 }} onClick={carregar}>
          <Icon name="refresh" size={16} /> Nova sessão
        </button>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
        <span className="tag tag-ember">{q?.disciplina.nome}</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="tag">{q?.banca}</span>
          <span className="tag">{q?.dificuldade.toLowerCase()}</span>
        </div>
      </div>

      <p style={{ fontSize: "1.05rem", lineHeight: 1.55, fontWeight: 500, marginBottom: 24 }}>{q?.enunciado}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {alts.map((a, i) => {
          let estilo: React.CSSProperties = {};
          if (enviado && i === resultado?.gabarito) {
            estilo = { borderColor: "var(--ok)", background: "var(--ok-bg)", color: "#fff" };
          } else if (enviado && i === escolhida && !resultado?.acerto) {
            estilo = { borderColor: "var(--danger)", background: "var(--danger-bg)" };
          }
          return (
            <button
              key={i}
              className="btn btn-line"
              disabled={enviado}
              onClick={() => responder(i)}
              style={{ justifyContent: "flex-start", textAlign: "left", padding: "1em 1.2em", ...estilo }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 99,
                  border: "1px solid var(--line-strong)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: ".75rem",
                  fontFamily: "var(--font-mono)",
                  flexShrink: 0,
                }}
              >
                {LETRAS[i]}
              </span>
              <span style={{ lineHeight: 1.4 }}>{a}</span>
              {enviado && i === resultado?.gabarito && <Icon name="check" size={16} style={{ marginLeft: "auto", color: "var(--ok)" }} />}
            </button>
          );
        })}
      </div>

      {enviado && resultado && (
        <div className="card card-ember" style={{ marginTop: 20, fontSize: ".9rem", lineHeight: 1.6 }}>
          <strong style={{ color: resultado.acerto ? "var(--ok)" : "var(--danger)" }}>
            {resultado.acerto ? "Correto!" : "Errou — "}
          </strong>
          {!resultado.acerto && <>a correta era <strong>{LETRAS[resultado.gabarito]}</strong>. </>}
          {resultado.comentario && <span style={{ color: "var(--ink-dim)" }}>{resultado.comentario}</span>}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
        <span style={{ fontSize: ".78rem", color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>
          Questão {idx + 1} de {questoes?.length}
        </span>
        <button className="btn btn-ember btn-sm" onClick={proxima} disabled={!enviado}>
          {idx + 1 < (questoes?.length ?? 0) ? "Próxima →" : "Concluir sessão"}
        </button>
      </div>
    </div>
  );
}
