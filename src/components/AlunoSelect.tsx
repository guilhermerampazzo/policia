"use client";

import { useRouter } from "next/navigation";

export default function AlunoSelect({
  alunos,
  atual,
}: {
  alunos: { id: string; name: string; concursoAlvo: string | null }[];
  atual: string;
}) {
  const router = useRouter();
  return (
    <select
      className="select"
      defaultValue={atual}
      onChange={(e) => router.push(`/admin/planejamento?aluno=${e.target.value}`)}
    >
      {alunos.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name} — {a.concursoAlvo ?? "sem concurso"}
        </option>
      ))}
    </select>
  );
}
