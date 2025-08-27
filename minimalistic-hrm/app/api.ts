import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:5000", // backend
  withCredentials: true,            // 👈 ensures cookies are sent
});

// Request Interceptor (runs before every request)
api.interceptors.request.use(
  (config) => {
    // you could attach extra headers if needed
    // e.g. config.headers["X-Custom"] = "value";
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (runs after every response)
api.interceptors.response.use(
  (response) => response, // return if success
  async (error) => {
    const originalRequest = error.config;

    // If access token expired (401), try refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry // custom flag
    ) {
      originalRequest._retry = true;
      try {
        // call refresh endpoint
        await api.get("/auth/refresh"); // 👈 must return new cookie
        // retry the original request
        return api(originalRequest);
      } catch (err) {
        console.error("Refresh failed:", err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
