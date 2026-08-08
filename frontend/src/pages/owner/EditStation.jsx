import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import OwnerLayout from "../../components/owner/OwnerLayout";
import api from "../../services/api";
import toast from "react-hot-toast";

function EditStation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [station, setStation] = useState({
    name: "",
    location: "",
    charger: "",
    power: "",
    price: "",
    image: "",
    available: true,
  });

  useEffect(() => {
    fetchStation();
  }, []);

  const fetchStation = async () => {
    try {
      const res = await api.get(`/stations/${id}`);

      setStation({
        name: res.data.data.name,
        location: res.data.data.location,
        charger: res.data.data.charger,
        power: res.data.data.power,
        price: res.data.data.price,
        image: res.data.data.image,
        available: res.data.data.available,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load station");
    }
  };

  const handleChange = (e) => {
    setStation({
      ...station,
      [e.target.name]:
        e.target.type === "checkbox"
          ? e.target.checked
          : e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await api.put(`/stations/${id}`, station, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Station Updated Successfully");

      navigate("/owner/my-stations");

    } catch (err) {
      console.error(err);

      toast.error("Update Failed");
    }
  };

  return (
    <OwnerLayout>

      <div className="max-w-3xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Edit Station
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow p-8 space-y-5"
        >

          <input
            name="name"
            value={station.name}
            onChange={handleChange}
            placeholder="Station Name"
            className="w-full border rounded-lg p-3"
          />

          <input
            name="location"
            value={station.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full border rounded-lg p-3"
          />

          <input
            name="charger"
            value={station.charger}
            onChange={handleChange}
            placeholder="Charger Type"
            className="w-full border rounded-lg p-3"
          />

          <input
            type="number"
            name="power"
            value={station.power}
            onChange={handleChange}
            placeholder="Power (kW)"
            className="w-full border rounded-lg p-3"
          />

          <input
            type="number"
            name="price"
            value={station.price}
            onChange={handleChange}
            placeholder="Price"
            className="w-full border rounded-lg p-3"
          />

          <input
            name="image"
            value={station.image}
            onChange={handleChange}
            placeholder="Image URL"
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

          <button
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700"
          >
            Update Station
          </button>

        </form>

      </div>

    </OwnerLayout>
  );
}

export default EditStation;