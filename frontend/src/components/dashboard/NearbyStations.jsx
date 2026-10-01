function NearbyStations() {
  const stations = [
    {
      id: 1,
      name: "Green Charge Hub",
      location: "Ranchi",
      charger: "DC Fast Charger",
      power: "120 kW",
      status: "Available",
    },
    {
      id: 2,
      name: "EV Point",
      location: "Hazaribagh",
      charger: "AC Charger",
      power: "22 kW",
      status: "Busy",
    },
    {
      id: 3,
      name: "FastVolt Station",
      location: "Jamshedpur",
      charger: "Ultra Fast",
      power: "150 kW",
      status: "Available",
    },
  ];

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-6">
        Nearby Charging Stations
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {stations.map((station) => (
          <div
            key={station.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
          >
            <img
              src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800"
              alt="Charging Station"
              className="h-48 w-full object-cover"
            />

            <div className="p-5">

              <h3 className="text-xl font-bold">
                {station.name}
              </h3>

              <p className="text-gray-500 mt-2">
                📍 {station.location}
              </p>

              <p className="mt-2">
                ⚡ {station.charger}
              </p>

              <p>
                🔋 {station.power}
              </p>

              <span
                className={`inline-block mt-4 px-3 py-1 rounded-full text-sm ${
                  station.status === "Available"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {station.status}
              </span>

              <button className="w-full mt-5 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition">
                Book Now
              </button>

            </div>
          </div>
        ))}

      </div>
    </div>
  );
}

export default NearbyStations;