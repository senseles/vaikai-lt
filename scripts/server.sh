#!/usr/bin/env bash
# =============================================================================
# server.sh — Build and run the Next.js production server on port 3000
#
# Features:
#   - Kills any existing process on port 3000 before starting
#   - Builds the project with `npx next build`
#   - Starts the server with `npx next start`
#   - Auto-restarts if the process dies (while loop with 5s delay)
#   - All output is logged to /tmp/vaikai-next.log
#
# Usage:
#   ./scripts/server.sh          (run in foreground)
#   nohup ./scripts/server.sh &  (run in background — see restart.sh)
# =============================================================================

set -euo pipefail

PROJECT_DIR="/home/openclaw/Projects/vaikai-lt"
LOG_FILE="/tmp/vaikai-next.log"
PORT=3000

# -----------------------------------------------------------
# Step 1: Kill any existing process on the target port
# -----------------------------------------------------------
echo "[$(date)] Checking for existing processes on port ${PORT}..." | tee -a "$LOG_FILE"

if lsof -ti :"$PORT" > /dev/null 2>&1; then
  echo "[$(date)] Killing existing process(es) on port ${PORT}..." | tee -a "$LOG_FILE"
  lsof -ti :"$PORT" | xargs kill -9 2>/dev/null || true
  sleep 1
fi

# -----------------------------------------------------------
# Step 2: Move into the project directory
# -----------------------------------------------------------
cd "$PROJECT_DIR"

# -----------------------------------------------------------
# Step 3: Build the Next.js project
# -----------------------------------------------------------
echo "[$(date)] Building Next.js project..." | tee -a "$LOG_FILE"
npx next build 2>&1 | tee -a "$LOG_FILE"

if [ "${PIPESTATUS[0]}" -ne 0 ]; then
  echo "[$(date)] ERROR: Build failed. Exiting." | tee -a "$LOG_FILE"
  exit 1
fi

echo "[$(date)] Build succeeded." | tee -a "$LOG_FILE"

# -----------------------------------------------------------
# Step 4: Start the server with auto-restart on crash
# -----------------------------------------------------------
echo "[$(date)] Starting Next.js server on port ${PORT} (0.0.0.0)..." | tee -a "$LOG_FILE"

while true; do
  npx next start -p "$PORT" -H 0.0.0.0 2>&1 | tee -a "$LOG_FILE"

  EXIT_CODE=$?
  echo "[$(date)] Server exited with code ${EXIT_CODE}. Restarting in 5 seconds..." | tee -a "$LOG_FILE"
  sleep 5
done
