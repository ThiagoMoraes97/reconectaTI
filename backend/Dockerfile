FROM oven/bun:1 AS build

WORKDIR /app
COPY backend/package.json backend/bun.lock ./
COPY backend/prisma ./prisma
RUN bun install --frozen-lockfile
COPY backend ./
RUN bun run prisma:generate && bun run build

FROM oven/bun:1 AS runtime

WORKDIR /app
ENV NODE_ENV=production \
    PORT=3002 \
    DATABASE_URL=file:/data/reconecta.db
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
RUN mkdir -p /data
EXPOSE 3002
CMD ["sh", "-c", "bun run prisma:deploy && bun run prisma:seed && bun dist/src/index.js"]
