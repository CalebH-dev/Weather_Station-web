#!/bin/bash
set -e
PROJECT_DIR="/var/www/weather"
cd "$PROJECT_DIR"

# Kill any existing instances
pkill -f "backend/getdata.py" || true

# Create logs directory if it doesn't exist
mkdir -p logs || { echo "Cannot create logs directory"; exit 1; }

# Activate virtual environment if you're using one
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Start the Python backend
python3 backend/getdata.py >> logs/backend.log 2>> logs/error.log &
BACKEND_PID=$!

echo "Backend started with PID: $BACKEND_PID"
echo $BACKEND_PID > "$PROJECT_DIR/backend.pid"

# Keep script running to handle signals
wait $BACKEND_PID