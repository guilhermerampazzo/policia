"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "./icons";

export default function MetaAcoes({ topicoId, topicoTitulo }: { topicoId: string; topicoTitulo: string }) {
  const [resumo, setResumo] = useState<{ texto: string; origem: string } | null>(null);
  const [carregandoResumo, setCarregandoResumo] = useState(false);

  async function gerarResumo() {
    setCarregandoResumo(true);
    setResumo(null);
    try {
      const res = await fetch("/api/resumo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicoId }),
      });
      const json = await res.json();
      setResumo({ texto: json.resumo ?? "Sem resumo.", origem: json.origem ?? "" });
    } catch {
      setResumo({ texto: "Erro ao gerar resumo.", origem: "" });
    } finally {
      setCarregandoResumo(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="btn btn-line btn-sm" onClick={gerarResumo} disabled={carregandoResumo}>
          <Icon name="spark" size={15} />
          {carregandoResumo ? "Gerando…" : "Gerar resumo com IA"}
        </button>
        <Link href="/aluno/simulado" className="btn btn-line btn-sm">
          <Icon name="target" size={15} />
          Fazer exercícios
        </Link>
      </div>
      {resumo && (
        <div
          className="card card-ember"
          style={{ marginTop: 16, fontSize: ".9rem", lineHeight: 1.65 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Icon name="spark" size={15} style={{ color: "var(--ember-400)" }} />
            <span className="tag tag-ember">{resumo.origem === "ia" ? "Resumo gerado por IA" : "Resumo"}</span>
            <button
              style={{ marginLeft: "auto", color: "var(--ink-faint)", fontSize: ".78rem" }}
              onClick={() => setResumo(null)}
            >
              fechar ✕
            </button>
          </div>
          <p style={{ whiteSpace: "pre-wrap", color: "var(--ink-dim)" }}>
            {resumo.texto}
          </p>
        </div>
      )}
      <p style={{ fontSize: ".7rem", color: "var(--ink-faint)", marginTop: 8 }}>
        Conteúdo da meta: {topicoTitulo}
      </p>
    </div>
  );
}
