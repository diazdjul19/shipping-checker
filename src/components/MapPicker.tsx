"use client";

import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./MapPicker.module.css";

// Fix Leaflet marker icons with Next.js/webpack
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface FlyToProps {
  center: [number, number];
  zoom: number;
}

function FlyToLocation({ center, zoom }: FlyToProps) {
  const map = useMap();
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);

  return null;
}

interface ClickHandlerProps {
  onLocationChange: (lat: number, lng: number) => void;
}

function MapClickHandler({ onLocationChange }: ClickHandlerProps) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export interface MapPickerProps {
  center: [number, number];
  zoom: number;
  markerPosition: [number, number] | null;
  onLocationChange: (lat: number, lng: number) => void;
  apiKey: string;
}

export default function MapPicker({
  center,
  zoom,
  markerPosition,
  onLocationChange,
  apiKey,
}: MapPickerProps) {
  const tileUrl = `https://maps.geoapify.com/v1/tile/dark-matter/{z}/{x}/{y}.png?apiKey=${apiKey}`;

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url={tileUrl}
          attribution='Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <FlyToLocation center={center} zoom={zoom} />
        <MapClickHandler onLocationChange={onLocationChange} />
        {markerPosition && (
          <Marker
            position={markerPosition}
            icon={markerIcon}
            draggable={true}
            eventHandlers={{
              dragend(e) {
                const { lat, lng } = e.target.getLatLng();
                onLocationChange(lat, lng);
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
