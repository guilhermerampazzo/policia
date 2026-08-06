"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "./icons";
import { fmtHora, fmtDataCurta } from "@/lib/dates";

interface Msg {
  id: string;
  texto: string;
  data: Date;
  autor: { id: string; name: string; role: string };
}
interface Conv {
  id: string;
  topico: string;
  aberta: boolean;
  criadoEm: Date;
  mensagens: Msg[];
  aluno: { id: string; name: string };
}

export default function ChatClient({
  conversas,
  eu,
}: {
  conversas: Conv[];
  eu: { id: string; name: string; role: string };
}) {
  const router = useRouter();
  const [selId, setSelId] = useState<string>(conversas[0]?.id ?? "");
  const [texto, setTexto] = useState("");
  const [novoTopico, setNovoTopico] = useState("");
  const [criando, setCriando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const sel = conversas.find((c) => c.id === selId) ?? conversas[0];

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim() || !sel) return;
    setEnviando(true);
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversaId: sel.id, texto: texto.trim() }),
    });
    setTexto("");
    setEnviando(false);
    router.refresh();
  }

  async function criarDuvida(e: React.FormEvent) {
    e.preventDefault();
    if (novoTopico.trim().length < 2) return;
    setCriando(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topico: novoTopico.trim(), texto: "Preciso de ajuda com este tópico." }),
    });
    const json = await res.json();
    setNovoTopico("");
    setCriando(false);
    if (json.ok) {
      setSelId(json.msg.conversaId);
      router.refresh();
    }
  }

  return (
    <div className="grid-300" style={{ gridTemplateColumns: "280px 1fr" }}>
      {/* lista */}
      <div className="card" style={{ padding: 8 }}>
        <form onSubmit={criarDuvida} style={{ padding: "10px 12px", display: "flex", gap: 8 }}>
          <input
            className="input"
            style={{ padding: "0.6em 0.8em", fontSize: ".8rem" }}
            placeholder="Nova dúvida…"
            value={novoTopico}
            onChange={(e) => setNovoTopico(e.target.value)}
          />
          <button className="btn btn-ember btn-sm" type="submit" disabled={criando}>
            <Icon name="plus" size={14} />
          </button>
        </form>
        <div style={{ padding: "4px 6px", fontSize: ".62rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>
          Dúvidas por tópico
        </div>
        {conversas.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelId(c.id)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              padding: "11px 12px",
              borderRadius: 9,
              background: sel?.id === c.id ? "var(--panel-3)" : "transparent",
              textAlign: "left",
            }}
          >
            <span style={{ fontWeight: 500, fontSize: ".86rem", color: sel?.id === c.id ? "#fff" : "var(--ink-dim)" }}>
              {c.topico}
            </span>
            <span className="tag" style={{ fontSize: ".58rem" }}>{c.aberta ? "aberta" : "fechada"}</span>
          </button>
        ))}
        {conversas.length === 0 && (
          <p style={{ padding: 18, fontSize: ".8rem", color: "var(--ink-faint)" }}>Nenhuma dúvida ainda.</p>
        )}
      </div>

      {/* thread */}
      <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 480 }}>
        {sel ? (
          <>
            <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: 14, marginBottom: 18, display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <span className="eyebrow" style={{ color: "var(--ember-400)" }}>Dúvida</span>
                <h2 style={{ fontSize: "1.15rem", marginTop: 4 }}>{sel.topico}</h2>
              </div>
              <span className="tag tag-ember">
                {eu.role === "ADMIN" ? `Aluno: ${sel.aluno.name}` : "Mentor Forja"}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
              {sel.mensagens.map((m) => {
                const minha = m.autor.id === eu.id;
                return (
                  <div key={m.id} style={{ maxWidth: "78%", alignSelf: minha ? "flex-end" : "flex-start" }}>
                    <div
                      style={{
                        background: minha ? "linear-gradient(160deg,var(--ember-500),var(--ember-600))" : "var(--panel-3)",
                        color: "#fff",
                        borderRadius: minha ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                        padding: "12px 15px",
                        fontSize: ".9rem",
                        lineHeight: 1.55,
                        border: minha ? "none" : "1px solid var(--line)",
                      }}
                    >
                      {m.texto}
                    </div>
                    <div
                      style={{
                        fontSize: ".66rem",
                        color: "var(--ink-faint)",
                        marginTop: 4,
                        textAlign: minha ? "right" : "left",
                      }}
                    >
                      {m.autor.name} · {fmtHora(new Date(m.data))} · {fmtDataCurta(new Date(m.data))}
                    </div>
                  </div>
                );
              })}
              {sel.mensagens.length === 0 && (
                <p style={{ color: "var(--ink-faint)", fontSize: ".84rem" }}>Sem mensagens ainda — comece a conversa.</p>
              )}
            </div>

            <form onSubmit={enviar} style={{ display: "flex", gap: 10, marginTop: 18, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
              <input
                className="input"
                placeholder={eu.role === "ADMIN" ? `Responder a ${sel.aluno.name}…` : "Responder ao mentor…"}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
              />
              <button className="btn btn-ember" type="submit" disabled={enviando || !texto.trim()}>
                <Icon name="send" size={15} /> Enviar
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: 60, color: "var(--ink-faint)" }}>
            Selecione ou crie uma dúvida para começar.
          </div>
        )}
      </div>
    </div>
  );
}
