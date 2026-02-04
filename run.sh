#!/bin/bash
set -e
PROJECT_DIR="/var/www/weather"
cd "$PROJECT_DIR"

# Kill any existing instances
pkill -f "backend/getdata.py" || true
pkill -f "backend/write_to_db.py" || true

# Create logs directory if it doesn't exist
mkdir -p logs || { echo "Cannot create logs directory"; exit 1; }

# Activate virtual environment if you're using one
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Start UDP writer in background
python3 backend/write_to_db.py >> logs/udp.log 2>> logs/udp_err.log &
UDP_PID=$!
echo "UDP data logger started with PID: $UDP_PID"

# Start Flask API
python3 backend/getdata.py >> logs/api.log 2>> logs/api_err.log &
API_PID=$!
echo "Flask API started with PID: $API_PID"

# Save PIDs for later
echo $UDP_PID > "$PROJECT_DIR/udp.pid"
echo $API_PID > "$PROJECT_DIR/api.pid"

# Wait for both processes
wait $UDP_PID $API_PID
