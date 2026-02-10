"use client";

import React, { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import L, { LatLngExpression } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const MarkerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const DraggableMarker = ({ position, setPosition }: any) => {
  const map = useMap();
  if (!position) return null;

  useEffect(() => {
    try {
      map.setView(position as LatLngExpression, 15, { animate: true });
    } catch (e) {
      console.warn("Map setView failed", e);
    }
  }, [position, map]);

  return (
    <Marker
      icon={MarkerIcon}
      position={position as LatLngExpression}
      draggable={true}
      eventHandlers={{
        dragend: (e: L.LeafletEvent) => {
          const marker = e.target as L.Marker;
          const { lat, lng } = marker.getLatLng();
          setPosition([lat, lng]);
        },
      }}
    />
  );
};

interface MapComponentProps {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  position,
  setPosition,
}) => {
  return (
    <MapContainer
      key={`${position[0]}_${position[1]}`}
      center={position as LatLngExpression}
      zoom={13}
      scrollWheelZoom={true}
      className="w-full h-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DraggableMarker position={position} setPosition={setPosition} />
    </MapContainer>
  );
};

export default MapComponent;
