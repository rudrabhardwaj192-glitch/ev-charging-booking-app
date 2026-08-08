import { useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import SearchBar from "../../components/stations/SearchBar";
import FilterPanel from "../../components/stations/FilterPanel";
import StationGrid from "../../components/stations/StationGrid";

import StationMap from "../../components/map/StationMap";
import NearbyStations from "../../components/map/NearbyStations";

function StationList() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Live stations from PostgreSQL
  const [stations, setStations] = useState([]);

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">
            Charging Stations
          </h1>

          <p className="text-gray-500 mt-2">
            Find the best charging station near you.
          </p>
        </div>

        {/* Search */}
        <SearchBar
          search={search}
          setSearch={setSearch}
        />

        {/* Filter */}
        <FilterPanel
          filter={filter}
          setFilter={setFilter}
        />

        {/* OpenStreetMap */}
        <StationMap stations={stations} />

        {/* Nearby Stations */}
        <NearbyStations stations={stations} />

        {/* Station Grid */}
        <StationGrid
          search={search}
          filter={filter}
          onStationsLoaded={setStations}
        />

      </div>
    </DashboardLayout>
  );
}

export default StationList;