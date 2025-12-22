from flask import Flask, jsonify, request
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)


structure_keys = ['time', 'id']

def limit_data(num_rows, old_list):
    new_list = []
    n = len(old_list)

    data_keys = []
    for k in old_list[0].keys():
        if k not in structure_keys:
            data_keys.append(k)


    if num_rows <= 0 or n == 0:
        return new_list

    step = n / num_rows

    for row in range(num_rows):
        start = int(row * step)
        end = int((row + 1) * step)

        if start >= n:
            break
        if end > n:
            end = n

        # initialize averages
        avg = {key: 0.0 for key in data_keys}
        count = 0

        for i in range(start, end):
            for key in data_keys:
                avg[key] += old_list[i][key]
            count += 1

        if count == 0:
            continue

        # create a NEW dict (do not mutate input)
        new_row = {}

        for key in old_list[row].keys():
            new_row[key] = old_list[start][key]

        for key in data_keys:
            new_row[key] = avg[key] / count

        new_list.append(new_row)

    return new_list


def query_db(query, *args):
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

    send = False
    time_clause = "" 
    column = ""
    params = []

    if 'recent' in request.args:
        result = query_db("""
            SELECT *
            FROM weather_data
            ORDER BY ID DESC
            LIMIT 1
        """)
        return jsonify(dict(result[0]) if result else {'error': 'No data found'})
    

    if 'type' in request.args:
        data_type = request.args.get('type')  
        data_type = data_type.lower()
    
        # Map type to database columns 
        ALLOWED_TYPES = {
            "temp": "temp",
            "pressure": "pressure",
            "humidity": "humidity"
        }

        if data_type not in ALLOWED_TYPES:
            return {'error': 'type parameter invalid'}
        else:
            column = ALLOWED_TYPES[data_type]

        send = True



        # Range based query
        if 'range' in request.args:
            time_range = request.args.get('range', 'all,all')
            values = time_range.split(',')
            if(len(values) != 2):
                return {'error': 'Must include exactly 2 time parameters'}
            
            for value in values:
                if value != 'all':
                    try: 
                        datetime.fromisoformat(value)
                    except ValueError:
                        return {'error': 'recieved invalid time'}

            conditions = []

            # lower bound
            if values[0] != "all":
                conditions.append("time >= ?")
                params.append(values[0])

            # upper bound
            if values[1] != "all":
                conditions.append("time <= ?")
                params.append(values[1])

            time_clause = ""
            if conditions:
                time_clause = "WHERE " + " AND ".join(conditions)
            

    query = f"""
        SELECT time, {column}
        FROM weather_data
        {time_clause}
        ORDER BY time ASC
    """
    
    if send:
        rows = query_db(query, *params)

        data = [dict(row) for row in rows]
        return jsonify(limit_data(1200, data))
    
    else:
        return {'error': 'recieved no parameters'}
    

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=3000, debug=False)