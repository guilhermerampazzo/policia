"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";

type Content = {
  resumo: string;
  pontosChave: string[];
  armadilhas: string[];
  planoRevisao: string;
  origem?: string;
};

export default function ErrorStrategicActions({
  erroId,
  descricao,
  hasFlashcard,
  hasConteudo,
}: {
  erroId: string;
  descricao: string;
  hasFlashcard: boolean;
  hasConteudo: boolean;
}) {
  const router = useRouter();
  const [flashcard, setFlashcard] = useState(hasFlashcard);
  const [content, setContent] = useState<Content | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState<"flashcard" | "content" | "review" | null>(null);
  const [message, setMessage] = useState("");

  async function createFlashcard() {
    setBusy("flashcard");
    setMessage("");
    try {
      const response = await fetch("/api/flashcard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ erroId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Não foi possível criar o flashcard.");
      setFlashcard(true);
      setMessage("Flashcard pronto para revisão.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao criar flashcard.");
    } finally {
      setBusy(null);
    }
  }

  async function loadContent() {
    setBusy("content");
    setMessage("");
    try {
      const response = await fetch(`/api/erro/${erroId}/conteudo`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Não foi possível carregar o conteúdo.");
      setContent(data.conteudo);
      setExpanded(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao gerar conteúdo.");
    } finally {
      setBusy(null);
    }
  }

  async function review() {
    setBusy("review");
    setMessage("");
    try {
      const response = await fetch(`/api/erro/${erroId}/rever`, { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Não foi possível registrar a revisão.");
      setMessage("Erro marcado como revisado. O próximo intervalo foi agendado.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao registrar revisão.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="error-actions">
      <div className="error-actions-row">
        <button className={`btn btn-sm ${flashcard ? "btn-dark" : "btn-line"}`} type="button" disabled={busy !== null || flashcard} onClick={createFlashcard}>
          <Icon name="brain" size={14} />
          {flashcard ? "Flashcard criado" : busy === "flashcard" ? "Criando…" : "Gerar flashcard"}
        </button>
        <button className={`btn btn-sm ${hasConteudo || content ? "btn-dark" : "btn-line"}`} type="button" disabled={busy !== null} onClick={loadContent}>
          <Icon name="spark" size={14} />
          {busy === "content" ? "Gerando…" : content || hasConteudo ? "Abrir estratégia" : "Gerar estratégia"}
        </button>
        <button className="btn btn-ember btn-sm" type="button" disabled={busy !== null} onClick={review}>
          <Icon name="check" size={14} />
          {busy === "review" ? "Salvando…" : "Marcar revisado"}
        </button>
      </div>
      <p className="error-action-message" aria-live="polite">{message}</p>
      {expanded && content && (
        <div className="strategic-content" aria-label="Conteúdo estratégico do erro">
          <div className="strategic-content-head">
            <div><span className="eyebrow">Conteúdo estratégico</span><h4>O que levar para a próxima questão</h4></div>
            <button className="icon-button" type="button" aria-label="Fechar conteúdo estratégico" onClick={() => setExpanded(false)}>×</button>
          </div>
          <p className="strategic-summary">{content.resumo}</p>
          <div className="strategic-columns">
            <div><strong>Pontos-chave</strong><ul>{content.pontosChave.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div><strong>Armadilhas da banca</strong><ul>{content.armadilhas.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </div>
          <div className="strategic-plan"><strong>Plano de revisão</strong><span>{content.planoRevisao}</span></div>
          <span className="tag tag-ember">{content.origem === "ia" ? "gerado com IA" : "roteiro base Forja"}</span>
        </div>
      )}
      {!expanded && hasConteudo && <span className="tag tag-ok" style={{ marginTop: 6 }}>estratégia já disponível</span>}
      <span className="error-action-source">Anotação: {descricao}</span>
    </div>
  );
}
