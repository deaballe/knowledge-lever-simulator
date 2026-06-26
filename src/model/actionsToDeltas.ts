import type { ConstructScores, Lever } from '../types';
import { PLAYBOOK } from '../actions';
import { LEVERS } from './constants';

export const DELTA_PER_ACTION = 0.5;

export function actionsToDeltas(
  checkedActionIds: Set<string>,
  scores: ConstructScores,
): Record<Lever, number> {
  const counts: Record<Lever, number> = {
    KS: 0,
    HC: 0,
    SC: 0,
    RC: 0,
    TC: 0,
    AC: 0,
  };

  for (const section of PLAYBOOK) {
    for (const action of section.actions) {
      if (checkedActionIds.has(action.id)) {
        counts[section.lever] += 1;
      }
    }
  }

  const deltas = {} as Record<Lever, number>;
  for (const lever of LEVERS) {
    const headroom = Math.max(0, 5 - scores[lever]);
    deltas[lever] = Math.min(counts[lever] * DELTA_PER_ACTION, headroom);
  }
  return deltas;
}
