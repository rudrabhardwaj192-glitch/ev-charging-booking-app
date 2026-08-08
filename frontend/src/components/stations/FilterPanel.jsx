function FilterPanel({
  filter,
  setFilter,
}) {
  return (
    <div className="flex flex-wrap gap-4">

      <button
        onClick={() => setFilter("all")}
        className={`px-5 py-3 rounded-xl transition ${
          filter === "all"
            ? "bg-green-600 text-white"
            : "bg-white shadow"
        }`}
      >
        All
      </button>

      <button
        onClick={() => setFilter("available")}
        className={`px-5 py-3 rounded-xl transition ${
          filter === "available"
            ? "bg-green-600 text-white"
            : "bg-white shadow"
        }`}
      >
        Available
      </button>

      <button
        onClick={() => setFilter("fast")}
        className={`px-5 py-3 rounded-xl transition ${
          filter === "fast"
            ? "bg-green-600 text-white"
            : "bg-white shadow"
        }`}
      >
        Fast Charger
      </button>

      <button
        onClick={() => setFilter("ac")}
        className={`px-5 py-3 rounded-xl transition ${
          filter === "ac"
            ? "bg-green-600 text-white"
            : "bg-white shadow"
        }`}
      >
        AC Charger
      </button>

    </div>
  );
}

export default FilterPanel;