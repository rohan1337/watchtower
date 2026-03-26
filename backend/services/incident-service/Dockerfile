# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

ENV NODE_OPTIONS=--dns-result-order=ipv4first

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

RUN npm config set registry https://registry.npmmirror.com && \
    npm config set prefer-online true
RUN npm ci --fetch-retries=5 --fetch-retry-mintimeout=20000

COPY . .

# Generate Prisma client
RUN npx prisma generate

RUN npm run build


# ---- Stage 2: Production ----
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl postgresql-client

ENV NODE_ENV=production

# Copy everything from builder
COPY --from=builder /app ./

# 🔥 Remove devDependencies AFTER copy
RUN npm prune --omit=dev

EXPOSE 3003

# CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
CMD ["node", "dist/main.js"]