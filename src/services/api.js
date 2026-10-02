import axios from "axios";

const api = axios.create({
  baseURL: "https://ev-charging-booking-app.onrender.com/api",

  headers: {
    "Content-Type": "application/json",
  },
});

// ======================================================
// ADD AUTH TOKEN TO EVERY REQUEST
// ======================================================

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// ======================================================
// HANDLE AUTHENTICATION ERRORS
// ======================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (
      error.response?.status === 401
    ) {
      console.error(
        "Authentication failed:",
        error.response?.data
      );
    }

    return Promise.reject(error);
  }
);

export default api;
