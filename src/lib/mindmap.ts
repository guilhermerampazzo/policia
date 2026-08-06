import type { ArvoreMental } from "./ai";

/** Nó/tamanho base usado no layout interativo (combinado com estilos dos nós custom) */
export const NODE_W = 260;
export const NODE_H = 70;

export interface FlowNode {
  id: string;
  type: "central" | "branch" | "leaf";
  position: { x: number; y: number };
  data: { label: string; detail?: string };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type: "smoothstep";
  animated?: boolean;
}

/** Layout determinístico: central no meio, ramos em 2 colunas, folhas em leque. */
export function layoutArvore(tree: ArvoreMental): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const nodes: FlowNode[] = [
    {
      id: "central",
      type: "central",
      position: { x: -NODE_W / 2 + 40, y: 0 },
      data: { label: tree.central },
    },
  ];
  const edges: FlowEdge[] = [];

  const branches = tree.branches;
  const n = branches.length;
  const colX = 380;
  const childX = 330;
  const childYStep = 96;

  branches.forEach((b, i) => {
    const lado = i < Math.ceil(n / 2) ? -1 : 1;
    const ordem = lado === -1 ? i : i - Math.ceil(n / 2);
    const countCol = lado === -1 ? Math.ceil(n / 2) : Math.floor(n / 2);
    const y = (ordem - (countCol - 1) / 2) * 190;

    const id = `b${i}`;
    nodes.push({ id, type: "branch", position: { x: lado * colX - NODE_W / 2, y }, data: { label: b.label } });
    edges.push({ id: `e-c-${i}`, source: "central", target: id, type: "smoothstep" });

    const children = b.children ?? [];
    const k = children.length;
    children.forEach((child, j) => {
      const cid = `c${i}_${j}`;
      const cy = y + (j - (k - 1) / 2) * childYStep;
      nodes.push({
        id: cid,
        type: "leaf",
        position: { x: lado * (colX + childX) - NODE_W / 2, y: cy },
        data: { label: child },
      });
      edges.push({ id: `e-${i}-${j}`, source: id, target: cid, type: "smoothstep" });
    });
  });

  return { nodes, edges };
}

export function parseArvore(json: string): ArvoreMental {
  try {
    const parsed = JSON.parse(json) as ArvoreMental;
    if (!parsed.central || !Array.isArray(parsed.branches)) throw new Error("estrutura inválida");
    return parsed;
  } catch {
    return { central: "Conteúdo", branches: [{ label: "Sem estrutura", children: [] }] };
  }
}

/** Estrutura determinística a partir de tópicos que o mentor digita */
export function arvoreDeTopicos(titulo: string, topicos: { label: string; children: string[] }[]): ArvoreMental {
  return {
    central: titulo || "Conteúdo",
    branches: topicos
      .filter((t) => t.label.trim().length > 0)
      .map((t) => ({
        label: t.label.trim().slice(0, 80),
        children: t.children
          .map((c) => c.trim())
          .filter((c) => c.length > 1)
          .slice(0, 9),
      })),
  };
}
