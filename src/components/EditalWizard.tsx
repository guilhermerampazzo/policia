"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EDITAIS } from "@/lib/edital";
import { Icon } from "./icons";

interface Item {
  titulo: string;
  disciplina: string;
  recorrencia: string;
  recorrenciaNum: number;
  nivel: "alta" | "media" | "baixa";
  novo: boolean;
  estudado: boolean;
}

export default function EditalWizard({ alunos }: { alunos: { id: string; name: string }[] }) {
  const router = useRouter();
  const [editalId, setEditalId] = useState(EDITAIS[0].id);
  const [alunoId, setAlunoId] = useState(alunos[0]?.id ?? "");
  const [carregando, setCarregando] = useState(false);
  const [publicando, setPublicando] = useState(false);
  const [resultado, setResultado] = useState<{ nome: string; banca: string } | null>(null);
  const [itens, setItens] = useState<Item[] | null>(null);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  const edital = EDITAIS.find((e) => e.id === editalId);

  async function gerar() {
    setCarregando(true);
    setMsg(null);
    setItens(null);
    setResultado(null);
    try {
      const res = await fetch("/api/admin/edital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editalId, alunoId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Falha ao gerar.");
      setResultado({ nome: json.edital.nome, banca: json.edital.banca });
      setItens(json.resultados);
      setSelecionados(new Set(json.resultados.filter((i: Item) => i.novo).slice(0, 3).map((i: Item) => i.titulo)));
    } catch (e) {
      setMsg({ tipo: "erro", texto: (e as Error).message });
    } finally {
      setCarregando(false);
    }
  }

  async function publicar() {
    setPublicando(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/edital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editalId, alunoId, publicar: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Falha ao publicar.");
      setMsg({ tipo: "ok", texto: `${json.publicados} meta(s) publicada(s) para o aluno. O plano já aparece no painel do aluno.` });
      router.refresh();
    } catch (e) {
      setMsg({ tipo: "erro", texto: (e as Error).message });
    } finally {
      setPublicando(false);
    }
  }

  return (
    <div className="grid-2-wide">
      <div className="card">
        <h3 style={{ fontSize: "1rem", marginBottom: 16 }}>1 · Configuração</h3>
        <div className="field" style={{ marginBottom: 14 }}>
          <label className="label">Edital bruto (amostra da prévia)</label>
          <select className="select" value={editalId} onChange={(e) => setEditalId(e.target.value)}>
            {EDITAIS.map((e) => (
              <option key={e.id} value={e.id}>{e.nome} — {e.banca}</option>
            ))}
          </select>
        </div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label className="label">Comparar com o conteúdo estudado de</label>
          <select className="select" value={alunoId} onChange={(e) => setAlunoId(e.target.value)}>
            {alunos.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label className="label">Recorrência histórica da banca</label>
          <div className="tag tag-ember" style={{ alignSelf: "flex-start" }}>{edital?.banca} · últimos 5 anos</div>
        </div>
        <div className="field" style={{ marginBottom: 20 }}>
          <label className="label">Processamento</label>
          <div style={{ display: "flex", gap: 8 }}>
            <span className="tag tag-ember">IA do mentor</span>
          </div>
        </div>
        <button className="btn btn-ember" style={{ width: "100%", justifyContent: "center" }} onClick={gerar} disabled={carregando || !alunoId}>
          <Icon name="spark" size={16} />
          {carregando ? "Gerando…" : "Gerar verticalizado"}
        </button>
      </div>

      <div>
        {!resultado && !msg && (
          <div className="card card-flat" style={{ textAlign: "center", padding: 60, color: "var(--ink-faint)" }}>
            Configure o edital e clique em gerar para ver o resultado da verticalização.
          </div>
        )}

        {resultado && (
          <div className="card card-ember" style={{ marginBottom: 14 }}>
            <span className="eyebrow" style={{ color: "var(--ember-400)" }}>Resultado — {resultado.nome}</span>
            <p style={{ marginTop: 8, fontSize: ".86rem", color: "var(--ink-dim)" }}>
              A IA cruzou o edital com o que o aluno já estudou e priorizou por recorrência da banca.
            </p>
            {itens && (
              <div style={{ display: "flex", gap: 22, marginTop: 12, flexWrap: "wrap" }}>
                <div><b style={{ fontSize: "1.4rem", fontFamily: "var(--font-display)" }}>{itens.filter((i) => i.novo).length}</b> <span style={{ fontSize: ".7rem", color: "var(--ink-dim)" }}>tópicos novos</span></div>
                <div><b style={{ fontSize: "1.4rem", fontFamily: "var(--font-display)", color: "var(--ember-400)" }}>{itens.filter((i) => i.estudado).length}</b> <span style={{ fontSize: ".7rem", color: "var(--ink-dim)" }}>já dominados</span></div>
                <div><b style={{ fontSize: "1.4rem", fontFamily: "var(--font-display)" }}>{itens.filter((i) => i.nivel === "alta").length}</b> <span style={{ fontSize: ".7rem", color: "var(--ink-dim)" }}>alta recorrência</span></div>
              </div>
            )}
          </div>
        )}

        {itens && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {itens.map((item, idx) => {
              const checked = selecionados.has(item.titulo);
              return (
                <div key={idx} className="card" style={{ padding: 16, opacity: item.estudado ? 0.55 : 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <span className="tag" style={item.nivel === "alta" ? { color: "var(--danger)", borderColor: "rgba(255,107,94,.45)" } : item.nivel === "media" ? { color: "var(--warn)", borderColor: "rgba(240,177,66,.45)" } : undefined}>
                        {item.estudado ? "já dominado" : item.nivel === "alta" ? "alta recorrência" : item.nivel === "media" ? "recorrência média" : "recorrência baixa"}
                      </span>
                      <h4 style={{ fontSize: "1rem", margin: ".5em 0 .2em" }}>{item.titulo}</h4>
                      <span style={{ fontSize: ".74rem", color: "var(--ink-faint)" }}>
                        {item.disciplina} · cobrado em {item.recorrencia}
                      </span>
                    </div>
                    {!item.estudado && (
                      <button
                        className={`btn ${checked ? "btn-ember" : "btn-line"} btn-sm`}
                        onClick={() => {
                          const next = new Set(selecionados);
                          if (checked) next.delete(item.titulo);
                          else next.add(item.titulo);
                          setSelecionados(next);
                        }}
                      >
                        {checked ? <Icon name="check" size={14} /> : <Icon name="plus" size={14} />}
                        {checked ? "Selecionada" : "Selecionar"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {itens && (
          <button className="btn btn-ember" style={{ width: "100%", justifyContent: "center" }} onClick={publicar} disabled={publicando || selecionados.size === 0}>
            {publicando ? "Publicando…" : `Publicar ${selecionados.size} meta(s) selecionada(s) para o aluno →`}
          </button>
        )}

        {msg && (
          <p style={{ marginTop: 12, fontSize: ".84rem", color: msg.tipo === "ok" ? "var(--ok)" : "var(--danger)" }}>{msg.texto}</p>
        )}
      </div>
    </div>
  );
}
