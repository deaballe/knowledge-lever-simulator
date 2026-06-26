import { RADAR_CONSTRUCTS } from '../model/constants';
import type { ConstructScores } from '../types';
import { trafficLight } from '../model/analysis';

const SIZE = 280;
const CENTER = SIZE / 2;
const RADIUS = 100;

export function RadarChart({ scores }: { scores: ConstructScores }) {
  const n = RADAR_CONSTRUCTS.length;
  const angleStep = (2 * Math.PI) / n;

  const point = (i: number, value: number) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const r = (value / 5) * RADIUS;
    return { x: CENTER + r * Math.cos(angle), y: CENTER + r * Math.sin(angle) };
  };

  const gridLevels = [1, 2, 3, 4, 5];
  const dataPoints = RADAR_CONSTRUCTS.map((c, i) => point(i, scores[c]));
  const pathD = dataPoints.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ' ' + p.y).join(' ') + ' Z';

  return (
    <svg viewBox={'0 0 ' + SIZE + ' ' + SIZE} className="radar-chart" role="img" aria-label="Knowledge profile radar chart">
      {gridLevels.map((level) => {
        const pts = RADAR_CONSTRUCTS.map((_, i) => point(i, level));
        const d = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ' ' + p.y).join(' ') + ' Z';
        return <path key={level} d={d} className="radar-grid" />;
      })}
      {RADAR_CONSTRUCTS.map((c, i) => {
        const outer = point(i, 5);
        const light = trafficLight(scores[c]);
        return (
          <g key={c}>
            <line x1={CENTER} y1={CENTER} x2={outer.x} y2={outer.y} className="radar-axis" />
            <text x={outer.x} y={outer.y} className={'radar-label radar-' + light} textAnchor="middle" dominantBaseline="middle">
              {c}
            </text>
          </g>
        );
      })}
      <path d={pathD} className="radar-area" />
    </svg>
  );
}
