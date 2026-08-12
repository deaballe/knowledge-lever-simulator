# Knowledge Lever Simulator — production image
#
# Runtime contract:
# - Build: bun install --frozen-lockfile && bun run build → dist/
# - Runtime: nginx serves static SPA (no Node process)
# - Port: 8080
# - Health: GET $BASE_PATH → 200 (index.html)
# - Env (runtime):
#     BASE_PATH — public URL path (default /knowledge-lever-simulator/)
#                 use / for domain root
# - Persistence: none
#
#   docker build -t knowledge-lever-simulator .
#   docker run --rm -p 8080:8080 knowledge-lever-simulator
#   docker run --rm -p 8080:8080 -e BASE_PATH=/ knowledge-lever-simulator

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
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

ENV BASE_PATH=/knowledge-lever-simulator/

# Immutable build output; entrypoint copies under $BASE_PATH on start
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/app
COPY --chown=nginx:nginx docker/15-runtime-base-path.sh /docker-entrypoint.d/15-runtime-base-path.sh

# Stock default.conf is replaced at container start
RUN rm -f /etc/nginx/conf.d/default.conf \
 && chmod +x /docker-entrypoint.d/15-runtime-base-path.sh

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
