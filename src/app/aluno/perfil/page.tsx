import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import PerfilForm from "@/components/PerfilForm";
import { Icon } from "@/components/icons";
import { computeXpEStreak, nomeNivel, levelFromXp } from "@/lib/points";
import { fmtData } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const user = await requireUser();
  const [anamnese, xpEStreak, totalMetas, totalErros] = await Promise.all([
    prisma.anamnese.findUnique({ where: { userId: user.id } }),
    computeXpEStreak(user.id),
    prisma.meta.count({ where: { userId: user.id } }),
    prisma.erro.count({ where: { userId: user.id } }),
  ]);
  const nivel = levelFromXp(xpEStreak.xp);

  return (
    <AppShell user={user} active="/aluno/perfil">
      <span className="eyebrow">Seu perfil completo</span>
      <h1 style={{ fontSize: "2.1rem", margin: "0.25em 0 1em" }}>Perfil e anamnese</h1>

      <div className="grid-2-wide">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card card-ember" style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <div className="avatar avatar-lg">{user.name.charAt(0)}</div>
            <div>
              <h2 style={{ fontSize: "1.4rem" }}>{user.name}</h2>
              <p style={{ color: "var(--ink-dim)", fontSize: ".9rem" }}>
                {user.concursoAlvo ?? "Concurso alvo não definido"}
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <span className="tag tag-ember">{user.banca ?? "Banca não definida"}</span>
                {user.dataProva && <span className="tag">Prova: {fmtData(user.dataProva)}</span>}
              </div>
            </div>
          </div>

          <PerfilForm user={{ name: user.name, concursoAlvo: user.concursoAlvo, banca: user.banca, dataProva: user.dataProva }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Icon name="calendar" size={16} style={{ color: "var(--ember-400)" }} />
              <h3 style={{ fontSize: "1rem" }}>Anamnese do estudo</h3>
              <Link href="/aluno/onboarding" className="btn btn-line btn-sm" style={{ marginLeft: "auto" }}>Revisar anamnese</Link>
            </div>
            {anamnese ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <div className="eyebrow">Disponibilidade</div>
                  <p style={{ marginTop: 6, fontSize: ".95rem" }}>{anamnese.horasPorDia}h/dia</p>
                  <p style={{ fontSize: ".82rem", color: "var(--ink-dim)" }}>
                    {anamnese.diasDisponiveis.length} dias de estudo
                  </p>
                </div>
                <div>
                  <div className="eyebrow">Formato preferido</div>
                  <p style={{ marginTop: 6, fontSize: ".95rem", textTransform: "capitalize" }}>{anamnese.formatoPreferido}</p>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <div className="eyebrow">Dificuldades declaradas</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    {(anamnese.dificuldades.length ? anamnese.dificuldades : ["Nenhuma"]).map((d) => (
                      <span key={d} className="tag tag-warn">{d}</span>
                    ))}
                  </div>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <div className="eyebrow">Objetivo</div>
                  <p style={{ marginTop: 6, fontSize: ".92rem", color: "var(--ink-dim)" }}>{anamnese.objetivo}</p>
                </div>
              </div>
            ) : (
              <p style={{ color: "var(--ink-faint)", fontSize: ".88rem" }}>
                Anamnese ainda não concluída. <Link href="/aluno/onboarding" style={{ color: "var(--ember-400)" }}>Começar agora →</Link>
              </p>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: "1rem", marginBottom: 16 }}>Resumo do seu estudo</h3>
            <div className="grid-kpis" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
              <div>
                <span className="eyebrow">Força (XP)</span>
                <div className="stat-num" style={{ fontSize: "1.7rem" }}>{xpEStreak.xp}</div>
                <span className="tag" style={{ marginTop: 6 }}>nível {nivel.nivel} · {nomeNivel(xpEStreak.xp)}</span>
              </div>
              <div>
                <span className="eyebrow">Sequência</span>
                <div className="stat-num" style={{ fontSize: "1.7rem" }}>{xpEStreak.streak}</div>
                <span className="tag" style={{ marginTop: 6 }}>dias seguidos</span>
              </div>
              <div>
                <span className="eyebrow">Metas</span>
                <div className="stat-num" style={{ fontSize: "1.7rem" }}>{totalMetas}</div>
                <span className="tag" style={{ marginTop: 6 }}>no cronograma</span>
              </div>
              <div>
                <span className="eyebrow">Erros</span>
                <div className="stat-num" style={{ fontSize: "1.7rem" }}>{totalErros}</div>
                <span className="tag" style={{ marginTop: 6 }}>no caderno</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
