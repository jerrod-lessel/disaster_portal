import requests
import sqlite3
from datetime import datetime
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from scripts.geo_filter import is_in_california

# NASA FIRMS API URL
NASA_API_URL = "https://firms.modaps.eosdis.nasa.gov/api/active_fires"

def fetch_wildfires():
    response = requests.get(NASA_API_URL)
    if response.status_code == 200:
        return response.json()
    return []

def store_wildfires(data):
    conn = sqlite3.connect("data/disaster_data.db")
    cur = conn.cursor()

    for fire in data:
        lat, lon = fire["latitude"], fire["longitude"]
        if is_in_california(lat, lon):  # 🔥 Filter for California
            cur.execute("""
                INSERT INTO disasters (type, latitude, longitude, date, severity, source)
                VALUES (?, ?, ?, ?, ?, ?)
            """, ("wildfire", lat, lon, datetime.now(), fire.get("burn_area", 0), "NASA FIRMS"))

    conn.commit()
    conn.close()

fire_data = fetch_wildfires()
if fire_data:
    store_wildfires(fire_data)
    print("🔥 California wildfire data stored successfully!")
else:
    print("⚠️ No wildfire data fetched.")
