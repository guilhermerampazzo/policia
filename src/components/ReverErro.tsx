"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";

export default function ReverErro({ erroId }: { erroId: string }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  return (
    <button
      className="btn btn-ember btn-sm"
      disabled={ok}
      onClick={async () => {
        const res = await fetch(`/api/erro/${erroId}/rever`, { method: "POST" });
        if (res.ok) {
          setOk(true);
          router.refresh();
        }
      }}
    >
      <Icon name="check" size={14} />
      {ok ? "Revisto" : "Revisar agora"}
    </button>
  );
}
