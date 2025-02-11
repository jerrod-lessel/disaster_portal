import requests
import sqlite3
from datetime import datetime
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from scripts.geo_filter import is_in_california

# US Drought Monitor API (Replace with actual API)
DROUGHT_API = "https://droughtmonitor.unl.edu/api/droughts"

def fetch_droughts():
    response = requests.get(DROUGHT_API)
    if response.status_code == 200:
        return response.json()
    return []

def store_droughts(data):
    conn = sqlite3.connect("data/disaster_data.db")
    cur = conn.cursor()

    for drought in data:
        lat, lon = drought["latitude"], drought["longitude"]
        if is_in_california(lat, lon):  # ☀️ Filter for California
            cur.execute("""
                INSERT INTO disasters (type, latitude, longitude, date, severity, source)
                VALUES (?, ?, ?, ?, ?, ?)
            """, ("drought", lat, lon, datetime.now(), drought.get("severity", 0), "US Drought Monitor"))

    conn.commit()
    conn.close()

drought_data = fetch_droughts()
if drought_data:
    store_droughts(drought_data)
    print("☀️ California drought data stored successfully!")
else:
    print("⚠️ No drought data fetched.")
