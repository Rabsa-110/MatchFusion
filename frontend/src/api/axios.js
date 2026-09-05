import axios from "axios";

// Central Axios instance. Every request from the React app should go through
// the Node/Express backend, never directly to a third-party sports/AI API —
// that keeps API keys off the client, per the project's security design.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT (once auth is wired up) to every request automatically.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("matchfusion_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
