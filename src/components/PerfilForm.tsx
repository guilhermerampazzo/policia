"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";

export default function PerfilForm({
  user,
}: {
  user: { name: string; concursoAlvo: string | null; banca: string | null; dataProva: Date | null };
}) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [concurso, setConcurso] = useState(user.concursoAlvo ?? "");
  const [banca, setBanca] = useState(user.banca ?? "");
  const [dataProva, setDataProva] = useState(user.dataProva ? new Date(user.dataProva).toISOString().slice(0, 10) : "");
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    const res = await fetch("/api/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, concursoAlvo: concurso || null, banca: banca || null, dataProva: dataProva || null }),
    });
    setSalvando(false);
    if (res.ok) router.refresh();
  }

  return (
    <form className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }} onSubmit={salvar}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Icon name="user" size={16} style={{ color: "var(--ember-400)" }} />
        <h3 style={{ fontSize: "1rem" }}>Dados do perfil</h3>
      </div>
      <div className="field">
        <label className="label">Nome</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="grid-2" style={{ gap: 12 }}>
        <div className="field">
          <label className="label">Concurso alvo</label>
          <input className="input" value={concurso} onChange={(e) => setConcurso(e.target.value)} />
        </div>
        <div className="field">
          <label className="label">Banca</label>
          <input className="input" value={banca} onChange={(e) => setBanca(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label className="label">Data da prova</label>
        <input className="input" type="date" value={dataProva} onChange={(e) => setDataProva(e.target.value)} />
      </div>
      <button className="btn btn-ember" type="submit" disabled={salvando} style={{ alignSelf: "flex-start" }}>
        {salvando ? "Salvando…" : "Salvar alterações"}
      </button>
    </form>
  );
}
