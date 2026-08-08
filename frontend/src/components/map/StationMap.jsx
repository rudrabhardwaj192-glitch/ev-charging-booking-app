import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function StationMap({ stations }) {
  return (
    <MapContainer
      center={[23.3441, 85.3096]}
      zoom={6}
      style={{
        width: "100%",
        height: "650px",
        borderRadius: "20px",
      }}
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {stations.map((station) => {
        if (!station.latitude || !station.longitude) return null;

        return (
          <Marker
            key={station.id}
            position={[station.latitude, station.longitude]}
          >
            <Popup>
              <div className="space-y-2 min-w-[220px]">

                <h2 className="font-bold text-lg">
                  {station.name}
                </h2>

                <p>📍 {station.location}</p>

                <p>⚡ {station.charger}</p>

                <p>🔋 {station.power} kW</p>

                <p>💰 ₹{station.price}/kWh</p>

                <Link
                  to={`/stations/${station.id}`}
                  className="text-green-600 font-semibold"
                >
                  View Details →
                </Link>

              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default StationMap;