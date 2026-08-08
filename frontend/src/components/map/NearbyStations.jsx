import { useEffect, useMemo, useState } from "react";
import { calculateDistance } from "../../utils/distance";

function NearbyStations({ stations }) {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error(error);
      }
    );
  }, []);

  const nearbyStations = useMemo(() => {
    if (!userLocation) return [];

    return stations
      .filter(
        (station) =>
          station.latitude !== null &&
          station.longitude !== null
      )
      .map((station) => ({
        ...station,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          station.latitude,
          station.longitude
        ),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [stations, userLocation]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">

      <h2 className="text-2xl font-bold mb-5">
        📍 Nearby Charging Stations
      </h2>

      {!userLocation && (
        <p>Allow location access to see nearby stations.</p>
      )}

      {userLocation &&
        nearbyStations.map((station) => (
          <div
            key={station.id}
            className="border-b py-4 flex justify-between items-center"
          >
            <div>

              <h3 className="font-semibold text-lg">
                {station.name}
              </h3>

              <p className="text-gray-500">
                {station.location}
              </p>

              <p className="text-green-600">
                {station.distance.toFixed(2)} km away
              </p>

            </div>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="bg-green-600 text-white px-5 py-2 rounded-lg"
            >
              Navigate
            </a>

          </div>
        ))}

    </div>
  );
}

export default NearbyStations;