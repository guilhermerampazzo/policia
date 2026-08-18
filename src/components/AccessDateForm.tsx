"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";

function dateInputValue(value: string | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

export default function AccessDateForm({
  alunoId,
  acessoAte,
}: {
  alunoId: string;
  acessoAte: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(dateInputValue(acessoAte));
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  async function save(clear = false) {
    setSaving(true);
    setFeedback(null);
    try {
      const response = await fetch(`/api/admin/alunos/${alunoId}/acesso`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acessoAte: clear ? null : value || null }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Não foi possível salvar o acesso.");
      setValue(dateInputValue(data.aluno?.acessoAte ?? null));
      setFeedback({ ok: true, text: clear ? "Acesso sem data de encerramento." : "Data de acesso atualizada." });
      router.refresh();
    } catch (error) {
      setFeedback({ ok: false, text: error instanceof Error ? error.message : "Falha ao salvar." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
        <div>
          <span className="eyebrow">Controle de acesso</span>
          <h2 style={{ marginTop: 6, fontSize: "1.05rem" }}>Data de encerramento</h2>
          <p style={{ marginTop: 6, color: "var(--ink-dim)", fontSize: ".78rem", lineHeight: 1.5 }}>
            O aluno continua com acesso enquanto a data não for atingida. Deixe em branco para acesso contínuo.
          </p>
        </div>
        <Icon name="calendar" size={19} style={{ color: "var(--ember-400)" }} />
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
        <div className="field" style={{ minWidth: 190, flex: "1 1 190px" }}>
          <label className="label" htmlFor="acesso-ate">Acesso válido até</label>
          <input
            id="acesso-ate"
            className="input"
            type="date"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-describedby="acesso-help"
          />
        </div>
        <button className="btn btn-ember btn-sm" type="button" disabled={saving} onClick={() => save()}>
          {saving ? "Salvando…" : "Salvar data"}
        </button>
        <button className="btn btn-line btn-sm" type="button" disabled={saving || !value} onClick={() => { setValue(""); void save(true); }}>
          Limpar data
        </button>
      </div>
      <p id="acesso-help" aria-live="polite" style={{ minHeight: 18, marginTop: 10, color: feedback?.ok ? "var(--ok)" : "var(--danger)", fontSize: ".75rem" }}>
        {feedback?.text ?? ""}
      </p>
    </div>
  );
}
