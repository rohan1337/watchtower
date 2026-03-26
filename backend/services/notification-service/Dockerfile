# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

ENV NODE_OPTIONS=--dns-result-order=ipv4first

WORKDIR /app

COPY package*.json ./

RUN npm config set registry https://registry.npmmirror.com && \
    npm config set prefer-online true
RUN npm ci --fetch-retries=5 --fetch-retry-mintimeout=20000

COPY . .

RUN npm run build


# ---- Stage 2: Production ----
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy everything from builder
COPY --from=builder /app ./

# 🔥 Remove devDependencies AFTER copy
RUN npm prune --omit=dev

CMD ["node", "dist/main.js"]