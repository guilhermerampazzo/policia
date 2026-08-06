"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "./icons";

export default function ConcluirMeta({ metaId, label = "Marcar como concluída" }: { metaId: string; label?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      className="btn btn-ember"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const res = await fetch(`/api/meta/${metaId}/concluir`, { method: "POST" });
        if (res.ok) {
          router.refresh();
        } else {
          setLoading(false);
          alert("Não foi possível concluir a meta.");
        }
      }}
    >
      <Icon name="check" size={16} />
      {loading ? "Concluindo…" : label}
    </button>
  );
}
