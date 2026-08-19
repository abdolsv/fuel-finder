import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LAGOS_CENTER = [6.5244, 3.3792];

function RecenterMap({ userLocation }) {
  const map = useMap();
  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 14);
    }
  }, [userLocation, map]);
  return null;
}

export default function StationMap({ stations, onSelect, userLocation }) {
  return (
    <MapContainer
      center={userLocation ? [userLocation.lat, userLocation.lng] : LAGOS_CENTER}
      zoom={11}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RecenterMap userLocation={userLocation} />

      {userLocation && (
        <CircleMarker
          center={[userLocation.lat, userLocation.lng]}
          radius={8}
          pathOptions={{ color: '#1e90ff', fillColor: '#1e90ff', fillOpacity: 0.7 }}
        >
          <Popup>You are here</Popup>
        </CircleMarker>
      )}

      {stations.map((s) => (
        <Marker
          key={s.id}
          position={[s.lat, s.lng]}
          eventHandlers={{ click: () => onSelect(s) }}
        >
          <Popup>
            <strong>{s.name}</strong>
            <br />
            {s.latestPrice ? `₦${s.latestPrice} / litre` : 'No price yet'}
            <br />
            {s.fuelAvailable === false
              ? '🔴 Out of fuel'
              : s.fuelAvailable === true
              ? '🟢 Fuel available'
              : '⚪ No reports yet'}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
