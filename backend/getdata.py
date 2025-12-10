from flask import Flask, jsonify, request
import sqlite3
import os

app = Flask(__name__)

def query_db(query, args=()):
    # Changed from example.db to data.db
    db_path = os.path.join(os.path.dirname(__file__), 'data.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.execute(query, args)
    rows = cur.fetchall()
    conn.close()
    return rows

@app.route("/api/weather", methods=['GET'])
def get_weather():
    # Get query parameter
    data_type = request.args.get('type', 'temp')  # default to 'temp'
    
    # Map type to database columns (lowercase to match your DB)
    column_map = {
        'temp': 'temp',
        'pressure': 'pressure',
        'humidity': 'humidity'
    }
    
    column = column_map.get(data_type, 'temp')
    
    # Query with lowercase column names and correct table name
    rows = query_db(f"""
        SELECT time, {column}
        FROM weather_data
        ORDER BY time ASC
    """)
    
    data = [dict(row) for row in rows]
    return jsonify(data)

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=3000, debug=False)