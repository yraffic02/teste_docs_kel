import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 15000,
});

function getToken() {
  try {
    const useAuthStore = require("../store/authStore").default;
    return useAuthStore.getState().token;
  } catch {
    return null;
  }
}

function logout() {
  try {
    const useAuthStore = require("../store/authStore").default;
    useAuthStore.getState().logout();
  } catch {
    /* store not loaded yet */
  }
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout();
    }
    return Promise.reject(error);
  }
);

export default api;
