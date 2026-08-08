import { useEffect, useState } from "react";
import { getFavorites } from "../../services/favoriteService";
import StationCard from "../../components/stations/StationCard";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Temporary user id (we'll replace this with JWT later)
  const userId = 1;

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const res = await getFavorites(userId);
      setFavorites(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-2xl">
        Loading Favorites...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <h1 className="text-4xl font-bold mb-8">
        ❤️ My Favorite Stations
      </h1>

      {favorites.length === 0 ? (
        <div className="text-center text-xl text-gray-500 mt-20">
          No favorite stations yet.
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          {favorites.map((station) => (
            <StationCard
              key={station.id}
              station={station}
            />
          ))}
        </div>
      )}

    </div>
  );
}

export default Favorites;