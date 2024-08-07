# Install dependencies only when needed
FROM node:20-alpine AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM node:20-alpine
RUN apk update && apk add --no-cache make && apk add --no-cache bash
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 automation-nodejs

USER automation-nodejs

CMD ["make", "list"]
