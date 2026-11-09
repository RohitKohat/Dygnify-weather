export interface NDVIStats {
  NDVI_mean?: number;
  NDVI_min?: number;
  NDVI_max?: number;
}

export interface NDVIResponse {
  status: string;
  stats: NDVIStats | null;
  aoi_geojson: any | null;
  error?: string;
}