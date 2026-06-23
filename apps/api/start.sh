#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Running Prisma seed..."
# Run seed to ensure demo data exists
npx tsx prisma/seed.ts

echo "Starting API server..."
node apps/api/dist/server.js
