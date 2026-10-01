import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OwnerLayout from "../../components/owner/OwnerLayout";
import api from "../../services/api";
import toast from "react-hot-toast";

function MyStations() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Temporary owner id
  // Later we'll get this from JWT
  const ownerId = 1;

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const res = await api.get(`/stations/owner/${ownerId}`);
      setStations(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load stations");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this station?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/stations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Station deleted successfully");

      fetchStations();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  return (
    <OwnerLayout>
      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          My Stations
        </h1>

        {loading ? (
          <div className="text-center text-xl py-10">
            Loading...
          </div>
        ) : stations.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8">
            <h2 className="text-xl font-semibold">
              No stations found.
            </h2>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>

                  <th className="text-left px-6 py-4">
                    Name
                  </th>

                  <th className="text-left px-6 py-4">
                    Location
                  </th>

                  <th className="text-left px-6 py-4">
                    Charger
                  </th>

                  <th className="text-left px-6 py-4">
                    Power
                  </th>

                  <th className="text-left px-6 py-4">
                    Price
                  </th>

                  <th className="text-left px-6 py-4">
                    Status
                  </th>

                  <th className="text-left px-6 py-4">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {stations.map((station) => (

                  <tr
                    key={station.id}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="px-6 py-4">
                      {station.name}
                    </td>

                    <td className="px-6 py-4">
                      {station.location}
                    </td>

                    <td className="px-6 py-4">
                      {station.charger}
                    </td>

                    <td className="px-6 py-4">
                      {station.power} kW
                    </td>

                    <td className="px-6 py-4">
                      ₹{station.price}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          station.available
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {station.available
                          ? "Available"
                          : "Busy"}
                      </span>
                    </td>

                    <td className="px-6 py-4">

                      <Link
                        to={`/owner/edit/${station.id}`}
                        className="text-blue-600 hover:underline mr-5"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() =>
                          handleDelete(station.id)
                        }
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>
    </OwnerLayout>
  );
}

export default MyStations;