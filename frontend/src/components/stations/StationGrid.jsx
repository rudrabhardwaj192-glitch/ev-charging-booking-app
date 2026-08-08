import { useEffect, useState } from "react";
import api from "../../services/api";
import StationCard from "./StationCard";

import station1 from "../../assets/stations/station1.jpg";
import station2 from "../../assets/stations/station2.jpg";
import station3 from "../../assets/stations/station3.jpg";

function StationGrid({ search, filter, onStationsLoaded }) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  const images = [station1, station2, station3];

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      const res = await api.get("/stations");

      const data = res.data.data.map((station, index) => ({
        ...station,
        image: station.image || images[index % images.length],
      }));

      setStations(data);

      // Send data to parent component
      if (onStationsLoaded) {
        onStationsLoaded(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-xl">
        Loading Charging Stations...
      </div>
    );
  }

  const filteredStations = stations.filter((station) => {
    const matchesSearch =
      station.name.toLowerCase().includes(search.toLowerCase()) ||
      station.location.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" || station.charger === filter;

    return matchesSearch && matchesFilter;
  });

  if (filteredStations.length === 0) {
    return (
      <div className="text-center py-10 text-xl">
        No Charging Stations Found
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
      {filteredStations.map((station) => (
        <StationCard
          key={station.id}
          station={station}
        />
      ))}
    </div>
  );
}

export default StationGrid;