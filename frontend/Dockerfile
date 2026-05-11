# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

ENV NODE_OPTIONS=--dns-result-order=ipv4first

WORKDIR /app

# 👇 Accept build-time argument
ARG NEXT_PUBLIC_API_BASE_URL_AUTH_SER
ARG NEXT_PUBLIC_API_BASE_URL_INCIDENT_SER

# 👇 Inject into build environment
ENV NEXT_PUBLIC_API_BASE_URL_AUTH_SER=$NEXT_PUBLIC_API_BASE_URL_AUTH_SER
ENV NEXT_PUBLIC_API_BASE_URL_INCIDENT_SER=$NEXT_PUBLIC_API_BASE_URL_INCIDENT_SER

COPY package*.json ./

# Install ALL dependencies (including dev)
RUN npm ci

COPY . .

RUN npm run build


# ---- Stage 2: Production ----
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node","server.js"]