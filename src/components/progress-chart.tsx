"use client";
import { useId, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { safeResult } from "@/lib/calculations";
import { dateLabel, fmt } from "@/lib/format";
import type { Assessment } from "@/types";
import { EmptyState, SectionTitle } from "./ui";
const metrics = {
  bodyFat: { label: "Gordura corporal", unit: "%" },
  weight: { label: "Peso corporal", unit: "kg" },
  leanMass: { label: "Massa magra", unit: "kg" },
  waist: { label: "Cintura", unit: "cm" },
};
export function ProgressChart({
  assessments,
  compact = false,
}: {
  assessments: Assessment[];
  compact?: boolean;
}) {
  const [metric, setMetric] = useState<keyof typeof metrics>("bodyFat"),
    [range, setRange] = useState("6");
  const id = useId().replace(/:/g, "");
  const sorted = [...assessments]
    .reverse()
    .sort((a, b) => a.date.localeCompare(b.date));
  const end = sorted.at(-1)?.date;
  const cutoff = end ? new Date(end + "T12:00:00") : new Date();
  cutoff.setMonth(cutoff.getMonth() - Number(range));
  const data = sorted
    .filter((a) => range === "all" || new Date(a.date + "T12:00:00") >= cutoff)
    .map((a) => ({
      id: a.id,
      date: a.date,
      label: new Date(a.date + "T12:00:00")
        .toLocaleDateString("pt-BR", { month: "short" })
        .replace(".", ""),
      value:
        metric === "weight"
          ? a.weight
          : metric === "waist"
            ? a.circumferences.waist
            : (safeResult(a)?.[metric] ?? null),
    }));
  return (
    <section className="panel chart-panel">
      <SectionTitle
        title={compact ? "Evolução em foco" : "Cada medida, uma evolução."}
        sub={
          compact
            ? "Acompanhe a trajetória de Nathan Demo"
            : "Seu histórico traduzido em progresso."
        }
        action={
          <div className="range-switch" aria-label="Período">
            {[
              ["3", "3 meses"],
              ["6", "6 meses"],
              ["12", "1 ano"],
              ["all", "Tudo"],
            ].map(([v, l]) => (
              <button
                key={v}
                aria-pressed={range === v}
                className={range === v ? "selected" : ""}
                onClick={() => setRange(v)}
              >
                {l}
              </button>
            ))}
          </div>
        }
      />
      <div className="chart-top">
        <div className="metric-tabs">
          {Object.entries(metrics).map(([key, m]) => (
            <button
              key={key}
              className={metric === key ? "selected" : ""}
              aria-pressed={metric === key}
              onClick={() => setMetric(key as keyof typeof metrics)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <span className="chart-unit">{metrics[metric].unit}</span>
      </div>
      {data.length ? (
        <>
          <PrintChart
            data={data}
            title={metrics[metric].label}
            unit={metrics[metric].unit}
          />
          <div
            className="chart-container"
            role="img"
            aria-label={`Gráfico de ${metrics[metric].label}, ${data.length} avaliações`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 20, right: 18, bottom: 0, left: -20 }}
              >
                <defs>
                  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d2f56a" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#d2f56a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="#2b302b"
                  strokeDasharray="3 6"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#8e968c", fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#8e968c", fontSize: 11 }}
                  tickFormatter={(v) => fmt(v, 0)}
                />
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="chart-tooltip">
                        <small>{dateLabel(payload[0].payload.date)}</small>
                        <strong>
                          {fmt(Number(payload[0].value))} {metrics[metric].unit}
                        </strong>
                      </div>
                    ) : null
                  }
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#d2f56a"
                  strokeWidth={2.5}
                  fill={`url(#${id})`}
                  dot={{
                    r: 3,
                    fill: "#d2f56a",
                    stroke: "#191c19",
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <details className="chart-data">
            <summary>Ver valores do gráfico</summary>
            <div className="data-values">
              {data.map((d) => (
                <span key={d.id}>
                  {dateLabel(d.date)}{" "}
                  <b>
                    {fmt(d.value)} {metrics[metric].unit}
                  </b>
                </span>
              ))}
            </div>
          </details>
        </>
      ) : (
        <EmptyState
          title="Seu próximo ponto de partida"
          description="Registre uma avaliação para acompanhar a evolução."
        />
      )}
    </section>
  );
}

function PrintChart({
  data,
  title,
  unit,
}: {
  data: { id: string; date: string; value: number | null }[];
  title: string;
  unit: string;
}) {
  const values = data.flatMap((d) => (d.value === null ? [] : [d.value]));
  if (!values.length) return null;
  const min = Math.floor(Math.min(...values) - 1),
    max = Math.ceil(Math.max(...values) + 1);
  const x = (i: number) => 45 + (i * 575) / Math.max(data.length - 1, 1);
  const y = (v: number) => 115 - ((v - min) / (max - min)) * 90;
  const path = data
    .map((d, i) =>
      d.value === null
        ? ""
        : `${i === 0 || data[i - 1].value === null ? "M" : "L"}${x(i)},${y(d.value)}`,
    )
    .join(" ");
  return (
    <div className="print-chart">
      <p>
        {title} ({unit})
      </p>
      <svg viewBox="0 0 650 150" role="img" aria-label={`Evolução de ${title}`}>
        {[min, (min + max) / 2, max].map((v) => (
          <g key={v}>
            <line
              x1="40"
              x2="630"
              y1={y(v)}
              y2={y(v)}
              stroke="#cbd3c5"
              strokeDasharray="3 5"
            />
            <text
              x="30"
              y={y(v) + 3}
              textAnchor="end"
              fontSize="9"
              fill="#526046"
            >
              {fmt(v, 1)}
            </text>
          </g>
        ))}
        <path d={path} stroke="#577727" strokeWidth="2" fill="none" />
        {data.map((d, i) => (
          <g key={d.id}>
            {d.value !== null && (
              <circle cx={x(i)} cy={y(d.value)} r="3" fill="#577727" />
            )}
            {(i % Math.max(1, Math.ceil(data.length / 6)) === 0 ||
              i === data.length - 1) && (
              <text
                x={x(i)}
                y="137"
                textAnchor="middle"
                fontSize="8"
                fill="#526046"
              >
                {new Date(d.date + "T12:00:00").toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
