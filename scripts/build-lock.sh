#!/bin/bash
# Locked build — prevents multiple concurrent builds
LOCKFILE="/tmp/vaikai-build.lock"
PROJECT_DIR="/home/openclaw/Projects/vaikai-lt"

if [ -f "$LOCKFILE" ]; then
  LOCK_AGE=$(( $(date +%s) - $(stat -c %Y "$LOCKFILE" 2>/dev/null || echo 0) ))
  if [ "$LOCK_AGE" -lt 120 ]; then
    echo "Build already in progress (${LOCK_AGE}s ago). Skipping."
    exit 0
  fi
  echo "Stale lock (${LOCK_AGE}s). Breaking."
fi

echo $$ > "$LOCKFILE"
trap "rm -f $LOCKFILE" EXIT

cd "$PROJECT_DIR"
rm -rf .next
npx next build 2>&1
BUILD_EXIT=$?

if [ $BUILD_EXIT -eq 0 ]; then
  fuser -k 3000/tcp 2>/dev/null
  sleep 1
  nohup npx next start -p 3000 -H 0.0.0.0 > /tmp/next.log 2>&1 &
  sleep 3
  echo "✅ Build + restart OK"
else
  echo "❌ Build failed"
fi
