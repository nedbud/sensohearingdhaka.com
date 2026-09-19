# The image the site runs as. Built once by CI, tagged with the commit, and
# pulled by the server — the server never installs anything or runs a build.

# ── 0. dependencies ──────────────────────────────────────────────────────────
FROM node:18-alpine AS deps

# Next's SWC binary is linked against glibc symbols that musl does not provide
# by default; this shim is what the official Next Docker example uses.
RUN apk add --no-cache libc6-compat

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# ── 1. the build ─────────────────────────────────────────────────────────────
FROM node:18-alpine AS build

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_ variables are not read at runtime. Next substitutes them into
# the JavaScript at build time, so this has to be an ARG — passing it to
# `docker run` instead would do nothing at all, and the site would ship with
# whatever the default happened to be, silently, and fetch products from the
# wrong host.
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

# Same reason: the measurement ID is substituted at build time. It sat in
# .env with a real ID in it and was passed to nothing, so every production
# image so far has shipped with analytics switched off while looking
# configured.
ARG NEXT_PUBLIC_GTM
ENV NEXT_PUBLIC_GTM=$NEXT_PUBLIC_GTM

ENV NEXT_TELEMETRY_DISABLED=1

# The build fetches the product list and the site copy from the CMS in order to
# generate the pages, so a build with the CMS unreachable fails here rather
# than shipping an empty catalogue.
RUN yarn build

# ── 2. what actually runs ────────────────────────────────────────────────────
FROM node:18-alpine AS final

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs \
 && adduser -S nextjs -u 1001

COPY --from=build /app/public ./public
# standalone already contains server.js and the node_modules it needs.
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
