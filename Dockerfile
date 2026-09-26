FROM oven/bun:1 AS bun-runtime

FROM node:22-bookworm-slim AS frontend-build

WORKDIR /app
COPY --from=bun-runtime /usr/local/bin/bun /usr/local/bin/bun
COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile
COPY . .
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN node ./node_modules/vite/bin/vite.js build

FROM node:22-bookworm-slim AS frontend

WORKDIR /app
ENV NODE_ENV=production \
    NITRO_HOST=0.0.0.0 \
    NITRO_PORT=3000
COPY --from=frontend-build /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
