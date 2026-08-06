"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";

export default function NovoTopicoForm() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [corpo, setCorpo] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (titulo.trim().length < 3 || corpo.trim().length < 3) return;
    setEnviando(true);
    const res = await fetch("/api/forum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: titulo.trim(), corpo: corpo.trim() }),
    });
    if (res.ok) {
      setTitulo("");
      setCorpo("");
      setAberto(false);
      router.refresh();
    }
    setEnviando(false);
  }

  if (!aberto) {
    return (
      <button className="btn btn-ember" onClick={() => setAberto(true)}>
        <Icon name="plus" size={16} /> Criar tópico
      </button>
    );
  }

  return (
    <form className="card card-ember" style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }} onSubmit={enviar}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>Novo tópico no fórum</strong>
        <button type="button" style={{ color: "var(--ink-faint)", fontSize: ".8rem" }} onClick={() => setAberto(false)}>fechar ✕</button>
      </div>
      <input className="input" placeholder="Título do tópico" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      <textarea className="textarea" placeholder="O que você quer discutir com os outros alunos?" value={corpo} onChange={(e) => setCorpo(e.target.value)} />
      <button className="btn btn-ember" type="submit" disabled={enviando}>{enviando ? "Publicando…" : "Publicar"}</button>
    </form>
  );
}
