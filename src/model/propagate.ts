import type { LeverDeltas, PropagationResult } from '../types';

/** Propagate direct lever interventions through supported structural paths (Table 7). */
export function propagate(d: LeverDeltas): PropagationResult {
  const dKS = d.KS ?? 0;
  const dHCdirect = d.HC ?? 0;
  const dRCdirect = d.RC ?? 0;
  const dTCdirect = d.TC ?? 0;
  const dSCdirect = d.SC ?? 0;
  const dACdirect = d.AC ?? 0;

  const dHC = 0.58 * dKS + dHCdirect;
  const dRC = 0.487 * dKS + 0.253 * dHC + dRCdirect;
  const dTC = 0.356 * dKS + 0.347 * dHC + dTCdirect;
  const dSC = 0.319 * dHC + 0.262 * dTC + 0.193 * dRC + dSCdirect;
  const dAC = 0.284 * dKS + 0.111 * dHC + 0.357 * dTC + 0.135 * dSC + dACdirect;
  const dIN = 0.14 * dTC + 0.162 * dSC + 0.431 * dAC;
  const dOP = 0.63 * dIN;

  return { dHC, dRC, dTC, dSC, dAC, dIN, dOP };
}

export function clampScore(value: number, min = 1, max = 5): number {
  return Math.min(max, Math.max(min, value));
}

export function applyPropagation(
  scores: import('../types').ConstructScores,
  deltas: LeverDeltas,
): import('../types').ConstructScores {
  const p = propagate(deltas);
  return {
    KS: clampScore(scores.KS + (deltas.KS ?? 0)),
    HC: clampScore(scores.HC + p.dHC),
    SC: clampScore(scores.SC + p.dSC),
    RC: clampScore(scores.RC + p.dRC),
    TC: clampScore(scores.TC + p.dTC),
    AC: clampScore(scores.AC + p.dAC),
    IN: clampScore(scores.IN + p.dIN),
    OP: clampScore(scores.OP + p.dOP),
  };
}
