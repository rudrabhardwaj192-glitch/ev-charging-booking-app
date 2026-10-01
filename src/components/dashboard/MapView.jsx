import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function MapView() {
  const stations = [
    {
      id: 1,
      name: "Green Charge Hub",
      position: [23.3441, 85.3096], // Ranchi
    },
    {
      id: 2,
      name: "EV Point",
      position: [23.9966, 85.3691], // Hazaribagh
    },
    {
      id: 3,
      name: "FastVolt Station",
      position: [22.8046, 86.2029], // Jamshedpur
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4">
        Nearby Charging Stations Map
      </h2>

      <MapContainer
        center={[23.3441, 85.3096]}
        zoom={8}
        style={{ height: "450px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stations.map((station) => (
          <Marker key={station.id} position={station.position}>
            <Popup>
              <h3 className="font-bold">{station.name}</h3>
              <button className="mt-2 bg-green-600 text-white px-3 py-2 rounded">
                Book Now
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;