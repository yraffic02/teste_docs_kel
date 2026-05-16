import { create } from "zustand";
import api from "../services/api";

const useDocumentStore = create((set) => ({
  documents: [],
  total: 0,
  loading: false,

  list: async (params = {}) => {
    set({ loading: true });
    try {
      const { data } = await api.get("/documents", { params });
      set({ documents: data.data, total: data.total, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  upload: async (files) => {
    const formData = new FormData();
    const arr = Array.isArray(files) ? files : [files];
    for (const f of arr) {
      if (f instanceof File) {
        formData.append("files", f, f.name);
      } else {
        formData.append("files", {
          uri: f.uri,
          name: f.name,
          type: f.mimeType || f.type,
        });
      }
    }
    const { data } = await api.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/documents/${id}`);
    return data;
  },
}));

export default useDocumentStore;
