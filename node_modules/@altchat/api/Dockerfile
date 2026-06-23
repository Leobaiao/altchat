FROM node:20-alpine AS builder

WORKDIR /app

# Install turbo globally
RUN npm install -g turbo@2.0.4

# Copy everything
COPY . .

# Install dependencies
RUN npm install

# Build only the API and its dependencies
RUN turbo run build --filter=@altchat/api

# Prepare production image
FROM node:20-alpine AS runner
WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/prisma ./prisma

# Copy startup script
COPY apps/api/start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 4300

ENV NODE_ENV=production
CMD ["/app/start.sh"]
