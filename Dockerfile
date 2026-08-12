# Knowledge Lever Simulator — production image
#
# Runtime contract:
# - Build: bun install --frozen-lockfile && bun run build → dist/
# - Runtime: miniserve serves static SPA (no Node)
# - Port: 8080
# - Health: GET / → 200 (index.html)
# - Env: none
# - Persistence: none
#
#   docker build -t knowledge-lever-simulator .
#   docker run --rm -p 8080:8080 knowledge-lever-simulator

# ---- build ----
FROM oven/bun:1.3.14 AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY index.html ./
COPY public ./public
COPY src ./src
COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts ./

RUN bun run build

# ---- runtime ----
FROM docker.io/svenstaro/miniserve:0.35.0-alpine AS runtime

COPY --from=build /app/dist /app

EXPOSE 8080
CMD ["--spa", "--index", "index.html", "/app"]
