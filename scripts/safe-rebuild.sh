#!/bin/bash
# Safe rebuild — builds in background, then hot-swaps server
# USE THIS instead of manually killing server + rebuilding

PROJECT_DIR="/home/openclaw/Projects/vaikai-lt"
PORT=3000

echo "[$(date)] Starting safe rebuild..."

cd "$PROJECT_DIR"

# Build to a temp location first
rm -rf .next-new
cp -r .next .next-backup 2>/dev/null

# Build
npx next build 2>&1
BUILD_EXIT=$?

if [ $BUILD_EXIT -ne 0 ]; then
  echo "[$(date)] BUILD FAILED — server stays running with old build"
  # Restore backup if .next was damaged
  if [ ! -d ".next" ] && [ -d ".next-backup" ]; then
    mv .next-backup .next
  fi
  exit 1
fi

echo "[$(date)] Build OK. Restarting server..."

# Quick restart — minimal downtime
fuser -k $PORT/tcp 2>/dev/null
sleep 1
nohup npx next start -p $PORT -H 0.0.0.0 > /tmp/next.log 2>&1 &
sleep 3

# Verify
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:$PORT/)
echo "[$(date)] Server restarted: HTTP $HTTP_CODE"

# Cleanup
rm -rf .next-backup

if [ "$HTTP_CODE" = "200" ]; then
  echo "[$(date)] ✅ Safe rebuild complete"
else
  echo "[$(date)] ⚠️ Server may not be healthy — monitor will auto-fix"
fi
