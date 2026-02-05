import sqlite3
import socket
import json
import os
from datetime import datetime


UDP_IP = "" 
# 192.168.1.53
UDP_PORT = 5005
 
sock = socket.socket(socket.AF_INET, # Internet
                     socket.SOCK_DGRAM) # UDP
sock.bind((UDP_IP, UDP_PORT))

print(f"Bound to {UDP_IP}:{UDP_PORT}")


    


with sqlite3.connect(os.path.join(os.path.dirname(__file__), 'data.db')) as conn:

    c = conn.cursor() # cursor
    try:
        c.execute("""CREATE TABLE IF NOT EXISTS weather_data
                (ID INTEGER PRIMARY KEY, time TEXT, temp FLOAT, humidity FLOAT, pressure FLOAT)""")
    except Exception as e:
        print(f"An Error has occured: {e}")
        print("Exiting now.")

    while True:
        data, addr = sock.recvfrom(1024) # buffer size is 1024 bytes
        print("received message: ", data)
        payload = json.loads(data.decode('utf-8'))
        # print(f"Received from {addr}: {payload}")
        # print("Type: ", payload["Data type"], "Data: ", payload["value"])
        
        timestamp = datetime.now().isoformat()
        # c.execute("INSERT INTO weather_data VALUES (?, ?, ?, ?)", (timestamp, T, H, P))

        T = payload["Deg_C"]
        T = T*1.8 + 32
        print("Tempurature is ", T, " deg F")
        H = payload["RH"]
        print("RH is ", H, "%")
        P = payload["hPa"]
        print("Atmospheric preasure is ", P, " hPa")
        
        c.execute(
            "INSERT INTO weather_data (time, temp, humidity, pressure) VALUES (?, ?, ?, ?)",
            (timestamp, T, H, P)
        )

        conn.commit()

    