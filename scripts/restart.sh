#!/usr/bin/env bash
# =============================================================================
# restart.sh — Quick restart of the Next.js production server
#
# What it does:
#   1. Kills any existing server on port 3000
#   2. Waits 2 seconds for a clean shutdown
#   3. Launches server.sh in the background via nohup
#   4. Tails the log for 5 seconds so you can see startup output
#
# Usage:
#   ./scripts/restart.sh
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_SCRIPT="${SCRIPT_DIR}/server.sh"
LOG_FILE="/tmp/vaikai-next.log"
PORT=3000

# -----------------------------------------------------------
# Step 1: Kill any existing server on the target port
# -----------------------------------------------------------
echo "[$(date)] Stopping any existing server on port ${PORT}..."

if lsof -ti :"$PORT" > /dev/null 2>&1; then
  lsof -ti :"$PORT" | xargs kill -9 2>/dev/null || true
  echo "[$(date)] Killed existing process(es) on port ${PORT}."
else
  echo "[$(date)] No existing process found on port ${PORT}."
fi

# -----------------------------------------------------------
# Step 2: Wait for clean shutdown
# -----------------------------------------------------------
echo "[$(date)] Waiting 2 seconds for clean shutdown..."
sleep 2

# -----------------------------------------------------------
# Step 3: Clear the old log and start the server in background
# -----------------------------------------------------------
echo "[$(date)] Starting server in background..."
> "$LOG_FILE"  # Truncate the log file for a fresh start

nohup bash "$SERVER_SCRIPT" >> "$LOG_FILE" 2>&1 &
SERVER_PID=$!

echo "[$(date)] Server started with PID ${SERVER_PID}."
echo "[$(date)] Log file: ${LOG_FILE}"

# -----------------------------------------------------------
# Step 4: Tail the log for 5 seconds to show startup progress
# -----------------------------------------------------------
echo ""
echo "--- Showing startup output for 5 seconds ---"
echo ""

# Use timeout to tail the log for 5 seconds, then stop
timeout 5 tail -f "$LOG_FILE" 2>/dev/null || true

echo ""
echo "--- End of startup preview ---"
echo ""
echo "Server is running in the background (PID ${SERVER_PID})."
echo "To follow the full log:  tail -f ${LOG_FILE}"
echo "To stop the server:      kill ${SERVER_PID}"
