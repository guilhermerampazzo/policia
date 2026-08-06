"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type NodeProps,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ArvoreMental } from "@/lib/ai";
import { layoutArvore } from "@/lib/mindmap";

/* Paleta inspirada no mapa mental de referência (caderno de estudo):
   rosa/marrom-claro para ramos, central em gradiente forte, linhas escuras. */

function CentralNode({ data }: NodeProps) {
  return (
    <div
      style={{
        background: "linear-gradient(160deg, #e85d75, #a92f4f)",
        color: "#fff",
        padding: "16px 24px",
        borderRadius: 14,
        border: "2px solid rgba(255,255,255,.3)",
        fontFamily: "var(--font-body)",
        fontWeight: 700,
        fontSize: "1rem",
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: ".02em",
        boxShadow: "0 18px 42px -14px rgba(168,47,79,.75)",
        maxWidth: 250,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      {data.label as string}
    </div>
  );
}

function BranchNode({ data }: NodeProps) {
  return (
    <div
      style={{
        background: "linear-gradient(180deg, #33202a, #241820)",
        border: "1.5px solid #b4465f",
        borderLeft: "5px solid #e85d75",
        borderRadius: 10,
        padding: "11px 15px",
        fontSize: ".88rem",
        fontWeight: 700,
        color: "#ffd9e0",
        boxShadow: "0 12px 26px -14px rgba(0,0,0,.7)",
        maxWidth: 250,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      {data.label as string}
    </div>
  );
}

function LeafNode({ data }: NodeProps) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,.045)",
        border: "1px solid rgba(232,93,117,.35)",
        borderRadius: 8,
        padding: "7px 12px",
        fontSize: ".78rem",
        color: "#e8c9d0",
        maxWidth: 230,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      {data.label as string}
    </div>
  );
}

const nodeTypes = {
  central: CentralNode,
  branch: BranchNode,
  leaf: LeafNode,
};

const edgeOptions = { animated: false, stroke: "#8a3a4f", strokeWidth: 1.8 };

export default function MindMapView({
  tree,
  height = 520,
}: {
  tree: ArvoreMental;
  height?: number;
}) {
  const { nodes, edges } = useMemo(() => layoutArvore(tree), [tree]);
  const nodesMemo = useMemo(() => nodes as Node[], [nodes]);
  const edgesMemo = useMemo(() => edges as Edge[], [edges]);

  return (
    <div
      style={{
        height,
        borderRadius: 14,
        border: "1px solid var(--line)",
        background:
          "radial-gradient(800px 400px at 50% 40%, rgba(168,47,79,.12), transparent 60%), #0e1013",
        overflow: "hidden",
      }}
    >
      <ReactFlow
        nodes={nodesMemo}
        edges={edgesMemo}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={edgeOptions}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.25}
        maxZoom={1.6}
        nodesConnectable={false}
        nodesDraggable
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={26} color="rgba(255,255,255,.05)" />
        <Controls
          style={{
            background: "var(--panel-2)",
            border: "1px solid var(--line-strong)",
            borderRadius: 9,
            color: "var(--ink-dim)",
          }}
        />
        <MiniMap
          nodeColor="#e85d75"
          maskColor="rgba(8,9,11,.75)"
          style={{ background: "#0e1013" }}
        />
      </ReactFlow>
    </div>
  );
}
