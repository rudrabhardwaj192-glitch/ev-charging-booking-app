import api from "./api";

export const getOwnerBookings = async (token) => {
  const response = await api.get(
    "/owner/bookings",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getOwnerBookingStats = async (token) => {
  const response = await api.get(
    "/owner/bookings/stats",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};