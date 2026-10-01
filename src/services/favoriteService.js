import api from "./api";

// =====================================================
// ADD FAVORITE
// POST /api/favorites
// =====================================================

export const addFavorite = async (stationId) => {
  const token =
    localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "Authentication required."
    );
  }

  const response = await api.post(
    "/favorites",
    {
      station_id: stationId,
    },
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// =====================================================
// GET FAVORITES
// GET /api/favorites/:userId
// =====================================================

export const getFavorites = async (
  userId
) => {
  const token =
    localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "Authentication required."
    );
  }

  const response = await api.get(
    `/favorites/${userId}`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// =====================================================
// REMOVE FAVORITE
// DELETE /api/favorites
// =====================================================

export const removeFavorite = async (
  stationId
) => {
  const token =
    localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "Authentication required."
    );
  }

  const response = await api.delete(
    "/favorites",
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },

      data: {
        station_id: stationId,
      },
    }
  );

  return response.data;
};