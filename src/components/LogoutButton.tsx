"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "./icons";

export default function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  return (
    <button
      className="btn btn-line btn-sm"
      disabled={saindo}
      style={compact ? { padding: "0.5em", borderRadius: 8 } : undefined}
      onClick={async () => {
        setSaindo(true);
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/entrar");
      }}
      title="Sair"
    >
      <Icon name="logout" size={15} />
      {!compact && "Sair"}
    </button>
  );
}
