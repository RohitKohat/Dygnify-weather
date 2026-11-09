import { useState } from "react";
import axios from "axios";
import MapView from "./components/MapView";
import type { NDVIResponse } from "./types";

const API_BASE = "http://127.0.0.1:8000";

const REGIONS = {
  amazon: {
    name: "Amazon Rainforest (Brazil)",
    min_lon: -60.0,
    min_lat: -5.0,
    max_lon: -59.8,
    max_lat: -4.8,
  },
  california: {
    name: "Central Valley (California)",
    min_lon: -121.0,
    min_lat: 36.5,
    max_lon: -120.5,
    max_lat: 37.0,
  },
  india: {
    name: "Punjab (India)",
    min_lon: 74.5,
    min_lat: 30.5,
    max_lon: 75.0,
    max_lat: 31.0,
  }
};

function App() {
  const [data, setData] = useState<NDVIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [selectedRegion, setSelectedRegion] = useState<keyof typeof REGIONS>("amazon");
  const [startDate, setStartDate] = useState("2024-06-01");
  const [endDate, setEndDate] = useState("2024-09-30");

  const fetchNDVI = async () => {
    setLoading(true);
    setError("");
    setData(null);

    const bounds = REGIONS[selectedRegion];

    try {
      const res = await axios.post<NDVIResponse>(`${API_BASE}/api/ndvi`, {
        ...bounds,
        start_date: startDate,
        end_date: endDate,
      });
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#2c3e50" }}>Dygnify Geospatial Demo — NDVI</h1>
      <p style={{ color: "#555" }}>
        Powered by Sentinel-2 L2A data from Microsoft Planetary Computer.
      </p>

      <div style={{ background: "#f8f9fa", padding: 16, borderRadius: 8, marginBottom: 24, border: "1px solid #ddd" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
          
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: "bold", marginBottom: 4 }}>Region</label>
            <select 
              value={selectedRegion} 
              onChange={(e) => setSelectedRegion(e.target.value as keyof typeof REGIONS)}
              style={{ padding: "8px", borderRadius: 4, border: "1px solid #ccc" }}
            >
              {Object.entries(REGIONS).map(([key, region]) => (
                <option key={key} value={key}>{region.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: "bold", marginBottom: 4 }}>Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: "8px", borderRadius: 4, border: "1px solid #ccc" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: "bold", marginBottom: 4 }}>End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: "8px", borderRadius: 4, border: "1px solid #ccc" }}
            />
          </div>

          <button 
            onClick={fetchNDVI} 
            disabled={loading}
            style={{ 
              padding: "9px 24px", 
              backgroundColor: loading ? "#ccc" : "#007bff", 
              color: "white", 
              border: "none", 
              borderRadius: 4, 
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold"
            }}
          >
            {loading ? "Computing…" : "Compute NDVI"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: 12, backgroundColor: "#f8d7da", color: "#721c24", borderRadius: 4, marginBottom: 16 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {data?.stats && (
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1, background: "#e3f2fd", padding: 16, borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#555" }}>Mean NDVI</div>
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#0d47a1" }}>{data.stats.NDVI_mean?.toFixed(4)}</div>
          </div>
          <div style={{ flex: 1, background: "#e8f5e9", padding: 16, borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#555" }}>Min NDVI</div>
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#1b5e20" }}>{data.stats.NDVI_min?.toFixed(4)}</div>
          </div>
          <div style={{ flex: 1, background: "#fff3e0", padding: 16, borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#555" }}>Max NDVI</div>
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#e65100" }}>{data.stats.NDVI_max?.toFixed(4)}</div>
            
          </div>
        </div>
      )}

      {data?.aoi_geojson && (
        <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden"  }}>
          <MapView geojson={data.aoi_geojson} />
        </div>
        
      )}
    </div>
  );
}

export default App;