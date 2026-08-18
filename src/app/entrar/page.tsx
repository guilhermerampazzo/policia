"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function EntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(em: string, senha: string) {
    setErro("");
    setCarregando(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: em, password: senha }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.code === "ACCESS_EXPIRED") {
          router.push(`/acesso-encerrado${json.acessoAte ? `?ate=${encodeURIComponent(json.acessoAte)}` : ""}`);
          return;
        }
        throw new Error(json.error ?? "Falha ao entrar.");
      }
      router.push(json.role === "ADMIN" ? "/admin" : "/aluno");
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(900px 500px at 80% -10%, rgba(243,126,31,.14), transparent 55%), #08090b",
        padding: 24,
      }}
    >
      <style>{`
        .entrar-card{ width:100%; max-width:430px; }
        .divider{ display:flex; align-items:center; gap:12px; color:#6d7480; font-size:.72rem; margin:22px 0; }
        .divider::before,.divider::after{ content:""; flex:1; height:1px; background:rgba(255,255,255,.08); }
      `}</style>

      <div className="entrar-card rise">
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <img src="/logo/logo-horizontal.jpeg" alt="Mentoria Forja" style={{ height: 34, margin: "0 auto 14px" }} />
          <span className="eyebrow" style={{ justifyContent: "center" }}>Área restrita</span>
          <h1 style={{ fontSize: "1.7rem", marginTop: 10 }}>Entrar na Forja</h1>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              entrar(email.trim(), password);
            }}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div className="field">
              <label className="label" htmlFor="em">E-mail</label>
              <input
                id="em"
                className="input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="pw">Senha</label>
              <input
                id="pw"
                className="input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {erro && (
              <p style={{ color: "var(--danger)", fontSize: ".82rem" }}>{erro}</p>
            )}
            <button className="btn btn-ember" type="submit" disabled={carregando}>
              {carregando ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <div className="divider">acesso rápido da prévia</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              className="btn btn-line"
              disabled={carregando}
              onClick={() => entrar("admin@forja.com", "forja1234")}
            >
              <span className="hex" style={{ width: 20, height: 20, background: "linear-gradient(160deg,var(--ember-500),var(--ember-700))", fontSize: 10, color: "#fff" }}>G</span>
              Entrar como Mentor
            </button>
            <button
              className="btn btn-line"
              disabled={carregando}
              onClick={() => entrar("aluno@forja.com", "forja1234")}
            >
              <span className="hex" style={{ width: 20, height: 20, background: "linear-gradient(160deg,var(--ember-500),var(--ember-700))", fontSize: 10, color: "#fff" }}>R</span>
              Entrar como Aluno
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", color: "var(--ink-faint)", fontSize: ".74rem", marginTop: 18 }}>
          Prévia de demonstração · credenciais: admin@forja.com · aluno@forja.com — senha forja1234
        </p>
        <p style={{ textAlign: "center", marginTop: 8 }}>
          <Link href="/" style={{ color: "var(--ember-400)", fontSize: ".82rem" }}>← Voltar à landing</Link>
        </p>
      </div>
    </main>
  );
}
