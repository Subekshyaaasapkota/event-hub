// Shared axios instance.
// Frontend -> interceptor -> Server -> interceptor -> Frontend
import axios from "axios";

const api = axios.create({
  // VITE_BASE_API_URL must point at the SERVER, not at the Vite dev server.
  baseURL: import.meta.env.VITE_BASE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

// Attach the stored JWT to every outgoing request.
api.interceptors.request.use(
  (config) => {
  const token = localStorage.getItem("authToken");
  if (token && token !== "undefined" && token !== "null") {
  config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
  },
  (error) => Promise.reject(error),
);

// Log out automatically when the session is no longer valid.
api.interceptors.response.use(
  (res) => res,
  (error) => {
  const status = error.response?.status;

  if (status === 401) {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");

  const onAuthPage = ["/login", "/signup"].includes(
  window.location.pathname,
  );
  if (!onAuthPage) {
  window.location.href = "/login";
  }
  }

  return Promise.reject(error);
  },
);

/**
 * Pulls a human readable message out of an API error.
 * The server answers with `{ error }` (and sometimes `{ message }`).
 */
export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again.",
) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  return data?.error || data?.message || error?.message || fallback;
};

export default api;