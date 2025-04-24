
var map = L.map('map').setView([37.5, -119.5], 6);

// Base Layer
var baseOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Marker for clicked location
var clickMarker = null;

// Dynamic Landslide Layer (visual only)
var landslideLayer = L.esri.dynamicMapLayer({
  url: 'https://gis.conservation.ca.gov/server/rest/services/CGS/MS58_LandslideSusceptibility_Classes/MapServer',
  opacity: 0.6
}).addTo(map);

// Fire Hazard Feature Layer
var fireHazardLayer = L.esri.featureLayer({
  url: 'https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/FHSZ_SRA_LRA_Combined/FeatureServer/0',
  style: function (feature) {
    const hazard = feature.properties.FHSZ_Description;
    let color = "#ffffff";
    if (hazard === "Very High") color = "#d7191c";
    else if (hazard === "High") color = "#fdae61";
    else if (hazard === "Moderate") color = "#ffffbf";
    return { color, weight: 1, fillOpacity: 0.4 };
  }
}).addTo(map);

// Flood Hazard Layer
var floodLayer = L.esri.featureLayer({
  url: 'https://services2.arcgis.com/Uq9r85Potqm3MfRV/ArcGIS/rest/services/S_FLD_HAZ_AR_Reduced_Set_CA_wm/FeatureServer/0',
  style: function (feature) {
    const zone = feature.properties.ESRI_SYMBOLOGY;
    const colorMap = {
      "1% Annual Chance Flood Hazard": "#f03b20",
      "0.2% Annual Chance Flood Hazard": "#feb24c",
      "Regulatory Floodway": "#769ccd",
      "Area with Reduced Risk Due to Levee": "#e5d099"
    };
    return {
      color: colorMap[zone] || "#cccccc",
      weight: 0.5,
      fillOpacity: 0.6
    };
  }
}).addTo(map);

// Earthquake Shaking Potential Layer (visual only)
var shakingLayer = L.esri.dynamicMapLayer({
  url: 'https://gis.conservation.ca.gov/server/rest/services/CGS/MS48_ShakingPotential/MapServer',
  opacity: 0.6
}).addTo(map);

// Layer Control
L.control.layers({ "OpenStreetMap": baseOSM }, {
  "Landslide Susceptibility": landslideLayer,
  "Fire Hazard Zones": fireHazardLayer,
  "Flood Hazard Zones": floodLayer,
  "Shaking Potential": shakingLayer
}).addTo(map);

// Scale Bar
L.control.scale({ imperial: true }).addTo(map);

// Home Button
var homeButton = L.control({ position: 'topleft' });
homeButton.onAdd = function(map) {
  var button = L.DomUtil.create('button', 'home-button');
  button.innerHTML = '🏠';
  button.title = 'Reset View';
  button.onclick = function () {
    map.setView([37.5, -119.5], 6);
  };
  L.DomEvent.disableClickPropagation(button);
  return button;
};
homeButton.addTo(map);

// Legend Toggle & Panel
var legendToggle = L.control({ position: 'topright' });
legendToggle.onAdd = () => {
  var div = L.DomUtil.create('div', 'map-widget leaflet-control leaflet-bar');
  div.innerHTML = `<a href="#" id="legend-toggle" title="Show/Hide Legend">🗺️</a>`;
  L.DomEvent.disableClickPropagation(div);
  return div;
};
legendToggle.addTo(map);

var legendPanel = L.control({ position: 'topright' });
legendPanel.onAdd = () => {
  var div = L.DomUtil.create('div', 'legend-panel hidden');
  div.innerHTML = `
    <h4>Legends</h4>
    <div class="legend-section">
      <strong>Fire Hazard Zones</strong>
      <div><i style="background:#d7191c;"></i> Very High</div>
      <div><i style="background:#fdae61;"></i> High</div>
      <div><i style="background:#ffffbf;"></i> Moderate</div>
    </div>
    <div class="legend-section">
      <strong>Landslide Susceptibility</strong>
      <div><i style="background:#9a1e13;"></i> X</div>
      <div><i style="background:#d32d1f;"></i> IX</div>
      <div><i style="background:#ec622b;"></i> VIII</div>
      <div><i style="background:#db9b36;"></i> VII</div>
      <div><i style="background:#f3ae3d;"></i> VI</div>
      <div><i style="background:#f8d58b;"></i> V</div>
      <div><i style="background:#ffffc5;"></i> III</div>
    </div>
    <div class="legend-section">
      <strong>Flood Zones</strong>
      <div><i style="background:#f03b20;"></i> 1% Annual Chance Flood Hazard</div>
      <div><i style="background:#feb24c;"></i> 0.2% Annual Chance Flood Hazard</div>
      <div><i style="background:#e5d099;"></i> Area with Reduced Risk Due to Levee</div>
      <div><i style="background:#769ccd;"></i> Regulatory Floodway</div>
    </div>
    <div class="legend-section">
  <strong>Earthquake Shaking Potential (SA10)</strong>
  <div><i style="background:rgb(56,168,0);"></i> &lt; 0.4</div>
  <div><i style="background:rgb(176,224,0);"></i> 0.4 – 0.8</div>
  <div><i style="background:rgb(255,225,0);"></i> 0.8 – 1.2</div>
  <div><i style="background:rgb(255,115,0);"></i> 1.2 – 1.6</div>
  <div><i style="background:rgb(255,0,0);"></i> 1.6 – 2.0</div>
  <div><i style="background:rgb(255,0,119);"></i> 2.0 – 2.2</div>
  <div><i style="background:rgb(255,54,201);"></i> 2.2 – 2.4</div>
  <div><i style="background:rgb(255,148,221);"></i> 2.4 – 2.5</div>
  <div><i style="background:rgb(255,191,233);"></i> &gt; 2.5</div>
</div>
`;
  return div;
};
legendPanel.addTo(map);

// Prevent map zooming when scrolling inside the legend panel
document.addEventListener('DOMContentLoaded', function () {
    const legendPanel = document.querySelector('.legend-panel');
  
    if (legendPanel) {
      legendPanel.addEventListener('mouseenter', function () {
        map.scrollWheelZoom.disable(); // Disable zooming while hovering
      });
  
      legendPanel.addEventListener('mouseleave', function () {
        map.scrollWheelZoom.enable(); // Re-enable when leaving legend
      });
    }
  });
  
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('legend-toggle').addEventListener('click', function (e) {
    e.preventDefault();
    const legendEl = document.querySelector('.legend-panel');
    legendEl.classList.toggle('hidden');
  });
});

// Helper to calculate distance to edge of polygon
function getDistanceToPolygonEdge(clickLatLng, feature) {
  const point = turf.point([clickLatLng.lng, clickLatLng.lat]);
  const geom = feature.geometry;

  let line;
  if (geom.type === "Polygon") {
    line = turf.polygonToLine(turf.polygon(geom.coordinates));
  } else if (geom.type === "MultiPolygon") {
    line = turf.polygonToLine(turf.multiPolygon(geom.coordinates));
  } else {
    console.warn("Unknown geometry type for edge proximity:", geom.type);
    return NaN;
  }

  const nearestPoint = turf.nearestPointOnLine(line, point);
  const distance = turf.distance(point, nearestPoint, { units: 'miles' });
  return distance.toFixed(2);
}

// Generalized function to get closest feature
function getClosestFeatureByEdgeDistance(layer, clickLatLng, label, fieldName, results, finishCallback) {
  layer.query().nearby(clickLatLng, 80467).run(function (err, fc) {
    if (!err && fc.features.length > 0) {
      let minDist = Infinity;
      let bestFeature = null;
      fc.features.forEach(feature => {
        const dist = parseFloat(getDistanceToPolygonEdge(clickLatLng, feature));
        if (!isNaN(dist) && dist < minDist) {
          minDist = dist;
          bestFeature = feature;
        }
      });
      if (bestFeature) {
        results.push(`✅ <strong>Nearest ${label}:</strong> ${bestFeature.properties[fieldName]}<br>📏 Distance: ${minDist.toFixed(2)} mi`);
      } else {
        results.push(`❌ <strong>${label}:</strong> Unable to measure distance`);
      }
    } else {
      results.push(`❌ <strong>${label}:</strong> No nearby zones`);
    }
    finishCallback();
  });
}

// Click Event Logic
map.on("click", function (e) {
  if (clickMarker) map.removeLayer(clickMarker);
  clickMarker = L.marker(e.latlng).addTo(map);

  const lat = e.latlng.lat.toFixed(5);
  const lng = e.latlng.lng.toFixed(5);
  document.getElementById("report-content").innerHTML =
    `<strong>Location:</strong><br>Lat: ${lat}, Lng: ${lng}<br><em>Loading hazard information...</em>`;

  const results = [];
  let completed = 0;

  function checkDone() {
    completed++;
    if (completed === 2) {
      results.push("🪨 <strong>Landslide Susceptibility:</strong> Visual only");
      results.push("💥 <strong>Shaking Potential:</strong> Visual only");
      document.getElementById("report-content").innerHTML = results.join("<br><br>");
    }
  }

  // Fire Query
  fireHazardLayer.query().contains(e.latlng).run(function (err, fc) {
    if (!err && fc.features.length > 0) {
      results.push(`🔥 <strong>Fire Hazard Zone:</strong> ${fc.features[0].properties.FHSZ_Description}`);
      checkDone();
    } else {
      getClosestFeatureByEdgeDistance(fireHazardLayer, e.latlng, "Fire Hazard Zone", "FHSZ_Description", results, checkDone);
    }
  });

  // Flood Query
  floodLayer.query().contains(e.latlng).run(function (err, fc) {
    if (!err && fc.features.length > 0) {
      results.push(`🌊 <strong>Flood Hazard Zone:</strong> ${fc.features[0].properties.ESRI_SYMBOLOGY}`);
      checkDone();
    } else {
      getClosestFeatureByEdgeDistance(floodLayer, e.latlng, "Flood Hazard Zone", "ESRI_SYMBOLOGY", results, checkDone);
    }
  });
});
