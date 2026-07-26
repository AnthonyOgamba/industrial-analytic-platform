import type { TrendPoint } from "./dashboard-data";

const width = 760;
const height = 230;
const padding = { top: 20, right: 20, bottom: 38, left: 52 };

function chartCoordinates(data: TrendPoint[]) {
  const values = data.map((point) => point.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const margin = Math.max(1, Math.ceil((rawMax - rawMin || Math.abs(rawMax) || 1) * 0.1));
  const min = rawMin - margin;
  const max = rawMax + margin;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const horizontalDivisor = Math.max(1, data.length - 1);

  return {
    min,
    max,
    points: data.map((point, index) => ({
      ...point,
      x: data.length === 1 ? padding.left + plotWidth / 2 : padding.left + (index / horizontalDivisor) * plotWidth,
      y: padding.top + ((max - point.value) / (max - min)) * plotHeight,
    })),
  };
}

export function ProductionChart({ data }: { data: TrendPoint[] }) {
  const { min, max, points } = chartCoordinates(data);
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L ${points.at(-1)?.x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;
  const guides = [max, Math.round((max + min) / 2), min];

  return (
    <div className="p-3 sm:p-5">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto min-h-52 w-full"
        role="img"
        aria-labelledby="production-chart-title production-chart-description"
      >
        <title id="production-chart-title">Production output trend</title>
        <desc id="production-chart-description">
          Production output contains {data.length} gateway data {data.length === 1 ? "point" : "points"}, from {min.toLocaleString()} to {max.toLocaleString()} units.
        </desc>
        <defs>
          <linearGradient id="dashboard-production-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--dv-accent)" stopOpacity="0.24" />
            <stop offset="100%" stopColor="var(--dv-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {guides.map((guide, index) => {
          const y = padding.top + (index / (guides.length - 1)) * (height - padding.top - padding.bottom);
          return (
            <g key={guide}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="var(--dv-border)"
                strokeDasharray="4 5"
              />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" className="fill-[var(--dv-muted)] font-mono text-[10px]">
                {guide.toLocaleString()}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#dashboard-production-fill)" />
        <path d={linePath} fill="none" stroke="var(--dv-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((point, index) => {
          const labelEvery = Math.max(1, Math.ceil(points.length / 6));
          const showLabel = index === 0 || index === points.length - 1 || index % labelEvery === 0;
          return (
          <g key={`${point.label}-${index}`}>
            <circle cx={point.x} cy={point.y} r="4" fill="var(--dv-card)" stroke="var(--dv-accent)" strokeWidth="2.5" />
            {showLabel && <text
              x={point.x}
              y={height - 13}
              textAnchor="middle"
              className="fill-[var(--dv-muted)] font-mono text-[10px]"
            >
              {point.label}
            </text>}
          </g>
        )})}
      </svg>
    </div>
  );
}
