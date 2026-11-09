import pystac_client
import planetary_computer
import rasterio
from rasterio.windows import from_bounds
from rasterio.warp import transform_bounds
import numpy as np

def compute_ndvi(min_lon, min_lat, max_lon, max_lat, start_date, end_date):
    catalog = pystac_client.Client.open(
        "https://planetarycomputer.microsoft.com/api/stac/v1",
        modifier=planetary_computer.sign_inplace,
    )
    
    search = catalog.search(
        collections=["sentinel-2-l2a"],
        bbox=[min_lon, min_lat, max_lon, max_lat],
        datetime=f"{start_date}/{end_date}",
        query={"eo:cloud_cover": {"lt": 20}},
    )
    
    items = list(search.items())
    if not items:
        raise ValueError("No Sentinel-2 data found for this area and time range.")
    
    for item in items:
        try:
            red_url = item.assets["B04"].href
            nir_url = item.assets["B08"].href
            
            with rasterio.open(red_url) as red_src:
                # Key fix: transform WGS84 bbox to the image's CRS
                red_bounds = transform_bounds(
                    "EPSG:4326", red_src.crs,
                    min_lon, min_lat, max_lon, max_lat
                )
                red_window = from_bounds(*red_bounds, red_src.transform)
                red_window = red_window.round_offsets().round_lengths()
                
                if red_window.width <= 0 or red_window.height <= 0:
                    continue
                
                red = red_src.read(1, window=red_window).astype(float)
                if red_src.nodata is not None:
                    red[red == red_src.nodata] = np.nan
                else:
                    red[red == 0] = np.nan
            
            with rasterio.open(nir_url) as nir_src:
                nir_bounds = transform_bounds(
                    "EPSG:4326", nir_src.crs,
                    min_lon, min_lat, max_lon, max_lat
                )
                nir_window = from_bounds(*nir_bounds, nir_src.transform)
                nir_window = nir_window.round_offsets().round_lengths()
                
                nir = nir_src.read(1, window=nir_window).astype(float)
                if nir_src.nodata is not None:
                    nir[nir == nir_src.nodata] = np.nan
                else:
                    nir[nir == 0] = np.nan
            
            if red.shape != nir.shape:
                continue
            
            np.seterr(divide='ignore', invalid='ignore')
            ndvi = (nir - red) / (nir + red + 1e-10)
            
            valid_mask = np.isfinite(ndvi) & (ndvi >= -1.0) & (ndvi <= 1.0)
            valid_ndvi = ndvi[valid_mask]
            
            if len(valid_ndvi) > 0:
                return {
                    "stats": {
                        "NDVI_mean": float(np.mean(valid_ndvi)),
                        "NDVI_min": float(np.min(valid_ndvi)),
                        "NDVI_max": float(np.max(valid_ndvi)),
                    },
                    "aoi_geojson": {
                        "type": "Polygon",
                        "coordinates": [[
                            [min_lon, min_lat], [max_lon, min_lat],
                            [max_lon, max_lat], [min_lon, max_lat], [min_lon, min_lat]
                        ]]
                    }
                }
        except Exception as e:
            print(f"Skipping {item.id}: {e}")
            continue
    
    raise ValueError("No valid pixels found. The bounding box may be outside the image footprint or all cloudy.")