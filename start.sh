#!/bin/sh
set -e

echo "🚀 Running database migrations..."
npx prisma migrate deploy

echo "✅ Migrations complete. Starting Next.js server..."
exec npm run start
