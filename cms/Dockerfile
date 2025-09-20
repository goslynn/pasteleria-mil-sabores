# ========== Base de build ==========
FROM node:20-alpine AS base
WORKDIR /repo
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Copiamos workspace + cms para resolver deps
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY cms/package.json cms/package.json
# Instalar deps de cms (dev para build)
RUN pnpm --filter @pasteleria/cms... install --frozen-lockfile

# Copiar código cms y compilar
COPY cms cms
WORKDIR /repo/cms
RUN pnpm build

# ========== Runtime (producción) ==========
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=1337

# Deploy pruned (pnpm v9)
# Esto genera node_modules + files productivos mínimos en /app
COPY --from=base /repo /repo
RUN corepack enable && \
    cd /repo && pnpm deploy --filter @pasteleria/cms --prod /app

# Copiar el build de Strapi (dist)
COPY --from=base /repo/cms/dist ./dist
# Copiar público
COPY --from=base /repo/cms/public ./public

EXPOSE 1337
CMD ["node", "dist/server.js"]
