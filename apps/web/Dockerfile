# Multi-stage build for Next.js Web App
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy workspace package files
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS build

# Copy all source files
COPY . .

# Build Next.js app
WORKDIR /app/apps/web
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy standalone build output
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public

# Set working directory to app root
WORKDIR /app/apps/web

# Expose port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3005/en', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
ENV NODE_ENV=production
ENV PORT=3005
CMD ["node", "server.js"]
