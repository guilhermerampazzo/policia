"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const tooltipStyle = {
  background: "#1a1d23",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 10,
  fontSize: 12,
  color: "#f4f3ef",
};

const axis = { stroke: "#6d7480", fontSize: 11, tickLine: false, axisLine: false } as const;

export function BarsChart({
  data,
  dataKey,
  color = "#f37e1f",
  height = 240,
  horizontal = false,
}: {
  data: unknown[];
  dataKey: string;
  color?: string;
  height?: number;
  horizontal?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      {horizontal ? (
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
          <CartesianGrid stroke="rgba(255,255,255,.05)" horizontal={false} />
          <XAxis type="number" tick={{ ...axis }} />
          <YAxis type="category" dataKey="nome" tick={{ ...axis }} width={130} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,.04)" }} />
          <Bar dataKey={dataKey} fill={color} radius={[0, 7, 7, 0]} barSize={18} />
        </BarChart>
      ) : (
        <BarChart data={data} margin={{ top: 4, right: 12, left: -18, bottom: 4 }}>
          <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
          <XAxis dataKey="nome" tick={{ ...axis }} />
          <YAxis tick={{ ...axis }} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,.04)" }} />
          <Bar dataKey={dataKey} fill={color} radius={[7, 7, 0, 0]} barSize={26} />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}

export function AreaChartC({
  data,
  dataKey,
  color = "#f37e1f",
  height = 240,
}: {
  data: unknown[];
  dataKey: string;
  color?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 12, left: -18, bottom: 4 }}>
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.45} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
        <XAxis dataKey="nome" tick={{ ...axis }} />
        <YAxis tick={{ ...axis }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill="url(#grad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function LineChartC({
  data,
  dataKey,
  color = "#f5b84c",
  height = 240,
}: {
  data: unknown[];
  dataKey: string;
  color?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 12, left: -18, bottom: 4 }}>
        <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
        <XAxis dataKey="nome" tick={{ ...axis }} />
        <YAxis tick={{ ...axis }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({
  data,
  height = 220,
  centerLabel,
  centerValue,
}: {
  data: { nome: string; valor: number; cor: string }[];
  height?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  return (
    <div style={{ position: "relative" }}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey="valor" nameKey="nome" innerRadius={62} outerRadius={86} paddingAngle={3} strokeWidth={0}>
            {data.map((d) => (
              <Cell key={d.nome} fill={d.cor} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <span className="stat-num" style={{ fontSize: "1.9rem" }}>{centerValue}</span>
          <span style={{ fontSize: ".66rem", color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: ".1em" }}>{centerLabel}</span>
        </div>
      )}
    </div>
  );
}
