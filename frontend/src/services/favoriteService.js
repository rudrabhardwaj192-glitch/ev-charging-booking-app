import api from "./api";

// Add Favorite
export const addFavorite = async (data) => {
  const token = localStorage.getItem("token");

  const response = await api.post("/favorites", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Get Favorites
export const getFavorites = async (userId) => {
  const token = localStorage.getItem("token");

  const response = await api.get(`/favorites/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Remove Favorite
export const removeFavorite = async (data) => {
  const token = localStorage.getItem("token");

  const response = await api.delete("/favorites", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data,
  });

  return response.data;
};