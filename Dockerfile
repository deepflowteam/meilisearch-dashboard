FROM oven/bun:alpine AS build
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN bun run build

FROM oven/bun:alpine
WORKDIR /app
COPY --from=build /app/.output ./

ENV HOST=0.0.0.0
ENV NODE_ENV=production

EXPOSE 3000

CMD [ "bun", "server/index.mjs" ]
