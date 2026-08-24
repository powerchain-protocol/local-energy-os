# syntax=docker/dockerfile:1.7
FROM node:24-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@11.22.0 --activate
WORKDIR /workspace

FROM base AS dependencies
COPY . .
RUN --mount=type=cache,id=powerchain-pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM dependencies AS builder
RUN pnpm db:generate && pnpm build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/platform/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/platform/.next/static ./apps/platform/.next/static
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/platform/public ./apps/platform/public
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD wget -qO- http://127.0.0.1:3000/api/v1/health || exit 1
CMD ["node", "apps/platform/server.js"]
