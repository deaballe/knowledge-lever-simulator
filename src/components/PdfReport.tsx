import type { Construct, ConstructScores, Lever, PriorityItem } from '../types';
import { PLAYBOOK } from '../actions';
import {
  CITATION,
  CONSTRUCT_LABELS,
  CREDITS,
  DISCLAIMERS,
  LEVERS,
  RADAR_CONSTRUCTS,
} from '../model/constants';
import { findWeakAreas, formatDelta, pctChange, trafficLight } from '../model/analysis';
import { DELTA_PER_ACTION } from '../model/actionsToDeltas';
import { RadarChart } from './RadarChart';

const STATUS_COLOR = {
  green: '#15803d',
  yellow: '#a16207',
  red: '#b91c1c',
} as const;

const STATUS_BG = {
  green: '#dcfce7',
  yellow: '#fef9c3',
  red: '#fee2e2',
} as const;

type PdfReportProps = {
  scores: ConstructScores;
  simScores: ConstructScores;
  leverDeltas: Record<Lever, number>;
  priorities: PriorityItem[];
  bottleneck: Lever;
  checkedActions: Set<string>;
};

function StatusPill({ score }: { score: number }) {
  const status = trafficLight(score);
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.03em',
        textTransform: 'capitalize',
        color: STATUS_COLOR[status],
        background: STATUS_BG[status],
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
}

function ScoreBar({
  label,
  code,
  score,
}: {
  label: string;
  code: Construct;
  score: number;
}) {
  const status = trafficLight(score);
  const pct = Math.max(0, Math.min(100, (score / 5) * 100));
  return (
    <div className="pdf-bar-row">
      <div className="pdf-bar-label">
        <strong>{code}</strong>
        <span>{label}</span>
      </div>
      <div className="pdf-bar-track">
        <div
          className="pdf-bar-fill"
          style={{ width: `${pct}%`, background: STATUS_COLOR[status] }}
        />
      </div>
      <div className="pdf-bar-value">{score.toFixed(2)}</div>
    </div>
  );
}

function OutcomeCompare({
  label,
  before,
  after,
}: {
  label: string;
  before: number;
  after: number;
}) {
  const beforePct = (before / 5) * 100;
  const afterPct = (after / 5) * 100;
  return (
    <div className="pdf-outcome-card">
      <h4>{label}</h4>
      <div className="pdf-outcome-bars">
        <div className="pdf-outcome-row">
          <span>Before</span>
          <div className="pdf-bar-track">
            <div
              className="pdf-bar-fill"
              style={{ width: `${beforePct}%`, background: '#94a3b8' }}
            />
          </div>
          <strong>{before.toFixed(2)}</strong>
        </div>
        <div className="pdf-outcome-row">
          <span>After</span>
          <div className="pdf-bar-track">
            <div
              className="pdf-bar-fill"
              style={{ width: `${afterPct}%`, background: '#0f766e' }}
            />
          </div>
          <strong>{after.toFixed(2)}</strong>
        </div>
      </div>
      <p className="pdf-outcome-delta">
        {formatDelta(after - before)} ({pctChange(before, after)})
      </p>
    </div>
  );
}

export function PdfReport({
  scores,
  simScores,
  leverDeltas,
  priorities,
  bottleneck,
  checkedActions,
}: PdfReportProps) {
  const planned = PLAYBOOK.flatMap((section) =>
    section.actions
      .filter((a) => checkedActions.has(a.id))
      .map((a) => ({ section: section.label, title: a.title })),
  );

  const weakAreas = findWeakAreas(scores);

  const actionCount = (lever: Lever) =>
    PLAYBOOK.find((s) => s.lever === lever)?.actions.filter((a) =>
      checkedActions.has(a.id),
    ).length ?? 0;

  const generatedAt = new Date().toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div id="pdf-report" className="pdf-report">
      <header className="pdf-header">
        <p className="pdf-kicker">SME knowledge diagnostic</p>
        <h1>Knowledge Lever Simulator — Executive Report</h1>
        <p className="pdf-meta">
          Generated {generatedAt} · Browser-only export (not stored on any server)
        </p>
      </header>

      <section className="pdf-section pdf-page pdf-page--1">
        <h2>1. Diagnosis</h2>
        <div className="pdf-diag-layout">
          <div className="pdf-radar-wrap">
            <p className="pdf-radar-caption">Baseline profile</p>
            <RadarChart scores={scores} size={200} accent="#0f766e" />
          </div>
          <div className="pdf-bars-wrap">
            {RADAR_CONSTRUCTS.map((c) => (
              <ScoreBar
                key={c}
                code={c}
                label={CONSTRUCT_LABELS[c]}
                score={scores[c]}
              />
            ))}
          </div>
        </div>

        <p>
          Highest-leverage bottleneck among actionable levers:{' '}
          <strong>
            {CONSTRUCT_LABELS[bottleneck]} ({bottleneck})
          </strong>
        </p>

        {weakAreas.length > 0 && (
          <>
            <h3>Areas of concern (red scores below 3)</h3>
            <ul className="pdf-weak-list">
              {weakAreas.map((area) => (
                <li key={area.construct}>
                  <strong>
                    {area.label} ({area.construct})
                  </strong>{' '}
                  — score {area.score.toFixed(2)}
                  {area.kind === 'outcome' ? ' [outcome]' : ''}
                  {bottleneck === area.construct ? ' [highest-leverage bottleneck]' : ''}
                  <br />
                  {area.explanation}
                </li>
              ))}
            </ul>
          </>
        )}

        <table className="pdf-table pdf-table--scores">
          <colgroup>
            <col style={{ width: '55%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '25%' }} />
          </colgroup>
          <thead>
            <tr>
              <th>Construct</th>
              <th>Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {RADAR_CONSTRUCTS.map((c) => (
              <tr key={c}>
                <td>
                  {CONSTRUCT_LABELS[c]} ({c})
                </td>
                <td>{scores[c].toFixed(2)}</td>
                <td>
                  <StatusPill score={scores[c]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="pdf-h2-follow">2. Top priorities</h2>
        <div className="pdf-priority-row">
          {priorities.slice(0, 3).map((item, i) => (
            <div key={item.lever} className="pdf-priority-card">
              <div className="pdf-priority-rank">#{i + 1}</div>
              <strong>
                {item.label} ({item.lever})
              </strong>
              <p>Score {item.score.toFixed(2)}</p>
              <p className="pdf-note">Effect on OP: {item.totalEffectOP.toFixed(3)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pdf-section pdf-page pdf-page--2">
        <h2>3. Planned actions</h2>
        {planned.length === 0 ? (
          <p>No actions selected.</p>
        ) : (
          <ul className="pdf-action-list">
            {planned.map((item) => (
              <li key={`${item.section}-${item.title}`}>
                <strong>{item.section}:</strong> {item.title}
              </li>
            ))}
          </ul>
        )}
        <p className="pdf-note">
          Each planned action adds +{DELTA_PER_ACTION.toFixed(1)} to its lever (capped at the scale
          maximum). “Other actions” also counts as one planned action for that lever.
        </p>

        <h2 className="pdf-h2-follow">4. Impact review</h2>
        <table className="pdf-table">
          <colgroup>
            <col style={{ width: '36%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '18%' }} />
          </colgroup>
          <thead>
            <tr>
              <th>Lever</th>
              <th>Actions</th>
              <th>Baseline</th>
              <th>Direct Δ</th>
              <th>Simulated</th>
            </tr>
          </thead>
          <tbody>
            {LEVERS.map((lever) => (
              <tr key={lever}>
                <td>
                  {CONSTRUCT_LABELS[lever]} ({lever})
                </td>
                <td>{actionCount(lever)}</td>
                <td>{scores[lever].toFixed(2)}</td>
                <td>{formatDelta(leverDeltas[lever])}</td>
                <td>{simScores[lever].toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Simulation diagnosis</h3>
        <p className="pdf-note">
          Baseline profile (left) versus simulated profile after planned actions (right).
        </p>
        <div className="pdf-radar-compare">
          <div className="pdf-radar-panel">
            <p className="pdf-radar-caption">Baseline diagnosis</p>
            <RadarChart scores={scores} size={190} accent="#64748b" fillOpacity={0.22} />
          </div>
          <div className="pdf-radar-panel">
            <p className="pdf-radar-caption">Simulated diagnosis</p>
            <RadarChart scores={simScores} size={190} accent="#0f766e" fillOpacity={0.32} />
          </div>
        </div>

        <h3>Estimated causal outcomes</h3>
        <div className="pdf-outcomes">
          <OutcomeCompare
            label={CONSTRUCT_LABELS.IN}
            before={scores.IN}
            after={simScores.IN}
          />
          <OutcomeCompare
            label={CONSTRUCT_LABELS.OP}
            before={scores.OP}
            after={simScores.OP}
          />
        </div>
      </section>

      <section className="pdf-section pdf-page pdf-page--3">
        <h2>5. Notes and software credits</h2>
        <ul>
          {DISCLAIMERS.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <p className="pdf-citation">{CITATION}</p>
        <h3>Software credits</h3>
        <ul className="pdf-credits">
          {CREDITS.map((person) => (
            <li key={person.name}>
              <strong>{person.name}</strong> — {person.role}
            </li>
          ))}
        </ul>
        <p className="pdf-privacy">
          This PDF was generated locally in your browser. It is not uploaded or stored by this
          application. Save it on your device if you want to keep or share your results.
        </p>
      </section>
    </div>
  );
}
