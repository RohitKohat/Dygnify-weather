from fastapi.testclient import TestClient
from app.main import app

# Create a test client that talks to your FastAPI app
client = TestClient(app)

def test_health_check():
    """Test that the server is up and running."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_invalid_coordinates():
    """Test that the API rejects bad data (e.g., latitude > 90)."""
    invalid_payload = {
        "min_lon": -60.0,
        "min_lat": -100.0, # Invalid! Latitude can't be below -90
        "max_lon": -59.8,
        "max_lat": -4.8,
        "start_date": "2024-06-01",
        "end_date": "2024-09-30"
    }
    response = client.post("/api/ndvi", json=invalid_payload)
    # FastAPI/Pydantic should automatically return 422 Unprocessable Entity
    assert response.status_code == 422
    assert "Input should be greater than or equal to -90" in response.text

def test_valid_snapshot_request():
    """Test a real satellite data request for the Amazon."""
    payload = {
        "min_lon": -60.0,
        "min_lat": -5.0,
        "max_lon": -59.8,
        "max_lat": -4.8,
        "start_date": "2024-06-01",
        "end_date": "2024-09-30"
    }
    response = client.post("/api/ndvi", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "NDVI_mean" in data["stats"]
    assert data["aoi_geojson"]["type"] == "Polygon"

def test_timeseries_request():
    """Test the time-series endpoint."""
    payload = {
        "min_lon": -60.0,
        "min_lat": -5.0,
        "max_lon": -59.8,
        "max_lat": -4.8,
        "start_date": "2024-06-01",
        "end_date": "2024-08-30"
    }
    response = client.post("/api/ndvi/timeseries", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert "timeseries" in data
    assert len(data["timeseries"]) > 0
    assert "date" in data["timeseries"][0]
    assert "mean_ndvi" in data["timeseries"][0]