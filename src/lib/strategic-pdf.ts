function ascii(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, " ");
}

function escapePdf(value: string) {
  return ascii(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrap(value: string, width = 88) {
  const words = ascii(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = (line + " " + word).trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}

type StrategicPdfInput = {
  title: string;
  discipline: string;
  resumo: string;
  pontosChave: string[];
  armadilhas: string[];
  planoRevisao: string;
};

export function strategicPdf(input: StrategicPdfInput) {
  const lines = [
    "MENTORIA FORJA · CADERNO DE ERROS",
    "",
    `ESTRATEGIA DE REVISAO · ${input.discipline}`,
    `Topico: ${input.title}`,
    "",
    "RESUMO",
    ...wrap(input.resumo),
    "",
    "PONTOS-CHAVE",
    ...input.pontosChave.flatMap((item) => wrap(`• ${item}`)),
    "",
    "ARMADILHAS DA BANCA",
    ...input.armadilhas.flatMap((item) => wrap(`• ${item}`)),
    "",
    "PLANO DE REVISAO",
    ...wrap(input.planoRevisao),
    "",
    "Forja: disciplina constrói aprovacao.",
  ].slice(0, 44);

  const commands = ["BT", "/F1 10 Tf", "50 750 Td", "14 TL"];
  lines.forEach((line, index) => {
    if (index === 0) commands.push("/F1 12 Tf");
    if (index === 2) commands.push("/F1 11 Tf");
    commands.push(`(${escapePdf(line)}) Tj`);
    if (index < lines.length - 1) commands.push("T*");
  });
  commands.push("ET");
  const stream = commands.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n%FORJA\n";
  const offsets = [0];
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xref = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i += 1) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
}
