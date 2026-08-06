"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";

export default function ForumComentar({ topicoId }: { topicoId: string }) {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (texto.trim().length < 2) return;
    setEnviando(true);
    await fetch(`/api/forum/${topicoId}/comentar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: texto.trim() }),
    });
    setTexto("");
    setEnviando(false);
    router.refresh();
  }

  return (
    <form onSubmit={enviar} style={{ display: "flex", gap: 10, marginTop: 16 }}>
      <input className="input" placeholder="Comentar…" value={texto} onChange={(e) => setTexto(e.target.value)} />
      <button className="btn btn-ember btn-sm" type="submit" disabled={enviando || !texto.trim()}>
        <Icon name="send" size={14} /> Comentar
      </button>
    </form>
  );
}
