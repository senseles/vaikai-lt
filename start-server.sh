#!/bin/bash
# Auto-restarting Next.js server
cd /home/openclaw/Projects/vaikai-lt

while true; do
  echo "[$(date)] Starting Next.js server..."
  npx next start -p 3000 -H 0.0.0.0
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE. Restarting in 3s..."
  sleep 3
done
