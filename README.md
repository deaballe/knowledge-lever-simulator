# Knowledge Lever Simulator for SMEs

Manager-facing tool based on Oliveira et al. (2020) — PLS-SEM structural model for knowledge sharing, intellectual capital, absorptive capacity, innovation, and organizational performance.

## Run locally

```bash
bun install
bun dev
```

Open http://localhost:5173

## Build

```bash
bun run build
bun run preview
```

## Flow

1. Welcome
2. 12 questions (scale 1–5)
3. Diagnosis (radar + bottleneck)
4. Prioritization (Top 3 levers, causal impact)
5. Action playbook (checkboxes — each action adds +0.5 to its lever)
6. Impact review (estimated IN/OP from selected actions)
7. Executive summary (print)

All calculations run in the browser — no backend.

## Citation

Oliveira, M., Curado, C., Balle, A. R., & Kianto, A. (2020). Knowledge sharing, intellectual capital and organizational results in SMEs: are they related? *Journal of Intellectual Capital*, 21(6), 893–911. https://doi.org/10.1108/JIC-04-2019-0077
