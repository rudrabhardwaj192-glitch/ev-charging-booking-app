import api from "./api";

// ===============================
// Create Booking
// ===============================
export const createBooking = async (bookingData, token) => {
  const response = await api.post("/bookings", bookingData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// ===============================
// Get User Bookings
// ===============================
export const getMyBookings = async (userId, token) => {
  const response = await api.get(`/bookings/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// ===============================
// Cancel Booking
// ===============================
export const cancelBooking = async (bookingId, token) => {
  const response = await api.put(
    `/bookings/${bookingId}/cancel`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};