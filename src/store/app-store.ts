import { create } from "zustand";

interface AppStore {
  isSidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  isSidebarOpen: false,
  setSidebarOpen: (value) => set({ isSidebarOpen: value }),
  selectedCategory: "ALL",
  setSelectedCategory: (value) => set({ selectedCategory: value }),
  searchQuery: "",
  setSearchQuery: (value) => set({ searchQuery: value }),
}));
