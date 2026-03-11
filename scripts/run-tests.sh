#!/bin/bash
# Run vaikai.lt API integration tests
# Requires: localhost:3000 to be running (npm run dev or npm start)
set -e

echo "=== vaikai.lt API Integration Tests ==="
echo ""

# Check if server is running
if ! curl -sf http://localhost:3000/api/cities > /dev/null 2>&1; then
  echo "ERROR: Server is not running on http://localhost:3000"
  echo "Start it with: npm run dev"
  exit 1
fi

echo "Server is running. Starting tests..."
echo ""

npx vitest run --reporter=verbose

echo ""
echo "=== All tests passed ==="
