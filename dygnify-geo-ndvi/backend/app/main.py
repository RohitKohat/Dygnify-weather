from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models import NDVIRequest, NDVIResponse
from app.services.ndvi_service import compute_ndvi

app = FastAPI(title="Dygnify Geo NDVI API (Planetary Computer)")

origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.post("/api/ndvi", response_model=NDVIResponse)
def ndvi_endpoint(req: NDVIRequest):
    try:
        result = compute_ndvi(
            req.min_lon, req.min_lat, req.max_lon, req.max_lat,
            req.start_date, req.end_date,
        )
        return NDVIResponse(status="success", **result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))