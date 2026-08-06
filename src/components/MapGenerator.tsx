"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ArvoreMental } from "@/lib/ai";
import MindMapView from "./MindMapView";
import { Icon } from "./icons";

interface TopicoRow {
  label: string;
  children: string;
}

export default function MapGenerator({ disciplinas }: { disciplinas: { id: string; nome: string }[] }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [disciplinaId, setDisciplinaId] = useState(disciplinas[0]?.id ?? "");
  const [modo, setModo] = useState<"ia" | "manual">("ia");
  const [contexto, setContexto] = useState("");
  const [topicos, setTopicos] = useState<TopicoRow[]>([{ label: "", children: "" }]);
  const [carregando, setCarregando] = useState(false);
  const [arvore, setArvore] = useState<ArvoreMental | null>(null);
  const [imagem, setImagem] = useState<string | null>(null);
  const [verInterativo, setVerInterativo] = useState(false);
  const [origem, setOrigem] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  function gerar() {
    setCarregando(true);
    setMsg(null);
    setArvore(null);
    setImagem(null);
    setVerInterativo(false);
    const body =
      modo === "ia"
        ? { titulo, disciplinaId, modo, contexto }
        : {
            titulo,
            disciplinaId,
            modo,
            topicos: topicos.map((t) => ({
              label: t.label,
              children: t.children.split(",").map((c) => c.trim()).filter((c) => c.length > 0),
            })),
          };
    fetch("/api/admin/mapas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.ok) throw new Error(json.error ?? "Falha ao gerar.");
        setArvore(json.arvore);
        setImagem(json.imagem ?? null);
        setOrigem(json.origem);
        setMsg(`Mapa "${json.mapa.titulo}" gerado, salvo e publicado para os alunos.`);
        router.refresh();
      })
      .catch((e) => setMsg((e as Error).message))
      .finally(() => setCarregando(false));
  }

  return (
    <div className="grid-2-wide">
      <div className="card">
        <h3 style={{ fontSize: "1rem", marginBottom: 16 }}>Gerar mapa mental</h3>

        <div className="field" style={{ marginBottom: 14 }}>
          <label className="label">Título do mapa</label>
          <input className="input" placeholder="Ex.: Hierarquia das Normas — Direito Penal" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </div>

        <div className="field" style={{ marginBottom: 14 }}>
          <label className="label">Disciplina</label>
          <select className="select" value={disciplinaId} onChange={(e) => setDisciplinaId(e.target.value)}>
            {disciplinas.map((d) => (
              <option key={d.id} value={d.id}>{d.nome}</option>
            ))}
          </select>
        </div>

        <div className="field" style={{ marginBottom: 14 }}>
          <label className="label">Modo de geração</label>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className={`chip-opt ${modo === "ia" ? "active" : ""}`} onClick={() => setModo("ia")}>
              <Icon name="spark" size={13} /> IA (automática)
            </button>
            <button type="button" className={`chip-opt ${modo === "manual" ? "active" : ""}`} onClick={() => setModo("manual")}>
              Manual (determinístico)
            </button>
          </div>
        </div>

        {modo === "ia" ? (
          <div className="field">
            <label className="label">
              Contexto de conteúdo <span style={{ color: "var(--ink-faint)", fontWeight: 400 }}>(cole trecho do edital, da apostila ou descreva o tema)</span>
            </label>
            <textarea
              className="textarea"
              style={{ minHeight: 180 }}
              placeholder={"Ex.: Direito Penal — Teoria do crime. Fato típico: conduta, resultado, nexo causal, tipicidade. Culpabilidade: imputabilidade, potencial consciência da ilicitude, exigibilidade de conduta diversa…"}
              value={contexto}
              onChange={(e) => setContexto(e.target.value)}
            />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label className="label">Tópicos (cada linha = 1 ramo · children separados por vírgula)</label>
            {topicos.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input className="input" placeholder="Ramo (ex.: Constituição Federal)" value={t.label} onChange={(e) => {
                  const n = [...topicos];
                  n[i].label = e.target.value;
                  setTopicos(n);
                }} />
                <input className="input" placeholder="Sub-itens, separados por vírgula" value={t.children} onChange={(e) => {
                  const n = [...topicos];
                  n[i].children = e.target.value;
                  setTopicos(n);
                }} />
                <button className="btn btn-line btn-sm" onClick={() => setTopicos((x) => x.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
            <button className="btn btn-line btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => setTopicos((x) => [...x, { label: "", children: "" }])}>
              <Icon name="plus" size={14} /> Adicionar ramo
            </button>
          </div>
        )}

        <button className="btn btn-ember" style={{ width: "100%", justifyContent: "center", marginTop: 20 }} onClick={gerar} disabled={carregando || titulo.trim().length < 2}>
          <Icon name="spark" size={16} />
          {carregando ? "Gerando…" : "Gerar e publicar mapa"}
        </button>
        {msg && <p style={{ marginTop: 12, fontSize: ".82rem", color: msg.startsWith("Mapa") ? "var(--ok)" : "var(--danger)" }}>{msg}</p>}
        <p style={{ fontSize: ".7rem", color: "var(--ink-faint)", marginTop: 10 }}>
          {origem === "ia"
            ? "Gerado pela IA a partir do contexto informado."
            : origem === "texto"
              ? "IA indisponível — o mapa foi montado a partir do texto (determinístico)."
              : "Mapa montado manualmente (sem IA)."}
        </p>
      </div>

      <div>
        {imagem ? (
          <div>
            <div
              className="card"
              style={{
                padding: 12,
                background: "#fff",
                borderRadius: 14,
                overflow: "auto",
                maxHeight: 620,
                display: "flex",
                justifyContent: "center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagem}
                alt={`Mapa mental: ${titulo}`}
                style={{ width: "100%", height: "auto", borderRadius: 8, objectFit: "contain" }}
              />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
              <a className="btn btn-ember" download={`${titulo.replace(/[^\w\- ]+/g, "").trim() || "mapa"}.png`} href={imagem}>
                <Icon name="download" size={15} /> Baixar imagem (PNG)
              </a>
              {arvore && (
                <button className="btn btn-line btn-sm" style={{ alignSelf: "center" }} onClick={() => setVerInterativo((v) => !v)}>
                  {verInterativo ? "Ver imagem" : "Ver versão interativa"}
                </button>
              )}
            </div>
            {arvore && verInterativo && (
              <div style={{ marginTop: 14 }}>
                <MindMapView tree={arvore} height={480} />
              </div>
            )}
            <p style={{ fontSize: ".74rem", color: "var(--ink-faint)", marginTop: 10 }}>
              O mapa é gerado como imagem (PNG) no estilo de caderno de estudo. A versão interativa é um extra para revisão.
            </p>
          </div>
        ) : (
          <div className="card card-flat" style={{ textAlign: "center", padding: 60, color: "var(--ink-faint)" }}>
            Preencha o formulário e gere o mapa. A imagem gerada aparece aqui.
          </div>
        )}
      </div>
    </div>
  );
}
