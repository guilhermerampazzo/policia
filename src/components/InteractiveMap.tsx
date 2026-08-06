"use client";

import { useState } from "react";
import type { ArvoreMental } from "@/lib/ai";
import MindMapView from "./MindMapView";

export default function InteractiveMap({ arvore }: { arvore: ArvoreMental }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div>
      <button className="btn btn-line btn-sm" onClick={() => setAberto((a) => !a)}>
        {aberto ? "Fechar versão interativa" : "Abrir versão interativa"}
      </button>
      {aberto && (
        <div style={{ marginTop: 12 }}>
          <MindMapView tree={arvore} height={480} />
        </div>
      )}
    </div>
  );
}
