FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_NAVER_MAP_CLIENT_ID
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_TOSS_CLIENT_KEY
ARG NAVER_MAP_CLIENT_SECRET
ENV DATABASE_URL="file:/app/prisma/dev.db"
ENV NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=$NEXT_PUBLIC_NAVER_MAP_CLIENT_ID
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_TOSS_CLIENT_KEY=$NEXT_PUBLIC_TOSS_CLIENT_KEY
ENV NAVER_MAP_CLIENT_SECRET=$NAVER_MAP_CLIENT_SECRET
# Next는 NEXT_PUBLIC_*를 빌드 시 인라인. 빈 키면 결제 코드가 DCE로 사라짐.
RUN test -n "$NEXT_PUBLIC_TOSS_CLIENT_KEY" || (echo "ERROR: NEXT_PUBLIC_TOSS_CLIENT_KEY build-arg empty" >&2; exit 1)
RUN printf '%s\n' \
  "NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}" \
  "NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=${NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}" \
  "NEXT_PUBLIC_TOSS_CLIENT_KEY=${NEXT_PUBLIC_TOSS_CLIENT_KEY}" \
  > .env.production
RUN npx prisma generate
RUN npx prisma db push --accept-data-loss
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV DATA_DIR=/data
ENV DATABASE_URL="file:/data/dev.db"
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs \
  && mkdir -p /app/prisma /data \
  && chown -R nextjs:nodejs /app/prisma /data

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# 시드 DB(최초 볼륨 비어 있을 때만 복사). 재배포 시 볼륨 데이터는 덮어쓰지 않음.
COPY --from=builder --chown=nextjs:nodejs /app/prisma/dev.db ./prisma/seed.db
COPY --from=builder --chown=nextjs:nodejs /app/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=builder /app/lib/generated ./lib/generated
# prisma CLI (런타임 스키마 동기화용)
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/package.json ./package.json
COPY --chown=nextjs:nodejs scripts/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
VOLUME ["/data"]
ENTRYPOINT ["/app/docker-entrypoint.sh"]
