import { useMemo, useRef, useState } from 'react';
import type { ConstructScores } from './types';
import { QUESTIONS, SCALE_LABELS, QUESTION_BLOCKS } from './questions';
import { PLAYBOOK, OUTCOMES_PLAYBOOK_NOTE } from './actions';
import {
  CONSTRUCT_LABELS,
  LEVERS,
  MEDIATION_MESSAGES,
  DISCLAIMERS,
  CITATION,
  CREDITS,
  RADAR_CONSTRUCTS,
} from './model/constants';
import { answersToScores } from './model/scores';
import {
  computePriorities,
  findBottleneck,
  findWeakAreas,
  trafficLight,
  formatDelta,
  pctChange,
} from './model/analysis';
import { actionsToDeltas, DELTA_PER_ACTION } from './model/actionsToDeltas';
import { applyPropagation } from './model/propagate';
import { RadarChart } from './components/RadarChart';
import { PdfReport } from './components/PdfReport';

const STEPS = [
  'Welcome',
  'Questionnaire',
  'Diagnosis',
  'Priorities',
  'Playbook',
  'Impact review',
  'Summary',
] as const;

const EMPTY_ANSWERS: (number | null)[] = Array(12).fill(null);

function allAnswersFilled(answers: (number | null)[]): answers is number[] {
  return answers.every((a) => a !== null);
}

export default function App() {
  const [step, setStep] = useState(0);
  const [questionBlock, setQuestionBlock] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([...EMPTY_ANSWERS]);
  const [checkedActions, setCheckedActions] = useState<Set<string>>(new Set());
  const [pdfBusy, setPdfBusy] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const scores = useMemo<ConstructScores | null>(() => {
    if (!allAnswersFilled(answers)) return null;
    return answersToScores(answers);
  }, [answers]);

  const priorities = useMemo(
    () => (scores ? computePriorities(scores) : []),
    [scores],
  );

  const top3Levers = useMemo(
    () => priorities.slice(0, 3).map((p) => p.lever),
    [priorities],
  );

  const bottleneck = useMemo(
    () => (scores ? findBottleneck(scores) : null),
    [scores],
  );

  const weakAreas = useMemo(
    () => (scores ? findWeakAreas(scores) : []),
    [scores],
  );

  const sortedPlaybook = useMemo(() => {
    const order = new Map(top3Levers.map((lever, i) => [lever, i]));
    return [...PLAYBOOK].sort((a, b) => {
      const ai = order.get(a.lever) ?? 99;
      const bi = order.get(b.lever) ?? 99;
      return ai - bi;
    });
  }, [top3Levers]);

  const leverDeltas = useMemo(
    () => (scores ? actionsToDeltas(checkedActions, scores) : null),
    [scores, checkedActions],
  );

  const simScores = useMemo(
    () => (scores && leverDeltas ? applyPropagation(scores, leverDeltas) : null),
    [scores, leverDeltas],
  );

  const hasKsActions = useMemo(
    () =>
      PLAYBOOK.some(
        (s) => s.lever === 'KS' && s.actions.some((a) => checkedActions.has(a.id)),
      ),
    [checkedActions],
  );

  const blockQuestions = QUESTIONS.filter((q) => q.block === questionBlock);
  const blockComplete = blockQuestions.every((q) => answers[q.id - 1] !== null);

  const setAnswer = (index: number, value: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const toggleAction = (id: string) => {
    setCheckedActions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canAdvanceFromQuestionnaire =
    questionBlock < QUESTION_BLOCKS.length - 1 ? blockComplete : allAnswersFilled(answers);

  const goNext = () => {
    if (step === 1 && questionBlock < QUESTION_BLOCKS.length - 1) {
      setQuestionBlock((b) => b + 1);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    if (step === 1 && questionBlock > 0) {
      setQuestionBlock((b) => b - 1);
      return;
    }
    setStep((s) => Math.max(s - 1, 0));
  };

  const restart = () => {
    setStep(0);
    setQuestionBlock(0);
    setAnswers([...EMPTY_ANSWERS]);
    setCheckedActions(new Set());
  };

  const downloadPdf = async () => {
    if (!pdfRef.current || pdfBusy) return;
    setPdfBusy(true);
    const host = pdfRef.current.closest('.pdf-export-host');
    host?.classList.add('pdf-export-host--capturing');
    try {
      // Let layout settle while visible to html2canvas (opacity 0 causes blank pages)
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const html2pdf = (await import('html2pdf.js')).default;
      const stamp = new Date().toISOString().slice(0, 10);
      await html2pdf()
        .set({
          margin: [12, 8, 10, 8],
          filename: `knowledge-lever-report-${stamp}.pdf`,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 680,
            scrollX: 0,
            scrollY: 0,
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          pagebreak: { mode: ['css', 'legacy'] },
        } as any)
        .from(pdfRef.current)
        .save();
    } finally {
      host?.classList.remove('pdf-export-host--capturing');
      setPdfBusy(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header no-print">
        <p className="app-kicker">SME knowledge diagnostic</p>
        <h1>Knowledge Lever Simulator</h1>
        <nav className="stepper" aria-label="Progress">
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={
                'stepper-item' +
                (i === step ? ' stepper-item--active' : '') +
                (i < step ? ' stepper-item--done' : '')
              }
            >
              <span className="stepper-dot">{i + 1}</span>
              <span className="stepper-label">{label}</span>
            </span>
          ))}
        </nav>
      </header>

      <main className="app-main">
        {step === 0 && (
          <section className="panel">
            <h2>Welcome</h2>
            <p className="lead">
              This simulator helps small and medium enterprises assess knowledge-related
              capabilities, identify improvement priorities, and estimate how strengthening
              key levers may affect innovation and business results.
            </p>
            <ul className="feature-list">
              <li>12-question self-assessment on a 1–5 scale</li>
              <li>Visual knowledge profile and priority ranking</li>
              <li>Evidence-based playbook of practical actions</li>
              <li>Impact review from your planned actions</li>
            </ul>
            <p className="muted">
              One respondent completes the questionnaire. Results are indicative, not a formal audit.
            </p>
          </section>
        )}

        {step === 1 && (
          <section className="panel">
            <h2>Questionnaire</h2>
            <p className="block-title">{QUESTION_BLOCKS[questionBlock]}</p>
            <p className="muted block-progress">
              Block {questionBlock + 1} of {QUESTION_BLOCKS.length}
            </p>
            <div className="question-list">
              {blockQuestions.map((q) => (
                <fieldset key={q.id} className="question-card">
                  <legend>
                    <span className="question-num">Q{q.id}</span> {q.text}
                  </legend>
                  <div className="scale-row" role="radiogroup" aria-label={q.text}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <label key={value} className="scale-option">
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={value}
                          checked={answers[q.id - 1] === value}
                          onChange={() => setAnswer(q.id - 1, value)}
                        />
                        <span className="scale-value">{value}</span>
                        <span className="scale-label">{SCALE_LABELS[value - 1]}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          </section>
        )}

        {step === 2 && scores && (
          <section className="panel">
            <h2>Diagnosis</h2>
            <p className="lead">Your knowledge profile across eight constructs.</p>
            <div className="radar-wrap">
              <RadarChart scores={scores} />
            </div>
            <div className="score-grid">
              {(Object.keys(CONSTRUCT_LABELS) as (keyof typeof CONSTRUCT_LABELS)[]).map(
                (key) => (
                  <div key={key} className={`score-card score-card--${trafficLight(scores[key])}`}>
                    <span className="score-card-code">{key}</span>
                    <span className="score-card-label">{CONSTRUCT_LABELS[key]}</span>
                    <span className="score-card-value">{scores[key].toFixed(2)}</span>
                  </div>
                ),
              )}
            </div>
            {weakAreas.length > 0 ? (
              <div className="callout callout--danger weak-areas">
                <h3 className="weak-areas-title">Areas of concern (red scores)</h3>
                <p className="weak-areas-intro">
                  Scores below 3 are marked in red. All of them need attention — not only the single
                  highest-leverage bottleneck for the model.
                </p>
                <ul className="weak-areas-list">
                  {weakAreas.map((area) => (
                    <li key={area.construct}>
                      <p className="weak-area-heading">
                        <strong>
                          {area.label} ({area.construct})
                        </strong>
                        <span className="weak-area-score">Score {area.score.toFixed(2)}</span>
                        {area.kind === 'outcome' && (
                          <span className="weak-area-tag">Outcome</span>
                        )}
                        {bottleneck === area.construct && (
                          <span className="weak-area-tag weak-area-tag--primary">
                            Highest-leverage bottleneck
                          </span>
                        )}
                      </p>
                      <p className="weak-area-explain">{area.explanation}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="callout">
                No construct scored in the red zone (below 3). Review yellow items next if any
                remain.
              </p>
            )}
            <div className="mediation-notes">
              <p>{MEDIATION_MESSAGES.ksIn}</p>
              <p>{MEDIATION_MESSAGES.ksSc}</p>
              <p>{MEDIATION_MESSAGES.rc}</p>
            </div>
            <p className="pdf-teaser muted">
              At the end you can download a PDF report of your diagnosis, planned actions, and
              estimated impact. The file is created in your browser and is not stored on our
              servers.
            </p>
          </section>
        )}

        {step === 3 && scores && (
          <section className="panel">
            <h2>Prioritization</h2>
            <p className="lead">
              Top three levers to improve first, ranked by potential impact on business results
              weighted by current gap.
            </p>
            <ol className="priority-list">
              {priorities.slice(0, 3).map((item, i) => (
                <li key={item.lever} className="priority-card">
                  <span className="priority-rank">#{i + 1}</span>
                  <div>
                    <h3>
                      {item.label} <span className="code-tag">{item.lever}</span>
                    </h3>
                    <p className="muted">Current score: {item.score.toFixed(2)}</p>
                    <p>
                      Model effect on innovation: {item.totalEffectIN.toFixed(3)} · on business
                      results: {item.totalEffectOP.toFixed(3)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {step === 4 && (
          <section className="panel">
            <h2>Playbook</h2>
            <p className="lead">
              Practical actions for each lever. Sections for your top three priorities are expanded
              first. Select the actions you plan to pursue — your choices drive the estimated impact
              on innovation and business results. If none of the listed options fit, choose{' '}
              <strong>Other actions</strong> for that lever: it counts as one planned action
              (+{DELTA_PER_ACTION.toFixed(1)}), not one per custom initiative.
            </p>
            <div className="playbook-list">
              {sortedPlaybook.map((section) => {
                const isTop = top3Levers.includes(section.lever);
                return (
                  <details key={section.lever} className="accordion" open={isTop}>
                    <summary>
                      <span>
                        {section.label}{' '}
                        {isTop && <span className="badge">Priority</span>}
                      </span>
                      <span className="code-tag">{section.lever}</span>
                    </summary>
                    <div className="accordion-body">
                      {section.intro && <p className="muted">{section.intro}</p>}
                      <ul className="action-list">
                        {section.actions.map((action) => (
                          <li
                            key={action.id}
                            className={
                              'action-item' + (action.isOther ? ' action-item--other' : '')
                            }
                          >
                            <label className="action-check">
                              <input
                                type="checkbox"
                                checked={checkedActions.has(action.id)}
                                onChange={() => toggleAction(action.id)}
                              />
                              <span>
                                {action.isOther ? 'We plan other actions' : 'We plan to do this'}
                              </span>
                            </label>
                            <p className="action-title">
                              {action.title}
                              {action.isOther && (
                                <span className="other-badge">Counts as 1 action</span>
                              )}
                            </p>
                            <p className="muted action-rationale">{action.rationale}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                );
              })}
            </div>
            <p className="callout muted">{OUTCOMES_PLAYBOOK_NOTE}</p>
          </section>
        )}

        {step === 5 && scores && leverDeltas && simScores && (
          <section className="panel">
            <h2>Impact review</h2>
            <p className="lead">
              Estimated causal impact based on the actions you selected. Each planned action adds +
              {DELTA_PER_ACTION} to its lever (up to the scale maximum).
            </p>

            {checkedActions.size === 0 && (
              <p className="callout">
                No actions selected. Go back to the Playbook step and check the actions you plan to
                pursue.
              </p>
            )}

            {checkedActions.size > 0 && (
              <>
                <h3>Planned actions</h3>
                <ul className="summary-actions">
                  {PLAYBOOK.flatMap((s) =>
                    s.actions
                      .filter((a) => checkedActions.has(a.id))
                      .map((a) => (
                        <li key={a.id}>
                          <strong>{s.label}:</strong> {a.title}
                        </li>
                      )),
                  )}
                </ul>
              </>
            )}

            <h3>Lever impacts</h3>
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Lever</th>
                  <th>Baseline</th>
                  <th>Planned actions</th>
                  <th>Direct delta</th>
                  <th>Simulated</th>
                </tr>
              </thead>
              <tbody>
                {LEVERS.map((lever) => {
                  const actionCount =
                    PLAYBOOK.find((s) => s.lever === lever)?.actions.filter((a) =>
                      checkedActions.has(a.id),
                    ).length ?? 0;
                  return (
                    <tr key={lever}>
                      <td>
                        {CONSTRUCT_LABELS[lever]} <span className="code-tag">{lever}</span>
                      </td>
                      <td>{scores[lever].toFixed(2)}</td>
                      <td>{actionCount}</td>
                      <td>{formatDelta(leverDeltas[lever])}</td>
                      <td>{simScores[lever].toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <h3>Estimated outcomes</h3>
            <div className="outcome-sim">
              <div className="outcome-card">
                <h3>Innovation (IN)</h3>
                <p>
                  {scores.IN.toFixed(2)} → {simScores.IN.toFixed(2)}{' '}
                  <span className="delta">{formatDelta(simScores.IN - scores.IN)}</span>
                </p>
                <p className="muted">
                  {pctChange(scores.IN, simScores.IN)} estimated causal change from selected lever
                  improvements
                </p>
              </div>
              <div className="outcome-card">
                <h3>Business results (OP)</h3>
                <p>
                  {scores.OP.toFixed(2)} → {simScores.OP.toFixed(2)}{' '}
                  <span className="delta">{formatDelta(simScores.OP - scores.OP)}</span>
                </p>
                <p className="muted">
                  {pctChange(scores.OP, simScores.OP)} estimated causal change from selected lever
                  improvements
                </p>
              </div>
            </div>

            {hasKsActions && (
              <p className="callout muted">{MEDIATION_MESSAGES.ksIn}</p>
            )}
          </section>
        )}

        {step === 6 && scores && simScores && leverDeltas && bottleneck && (
          <section className="panel summary-panel">
            <div className="pdf-banner no-print">
              <div>
                <h2 className="pdf-banner-title">Download your results</h2>
                <p>
                  Save a PDF with your diagnosis, planned actions, impact review, and summary.
                  The file is generated in your browser and is <strong>not stored</strong> on any
                  server — keep a local copy if you want to present or revisit your results.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={downloadPdf}
                disabled={pdfBusy}
              >
                {pdfBusy ? 'Preparing PDF…' : 'Download PDF'}
              </button>
            </div>

            <h2>Summary</h2>
            <p className="lead">Your diagnostic snapshot and estimated causal impact.</p>

            <h3>Top priorities</h3>
            <ol className="summary-priorities">
              {priorities.slice(0, 3).map((item, i) => (
                <li key={item.lever}>
                  {i + 1}. {item.label} ({item.lever}) — score {item.score.toFixed(2)}
                </li>
              ))}
            </ol>

            <h3>Planned actions</h3>
            {checkedActions.size === 0 ? (
              <p className="muted">No actions selected.</p>
            ) : (
              <ul className="summary-actions">
                {PLAYBOOK.flatMap((s) =>
                  s.actions
                    .filter((a) => checkedActions.has(a.id))
                    .map((a) => (
                      <li key={a.id}>
                        <strong>{s.label}:</strong> {a.title}
                      </li>
                    )),
                )}
              </ul>
            )}

            <h3>Simulation diagnosis</h3>
            <p className="muted">
              Baseline knowledge profile versus the simulated profile after your planned actions.
            </p>
            <div className="radar-compare">
              <div className="radar-compare-panel">
                <p className="radar-compare-caption">Baseline diagnosis</p>
                <RadarChart scores={scores} size={260} accent="#64748b" fillOpacity={0.22} />
              </div>
              <div className="radar-compare-panel">
                <p className="radar-compare-caption">Simulated diagnosis</p>
                <RadarChart scores={simScores} size={260} accent="#0f766e" fillOpacity={0.32} />
              </div>
            </div>

            <h3>Simulation outcomes</h3>
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Construct</th>
                  <th>Baseline</th>
                  <th>Simulated</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {RADAR_CONSTRUCTS.map((key) => (
                  <tr key={key}>
                    <td>{CONSTRUCT_LABELS[key]}</td>
                    <td>{scores[key].toFixed(2)}</td>
                    <td>{simScores[key].toFixed(2)}</td>
                    <td>{formatDelta(simScores[key] - scores[key])}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>Disclaimers</h3>
            <ul className="disclaimer-list">
              {DISCLAIMERS.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <p className="citation">{CITATION}</p>

            <div className="credits">
              <h3 className="credits-title">Software credits</h3>
              <ul className="credits-list">
                {CREDITS.map((person) => (
                  <li key={person.name}>
                    <span className="credits-name">{person.name}</span>
                    <span className="credits-role">{person.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {scores && simScores && leverDeltas && bottleneck && (
          <div className="pdf-export-host" aria-hidden="true">
            <div ref={pdfRef}>
              <PdfReport
                scores={scores}
                simScores={simScores}
                leverDeltas={leverDeltas}
                priorities={priorities}
                bottleneck={bottleneck}
                checkedActions={checkedActions}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer no-print">
        <div className="footer-actions">
          {step > 0 && step < STEPS.length - 1 && (
            <button type="button" className="btn btn-secondary" onClick={goBack}>
              Back
            </button>
          )}
          {step === 0 && (
            <button type="button" className="btn btn-primary" onClick={goNext}>
              Start assessment
            </button>
          )}
          {step > 0 && step < STEPS.length - 1 && (
            <button
              type="button"
              className="btn btn-primary"
              disabled={step === 1 && !canAdvanceFromQuestionnaire}
              onClick={goNext}
            >
              {step === 1 && questionBlock < QUESTION_BLOCKS.length - 1
                ? 'Next block'
                : step === 4
                  ? 'Review estimated impact'
                  : 'Continue'}
            </button>
          )}
          {step === STEPS.length - 1 && (
            <>
              <button
                type="button"
                className="btn btn-primary"
                onClick={downloadPdf}
                disabled={pdfBusy}
              >
                {pdfBusy ? 'Preparing PDF…' : 'Download PDF'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={restart}>
                Start over
              </button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
