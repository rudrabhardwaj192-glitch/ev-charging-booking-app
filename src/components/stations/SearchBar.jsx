import { FaSearch } from "react-icons/fa";

function SearchBar({ search, setSearch }) {
  return (
    <div className="relative w-full">
      <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />

      <input
        type="text"
        placeholder="Search charging stations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-white rounded-2xl py-4 pl-14 pr-5 shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}

export default SearchBar;