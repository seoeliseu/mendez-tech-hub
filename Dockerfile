# syntax=docker/dockerfile:1
# Mendez Tech Hub — Next.js app in frontend/ that reads the sibling content/
# folder at BUILD time (CONTENT_DIR = <cwd>/../content) and at runtime for any
# on-demand render. The build context MUST be the repo root so both frontend/
# and content/ are present.

# ---- 1) deps: full install (incl. devDeps) for building ----
FROM node:24-slim AS deps
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
# npm install (not `ci`): the committed lockfile is Windows-generated and lacks
# Linux-only optional deps (e.g. @emnapi/* for Tailwind v4's native engine), which
# makes strict `npm ci` fail. `npm install` reconciles per-platform inside the image.
RUN npm install --no-audit --no-fund

# ---- 2) builder: prebuild (search index) + next build ----
FROM node:24-slim AS builder
WORKDIR /app/frontend
COPY --from=deps /app/frontend/node_modules ./node_modules
COPY frontend/ ./
# content must sit at ../content relative to the app (=> /app/content)
COPY content/ /app/content/
ENV NEXT_TELEMETRY_DISABLED=1
# `npm run build` runs `prebuild` (tsx -> public/search-index.json) then `next build`;
# both read /app/content.
RUN npm run build

# ---- 3) prod-deps: runtime-only node_modules (no devDeps) ----
FROM node:24-slim AS prod-deps
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install --omit=dev --no-audit --no-fund

# ---- 4) runner ----
FROM node:24-slim AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app/frontend
COPY --from=prod-deps /app/frontend/node_modules ./node_modules
COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/frontend/public ./public
COPY --from=builder /app/frontend/package.json ./package.json
COPY --from=builder /app/frontend/next.config.ts ./next.config.ts
# keep content for any on-demand render (resolved as ../content from /app/frontend)
COPY --from=builder /app/content /app/content
EXPOSE 3000
CMD ["npm", "start"]
