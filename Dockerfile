# Knowledge Lever Simulator — production image
#
# Runtime contract:
# - Build: bun install --frozen-lockfile && bun run build → dist/
# - Runtime: nginx serves static files (no Node)
# - Port: 8080
# - Health: GET / → 200 (index.html)
# - Env: none
# - Persistence: none
# - Deploy: Vite base is /knowledge-lever-simulator/; reverse proxy must
#   Strip Path and forward to Internal Path /
#   Container Port must be 8080
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
FROM nginxinc/nginx-unprivileged:alpine

COPY --from=build /app/dist /usr/share/nginx/html

USER 101
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
