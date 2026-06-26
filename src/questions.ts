import type { Construct } from './types';

export type Question = {
  id: number;
  construct: Construct;
  text: string;
  block: number;
  blockTitle: string;
};

export const QUESTION_BLOCKS = [
  'Knowledge flow',
  'Organizational knowledge',
  'Trust and learning',
  'Outcomes',
] as const;

export const QUESTIONS: Question[] = [
  { id: 1, construct: 'KS', block: 0, blockTitle: QUESTION_BLOCKS[0], text: 'People openly share what they know with colleagues.' },
  { id: 2, construct: 'KS', block: 0, blockTitle: QUESTION_BLOCKS[0], text: 'People ask colleagues for help when they need know-how.' },
  { id: 3, construct: 'HC', block: 1, blockTitle: QUESTION_BLOCKS[1], text: 'Our people have the expertise the business needs.' },
  { id: 4, construct: 'SC', block: 1, blockTitle: QUESTION_BLOCKS[1], text: 'Important know-how is captured in documents, systems, or databases.' },
  { id: 5, construct: 'SC', block: 1, blockTitle: QUESTION_BLOCKS[1], text: 'People can easily find and use existing documents and solutions.' },
  { id: 6, construct: 'RC', block: 1, blockTitle: QUESTION_BLOCKS[1], text: 'Teams work together smoothly to solve problems.' },
  { id: 7, construct: 'RC', block: 1, blockTitle: QUESTION_BLOCKS[1], text: 'We collaborate effectively with customers, suppliers, and partners.' },
  { id: 8, construct: 'TC', block: 2, blockTitle: QUESTION_BLOCKS[2], text: "Stakeholders trust our company's expertise." },
  { id: 9, construct: 'AC', block: 2, blockTitle: QUESTION_BLOCKS[2], text: 'We spot valuable new information or knowledge from outside the company.' },
  { id: 10, construct: 'AC', block: 2, blockTitle: QUESTION_BLOCKS[2], text: 'We turn what we learn into new solutions, products, or processes.' },
  { id: 11, construct: 'IN', block: 3, blockTitle: QUESTION_BLOCKS[3], text: 'Compared with main competitors, we innovate more in products and services.' },
  { id: 12, construct: 'OP', block: 3, blockTitle: QUESTION_BLOCKS[3], text: 'Compared with main competitors, our profit growth is stronger.' },
];

export const SCALE_LABELS = [
  'Strongly disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly agree',
] as const;
