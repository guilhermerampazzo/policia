"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";

export default function NovoErroForm({
  topicos,
}: {
  topicos: { id: string; titulo: string; disciplina: string }[];
}) {
  const router = useRouter();
  const [topicoId, setTopicoId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [revisaoDias, setRevisaoDias] = useState(10);
  const [aberto, setAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!topicoId || descricao.trim().length < 3) return;
    setEnviando(true);
    const res = await fetch("/api/erro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicoId, descricao, revisaoDias }),
    });
    if (res.ok) {
      setTopicoId("");
      setDescricao("");
      setAberto(false);
      router.refresh();
    }
    setEnviando(false);
  }

  if (!aberto) {
    return (
      <button className="btn btn-line" style={{ borderStyle: "dashed", width: "100%", justifyContent: "center" }} onClick={() => setAberto(true)}>
        <Icon name="plus" size={16} /> Registrar novo erro
      </button>
    );
  }

  return (
    <form className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }} onSubmit={enviar}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <strong style={{ fontSize: ".95rem" }}>Registrar erro</strong>
        <button type="button" style={{ color: "var(--ink-faint)", fontSize: ".8rem" }} onClick={() => setAberto(false)}>fechar ✕</button>
      </div>
      <div className="field">
        <label className="label">Tópico</label>
        <select className="select" value={topicoId} onChange={(e) => setTopicoId(e.target.value)}>
          <option value="">Selecione o tópico…</option>
          {topicos.map((t) => (
            <option key={t.id} value={t.id}>{t.disciplina} — {t.titulo}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="label">O que você errou? (sua anotação)</label>
        <textarea className="textarea" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex.: confundi o conectivo 'ou' inclusivo com exclusivo na tabela-verdade…" />
      </div>
      <div className="field">
        <label className="label">Revisão espaçada em quantos dias?</label>
        <select className="select" value={revisaoDias} onChange={(e) => setRevisaoDias(Number(e.target.value))}>
          <option value={10}>10 dias</option>
          <option value={15}>15 dias</option>
          <option value={30}>30 dias</option>
        </select>
      </div>
      <button className="btn btn-ember" type="submit" disabled={enviando}>
        {enviando ? "Salvando…" : "Salvar erro"}
      </button>
    </form>
  );
}
