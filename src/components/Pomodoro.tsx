"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";

function fmtTempo(seg: number) {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Pomodoro({
  minutosHoje,
  onRegistrar,
}: {
  minutosHoje: number;
  onRegistrar?: (minutos: number) => void;
}) {
  const [foco, setFoco] = useState(25);
  const [pausa, setPausa] = useState(5);
  const [duracao, setDuracao] = useState(25 * 60);
  const [restante, setRestante] = useState(25 * 60);
  const [rodando, setRodando] = useState(false);
  const [emPausa, setEmPausa] = useState(false);
  const [msg, setMsg] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!rodando) return;
    intervalRef.current = setInterval(() => {
      setRestante((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current!);
          setRodando(false);
          if (!emPausa) {
            registrarSessao();
          } else {
            setMsg("Pausa concluída. Pronto para o próximo foco?");
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rodando, emPausa]);

  async function registrarSessao() {
    try {
      const res = await fetch("/api/pomodoro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutos: foco }),
      });
      if (res.ok) {
        onRegistrar?.(foco);
        setMsg(`Sessão de ${foco} min registrada no relatório.`);
      }
    } catch {
      setMsg("Não foi possível registrar a sessão.");
    }
  }

  function iniciarFoco() {
    setEmPausa(false);
    setDuracao(foco * 60);
    setRestante(foco * 60);
    setMsg("");
    setRodando(true);
  }

  function iniciarPausa() {
    setEmPausa(true);
    setDuracao(pausa * 60);
    setRestante(pausa * 60);
    setMsg("");
    setRodando(true);
  }

  function pausarOuRetomar() {
    setRodando((r) => !r);
  }

  function resetar() {
    setRodando(false);
    setEmPausa(false);
    setRestante(duracao);
    setMsg("");
  }

  const raio = 82;
  const circ = 2 * Math.PI * raio;
  const prog = duracao > 0 ? (restante / duracao) * circ : circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ position: "relative", width: 190, height: 190 }}>
        <svg width={190} height={190} viewBox="0 0 190 190">
          <circle cx={95} cy={95} r={raio} fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.08)" strokeWidth={9} />
          <circle
            cx={95}
            cy={95}
            r={raio}
            fill="none"
            stroke={emPausa ? "var(--ok)" : "var(--ember-500)"}
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ - prog}
            transform="rotate(-90 95 95)"
            style={{ transition: "stroke-dashoffset 900ms linear, stroke 300ms ease" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontFamily: "var(--font-display)", fontSize: "2.3rem", lineHeight: 1 }}>{fmtTempo(restante)}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: ".6rem", letterSpacing: ".14em", color: "var(--ink-faint)", textTransform: "uppercase", marginTop: 4 }}>
            {emPausa ? "pausa" : "foco"}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        {!rodando && !emPausa ? (
          <>
            <button className="btn btn-ember btn-sm" onClick={iniciarFoco}>
              <Icon name="play" size={15} /> Iniciar foco
            </button>
            <button className="btn btn-line btn-sm" onClick={iniciarPausa}>
              <Icon name="clock" size={15} /> Pausa
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-ember btn-sm" onClick={pausarOuRetomar}>
              <Icon name={rodando ? "clock" : "play"} size={15} />
              {rodando ? "Pausar" : "Continuar"}
            </button>
            <button className="btn btn-line btn-sm" onClick={resetar}>
              Reiniciar
            </button>
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: 14, alignItems: "center", fontSize: ".8rem", color: "var(--ink-dim)" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          Foco
          <input
            className="input"
            type="number"
            min={5}
            max={120}
            value={foco}
            onChange={(e) => {
              const v = Number(e.target.value) || 25;
              setFoco(Math.min(120, Math.max(5, v)));
            }}
            style={{ width: 60, padding: "0.4em 0.6em" }}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          Pausa
          <input
            className="input"
            type="number"
            min={1}
            max={30}
            value={pausa}
            onChange={(e) => {
              const v = Number(e.target.value) || 5;
              setPausa(Math.min(30, Math.max(1, v)));
            }}
            style={{ width: 60, padding: "0.4em 0.6em" }}
          />
        </label>
      </div>

      {msg && (
        <p style={{ fontSize: ".78rem", color: "var(--ok)", textAlign: "center" }}>{msg}</p>
      )}
      <p style={{ fontSize: ".76rem", color: "var(--ink-faint)" }}>
        Hoje: <b style={{ color: "var(--ink-dim)" }}>{minutosHoje} min</b> de foco registrados
      </p>
    </div>
  );
}
