import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeName = "newsforex" | "newsforex-dark";

/** จำนวน id สูงสุดในคอลเลกชัน (ให้ไม่เกินขีดจำกัด ids ของ API) */
export const MAX_SAVED = 100;

interface AppState {
  /** เก็บเฉพาะ id ของเหตุการณ์ — ข้อมูลเต็มดึงจาก API ผ่าน TanStack Query */
  savedIds: string[];
  theme: ThemeName;
}

interface AppActions {
  toggleSaved: (id: string) => void;
  removeSaved: (id: string) => void;
  clearSaved: () => void;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set) => ({
      savedIds: [],
      theme: "newsforex",

      toggleSaved: (id) =>
        set((state) => {
          if (state.savedIds.includes(id)) {
            return { savedIds: state.savedIds.filter((x) => x !== id) };
          }
          if (state.savedIds.length >= MAX_SAVED) return state;
          return { savedIds: [...state.savedIds, id] };
        }),
      removeSaved: (id) =>
        set((state) => ({ savedIds: state.savedIds.filter((x) => x !== id) })),
      clearSaved: () => set({ savedIds: [] }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "newsforex" ? "newsforex-dark" : "newsforex",
        })),
    }),
    {
      name: "newsforex-app", // key ใน localStorage
      version: 1,
      partialize: (state) => ({ savedIds: state.savedIds, theme: state.theme }),
    },
  ),
);
