import type { Construct, Lever } from '../types';

export const CONSTRUCT_LABELS: Record<Construct, string> = {
  KS: 'Knowledge sharing',
  HC: "People's know-how",
  SC: 'Documented knowledge',
  RC: 'Collaboration and partnerships',
  TC: 'Trust',
  AC: 'Learning and applying new knowledge',
  IN: 'Innovation',
  OP: 'Business results',
};

export const LEVERS: Lever[] = ['KS', 'HC', 'SC', 'RC', 'TC', 'AC'];
export const RADAR_CONSTRUCTS: Construct[] = ['KS','HC','SC','RC','TC','AC','IN','OP'];

export const TOTAL_EFFECT_ON_IN: Record<Lever, number> = {
  AC: 0.431, KS: 0.414, TC: 0.352, HC: 0.251, SC: 0.22, RC: 0.042,
};
export const TOTAL_EFFECT_ON_OP: Record<Lever, number> = {
  AC: 0.272, KS: 0.261, TC: 0.221, HC: 0.158, SC: 0.139, RC: 0.027,
};
export const BOTTLENECK_LEVERS: Lever[] = ['KS', 'AC', 'TC', 'HC', 'SC'];
export const MEDIATION_MESSAGES = {
  ksIn: 'Knowledge sharing increases innovation through absorptive capacity — not directly.',
  ksSc: 'Sharing alone does not build documented knowledge; it works through people, trust, and partnerships.',
  rc: 'Partnerships help store knowledge (SC) but do not directly drive innovation in this model.',
} as const;
export const DISCLAIMERS = [
  'Estimates based on the PLS-SEM structural model validated in Oliveira et al. (2020), Journal of Intellectual Capital.',
  'Path coefficients reflect causal effects in the theoretical model, not bivariate correlations.',
  'Single respondent; cross-sectional design; SME sample Brazil and Portugal; industry not controlled.',
  '12-item proxy form approximates full constructs.',
] as const;
export const CITATION =
  'Oliveira, M., Curado, C., Balle, A. R., and Kianto, A. (2020). Knowledge sharing, intellectual capital and organizational results in SMEs: are they related? Journal of Intellectual Capital, 21(6), 893-911.';
