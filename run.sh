#!/bin/bash
set -e
PROJECT_DIR="/var/www/weather"
cd "$PROJECT_DIR"

L0G_DIR="$PROJECT_DIR/logs"
BACKEND_DIR="$PROJECT_DIR/backend"

# Kill any existing instances
pkill -f "$BACKEND_DIR/getdata.py" || true
pkill -f "$BACKEND_DIR/write_to_db.py" || true

# Create logs directory if it doesn't exist
mkdir -p logs || { echo "Cannot create logs directory"; exit 1; }

# Activate virtual environment if you're using one
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Start UDP writer in background
python3 "$BACKEND_DIR/write_to_db.py" >> "$L0G_DIR/udp.log" 2>> "$L0G_DIR/udp_err.log" &
UDP_PID=$!
echo "UDP data logger started with PID: $UDP_PID"

# Start Flask API
python3 "$BACKEND_DIR/getdata.py" >> "$L0G_DIR/api.log" 2>> "$L0G_DIR/api_err.log" &
API_PID=$!
echo "Flask API started with PID: $API_PID"

# Save PIDs for later
echo $UDP_PID > "$PROJECT_DIR/udp.pid"
echo $API_PID > "$PROJECT_DIR/api.pid"

# Wait for both processes
wait $UDP_PID $API_PID
