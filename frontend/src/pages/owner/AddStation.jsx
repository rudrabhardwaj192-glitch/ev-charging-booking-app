import { useState } from "react";
import OwnerLayout from "../../components/owner/OwnerLayout";
import LocationPicker from "../../components/map/LocationPicker";
import api from "../../services/api";
import toast from "react-hot-toast";

function AddStation() {
  const [station, setStation] = useState({
    name: "",
    location: "",
    charger: "",
    power: "",
    price: "",
    image: "",
    available: true,
    latitude: "",
    longitude: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setStation({
      ...station,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleLocationSelect = ({ latitude, longitude }) => {
    setStation((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/stations",
        {
          ...station,
          owner_id: 1, // temporary until JWT owner id is used
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Station Added Successfully");

      setStation({
        name: "",
        location: "",
        charger: "",
        power: "",
        price: "",
        image: "",
        available: true,
        latitude: "",
        longitude: "",
      });

    } catch (err) {
      console.error(err);
      toast.error("Failed to Add Station");
    }
  };

  return (
    <OwnerLayout>
      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Add Charging Station
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-8 space-y-5"
        >

          <input
            name="name"
            placeholder="Station Name"
            value={station.name}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            name="location"
            placeholder="Location"
            value={station.location}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            name="charger"
            placeholder="Charger Type"
            value={station.charger}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            name="power"
            type="number"
            placeholder="Power (kW)"
            value={station.power}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            name="price"
            type="number"
            placeholder="Price (₹)"
            value={station.price}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            name="image"
            placeholder="Image URL"
            value={station.image}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="available"
              checked={station.available}
              onChange={handleChange}
            />
            Available
          </label>

          <div>
            <h2 className="text-xl font-semibold mb-3">
              Select Station Location
            </h2>

            <LocationPicker
              onLocationSelect={handleLocationSelect}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">

            <input
              type="text"
              value={station.latitude}
              readOnly
              placeholder="Latitude"
              className="border rounded-lg p-3 bg-gray-100"
            />

            <input
              type="text"
              value={station.longitude}
              readOnly
              placeholder="Longitude"
              className="border rounded-lg p-3 bg-gray-100"
            />

          </div>

          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
          >
            Add Station
          </button>

        </form>

      </div>
    </OwnerLayout>
  );
}

export default AddStation;