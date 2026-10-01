import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import { Link } from "react-router-dom";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

// ======================================================
// FIX LEAFLET DEFAULT MARKER ICON
// ======================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ======================================================
// CHECK WHETHER A STATION HAS VALID COORDINATES
// ======================================================

const hasValidCoordinates = (station) => {
  if (!station) {
    return false;
  }

  const latitude = Number(
    station.latitude
  );

  const longitude = Number(
    station.longitude
  );

  // Must be actual numbers
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return false;
  }

  // Latitude range
  if (
    latitude < -90 ||
    latitude > 90
  ) {
    return false;
  }

  // Longitude range
  if (
    longitude < -180 ||
    longitude > 180
  ) {
    return false;
  }

  return true;
};

// ======================================================
// STATION MAP
// ======================================================

function StationMap({
  stations = [],
}) {
  // ====================================================
  // ONLY KEEP STATIONS WITH REAL COORDINATES
  // ====================================================

  const validStations =
    Array.isArray(stations)
      ? stations.filter(
          hasValidCoordinates
        )
      : [];

  return (
    <MapContainer
      center={[
        23.3441,
        85.3096,
      ]}
      zoom={6}
      style={{
        width: "100%",
        height: "650px",
        borderRadius: "20px",
      }}
    >
      {/* ==================================================
          OPENSTREETMAP
      ================================================== */}

      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* ==================================================
          MARKERS
      ================================================== */}

      {validStations.map(
        (station) => {
          const latitude =
            Number(
              station.latitude
            );

          const longitude =
            Number(
              station.longitude
            );

          return (
            <Marker
              key={station.id}
              position={[
                latitude,
                longitude,
              ]}
            >
              <Popup>
                <div className="space-y-2 min-w-[220px]">

                  {/* Station name */}

                  <h2 className="font-bold text-lg">
                    {station.name ||
                      "Charging Station"}
                  </h2>

                  {/* Location */}

                  <p>
                    📍{" "}
                    {station.location ||
                      "Location unavailable"}
                  </p>

                  {/* Charger */}

                  <p>
                    ⚡{" "}
                    {station.charger ||
                      "Charger information unavailable"}
                  </p>

                  {/* Power */}

                  {station.power !==
                    undefined &&
                    station.power !==
                      null && (
                      <p>
                        🔋{" "}
                        {station.power}{" "}
                        kW
                      </p>
                    )}

                  {/* Price */}

                  {station.price !==
                    undefined &&
                    station.price !==
                      null && (
                      <p>
                        💰 ₹
                        {station.price}
                        /kWh
                      </p>
                    )}

                  {/* Availability */}

                  {station.available !==
                    undefined && (
                    <p
                      className={`font-semibold ${
                        station.available
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {station.available
                        ? "● Available"
                        : "● Busy"}
                    </p>
                  )}

                  {/* View details */}

                  {/* 
                    Database stations have numeric IDs.
                    External OSM stations may have IDs such
                    as "osm-12345".
                  */}

                  {station.id &&
                    !String(
                      station.id
                    ).startsWith(
                      "osm-"
                    ) && (
                      <Link
                        to={`/stations/${station.id}`}
                        className="text-green-600 font-semibold"
                      >
                        View Details →
                      </Link>
                    )}

                </div>
              </Popup>
            </Marker>
          );
        }
      )}
    </MapContainer>
  );
}

export default StationMap;