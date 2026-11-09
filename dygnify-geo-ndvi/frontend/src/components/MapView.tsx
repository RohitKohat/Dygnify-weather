import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

interface Props {
  geojson: any;
}

function FitBounds({ geojson }: Props) {
  const map = useMap();
  useEffect(() => {
    if (geojson?.coordinates?.[0]) {
      const coords = geojson.coordinates[0];
      const lats = coords.map((c: number[]) => c[1]);
      const lngs = coords.map((c: number[]) => c[0]);
      map.fitBounds([
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ]);
    }
  }, [geojson, map]);
  return null;
}

export default function MapView({ geojson }: Props) {
  return (
    <MapContainer center={[-5.0, -60.0]} zoom={10} style={{ height: 480, width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap"
      />
      {geojson && (
        <>
          <GeoJSON data={geojson} style={{ color: "#e63946", weight: 2, fillOpacity: 0.1 }} />
          <FitBounds geojson={geojson} />
        </>
      )}
    </MapContainer>
  );
}