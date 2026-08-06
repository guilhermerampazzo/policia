"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";

export interface SimAcao {
  acao: string;
  label: string;
  descricao?: string;
  payload?: Record<string, string | number>;
  destaque?: boolean;
}

export default function SimPanel({
  alunoId,
  acoes,
}: {
  alunoId: string | null;
  acoes: SimAcao[];
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [executando, setExecutando] = useState<string | null>(null);

  async function rodar(acao: SimAcao) {
    setExecutando(acao.acao);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/simulacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: acao.acao, alunoId: alunoId ?? undefined, ...acao.payload }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Falha na simulação.");
      setMsg({ tipo: "ok", texto: json.mensagem ?? "Simulação executada." });
      router.refresh();
    } catch (e) {
      setMsg({ tipo: "erro", texto: (e as Error).message });
    } finally {
      setExecutando(null);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {acoes.map((a) => (
          <div key={a.acao}>
            <button
              className={`btn ${a.destaque ? "btn-ember" : "btn-line"} sim-btn`}
              style={{ justifyContent: "flex-start" }}
              disabled={executando !== null}
              onClick={() => rodar(a)}
            >
              <Icon name="flask" size={15} />
              <span style={{ flex: 1, textAlign: "left" }}>{a.label}</span>
              {executando === a.acao && <span style={{ fontSize: ".72rem" }}>executando…</span>}
            </button>
            {a.descricao && <p style={{ fontSize: ".72rem", color: "var(--ink-faint)", marginTop: 6 }}>{a.descricao}</p>}
          </div>
        ))}
      </div>
      {msg && (
        <p style={{ marginTop: 12, fontSize: ".82rem", color: msg.tipo === "ok" ? "var(--ok)" : "var(--danger)" }}>
          {msg.texto}
        </p>
      )}
    </div>
  );
}
