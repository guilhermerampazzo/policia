import path from "path";
import { Resvg } from "@resvg/resvg-js";
import type { ArvoreMental } from "./ai";

/**
 * ============================================================
 * IMAGEM DO MAPA MENTAL (estilo "caderno de estudo")
 * Somente servidor (usa fs + binário nativo).
 * Inspirado na referência: canvas claro, nó central com título
 * vinho, ramos como caixas rosadas (borda escura, título vinho),
 * sub-itens como caixas próprias conectadas, linhas curvas com
 * setas — layout orgânico/radial.
 * ============================================================
 */

function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncar(s: string, max: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
}

/** Monta o SVG do mapa no estilo da referência (orgânico/radial). */
export function montarSvgDaArvore(tree: ArvoreMental): { svg: string; width: number; height: number } {
  const branches = tree.branches.slice(0, 10);
  const n = branches.length;

  const COR_BG = "#fbf6ee";
  const COR_CAIXA = "#ffe4e1";
  const COR_CAIXA_CHILD = "#fff6f4";
  const COR_TITULO = "#8B0000";
  const COR_TEXTO = "#2b2b2b";
  const COR_BORDA = "#3c3c3c";
  const COR_LINHA = "#c94f68";
  const COR_SETA = "#cc0000";

  interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
  }
  const center = (r: Rect) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

  // ponto na borda do retângulo na direção de "from" → centro
  const edgePoint = (r: Rect, from: { x: number; y: number }) => {
    const c = center(r);
    const dx = c.x - from.x;
    const dy = c.y - from.y;
    const candidatos: { t: number; x: number; y: number }[] = [];
    if (Math.abs(dx) > 1e-6) {
      for (const ex of [r.x, r.x + r.w]) {
        const t = (ex - from.x) / dx;
        const y = from.y + t * dy;
        if (t > 0 && t <= 1 && y >= r.y && y <= r.y + r.h) candidatos.push({ t, x: ex, y });
      }
    }
    if (Math.abs(dy) > 1e-6) {
      for (const ey of [r.y, r.y + r.h]) {
        const t = (ey - from.y) / dy;
        const x = from.x + t * dx;
        if (t > 0 && t <= 1 && x >= r.x && x <= r.x + r.w) candidatos.push({ t, x, y: ey });
      }
    }
    candidatos.sort((a, b) => a.t - b.t);
    const p = candidatos[0];
    return p ? { x: p.x, y: p.y } : c;
  };

  const boxCentral: Rect = { x: 0, y: 0, w: 0, h: 0 };
  const centralW = Math.max(200, Math.min(430, tree.central.length * 14));
  boxCentral.w = centralW;
  boxCentral.h = 76;
  boxCentral.x = -centralW / 2;
  boxCentral.y = -38;

  // ramos ao redor (orgânico: ângulos variados, inclusive topo/base)
  const rx = 400;
  const ry = 340;
  const deg = (d: number) => (d * Math.PI) / 180;
  const boxBranches: { rect: Rect; label: string; children: string[]; angle: number }[] = [];
  branches.forEach((b, i) => {
    const angle = -90 + (i * 360) / Math.max(n, 1);
    const a = deg(angle);
    const w = Math.max(160, Math.min(340, b.label.length * 12));
    const h = 46;
    const cx = Math.cos(a) * rx;
    const cy = Math.sin(a) * ry;
    boxBranches.push({
      rect: { x: cx - w / 2, y: cy - h / 2, w, h },
      label: b.label,
      children: b.children ?? [],
      angle,
    });
  });

  // filhos de cada ramo (caixas próprias, espalhadas para fora do centro)
  const childRects: { rect: Rect; texto: string; angle: number }[] = [];
  boxBranches.forEach((br) => {
    const a = deg(br.angle);
    const dirX = Math.cos(a);
    const dirY = Math.sin(a);
    const nrmX = -dirY;
    const nrmY = dirX;
    const m = br.children.length;
    const larguras = br.children.map((c) => Math.max(140, Math.min(390, c.length * 7.6)));
    const spacing = Math.max(104, (larguras.length ? Math.max(...larguras) : 130) + 30);
    br.children.forEach((c, j) => {
      const w = larguras[j];
      const h = 40;
      const off = (j - (m - 1) / 2) * spacing;
      const cx = center(br.rect).x + dirX * 175 + nrmX * off;
      const cy = center(br.rect).y + dirY * 175 + nrmY * off;
      childRects.push({ rect: { x: cx - w / 2, y: cy - h / 2, w, h }, texto: c, angle: br.angle });
    });
  });

  // caixa do retângulo ocupado
  const todos = [boxCentral, ...boxBranches.map((b) => b.rect), ...childRects.map((c) => c.rect)];
  const minX = Math.min(...todos.map((r) => r.x)) - 90;
  const minY = Math.min(...todos.map((r) => r.y)) - 90;
  const maxX = Math.max(...todos.map((r) => r.x + r.w)) + 90;
  const maxY = Math.max(...todos.map((r) => r.y + r.h)) + 90;
  const width = maxX - minX;
  const height = maxY - minY;
  const deslocar = (r: Rect): Rect => ({ x: r.x - minX, y: r.y - minY, w: r.w, h: r.h });

  const elementos: string[] = [];

  const seta = (x1: number, y1: number, x2: number, y2: number, tam = 9) => {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const ax = x2;
    const ay = y2;
    return `<polygon points="${ax},${ay} ${ax - tam * Math.cos(ang - 0.45)},${ay - tam * Math.sin(ang - 0.45)} ${ax - tam * Math.cos(ang + 0.45)},${ay - tam * Math.sin(ang + 0.45)}" fill="${COR_SETA}"/>`;
  };

  const linhaCurva = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = (x2 - x1) * 0.45;
    const dy = (y2 - y1) * 0.45;
    return `<path d="M ${x1} ${y1} C ${x1 + dx} ${y1 + dy}, ${x2 - dx} ${y2 - dy}, ${x2} ${y2}" fill="none" stroke="${COR_LINHA}" stroke-width="1.8"/>`;
  };

  const caixa = (r: Rect, fill: string) =>
    `<rect x="${r.x + 3}" y="${r.y + 4}" width="${r.w}" height="${r.h}" rx="12" fill="#eccfc9" stroke="${COR_BORDA}" stroke-width="1.1"/>` +
    `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="12" fill="${fill}" stroke="${COR_BORDA}" stroke-width="1.4"/>`;

  const textoCentral = deslocar(boxCentral);
  elementos.push(caixa(textoCentral, COR_BG));
  elementos.push(
    `<text x="${textoCentral.x + textoCentral.w / 2}" y="${textoCentral.y + textoCentral.h / 2 + 8}" font-family="Inter" font-size="20" font-weight="bold" fill="${COR_TITULO}" text-anchor="middle" letter-spacing="1">${escXml(truncar(tree.central, 30).toUpperCase())}</text>`,
  );

  boxBranches.forEach((br) => {
    const rB = deslocar(br.rect);
    const cB = center(rB);
    const cC = center(textoCentral);
    const ini = edgePoint(textoCentral, cB);
    const fim = edgePoint(rB, cC);
    elementos.push(linhaCurva(ini.x, ini.y, fim.x, fim.y));
    elementos.push(seta(fim.x, fim.y, ini.x, ini.y, 8));
    elementos.push(caixa(rB, COR_CAIXA));
    elementos.push(
      `<text x="${rB.x + 14}" y="${rB.y + rB.h / 2 + 5}" font-family="Inter" font-size="14" font-weight="bold" fill="${COR_TITULO}">${escXml(truncar(br.label, 36).toUpperCase())}</text>`,
    );
  });

  childRects.forEach((ch) => {
    const rC = deslocar(ch.rect);
    const cC = center(rC);
    const br = boxBranches.find((b) => b.angle === ch.angle)!;
    const rB = deslocar(br.rect);
    const cB = center(rB);
    const ini = edgePoint(rB, cC);
    const fim = edgePoint(rC, cB);
    elementos.push(linhaCurva(ini.x, ini.y, fim.x, fim.y));
    elementos.push(seta(fim.x, fim.y, ini.x, ini.y, 7));
    elementos.push(caixa(rC, COR_CAIXA_CHILD));
    elementos.push(
      `<text x="${rC.x + 12}" y="${rC.y + rC.h / 2 + 4}" font-family="Inter" font-size="11" fill="${COR_TEXTO}">${escXml(truncar(ch.texto, 58))}</text>`,
    );
  });

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect width="${width}" height="${height}" fill="${COR_BG}"/>` +
    elementos.join("") +
    `</svg>`;

  return { svg, width, height };
}

/** Renderiza a árvore como imagem PNG (SVG → PNG, com fonte Inter). */
export function arvoreParaPng(tree: ArvoreMental): Buffer {
  const { svg } = montarSvgDaArvore(tree);
  const fontDir = path.join(process.cwd(), "public", "fonts");
  const resvg = new Resvg(svg, {
    font: {
      fontFiles: [path.join(fontDir, "Inter-Bold.ttf"), path.join(fontDir, "Inter-Regular.ttf")],
    },
  });
  return resvg.render().asPng();
}

/** Base64 data-URI da imagem (para exibir direto no navegador). */
export function arvoreParaDataUri(tree: ArvoreMental): string {
  const png = arvoreParaPng(tree);
  return `data:image/png;base64,${png.toString("base64")}`;
}
