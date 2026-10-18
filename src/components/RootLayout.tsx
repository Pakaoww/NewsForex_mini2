import type { ComponentType, SVGProps } from "react";
import { Link, NavLink, Outlet, ScrollRestoration } from "react-router";
import { useDatasetMeta } from "../hooks/useCalendar";
import { dayLabel } from "../lib/format";
import { useAppStore } from "../store/useAppStore";
import {
  BookmarkIcon,
  ChartIcon,
  HomeIcon,
  InfoIcon,
  MoonIcon,
  NewsIcon,
  SunIcon,
} from "./Icons";

interface NavItem {
  to: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "รายการข่าว", Icon: HomeIcon, end: true },
  { to: "/collection", label: "คอลเลกชัน", Icon: BookmarkIcon },
  { to: "/stats", label: "สถิติ", Icon: ChartIcon },
  { to: "/about", label: "เกี่ยวกับเรา", Icon: InfoIcon },
];

export default function RootLayout() {
  const savedCount = useAppStore((s) => s.savedIds.length);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const meta = useDatasetMeta();
  const rangeText = meta.data
    ? `${dayLabel(meta.data.range.min)} – ${dayLabel(meta.data.range.max)}`
    : "";

  return (
    <div className="flex min-h-screen flex-col bg-base-200 text-base-content">
      {/* Top navbar */}
      <header className="sticky top-0 z-30 border-b border-base-300 bg-base-100">
        <div className="navbar mx-auto max-w-6xl px-4">
          <div className="navbar-start">
            <Link to="/" className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-content">
                <NewsIcon width={22} height={22} />
              </span>
              <span className="leading-tight">
                <span className="block font-heading text-lg font-semibold">
                  NewsForex
                </span>
                <span className="block text-xs text-base-content/60">
                  ปฏิทินข่าวเศรษฐกิจ
                </span>
              </span>
            </Link>
          </div>

          <nav className="navbar-center hidden lg:flex" aria-label="เมนูหลัก">
            <ul className="menu menu-horizontal gap-1">
              {NAV_ITEMS.map(({ to, label, Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      isActive ? "menu-active" : ""
                    }
                  >
                    <Icon />
                    {label}
                    {to === "/collection" && savedCount > 0 && (
                      <span className="badge badge-primary badge-sm">
                        {savedCount}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="navbar-end">
            <button
              type="button"
              className="btn btn-ghost btn-circle"
              onClick={toggleTheme}
              aria-label={
                theme === "newsforex"
                  ? "เปลี่ยนเป็นโหมดมืด"
                  : "เปลี่ยนเป็นโหมดสว่าง"
              }
            >
              {theme === "newsforex" ? <MoonIcon /> : <SunIcon />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 lg:pb-10">
        <div
          role="note"
          className="alert alert-soft alert-warning mb-6 py-2 text-sm"
        >
          <span>
            ข้อมูลเป็นชุดข้อมูลย้อนหลัง{rangeText ? ` (${rangeText})` : ""}{" "}
            ไม่ใช่ข่าวสด และไม่มีเหตุการณ์ของปี 2026
          </span>
        </div>
        <Outlet />
      </main>

      <footer className="hidden border-t border-base-300 bg-base-100 py-6 text-center text-sm text-base-content/60 lg:block">
        NewsForex · Mini Project 2 · ข้อมูลจาก Hugging Face dataset
        Ehsanrs2/Forex_Factory_Calendar
      </footer>

      {/* Bottom dock สำหรับมือถือ/แท็บเล็ต */}
      <nav
        className="dock dock-sm z-30 border-t border-base-300 bg-base-100 lg:hidden"
        aria-label="เมนูหลัก (มือถือ)"
      >
        {NAV_ITEMS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => (isActive ? "dock-active" : "")}
          >
            <Icon />
            <span className="dock-label">
              {label}
              {to === "/collection" && savedCount > 0 ? ` (${savedCount})` : ""}
            </span>
          </NavLink>
        ))}
      </nav>

      <ScrollRestoration />
    </div>
  );
}
