#!/bin/bash
# Build script for Vercel monorepo

echo "Installing dependencies..."
npm install --prefix frontend
npm install --prefix backend

echo "Building frontend..."
cd frontend && npm run build && cd ..

echo "Copying API routes to Vercel format..."
mkdir -p api
cp -r backend/api/* api/ 2>/dev/null || true

echo "Build complete!"
