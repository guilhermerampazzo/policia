const PILLARS = [
  { letter: "F", name: "Foco", copy: "Uma prioridade por vez. Menos ruído, mais presença na sessão que realmente move sua prova.", image: "/img/hero-tactical.jpg" },
  { letter: "O", name: "Organização", copy: "O edital vira rota: metas, revisões e pendências ficam visíveis antes de virarem peso.", image: "/img/police-command.jpg" },
  { letter: "R", name: "Resiliência", copy: "O erro não é sentença. É sinal de ajuste para retornar mais forte na próxima questão.", image: "/img/police-training.jpg" },
  { letter: "J", name: "Jornada", copy: "A aprovação é construída no ritmo possível, com sequência e consistência todos os dias.", image: "/img/police-recruits.jpg" },
  { letter: "A", name: "Ação", copy: "Planejamento só conta quando vira estudo feito, questão respondida e revisão concluída.", image: "/img/police-operations.jpg" },
];

export default function ForjaPillars() {
  return (
    <section className="nf-section forja-pillars" aria-labelledby="forja-pillars-title">
      <div className="nf-section-head">
        <div>
          <span className="nf-section-kicker">A MÉTODO FORJA</span>
          <h2 id="forja-pillars-title">Cinco forças para sustentar a aprovação</h2>
        </div>
        <span className="nf-section-note">F · O · R · J · A</span>
      </div>
      <div className="forja-pillars-rail" role="list" aria-label="Cinco pilares da Forja">
        {PILLARS.map((pillar, index) => (
          <article key={pillar.name} className="forja-pillar-card" role="listitem" style={{ backgroundImage: `url('${pillar.image}')` }}>
            <div className="forja-pillar-overlay" />
            <span className="forja-pillar-index">0{index + 1}</span>
            <span className="hex forja-pillar-letter" aria-hidden="true">{pillar.letter}</span>
            <div className="forja-pillar-copy">
              <span className="nf-card-tag">PILAR {index + 1}</span>
              <h3>{pillar.name}</h3>
              <p>{pillar.copy}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
