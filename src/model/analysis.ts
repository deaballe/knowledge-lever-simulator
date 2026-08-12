import type { Construct, ConstructScores, Lever, PriorityItem, TrafficLight } from '../types';
import {
  BOTTLENECK_LEVERS,
  CONSTRUCT_LABELS,
  LEVERS,
  RADAR_CONSTRUCTS,
  TOTAL_EFFECT_ON_IN,
  TOTAL_EFFECT_ON_OP,
  WEAK_EXPLANATIONS,
} from './constants';

export function trafficLight(score: number): TrafficLight {
  if (score >= 4) return 'green';
  if (score >= 3) return 'yellow';
  return 'red';
}

export function computePriorities(scores: ConstructScores): PriorityItem[] {
  return LEVERS.map((lever) => {
    const score = scores[lever];
    const totalEffectIN = TOTAL_EFFECT_ON_IN[lever];
    const totalEffectOP = TOTAL_EFFECT_ON_OP[lever];
    return {
      lever,
      label: CONSTRUCT_LABELS[lever],
      totalEffectIN,
      totalEffectOP,
      priority: totalEffectOP * (5 - score),
      score,
    };
  }).sort((a, b) => b.priority - a.priority);
}

/** Primary actionable bottleneck: weakest lever relative to its causal effect on OP. */
export function findBottleneck(scores: ConstructScores): Lever {
  let best: Lever = 'AC';
  let minRatio = Infinity;
  for (const lever of BOTTLENECK_LEVERS) {
    const ratio = scores[lever] / TOTAL_EFFECT_ON_OP[lever];
    if (ratio < minRatio) {
      minRatio = ratio;
      best = lever;
    }
  }
  return best;
}

export type WeakArea = {
  construct: Construct;
  label: string;
  score: number;
  explanation: string;
  kind: 'lever' | 'outcome';
};

/** All constructs in the red zone (score < 3), levers first by causal weight on OP. */
export function findWeakAreas(scores: ConstructScores): WeakArea[] {
  const weak = RADAR_CONSTRUCTS.filter((c) => trafficLight(scores[c]) === 'red').map((c) => {
    const isLever = (LEVERS as Construct[]).includes(c);
    return {
      construct: c,
      label: CONSTRUCT_LABELS[c],
      score: scores[c],
      explanation: WEAK_EXPLANATIONS[c],
      kind: isLever ? ('lever' as const) : ('outcome' as const),
    };
  });

  return weak.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'lever' ? -1 : 1;
    if (a.kind === 'lever' && b.kind === 'lever') {
      return TOTAL_EFFECT_ON_OP[b.construct as Lever] - TOTAL_EFFECT_ON_OP[a.construct as Lever];
    }
    if (a.construct === 'IN') return -1;
    if (b.construct === 'IN') return 1;
    return a.score - b.score;
  });
}

export function formatDelta(n: number): string {
  return (n >= 0 ? '+' : '') + n.toFixed(2);
}

export function pctChange(before: number, after: number): string {
  if (before <= 0) return '—';
  return (((after - before) / before) * 100).toFixed(0) + '%';
}
