import { RADAR_CONSTRUCTS } from '../model/constants';
import type { ConstructScores } from '../types';
import { trafficLight } from '../model/analysis';

const STATUS_COLOR = {
  green: '#15803d',
  yellow: '#a16207',
  red: '#b91c1c',
} as const;

type RadarChartProps = {
  scores: ConstructScores;
  /** Outer SVG size in px (default 280). */
  size?: number;
  /** Polygon fill/stroke (default teal). */
  accent?: string;
  fillOpacity?: number;
};

export function RadarChart({
  scores,
  size = 280,
  accent = '#0f766e',
  fillOpacity = 0.28,
}: RadarChartProps) {
  const n = RADAR_CONSTRUCTS.length;
  const angleStep = (2 * Math.PI) / n;
  const center = size / 2;
  const radius = size * 0.32;

  const point = (i: number, value: number) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const r = (value / 5) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const labelPoint = (i: number) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const r = radius + size * 0.1;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const gridLevels = [1, 2, 3, 4, 5];
  const dataPoints = RADAR_CONSTRUCTS.map((c, i) => point(i, scores[c]));
  const pathD =
    dataPoints.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ') + ' Z';

  const fill =
    accent.startsWith('#') && accent.length === 7
      ? `rgba(${parseInt(accent.slice(1, 3), 16)}, ${parseInt(accent.slice(3, 5), 16)}, ${parseInt(accent.slice(5, 7), 16)}, ${fillOpacity})`
      : accent;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className="radar-chart"
      role="img"
      aria-label="Knowledge profile radar chart"
    >
      {gridLevels.map((level) => {
        const pts = RADAR_CONSTRUCTS.map((_, i) => point(i, level));
        const d = pts.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ') + ' Z';
        return (
          <path key={level} d={d} fill="none" stroke="#cbd5e1" strokeWidth={1} />
        );
      })}
      {RADAR_CONSTRUCTS.map((c, i) => {
        const outer = point(i, 5);
        const label = labelPoint(i);
        const light = trafficLight(scores[c]);
        return (
          <g key={c}>
            <line
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="#94a3b8"
              strokeWidth={1}
            />
            <text
              x={label.x}
              y={label.y}
              fill={STATUS_COLOR[light]}
              fontSize={size * 0.045}
              fontFamily="Segoe UI, system-ui, sans-serif"
              fontWeight={700}
              letterSpacing="0.02em"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {c}
            </text>
          </g>
        );
      })}
      <path d={pathD} fill={fill} stroke={accent} strokeWidth={2} />
    </svg>
  );
}
