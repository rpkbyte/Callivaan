FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.base.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/database/package*.json ./packages/database/
COPY apps/worker/package*.json ./apps/worker/
RUN npm install
COPY packages/shared ./packages/shared
COPY packages/database ./packages/database
COPY apps/worker ./apps/worker
RUN npm run build --workspace=@callivaan/shared && \
    npm run build --workspace=@callivaan/database && \
    npm run build --workspace=@callivaan/worker

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
CMD ["node", "apps/worker/dist/index.js"]
