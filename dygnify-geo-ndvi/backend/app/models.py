from pydantic import BaseModel, Field
from typing import Optional, Dict

class NDVIRequest(BaseModel):
    min_lon: float = Field(..., ge=-180, le=180)
    min_lat: float = Field(..., ge=-90, le=90)
    max_lon: float = Field(..., ge=-180, le=180)
    max_lat: float = Field(..., ge=-90, le=90)
    start_date: str = "2024-06-01"
    end_date: str = "2024-09-30"

class NDVIResponse(BaseModel):
    status: str
    stats: Optional[Dict[str, Optional[float]]] = None
    aoi_geojson: Optional[dict] = None
    error: Optional[str] = None