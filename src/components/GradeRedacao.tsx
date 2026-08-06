"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GradeRedacao({ id }: { id: string }) {
  const router = useRouter();
  const [nota, setNota] = useState(80);
  const [salvando, setSalvando] = useState(false);

  return (
    <form
      style={{ display: "flex", gap: 8, alignItems: "center" }}
      onSubmit={async (e) => {
        e.preventDefault();
        setSalvando(true);
        await fetch(`/api/admin/redacao/${id}/corrigir`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nota }),
        });
        setSalvando(false);
        router.refresh();
      }}
    >
      <input
        type="number"
        min={0}
        max={100}
        value={nota}
        onChange={(e) => setNota(Number(e.target.value))}
        className="input"
        style={{ width: 80, padding: "0.5em 0.7em" }}
      />
      <button className="btn btn-ember btn-sm" disabled={salvando}>
        {salvando ? "…" : "Corrigir"}
      </button>
    </form>
  );
}
