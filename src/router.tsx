import { createBrowserRouter } from "react-router";
import RootLayout from "./components/RootLayout";
import AboutPage from "./pages/AboutPage";
import CollectionPage from "./pages/CollectionPage";
import EventDetailPage from "./pages/EventDetailPage";
import ItemsPage from "./pages/ItemsPage";
import NotFoundPage from "./pages/NotFoundPage";
import RouteError from "./pages/RouteError";
import StatsPage from "./pages/StatsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout, // Root Layout (Navbar + <Outlet/>)
    ErrorBoundary: RouteError,
    children: [
      { index: true, Component: ItemsPage }, // 1) รายการข้อมูล
      { path: "event/:id", Component: EventDetailPage }, // 2) รายละเอียด (Dynamic Route)
      { path: "collection", Component: CollectionPage }, // 3) คอลเลกชันส่วนตัว
      { path: "about", Component: AboutPage }, // 4) About
      { path: "stats", Component: StatsPage }, // 5) Extended Page
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
