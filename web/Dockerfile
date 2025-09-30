# ========== Base de build ==========
FROM node:20-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Workspace para que pnpm resuelva deps
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY web/package.json web/package.json

# Instalar deps solo para web (respeta lockfile)
RUN pnpm --filter @pasteleria/web... install --frozen-lockfile

# Copiar código de web y generar prisma
COPY web web
WORKDIR /app/web
RUN npx prisma generate

# Build de Next (turbopack + standalone)
WORKDIR /app
RUN pnpm --filter @pasteleria/web build

# ========== Runtime (producción) ==========
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Prisma Node-API en Alpine
RUN apk add --no-cache openssl libc6-compat

COPY --from=base /app/web/.next/standalone ./
COPY --from=base /app/web/.next/static ./.next/static
COPY --from=base /app/web/public ./public

# Asegura que escuche en todas las interfaces
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

CMD ["node", "web/server.js"]
