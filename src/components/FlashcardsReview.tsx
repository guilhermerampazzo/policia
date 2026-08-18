"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "./icons";

type Card = {
  id: string;
  pergunta: string;
  resposta: string;
  repeticoes: number;
  proximaRevisao: string;
  disciplina: string;
  topico: string;
  image: string;
};

export default function FlashcardsReview({ cards: initialCards }: { cards: Card[] }) {
  const [cards, setCards] = useState(initialCards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [filter, setFilter] = useState<"todos" | "devidas">("todos");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const dueCards = useMemo(() => cards.filter((card) => new Date(card.proximaRevisao).getTime() <= Date.now()), [cards]);
  const visible = filter === "devidas" ? dueCards : cards;
  const current = visible[index] ?? null;
  const reviewed = cards.filter((card) => card.repeticoes > 0).length;

  useEffect(() => {
    if (index >= visible.length) setIndex(Math.max(0, visible.length - 1));
  }, [index, visible.length]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!current || saving) return;
      if (event.key === " " || event.key === "Enter") { event.preventDefault(); setFlipped((value) => !value); }
      if (event.key.toLowerCase() === "1") void review(false);
      if (event.key.toLowerCase() === "2") void review(true);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function move(direction: -1 | 1) {
    if (!visible.length) return;
    setIndex((value) => (value + direction + visible.length) % visible.length);
    setFlipped(false);
    setMessage("");
  }

  async function review(acertou: boolean) {
    if (!current || saving) return;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`/api/flashcard/${current.id}/revisar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acertou }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Não foi possível registrar a revisão.");
      const updated = data.flashcard;
      setCards((items) => items.map((item) => item.id === current.id ? { ...item, repeticoes: updated.repeticoes, proximaRevisao: updated.proximaRevisao } : item));
      setFlipped(false);
      setMessage(acertou ? "Acerto registrado. O intervalo aumentou." : "Tudo bem: este card volta amanhã.");
      if (filter === "devidas" && acertou) setIndex((value) => Math.min(value, Math.max(0, dueCards.length - 2)));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao registrar revisão.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flashcard-review-shell">
      <div className="flashcard-toolbar">
        <div><span className="eyebrow">Catálogo de memória</span><strong>{cards.length} cards · {dueCards.length} para hoje</strong></div>
        <div className="flashcard-filter" role="group" aria-label="Filtrar flashcards">
          <button className={filter === "todos" ? "active" : ""} type="button" onClick={() => { setFilter("todos"); setIndex(0); setFlipped(false); }}>Todos</button>
          <button className={filter === "devidas" ? "active" : ""} type="button" onClick={() => { setFilter("devidas"); setIndex(0); setFlipped(false); }}>Para hoje</button>
        </div>
      </div>

      {current ? (
        <>
          <div className="flashcard-rail-wrap">
            <button className="flashcard-arrow" type="button" aria-label="Flashcard anterior" onClick={() => move(-1)}><Icon name="chevron" size={22} /></button>
            <button
              type="button"
              className={`flashcard-face ${flipped ? "is-flipped" : ""}`}
              style={{ backgroundImage: `url('${current.image}')` }}
              onClick={() => setFlipped((value) => !value)}
              aria-label={flipped ? "Resposta do flashcard. Clique para voltar à pergunta." : "Pergunta do flashcard. Clique para revelar a resposta."}
            >
              <span className="flashcard-face-overlay" />
              <span className="flashcard-face-meta"><span className="tag tag-ember">{current.disciplina}</span><span>{index + 1} / {visible.length}</span></span>
              <span className="flashcard-face-label">{flipped ? "RESPOSTA" : "PERGUNTA"}</span>
              <strong>{flipped ? current.resposta : current.pergunta}</strong>
              <span className="flashcard-face-hint">{flipped ? "Clique ou pressione espaço para voltar" : "Clique ou pressione espaço para revelar"}</span>
            </button>
            <button className="flashcard-arrow" type="button" aria-label="Próximo flashcard" onClick={() => move(1)}><Icon name="chevron" size={22} /></button>
          </div>
          <div className="flashcard-review-controls">
            <button className="btn btn-line" type="button" disabled={saving} onClick={() => review(false)}><Icon name="refresh" size={16} /> Novamente <kbd>1</kbd></button>
            <button className="btn btn-ember" type="button" disabled={saving} onClick={() => review(true)}><Icon name="check" size={16} /> Acertei <kbd>2</kbd></button>
          </div>
          <p className="flashcard-status" aria-live="polite">{message || `Repetições deste card: ${current.repeticoes} · ${current.topico}`}</p>
        </>
      ) : (
        <div className="card flashcard-empty">
          <span className="hex flashcard-empty-mark"><Icon name="check" size={24} /></span>
          <h2>{filter === "devidas" ? "Nenhuma revisão para hoje" : "Seu catálogo está vazio"}</h2>
          <p>{filter === "devidas" ? "Você está em dia. Volte quando o próximo intervalo chegar." : "Registre erros no caderno e transforme cada ponto de atenção em um flashcard."}</p>
        </div>
      )}

      <div className="flashcard-progress-row" aria-label="Progresso do catálogo">
        <div><span>DOMÍNIO DO CATÁLOGO</span><strong>{cards.length ? Math.round((reviewed / cards.length) * 100) : 0}%</strong></div>
        <div className="progress"><span style={{ width: `${cards.length ? (reviewed / cards.length) * 100 : 0}%` }} /></div>
        <small>O intervalo cresce quando você acerta e retorna ao início quando precisa rever.</small>
      </div>
    </div>
  );
}
