FROM node:22-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 CHECKPOINT_DISABLE=1

FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production PATH=/app/node_modules/.bin:$PATH
COPY --from=build --chown=node:node /app ./
USER node
EXPOSE 3000
# Migrations and the (idempotent) demo seed run on every start, then the server starts.
CMD ["sh", "-c", "prisma migrate deploy && tsx prisma/seed.ts && next start"]
