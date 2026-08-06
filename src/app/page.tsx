import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="landing">
      <style>{`
        .landing{ background:#08090b; color:#f4f3ef; }
        .l-nav{ position:fixed; top:0; left:0; right:0; z-index:50;
          display:flex; align-items:center; justify-content:space-between;
          padding:18px 34px; backdrop-filter:blur(12px);
          background:rgba(8,9,11,.72); border-bottom:1px solid rgba(255,255,255,.06); }
        .l-nav .l-logo{ height:30px; }
        .l-nav-links{ display:flex; align-items:center; gap:28px; font-size:.86rem; color:#a7adb8; }
        .l-nav-links a:hover{ color:#fff; }
        .l-hero{ position:relative; min-height:100vh; display:flex; align-items:center;
          overflow:hidden; padding:120px 0 80px;
          background:
            radial-gradient(1100px 700px at 78% -10%, rgba(243,126,31,.16), transparent 60%),
            radial-gradient(800px 500px at -10% 30%, rgba(214,95,13,.08), transparent 55%),
            #08090b; }
        .l-hero::after{ content:""; position:absolute; inset:auto 0 0 0; height:280px;
          background:linear-gradient(180deg, transparent, #08090b); pointer-events:none; }
        .l-hero-inner{ position:relative; z-index:2; display:grid; grid-template-columns:1.05fr .95fr;
          gap:60px; align-items:center; width:100%; max-width:1240px; margin:0 auto; padding:0 30px; }
        .l-hero h1{ font-size:clamp(2.6rem,5.2vw,4.4rem); line-height:1.04; font-weight:600;
          letter-spacing:-0.01em; }
        .l-hero h1 .serif-em{ font-style:italic; color:var(--ember-400); }
        .l-sub{ color:#a7adb8; font-size:1.06rem; line-height:1.65; max-width:520px; margin:22px 0 30px; }
        .l-actions{ display:flex; gap:14px; flex-wrap:wrap; }
        .l-proof{ display:flex; gap:40px; margin-top:44px; border-top:1px solid rgba(255,255,255,.08); padding-top:26px; }
        .l-proof b{ font-family:var(--font-display); font-size:1.6rem; display:block; }
        .l-proof span{ font-size:.74rem; color:#6d7480; text-transform:uppercase; letter-spacing:.06em; }

        .mockup{ position:relative; }
        .mockup-frame{ border:1px solid rgba(255,255,255,.12); border-radius:20px; overflow:hidden;
          background:#0e1013; box-shadow:0 60px 120px -40px rgba(0,0,0,.8), 0 0 0 1px rgba(243,126,31,.06); }
        .mockup-bar{ display:flex; gap:6px; padding:12px 16px; border-bottom:1px solid rgba(255,255,255,.06); }
        .mockup-bar i{ width:10px; height:10px; border-radius:50%; display:block; }
        .mockup-body{ padding:18px; display:grid; grid-template-columns:150px 1fr; gap:16px; }
        .mockup-side{ display:flex; flex-direction:column; gap:7px; }
        .mockup-side span{ height:26px; border-radius:7px; background:rgba(255,255,255,.05); }
        .mockup-side span.on{ background:linear-gradient(135deg,var(--ember-500),var(--ember-700)); }
        .mockup-main{ display:flex; flex-direction:column; gap:12px; }
        .m-card{ border:1px solid rgba(255,255,255,.08); border-radius:12px; background:#16181e; padding:14px; }
        .m-card.alert{ background:rgba(240,177,66,.08); border-color:rgba(240,177,66,.35); }
        .m-row{ display:flex; justify-content:space-between; align-items:center; }
        .m-chip{ font-family:var(--font-mono); font-size:.58rem; letter-spacing:.1em; text-transform:uppercase;
          padding:4px 8px; border-radius:5px; border:1px solid rgba(243,126,31,.4); color:#ffc173; background:rgba(243,126,31,.1); }
        .m-progress{ height:6px; border-radius:99px; background:#23262d; overflow:hidden; margin-top:10px; }
        .m-progress span{ display:block; height:100%; background:linear-gradient(90deg,var(--ember-600),var(--ember-400)); border-radius:99px; }
        .m-week{ display:grid; grid-template-columns:repeat(5,1fr); gap:8px; margin-top:12px; }
        .m-week div{ height:56px; border-radius:8px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.06); }
        .m-week div.hot{ border-color:var(--ember-500); background:rgba(243,126,31,.12); }
        .mockup-glow{ position:absolute; inset:-40px; z-index:-1;
          background:radial-gradient(600px 300px at 50% 50%, rgba(243,126,31,.18), transparent 70%);
          filter:blur(20px); }

        .l-sec{ padding:110px 0; }
        .l-sec-inner{ max-width:1240px; margin:0 auto; padding:0 30px; }
        .l-sec h2{ font-size:clamp(1.9rem,3.4vw,2.9rem); font-weight:600; line-height:1.1; }
        .l-sec h2 .serif-em{ font-style:italic; color:var(--ember-400); }
        .l-lead{ color:#a7adb8; max-width:640px; margin-top:14px; line-height:1.65; }

        .steps{ display:grid; grid-template-columns:repeat(3,1fr); gap:22px; margin-top:48px; }
        .step{ border:1px solid rgba(255,255,255,.08); border-radius:16px; padding:26px; background:linear-gradient(180deg,#14161b,#0f1114); }
        .step .n{ font-family:var(--font-mono); color:var(--ember-400); font-size:.8rem; }
        .step h3{ font-size:1.3rem; margin:.5em 0 .6em; }
        .step p{ color:#a7adb8; font-size:.9rem; line-height:1.6; }

        .feats{ display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.08); border-radius:16px; overflow:hidden; margin-top:48px; }
        .feat{ background:#0f1114; padding:28px 26px; min-height:190px; transition:background 200ms ease; }
        .feat:hover{ background:#14161b; }
        .feat .num{ font-family:var(--font-mono); font-size:.74rem; color:var(--ember-400); }
        .feat h3{ font-size:1.15rem; margin:.55em 0 .5em; }
        .feat p{ color:#a7adb8; font-size:.88rem; line-height:1.6; }

        .l-adaptive{ border-radius:18px; padding:56px; position:relative; overflow:hidden;
          background:linear-gradient(150deg, rgba(243,126,31,.13), rgba(214,95,13,.04) 60%), #0f1114;
          border:1px solid var(--line-ember); }
        .l-adaptive .bars{ display:grid; grid-template-columns:1fr 1fr; gap:34px; margin-top:36px; align-items:end; }
        .bar-col{ display:flex; flex-direction:column; gap:9px; }
        .bar-row{ display:grid; grid-template-columns:150px 1fr 34px; gap:12px; align-items:center; font-size:.82rem; color:#c7ccd4; }
        .bar-track{ height:10px; border-radius:99px; background:#23262d; overflow:hidden; }
        .bar-track span{ display:block; height:100%; border-radius:99px; transition:width 800ms var(--ease-out); }

        .l-mentor{ display:grid; grid-template-columns:300px 1fr; gap:64px; align-items:center; }
        .l-mentor img{ border-radius:16px; box-shadow:0 40px 90px -30px rgba(0,0,0,.8); }
        .l-cta{ text-align:center; padding:120px 0 90px; position:relative;
          background:
            radial-gradient(700px 320px at 50% 110%, rgba(243,126,31,.22), transparent 70%), #08090b; }
        .l-cta h2{ font-size:clamp(1.9rem,3.6vw,3rem); line-height:1.08; }
        .l-footer{ border-top:1px solid rgba(255,255,255,.08); padding:26px 0; font-size:.78rem; color:#6d7480; }
        .l-footer-inner{ max-width:1240px; margin:0 auto; padding:0 30px; display:flex; justify-content:space-between; gap:14px; flex-wrap:wrap; }

        @media (max-width:1024px){
          .l-hero-inner{ grid-template-columns:1fr; }
          .mockup{ max-width:560px; }
          .steps, .feats, .l-adaptive .bars{ grid-template-columns:1fr; }
          .l-mentor{ grid-template-columns:1fr; gap:34px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="l-nav">
        <img src="/logo/logo-horizontal.jpeg" alt="Mentoria Forja" className="l-logo" />
        <div className="l-nav-links">
          <a href="#sistema">O sistema</a>
          <a href="#recursos">Recursos</a>
          <a href="#adaptativo">Semana adaptativa</a>
          <Link href="/entrar" className="btn btn-ember btn-sm">Entrar</Link>
        </div>
      </nav>

      {/* HERO */}
      <header className="l-hero">
        <div className="l-hero-inner">
          <div className="rise">
            <span className="eyebrow" style={{ color: "var(--ember-400)" }}>
              Mentoria para concursos policiais
            </span>
            <h1 style={{ marginTop: "18px" }}>
              Sua aprovação não nasce pronta.{" "}
              <span className="serif-em">Ela é forjada.</span>
            </h1>
            <p className="l-sub">
              Um método, um mentor, um único painel. A semana de estudo se adapta
              ao seu dia, aos seus erros e ao seu tempo — até o dia da prova.
            </p>
            <div className="l-actions">
              <Link href="/entrar" className="btn btn-ember btn-lg">Começar agora</Link>
              <a href="#sistema" className="btn btn-ghost btn-lg">Ver o sistema →</a>
            </div>
            <div className="l-proof">
              <div><b>1 meta</b><span>por dia — sem dispersão</span></div>
              <div><b>Adaptativo</b><span>aos seus erros reais</span></div>
              <div><b>+3-5 anos</b><span>de recorrência por banca</span></div>
            </div>
          </div>

          {/* MOCKUP */}
          <div className="mockup rise">
            <div className="mockup-glow" />
            <div className="mockup-frame">
              <div className="mockup-bar">
                <i style={{ background: "#ff6b5e" }} /><i style={{ background: "#f0b142" }} /><i style={{ background: "#3dd68c" }} />
              </div>
              <div className="mockup-body">
                <div className="mockup-side">
                  <span className="on" /><span /><span /><span />
                </div>
                <div className="mockup-main">
                  <div className="m-card alert">
                    <div className="m-row">
                      <span style={{ fontSize: ".72rem", color: "#f0b142", fontWeight: 600 }}>Você deixou 2 metas pendentes</span>
                      <span style={{ fontSize: ".62rem", color: "#6d7480" }}>SEG · TER</span>
                    </div>
                  </div>
                  <div className="m-card">
                    <div className="m-row">
                      <span className="m-chip">Direito Penal</span>
                      <span style={{ fontSize: ".66rem", color: "#6d7480" }}>45 MIN · VIDEOAULA + PDF</span>
                    </div>
                    <div style={{ fontWeight: 600, marginTop: 10, fontSize: ".92rem" }}>
                      Meta do dia — Crimes contra a fé pública
                    </div>
                    <div className="m-progress"><span style={{ width: "68%" }} /></div>
                  </div>
                  <div className="m-card">
                    <div className="m-row">
                      <span style={{ fontSize: ".72rem", color: "#a7adb8" }}>Sua semana</span>
                      <span className="m-chip">pomodoro 25:00</span>
                    </div>
                    <div className="m-week">
                      <div className="hot" /><div className="hot" /><div className="hot" /><div /><div />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* SISTEMA / 3 PASSOS */}
      <section className="l-sec" id="sistema" style={{ background: "#0a0b0d" }}>
        <div className="l-sec-inner">
          <span className="eyebrow">O sistema por trás do método</span>
          <h2 style={{ marginTop: "14px" }}>
            Três engrenagens que <span className="serif-em">giram por você</span> todos os dias.
          </h2>
          <div className="steps">
            <div className="step">
              <span className="n">01 · ANAMNESE</span>
              <h3>O sistema pergunta antes de planejar</h3>
              <p>
                No primeiro acesso, o aluno responde: quantas horas por dia,
                quais disciplinas trazem mais dificuldade, qual banca e qual o
                prazo até a prova.
              </p>
            </div>
            <div className="step">
              <span className="n">02 · SEMANA ADAPTATIVA</span>
              <h3>O plano se adapta aos erros</h3>
              <p>
                Errou bastante em Direito Penal esta semana? A semana que vem
                recebe mais conteúdo de Direito Penal — sem pular a sequência do
                currículo.
              </p>
            </div>
            <div className="step">
              <span className="n">03 · REVISÃO INTELIGENTE</span>
              <h3>O caderno de erros trabalha sozinho</h3>
              <p>
                Cada erro vira revisão agendada que volta no dia certo. Na reta
                final, a revisão é só caderno de erros + questões.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="l-sec" id="recursos" style={{ paddingTop: "40px" }}>
        <div className="l-sec-inner">
          <span className="eyebrow">Recursos</span>
          <h2 style={{ marginTop: "14px" }}>Cada ferramenta existe para <span className="serif-em">um</span> propósito: te manter na meta certa.</h2>
          <div className="feats">
            <div className="feat"><span className="num">01</span><h3>Meta única do dia</h3><p>Ao entrar, o aluno vê exatamente a tarefa de hoje — nada mais. Pendências aparecem como alerta, nunca escondidas.</p></div>
            <div className="feat"><span className="num">02</span><h3>Pomodoro nativo</h3><p>Relógio de foco embutido no painel. Cada sessão vira horas reais no relatório de progressão.</p></div>
            <div className="feat"><span className="num">03</span><h3>Caderno de erros</h3><p>Cada erro vira anotação por disciplina e conteúdo, com revisão agendada automaticamente em 10, 15 dias.</p></div>
            <div className="feat"><span className="num">04</span><h3>Mapa mental por IA</h3><p>O mentor informa o conteúdo e a IA estrutura o mapa mental completo — pronto para revisar.</p></div>
            <div className="feat"><span className="num">05</span><h3>Relatório de progressão</h3><p>Horas, acertos, revisões e evolução do edital — o aluno e o mentor enxergam a curva real até a prova.</p></div>
            <div className="feat"><span className="num">06</span><h3>Painel do mentor</h3><p>Perfil completo de cada mentorado, anamnese, erros e simulação de cenários — uma central, sem planilhas.</p></div>
          </div>
        </div>
      </section>

      {/* ADAPTATIVO */}
      <section className="l-sec" id="adaptativo">
        <div className="l-sec-inner">
          <div className="l-adaptive">
            <span className="eyebrow" style={{ color: "var(--ember-400)" }}>Semana adaptativa</span>
            <h2 style={{ marginTop: "14px" }}>
              Esta semana ele errou <span className="serif-em">Direito Penal</span>.
              <br />Semana que vem, o sistema direciona mais.
            </h2>
            <p className="l-lead">
              O motor pondera erros recentes + dificuldades declaradas + horas
              disponíveis para distribuir os dias da semana. O conteúdo segue a
              sequência do currículo — só o peso de cada disciplina muda.
            </p>
            <div className="bars">
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: ".66rem", letterSpacing: ".14em", color: "#6d7480", textTransform: "uppercase", marginBottom: 16 }}>Semana atual</div>
                {[
                  ["Português", 30, "#a7adb8"],
                  ["Direito Penal", 34, "#ffa64d"],
                  ["Raciocínio Lógico", 22, "#9a7bf5"],
                  ["Direitos Humanos", 14, "#4aa8e8"],
                ].map(([n, w, c]) => (
                  <div className="bar-row" key={n as string}>
                    <span>{n}</span>
                    <div className="bar-track"><span style={{ width: `${w}%`, background: c as string }} /></div>
                    <b style={{ fontSize: ".78rem", color: "#c7ccd4" }}>{w}%</b>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: ".66rem", letterSpacing: ".14em", color: "#f37e1f", textTransform: "uppercase", marginBottom: 16 }}>Semana que vem →</div>
                {[
                  ["Português", 22, "#a7adb8"],
                  ["Direito Penal", 48, "#f37e1f"],
                  ["Raciocínio Lógico", 18, "#9a7bf5"],
                  ["Direitos Humanos", 12, "#4aa8e8"],
                ].map(([n, w, c]) => (
                  <div className="bar-row" key={n as string}>
                    <span>{n}</span>
                    <div className="bar-track"><span style={{ width: `${w}%`, background: c as string }} /></div>
                    <b style={{ fontSize: ".78rem", color: "#c7ccd4" }}>{w}%</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MENTOR */}
      <section className="l-sec" style={{ paddingTop: "20px" }}>
        <div className="l-sec-inner l-mentor">
          <img src="/img/mentor.jpeg" alt="Mentor Forja" />
          <div>
            <span className="eyebrow">Quem comanda a forja</span>
            <h2 style={{ marginTop: "14px" }}>Um mentor. Um método. Nenhum atalho.</h2>
            <p className="l-lead">
              Servidor público dedicado a bancas de concursos policiais. Produz o
              próprio material, elabora as próprias questões e constrói, para cada
              mentorado, um plano verticalizado — não um curso genérico revendido.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 26 }}>
              {["Conteúdo autoral, sem terceirização de método", "Turmas reduzidas — acompanhamento real", "Foco absoluto em bancas policiais"].map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: ".95rem" }}>
                  <span className="hex" style={{ width: 14, height: 14, background: "linear-gradient(160deg,var(--ember-500),var(--ember-700))" }} />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="l-cta">
        <div className="container">
          <h2>Sua vaga está sendo disputada agora.<br /><span className="serif-em">Comece a forjar a sua aprovação.</span></h2>
          <Link href="/entrar" className="btn btn-ember btn-lg" style={{ marginTop: 34 }}>Quero minha vaga na mentoria</Link>
        </div>
      </section>

      <footer className="l-footer">
        <div className="l-footer-inner">
          <span>© Mentoria Forja — plataforma em desenvolvimento. Conteúdo ilustrativo.</span>
          <span>Feito com método, para concurseiros sérios.</span>
        </div>
      </footer>
    </main>
  );
}
