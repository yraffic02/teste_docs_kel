import { create } from "zustand";
import api from "../services/api";

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post("/auth/login", { email, password });
      set({ user: data.user, token: data.token, loading: false });
      console.log('login===>', data);
      
      return data;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: () => {
    set({ user: null, token: null });
  },

  loadMe: async () => {
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data });
    } catch {
      set({ user: null, token: null });
    }
  },
}));

export default useAuthStore;
