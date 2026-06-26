import type { ConstructScores, Lever, PriorityItem, TrafficLight } from '../types';
import {
  BOTTLENECK_LEVERS,
  CONSTRUCT_LABELS,
  LEVERS,
  TOTAL_EFFECT_ON_IN,
  TOTAL_EFFECT_ON_OP,
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

export function formatDelta(n: number): string {
  return (n >= 0 ? '+' : '') + n.toFixed(2);
}

export function pctChange(before: number, after: number): string {
  if (before <= 0) return '—';
  return ((after - before) / before * 100).toFixed(0) + '%';
}
