import axios from "axios";

// ======================================================
// AXIOS API INSTANCE
// ======================================================

const api = axios.create({
  baseURL: "http://localhost:5000/api",

  headers: {
    "Content-Type": "application/json",
  },
});

// ======================================================
// REQUEST INTERCEPTOR
//
// Automatically attach JWT token to every API request.
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
// RESPONSE INTERCEPTOR
//
// Handle authentication errors globally.
// ======================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (
      error.response?.status === 401
    ) {
      console.warn(
        "Authentication expired or invalid."
      );

      // Remove invalid token
      localStorage.removeItem(
        "token"
      );

      // Optional:
      // We don't automatically redirect here
      // because some pages may handle 401 themselves.
    }

    return Promise.reject(error);
  }
);

// ======================================================
// EXPORT
// ======================================================

export default api;