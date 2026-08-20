# syntax=docker/dockerfile:1

# ---- deps + build ----------------------------------------------------------
FROM node:24-slim AS build
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile

# Only needed at build time: vite.config.ts requires both to be set, but the
# actual values don't matter for a production `vite build` (no dev/preview
# server is started here).
ENV BASE_PATH=/
ENV PORT=4173

RUN pnpm --filter @workspace/timedive build
RUN pnpm --filter @workspace/api-server build

# ---- runtime ----------------------------------------------------------------
FROM node:24-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# api-server's build is a single self-contained esbuild bundle (workspace
# deps like @workspace/db are inlined), so no node_modules are needed here.
COPY --from=build /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=build /app/artifacts/timedive/dist/public ./artifacts/timedive/dist/public

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
