import requests
import sqlite3
from datetime import datetime
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from scripts.geo_filter import is_in_california

# USGS Landslide API (Replace with actual API)
USGS_LANDSLIDE_API = "https://www.usgs.gov/api/landslides"

def fetch_landslides():
    response = requests.get(USGS_LANDSLIDE_API)
    if response.status_code == 200:
        return response.json()
    return []

def store_landslides(data):
    conn = sqlite3.connect("data/disaster_data.db")
    cur = conn.cursor()

    for landslide in data:
        lat, lon = landslide["latitude"], landslide["longitude"]
        if is_in_california(lat, lon):  # 🏔️ Filter for California
            cur.execute("""
                INSERT INTO disasters (type, latitude, longitude, date, severity, source)
                VALUES (?, ?, ?, ?, ?, ?)
            """, ("landslide", lat, lon, datetime.now(), landslide.get("severity", 0), "USGS"))

    conn.commit()
    conn.close()

landslide_data = fetch_landslides()
if landslide_data:
    store_landslides(landslide_data)
    print("🏔️ California landslide data stored successfully!")
else:
    print("⚠️ No landslide data fetched.")
