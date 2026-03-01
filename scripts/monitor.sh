#!/bin/bash
# Server monitor — checks every 15s, restarts if down
# Ensures 90%+ uptime even during rebuilds

PROJECT_DIR="/home/openclaw/Projects/vaikai-lt"
PORT=3000
LOG="/tmp/vaikai-monitor.log"

echo "[$(date)] Monitor started" >> "$LOG"

while true; do
  # Check if server responds
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:$PORT/ 2>/dev/null)
  
  if [ "$HTTP_CODE" != "200" ]; then
    echo "[$(date)] Server DOWN (HTTP $HTTP_CODE). Restarting..." >> "$LOG"
    
    # Kill any stuck processes
    fuser -k $PORT/tcp 2>/dev/null
    sleep 2
    
    # Check if .next exists (might be mid-build)
    if [ ! -d "$PROJECT_DIR/.next" ]; then
      echo "[$(date)] No .next dir — waiting for build to finish..." >> "$LOG"
      # Wait up to 2 minutes for build
      for i in $(seq 1 24); do
        sleep 5
        if [ -d "$PROJECT_DIR/.next" ]; then
          echo "[$(date)] .next appeared, starting server" >> "$LOG"
          break
        fi
      done
    fi
    
    if [ -d "$PROJECT_DIR/.next" ]; then
      cd "$PROJECT_DIR"
      fuser -k $PORT/tcp 2>/dev/null
      sleep 1
      nohup npx next start -p $PORT -H 0.0.0.0 >> /tmp/next.log 2>&1 &
      sleep 4
      
      # Verify it started
      VERIFY=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:$PORT/ 2>/dev/null)
      echo "[$(date)] Restart result: HTTP $VERIFY" >> "$LOG"
    else
      echo "[$(date)] .next still missing — build may have failed" >> "$LOG"
    fi
  fi
  
  sleep 15
done
