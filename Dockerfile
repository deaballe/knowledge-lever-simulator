# Knowledge Lever Simulator — production image
#
# Runtime contract:
# - Build: bun install --frozen-lockfile && bun run build → dist/
# - Runtime: nginx serves static files (no Node)
# - Port: 80
# - Health: GET / → 200 (index.html)
# - Env: none
# - Persistence: none
# - Deploy: Vite base is /knowledge-lever-simulator/; reverse proxy must
#   Strip Path and forward to Internal Path /
#   Container Port must be 80
#
#   docker build -t knowledge-lever-simulator .
#   docker run --rm -p 8080:80 knowledge-lever-simulator

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
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
