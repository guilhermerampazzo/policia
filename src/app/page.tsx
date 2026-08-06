import Link from "next/link";
import "./landing.css";
import Reveal from "@/components/Reveal";

export default function LandingPage() {
  return (
    <main className="landing">
      {/*
      THESIS: aprovação é treino direcionado, não volume aleatório — a landing vende o método
      como um campo de treino sob cronômetro; recusa o template de "landing de curso"
      (hero com mockup de navegador, grade de features em cards, depoimentos genéricos).
      OWN-WORLD: quase-preto de treino + giz branco, leitura de cronômetro em Space Mono,
      brasa como esforço ativo, hairline como linha de pista, chips HUD flutuantes (sem
      janelas simuladas), alvo concêntrico girando devagar atrás do herói.
      STORY: o concurseiro entende em segundos que existe um sistema de treino diário que
      se adapta aos erros dele; acredita porque vê os números do método e o painel real;
      age clicando no CTA.
      FIRST VIEWPORT: headline de impacto à esquerda + prova em números do método; à direita
      foto tática em duotone com chips reais do produto flutuando (meta do dia, peso da
      semana, revisão agendada); CTA primário acima da dobra; faixa de cronômetro abaixo.
      FORM: mundo "campo de treino sob cronômetro" (candidate 4; seed 3b4a3405).
      FINISH: unreviewed and undocumented is unfinished; this build ends with the finish
      review, the verdict, and DESIGN.md.
      */}

      {/* ======================= NAV ======================= */}
      <nav className="lp-nav">
        <img src="/logo/logo-horizontal.jpeg" alt="Mentoria Forja" className="lp-logo" />
        <div className="lp-nav-links">
          <a href="#metodo">Método</a>
          <a href="#produto">O painel</a>
          <a href="#edital">Bancas</a>
          <a href="#mentor">Mentor</a>
          <a href="#faq">Dúvidas</a>
          <Link href="/entrar" className="btn btn-ember btn-sm">Quero minha vaga</Link>
        </div>
      </nav>

      {/* ======================= HERO ======================= */}
      <header className="lp-hero">
        <div className="container-lp lp-hero-inner">
          <div>
            <span className="lp-kicker hero-in d1" style={{ display: "block" }}>
              Mentoria para concursos policiais
            </span>
            <h1 className="hero-in d2">
              Aprovado não é sorte.
              <br />
              É treino <span className="accent">certo, todos os dias.</span>
            </h1>
            <p className="lp-sub hero-in d3">
              A Forja monta a sua semana com uma única meta por dia, direciona mais conteúdo
              para onde você mais erra e agenda cada revisão no dia certo — até a prova.
            </p>
            <div className="lp-actions hero-in d4">
              <Link href="/entrar" className="btn btn-ember btn-lg">Começar minha preparação</Link>
              <a href="#metodo" className="btn btn-ghost btn-lg">Ver o método →</a>
            </div>
            <div className="lp-proof hero-in d5">
              <div>
                <span className="pv">01</span>
                <span>meta por dia — sem dispersão</span>
              </div>
              <div>
                <span className="pv">+10/+15</span>
                <span>dias — revisão espaçada automática</span>
              </div>
              <div>
                <span className="pv">3–5 anos</span>
                <span>de recorrência mapeada por banca</span>
              </div>
              <div>
                <span className="pv">Reduzida</span>
                <span>turma — acompanhamento real</span>
              </div>
            </div>
          </div>

          {/* visual: foto + chips HUD (sem janela simulada) */}
          <div className="lp-visual hero-in d3">
            <svg className="lp-alvo" viewBox="0 0 500 500" aria-hidden="true">
              <g className="anima">
                <circle cx="250" cy="250" r="200" />
                <circle cx="250" cy="250" r="150" />
                <circle cx="250" cy="250" r="100" />
                <path d="M250 20 V80 M250 420 V480 M20 250 H80 M420 250 H480" stroke="rgba(255,255,255,0.09)" />
              </g>
            </svg>
            <div className="lp-foto">
              <img src="/img/hero-tactical.jpg" alt="Preparação para concursos policiais" />
            </div>
            <div className="lp-chip c1">
              <span className="k">Meta do dia</span>
              <b><span className="ok" />Direito Penal — crimes contra a fé pública</b>
              <span className="t">45:00</span>
            </div>
            <div className="lp-chip c2">
              <span className="k">Semana adaptativa</span>
              <b>Direito Penal</b>
              <span className="t">peso +2.8× na próxima semana</span>
            </div>
            <div className="lp-chip c3">
              <span className="k">Erro registrado</span>
              <b>Revisão agendada automaticamente</b>
              <span className="t">+10 dias</span>
            </div>
          </div>
        </div>
      </header>

      {/* ======================= FAIXA CRONÔMETRO ======================= */}
      <div className="lp-chrono">
        <div className="lp-chrono-inner">
          <span className="ct"><b>1</b> META POR DIA</span>
          <span className="ct">REVISÃO <b>+10/+15</b> DIAS</span>
          <span className="ct">EDITAL VERTICALIZADO <b>POR BANCA</b></span>
          <span className="ct">TURMAS <b>REDUZIDAS</b></span>
        </div>
      </div>

      {/* ======================= DOR ======================= */}
      <section className="lp-sec lp-pain" style={{ paddingBottom: 60 }}>
        <div className="container-lp">
          <Reveal>
            <div className="lp-sec-head">
              <span className="lp-kicker">Antes do método, a verdade</span>
              <h2>Você reconhece <span className="accent">esse cenário?</span></h2>
            </div>
          </Reveal>
          <div style={{ marginTop: 44 }}>
            {[
              ["01", "Você estuda, estuda — e não sabe o que a banca cobra de verdade."],
              ["02", "Erra uma questão, diz que vai revisar — e nunca mais volta nela."],
              ["03", "Segunda-feira com cinco matérias abertas, sem prioridade, sem plano."],
              ["04", "Faltam 30 dias para a prova e não existe uma revisão estruturada."],
            ].map(([n, t]) => (
              <Reveal key={n}>
                <div className="lp-pain-row">
                  <span className="n">{n}</span>
                  <p>{t}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= MÉTODO ======================= */}
      <section className="lp-sec" id="metodo" style={{ paddingTop: 60 }}>
        <div className="container-lp">
          <Reveal>
            <div className="lp-sec-head">
              <span className="lp-kicker">O treino em 3 movimentos</span>
              <h2>Um sistema que <span className="accent">treina com você.</span></h2>
              <p className="lp-lead">
                Nada de curso gravado largado em uma plataforma. A Forja é um plano de treino
                vivo: pergunta, planeja, corrige a rota com os seus erros e agenda a revisão.
              </p>
            </div>
          </Reveal>
          <div style={{ marginTop: 40 }}>
            <Reveal>
              <div className="lp-method-row">
                <span className="n">01 · Aquecimento</span>
                <h3>Anamnese</h3>
                <p>
                  Antes de montar o plano, o sistema pergunta: quantas horas por dia, quais dias,
                  quais dificuldades, qual banca. O treino começa do seu tempo real — não de um
                  cronograma genérico.
                </p>
              </div>
            </Reveal>
            <Reveal>
              <div className="lp-method-row">
                <span className="n">02 · Série principal</span>
                <h3>Semana adaptativa</h3>
                <p>
                  Uma meta por dia, nada além. E quando você erra bastante em Direito Penal, a
                  semana seguinte pesa mais Direito Penal — sem nunca pular a sequência do
                  conteúdo.
                </p>
              </div>
            </Reveal>
            <Reveal>
              <div className="lp-method-row">
                <span className="n">03 · Recuperação</span>
                <h3>Revisão espaçada</h3>
                <p>
                  Todo erro registrado volta no dia certo (+10/+15 dias), até virar acerto
                  automático. Na reta final, a revisão é só o seu caderno de erros.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ======================= PRODUTO (painel real) ======================= */}
      <section className="lp-sec" id="produto" style={{ paddingTop: 40 }}>
        <div className="container-lp">
          <Reveal>
            <div className="lp-sec-head">
              <span className="lp-kicker">O painel do atleta</span>
              <h2>O sistema na mão, <span className="accent">todo dia.</span></h2>
              <p className="lp-lead">
                Capturas reais da plataforma — nada de promessa. O que você vê aqui é o que o
                aluno e o mentor usam diariamente.
              </p>
            </div>
          </Reveal>

          <div style={{ marginTop: 56 }}>
            <Reveal>
              <div className="lp-prod-item">
                <figure className="lp-prod-fig">
                  <span className="lp-prod-tag">Painel do dia · aluno</span>
                  <img src="/img/screens/dashboard.png" alt="Painel do dia com a meta única" loading="lazy" style={{ objectPosition: "35% 10%" }} />
                </figure>
                <figcaption className="lp-prod-cap">
                  <h3>Uma meta por dia. Sem dispersão.</h3>
                  <p>
                    O aluno abre o painel e sabe exatamente o que fazer hoje — com as pendências
                    em alerta e a semana inteira planejada.
                  </p>
                </figcaption>
              </div>
            </Reveal>
            <Reveal>
              <div className="lp-prod-item">
                <figure className="lp-prod-fig">
                  <span className="lp-prod-tag">Planejamento · mentor</span>
                  <img src="/img/screens/planejamento.png" alt="Motor adaptativo com pesos calculados" loading="lazy" style={{ objectPosition: "20% 8%" }} />
                </figure>
                <figcaption className="lp-prod-cap">
                  <h3>A semana se adapta aos erros.</h3>
                  <p>
                    O motor calcula o peso de cada disciplina — erros recentes, dificuldade
                    declarada, horas disponíveis — e gera a semana seguinte.
                  </p>
                </figcaption>
              </div>
            </Reveal>
            <Reveal>
              <div className="lp-prod-item">
                <figure className="lp-prod-fig">
                  <span className="lp-prod-tag">Caderno de erros · aluno</span>
                  <img src="/img/screens/caderno.png" alt="Caderno de erros com revisão agendada" loading="lazy" style={{ objectPosition: "18% 8%" }} />
                </figure>
                <figcaption className="lp-prod-cap">
                  <h3>O erro volta no dia certo.</h3>
                  <p>
                    Cada erro vira anotação por disciplina e conteúdo, com revisão espaçada
                    agendada sozinha — até virar acerto.
                  </p>
                </figcaption>
              </div>
            </Reveal>
            <Reveal>
              <div className="lp-prod-item">
                <figure className="lp-prod-fig">
                  <span className="lp-prod-tag">Relatório · aluno</span>
                  <img src="/img/screens/relatorio.png" alt="Relatório de progressão com gráficos" loading="lazy" style={{ objectPosition: "40% 8%" }} />
                </figure>
                <figcaption className="lp-prod-cap">
                  <h3>Sua curva real até a prova.</h3>
                  <p>
                    Horas de foco, acertos por disciplina, metas concluídas e revisões — semana
                    a semana, sem achismo.
                  </p>
                </figcaption>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ======================= EDITAL / BANCA ======================= */}
      <section className="lp-sec" id="edital" style={{ paddingTop: 20 }}>
        <div className="container-lp">
          <Reveal>
            <div className="lp-edital">
              <div>
                <span className="lp-kicker">Edital verticalizado</span>
                <h2>A banca não te conta o que cai. <span className="accent">A gente mapeia.</span></h2>
                <ul>
                  <li><span className="hex" /> Recorrência histórica de 3–5 anos por banca</li>
                  <li><span className="hex" /> Diferença entre o que você já estudou e o que falta</li>
                  <li><span className="hex" /> Metas prontas, priorizadas — o mentor só ajusta e publica</li>
                </ul>
                <Link href="/entrar" className="btn btn-ember">Ver o edital verticalizado →</Link>
              </div>
              <div className="lp-edital-table">
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#6d7480", padding: "14px 0 4px" }}>
                  PC-SP · Escrivão — Vunesp · últimos 5 anos
                </div>
                {[
                  { t: "Crimes contra a Administração Pública", d: "Direito Penal", r: "9 de 10 provas", p: 90 },
                  { t: "Proposições compostas", d: "Raciocínio Lógico", r: "9 de 10 provas", p: 90 },
                  { t: "Interpretação de texto", d: "Português", r: "10 de 10 provas", p: 100 },
                  { t: "Falsidade ideológica e documental", d: "Direito Penal", r: "8 de 10 provas", p: 80 },
                  { t: "Pacto de São José da Costa Rica", d: "Direitos Humanos", r: "6 de 10 provas", p: 60 },
                ].map((e) => (
                  <div key={e.t} className="e-row">
                    <div className="en">
                      {e.t}
                      <small>{e.d}</small>
                      <div className="bar"><span style={{ width: `${e.p}%` }} /></div>
                    </div>
                    <span className="rec">{e.r}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ======================= MENTOR ======================= */}
      <section className="lp-sec" id="mentor" style={{ paddingTop: 40 }}>
        <div className="container-lp lp-mentor">
          <Reveal>
            <div className="foto">
              <img src="/img/mentor.jpeg" alt="Mentor Forja" loading="lazy" />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div>
              <span className="lp-kicker">Quem treina com você</span>
              <h2>Um mentor. Um método. <span className="accent">Nenhum atalho.</span></h2>
              <p className="lp-lead">
                Servidor público dedicado a bancas de concursos policiais. Produz o próprio
                material, elabora as próprias questões e constrói, para cada mentorado, um
                plano verticalizado — não um curso genérico revendido.
              </p>
              <ul className="lp-mentor-pts">
                <li><span className="hex" /> Conteúdo autoral, sem terceirização de método</li>
                <li><span className="hex" /> Turmas reduzidas — acompanhamento real, não em massa</li>
                <li><span className="hex" /> Foco absoluto em bancas policiais</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ======================= URGÊNCIA ======================= */}
      <section className="lp-urgency">
        <div className="container-lp">
          <h2>O edital sai quando quiser. A vaga é de quem está pronto.</h2>
          <div style={{ marginTop: 34 }}>
            <Link href="/entrar" className="btn btn-dark btn-lg" style={{ background: "#08090b" }}>
              Quero minha vaga na mentoria
            </Link>
          </div>
          <p className="mono">Turmas reduzidas · acompanhamento real · prévia em demonstração</p>
        </div>
      </section>

      {/* ======================= FAQ ======================= */}
      <section className="lp-sec lp-faq" id="faq">
        <div className="container-lp" style={{ maxWidth: 860 }}>
          <Reveal>
            <div className="lp-sec-head">
              <span className="lp-kicker">Dúvidas de quem está chegando</span>
              <h2>Perguntas <span className="accent">frequentes.</span></h2>
            </div>
          </Reveal>
          <div style={{ marginTop: 34 }}>
            {[
              ["Não tenho muito tempo disponível. Funciona?", "Funciona. A anamnese capta quantas horas por dia você tem de verdade e o plano é montado em cima disso — o sistema adapta os dias e a carga à sua disponibilidade real, não o contrário."],
              ["Estou começando do zero.", "É exatamente para isso que a verticalização existe: o currículo começa pelos fundamentos e a priorização mostra o que a sua banca mais cobra — você estuda o que mais vale ponto desde o primeiro dia."],
              ["Como o sistema decide o que eu estudo a cada dia?", "Uma meta por dia, definida pelo motor adaptativo: ele pondera a sequência do currículo, seus erros recentes, as dificuldades que você declarou e as horas disponíveis. Errou mais em uma matéria? Ela ganha mais peso na semana seguinte."],
              ["O que acontece com os erros que eu cometo?", "Cada erro vira anotação no caderno de erros, com revisão agendada automaticamente (+10/+15 dias). Na semana anterior à prova, a revisão é 100% caderno de erros + questões — você revisa só o que precisa."],
            ].map(([q, a]) => (
              <Reveal key={q}>
                <details>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= FOOTER ======================= */}
      <footer className="lp-footer">
        <div className="container-lp">
          <img src="/logo/logo-horizontal.jpeg" alt="Mentoria Forja" />
          <span>© Mentoria Forja — prévia em desenvolvimento · conteúdo ilustrativo</span>
        </div>
      </footer>
    </main>
  );
}
