# ============================================================
# FORJA v2 — build multi-stage (Next.js standalone)
# ============================================================

# ---------- deps: instala dependências e gera o cliente Prisma ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund
COPY prisma ./prisma
RUN npx prisma generate

# ---------- builder: compila o app e o seed ----------
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build
# compila o seed para JS puro (não precisa de tsx no runtime)
RUN npx tsc prisma/seed.ts --outDir build --rootDir . --module commonjs --target es2020 \
    --moduleResolution node --esModuleInterop --skipLibCheck --strict false

# ---------- runner: imagem final (usuário node, sem root) ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# node_modules completo (inclui CLI do Prisma + deps, bcryptjs, tsx) —
# o standalone também o usa, e sobrescrever com o conjunto completo é seguro.
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/build ./build
COPY --from=builder --chown=node:node /app/package.json ./package.json

# app compilado (standalone)
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

COPY --chown=node:node docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER node
EXPOSE 3000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
