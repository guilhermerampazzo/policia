"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";

export default function NovaRedacaoForm() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [tema, setTema] = useState("");
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (tema.trim().length < 3 || texto.trim().length < 10) return;
    setEnviando(true);
    const res = await fetch("/api/redacao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tema: tema.trim(), texto: texto.trim() }),
    });
    if (res.ok) {
      setTema("");
      setTexto("");
      setAberto(false);
      router.refresh();
    }
    setEnviando(false);
  }

  if (!aberto) {
    return (
      <button className="btn btn-ember" onClick={() => setAberto(true)}>
        <Icon name="plus" size={16} /> Nova redação
      </button>
    );
  }

  return (
    <form className="card card-ember" style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }} onSubmit={enviar}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>Nova redação</strong>
        <button type="button" style={{ color: "var(--ink-faint)", fontSize: ".8rem" }} onClick={() => setAberto(false)}>fechar ✕</button>
      </div>
      <input className="input" placeholder="Tema da redação" value={tema} onChange={(e) => setTema(e.target.value)} />
      <textarea className="textarea" style={{ minHeight: 220 }} placeholder="Escreva sua redação aqui…" value={texto} onChange={(e) => setTexto(e.target.value)} />
      <button className="btn btn-ember" type="submit" disabled={enviando}>{enviando ? "Enviando…" : "Enviar para o mentor"}</button>
    </form>
  );
}
