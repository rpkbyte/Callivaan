FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.base.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/database/package*.json ./packages/database/
COPY apps/media-gateway/package*.json ./apps/media-gateway/
RUN npm install
COPY packages/shared ./packages/shared
COPY packages/database ./packages/database
COPY apps/media-gateway ./apps/media-gateway
RUN npm run build --workspace=@callivaan/shared && \
    npm run build --workspace=@callivaan/database && \
    npm run build --workspace=@callivaan/media-gateway

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
EXPOSE 4001
CMD ["node", "apps/media-gateway/dist/index.js"]
