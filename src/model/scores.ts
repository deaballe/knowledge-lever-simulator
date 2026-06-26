import type { ConstructScores } from '../types';

export function answersToScores(answers: number[]): ConstructScores {
  if (answers.length !== 12) throw new Error('Expected 12 answers');
  const mean = (a: number, b: number) => (a + b) / 2;
  return {
    KS: mean(answers[0], answers[1]),
    HC: answers[2],
    SC: mean(answers[3], answers[4]),
    RC: mean(answers[5], answers[6]),
    TC: answers[7],
    AC: mean(answers[8], answers[9]),
    IN: answers[10],
    OP: answers[11],
  };
}
