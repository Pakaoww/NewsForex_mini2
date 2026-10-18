import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router/dom";
import { queryClient } from "./lib/queryClient";
import { router } from "./router";
import { useAppStore } from "./store/useAppStore";
import "./index.css";

// ใช้ธีมที่เก็บไว้ใน Zustand (persist) ตั้งแต่ก่อน render เพื่อไม่ให้จอกะพริบ
const applyTheme = (theme: string): void => {
  document.documentElement.setAttribute("data-theme", theme);
};
applyTheme(useAppStore.getState().theme);
useAppStore.subscribe((state) => applyTheme(state.theme));

const container = document.getElementById("root");
if (!container) throw new Error("ไม่พบ element #root");

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
