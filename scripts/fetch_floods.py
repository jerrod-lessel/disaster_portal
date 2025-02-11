import requests
import sqlite3
from datetime import datetime
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from scripts.geo_filter import is_in_california

# NOAA Flood API (Replace with actual API)
NOAA_FLOOD_API = "https://api.floodmap.net/floods"

def fetch_floods():
    response = requests.get(NOAA_FLOOD_API)
    if response.status_code == 200:
        return response.json()
    return []

def store_floods(data):
    conn = sqlite3.connect("data/disaster_data.db")
    cur = conn.cursor()

    for flood in data:
        lat, lon = flood["latitude"], flood["longitude"]
        if is_in_california(lat, lon):  # 🌊 Filter for California
            cur.execute("""
                INSERT INTO disasters (type, latitude, longitude, date, severity, source)
                VALUES (?, ?, ?, ?, ?, ?)
            """, ("flood", lat, lon, datetime.now(), flood.get("severity", 0), "NOAA"))

    conn.commit()
    conn.close()

flood_data = fetch_floods()
if flood_data:
    store_floods(flood_data)
    print("🌊 California flood data stored successfully!")
else:
    print("⚠️ No flood data fetched.")
