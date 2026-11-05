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

## Run with Wrangler

The Wrangler config serves `dist/` as static assets. No backend or Cloudflare
account is needed to run it locally.

```bash
bun install --frozen-lockfile
bun run build:worker
bunx wrangler@4.157.0 dev --ip 127.0.0.1 --port 8787
```

Open http://127.0.0.1:8787.

`build:worker` uses `/` as the asset base for a dedicated hostname. The existing
`build` command keeps `/knowledge-lever-simulator/` for the Docker deployment
behind a path-stripping proxy.

### Run on self-host

Create a native Application from this repository and select **Worker or static
site**. Keep the supplied Node, Wrangler and workerd dependencies, and add
`bun` version `1.3.14`. Set these build commands:

```bash
bun install --frozen-lockfile
bun run build:worker
```

Set the Wrangler config path to `wrangler.jsonc`, enable Web publication and
choose a free loopback port. self-host serves the site locally with workerd;
it does not deploy to Cloudflare.

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
