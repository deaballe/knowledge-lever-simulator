import type { Lever } from './types';
import { CONSTRUCT_LABELS } from './model/constants';

export type PlaybookAction = {
  id: string;
  title: string;
  rationale: string;
  /** Custom/other initiatives for this lever — always counts as one action (+0.5). */
  isOther?: boolean;
};

export type PlaybookSection = {
  lever: Lever;
  label: string;
  intro?: string;
  actions: PlaybookAction[];
};

function otherAction(lever: Lever): PlaybookAction {
  const code = lever.toLowerCase();
  return {
    id: `${code}-other`,
    title: 'Other actions for this lever',
    rationale:
      'If none of the listed options fit, mark this once for any other initiatives you will pursue here. It counts as a single planned action (+0.5), even if you plan several custom steps.',
    isOther: true,
  };
}

export const PLAYBOOK: PlaybookSection[] = [
  {
    lever: 'KS',
    label: CONSTRUCT_LABELS.KS,
    intro: 'Sharing alone does not create innovation directly — it fuels trust, know-how, and learning capacity.',
    actions: [
      { id: 'ks-1', title: 'Lead by example — owners and managers visibly share what they know in meetings.', rationale: 'Top management as role models (section 5.2).' },
      { id: 'ks-2', title: 'Create simple sharing routines — short weekly huddles, peer demos, mentoring pairs.', rationale: 'Non-technological KS mechanisms; socialization in flat SMEs.' },
      { id: 'ks-3', title: 'Reward knowledge donation and asking — recognize people who teach and who seek help.', rationale: 'Rewards and career promotion tied to KS (section 5.2).' },
      { id: 'ks-4', title: 'Provide collaboration tools — shared drives, wikis, chat channels for teams.', rationale: 'Technological KS mechanisms (section 5.2).' },
      { id: 'ks-5', title: 'Hire and retain people willing to collaborate — include sharing attitude in selection.', rationale: 'Employee selection (section 5.2).' },
      otherAction('KS'),
    ],
  },
  {
    lever: 'HC',
    label: CONSTRUCT_LABELS.HC,
    actions: [
      { id: 'hc-1', title: 'Invest in targeted training for critical skills gaps.', rationale: 'Human capital as expertise stock.' },
      { id: 'hc-2', title: 'Use cross-training so key skills are not held by one person only.', rationale: 'Overlapping roles in SMEs.' },
      { id: 'hc-3', title: 'Mentor new hires through experienced staff.', rationale: 'Tacit knowledge transfer via socialization.' },
      { id: 'hc-4', title: 'Plan for succession — identify backups for critical roles.', rationale: 'SMEs cannot afford knowledge loss when someone leaves.' },
      otherAction('HC'),
    ],
  },
  {
    lever: 'SC',
    label: CONSTRUCT_LABELS.SC,
    intro: 'Critical for SMEs: turn tacit knowledge into organizational assets before people leave.',
    actions: [
      { id: 'sc-1', title: 'Document core processes — SOPs, checklists, templates for recurring work.', rationale: 'Externalization: tacit to explicit knowledge.' },
      { id: 'sc-2', title: 'Capture lessons from projects in a searchable knowledge base.', rationale: 'Structural capital as organizational storehouses.' },
      { id: 'sc-3', title: 'Make documents easy to find — clear folders, naming rules, one shared system.', rationale: 'Accessibility of documented knowledge.' },
      { id: 'sc-4', title: 'Run handover sessions when someone changes role or leaves.', rationale: 'Mitigate knowledge loss on exit.' },
      { id: 'sc-5', title: 'Use simple IT (CRM, ERP, wiki) to store solutions and customer know-how.', rationale: 'Information systems supporting structural capital.' },
      otherAction('SC'),
    ],
  },
  {
    lever: 'RC',
    label: CONSTRUCT_LABELS.RC,
    intro: 'Partnerships help store knowledge; in this model they do not directly drive innovation.',
    actions: [
      { id: 'rc-1', title: 'Set cross-team problem-solving sessions for internal issues.', rationale: 'Internal relational collaboration.' },
      { id: 'rc-2', title: 'Involve customers and suppliers in co-design or feedback loops.', rationale: 'External stakeholder collaboration.' },
      { id: 'rc-3', title: 'Build strategic partnerships with universities, clusters, or industry peers.', rationale: 'Expand enterprise boundaries.' },
      { id: 'rc-4', title: 'Leverage proximity — SMEs benefit from close partner relationships.', rationale: "Partners' nearness as facilitator." },
      otherAction('RC'),
    ],
  },
  {
    lever: 'TC',
    label: CONSTRUCT_LABELS.TC,
    actions: [
      { id: 'tc-1', title: 'Keep commitments to employees, customers, and partners.', rationale: 'Promises and agreements build trust.' },
      { id: 'tc-2', title: 'Communicate expertise honestly — do not overpromise.', rationale: 'Stakeholders trust your expertise.' },
      { id: 'tc-3', title: 'Protect reputation — consistent quality and ethical conduct.', rationale: 'Image and reputation inspire trust.' },
      { id: 'tc-4', title: 'Foster psychological safety so people share without fear.', rationale: 'Trust atmosphere enables knowledge sharing.' },
      otherAction('TC'),
    ],
  },
  {
    lever: 'AC',
    label: CONSTRUCT_LABELS.AC,
    intro: 'Central mediator: without this, knowledge sharing does not translate into innovation.',
    actions: [
      { id: 'ac-1', title: 'Scan outside the company — monitor competitors, customers, industry trends.', rationale: 'Recognize valuable new knowledge.' },
      { id: 'ac-2', title: 'Run small pilots to test new ideas before full rollout.', rationale: 'Apply knowledge into new solutions.' },
      { id: 'ac-3', title: 'Bring external input in — conferences, supplier visits, customer visits.', rationale: 'SMEs need external ideas for innovation.' },
      { id: 'ac-4', title: 'Integrate views across the firm — discuss external insights in team meetings.', rationale: 'Integrate opinions from the organization.' },
      { id: 'ac-5', title: 'Build routines to acquire, discuss, and implement new know-how.', rationale: 'Absorptive capacity as organizational routines.' },
      otherAction('AC'),
    ],
  },
];

export const OUTCOMES_PLAYBOOK_NOTE =
  'Innovation and business results improve when you strengthen the levers above — especially learning and applying new knowledge (AC) and knowledge sharing (KS). Use the simulator to estimate the impact. “Other actions” counts as one planned action per lever (+0.5), even if you pursue several custom initiatives.';
