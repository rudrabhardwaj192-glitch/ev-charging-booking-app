import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

function LocationPicker({ onLocationSelect }) {
  const [position, setPosition] = useState({
    lat: 23.3441,
    lng: 85.3096,
  });

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        setPosition(newPos);

        onLocationSelect({
          latitude: newPos.lat,
          longitude: newPos.lng,
        });
      },
      () => {
        alert("Unable to get your location.");
      }
    );
  };

  return (
    <div className="space-y-4">

      <button
        type="button"
        onClick={useCurrentLocation}
        className="bg-blue-600 text-white px-5 py-2 rounded-lg"
      >
        📍 Use My Current Location
      </button>

      <MapContainer
        center={[position.lat, position.lng]}
        zoom={13}
        style={{
          height: "400px",
          width: "100%",
          borderRadius: "16px",
        }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationMarker
          position={position}
          setPosition={(latlng) => {
            setPosition(latlng);

            onLocationSelect({
              latitude: latlng.lat,
              longitude: latlng.lng,
            });
          }}
        />
      </MapContainer>

      <div className="bg-gray-100 rounded-lg p-4">

        <p>
          Latitude:
          <strong> {position.lat}</strong>
        </p>

        <p>
          Longitude:
          <strong> {position.lng}</strong>
        </p>

      </div>

    </div>
  );
}

export default LocationPicker;