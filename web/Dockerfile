# ========== Build ==========
FROM node:20-alpine AS build
WORKDIR /app
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN apk add --no-cache ca-certificates

# 1) Copiar manifiestos primero (mejor caché)
COPY pnpm-lock.yaml package.json ./

# 2) Instalar deps (incluye prisma y @prisma/client)
#    Si usas workspaces, agrega: pnpm install --filter ./...
RUN pnpm install --frozen-lockfile

# 3) Copiar el resto del código (incluye prisma/schema.prisma)
COPY . .

# 4) Generar el cliente Prisma (ya existe schema y node_modules)
RUN npx prisma generate

# 5) Build de Next (standalone)
RUN pnpm build

# ========== Runtime ==========
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Requisitos para Prisma en Alpine (Node-API)
RUN apk add --no-cache openssl libc6-compat

# 6) Copiar la app standalone y assets
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

# 7) Copiar binarios de Prisma necesarios en runtime
#    (Aun con standalone, @prisma/client y .prisma con engines nativos)
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/seed ./seed

# Servidor Next standalone expone server.js en la raíz del standalone
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
