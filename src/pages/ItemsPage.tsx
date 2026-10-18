import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import EventCard from "../components/EventCard";
import { SearchIcon } from "../components/Icons";
import Pagination from "../components/Pagination";
import { EventGridSkeleton } from "../components/Skeletons";
import { useDatasetMeta, useEvents } from "../hooks/useCalendar";
import { dayKey, dayRange } from "../lib/format";
import type { CalendarParams } from "../types/calendar";

const PAGE_SIZE = 24; // มากกว่า 20 รายการต่อหน้า

interface ImpactTab {
  id: string;
  label: string;
  impact?: string;
}

const IMPACT_TABS: ImpactTab[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "high", label: "สูง", impact: "high" },
  { id: "medium", label: "ปานกลาง", impact: "medium" },
  { id: "low", label: "ต่ำ", impact: "low" },
  { id: "other", label: "อื่น ๆ", impact: "holiday,unknown" },
];

const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "AUD",
  "NZD",
  "CAD",
  "CHF",
  "CNY",
];

export default function ItemsPage() {
  // ตัวกรองเก็บใน URL (แชร์ลิงก์ได้ / กดย้อนกลับได้) — ไม่ซ้ำซ้อนกับ Zustand
  const [searchParams, setSearchParams] = useSearchParams();
  const tabId = searchParams.get("impact") ?? "all";
  const currency = searchParams.get("currency") ?? "";
  const q = searchParams.get("q") ?? "";
  const start = searchParams.get("start") ?? "";
  const end = searchParams.get("end") ?? "";
  const page = Math.max(
    1,
    Number.parseInt(searchParams.get("page") ?? "1", 10) || 1,
  );

  const [text, setText] = useState(q);
  const meta = useDatasetMeta();
  const minDay = meta.data ? dayKey(meta.data.range.min) : undefined;
  const maxDay = meta.data ? dayKey(meta.data.range.max) : undefined;

  const patch = (changes: Record<string, string>, keepPage = false): void => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(changes)) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        if (!keepPage) next.delete("page");
        return next;
      },
      { replace: !keepPage },
    );
  };

  // รอ 300 ms หลังพิมพ์ก่อนค่อยค้นหา
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = text.trim();
      if (trimmed !== q) patch({ q: trimmed });
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const activeTab = IMPACT_TABS.find((t) => t.id === tabId) ?? IMPACT_TABS[0];
  const params: CalendarParams = {
    impact: activeTab.impact,
    currency: currency || undefined,
    search: q || undefined,
    ...dayRange(start || undefined, end || undefined),
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
    order: "desc",
  };

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
    isPlaceholderData,
  } = useEvents(params);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilter = Boolean(q || currency || start || end || tabId !== "all");

  const resetFilters = (): void => {
    setText("");
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-primary">ปฏิทินข่าวเศรษฐกิจ</p>
        <h1 className="font-heading text-3xl font-semibold sm:text-4xl">
          ติดตามข่าว<span className="text-primary">ตลาดการเงิน</span>
        </h1>
        <p className="mt-1 text-base-content/70">
          เลือกดูเหตุการณ์เศรษฐกิจที่อาจมีผลต่อค่าเงิน กดการ์ดเพื่อดูรายละเอียด
          และกด “เก็บ” เพื่อบันทึกไว้ในคอลเลกชันของคุณ
        </p>
      </section>

      {/* Filters */}
      <section className="card card-border bg-base-100">
        <div className="card-body gap-4 p-4">
          <label className="input w-full">
            <SearchIcon />
            <input
              type="search"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="ค้นหาชื่อเหตุการณ์ เช่น CPI, NFP, Rate…"
              aria-label="ค้นหาเหตุการณ์"
            />
          </label>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div
              role="tablist"
              className="tabs tabs-box w-full overflow-x-auto lg:w-auto"
            >
              {IMPACT_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab.id === t.id}
                  className={`tab ${activeTab.id === t.id ? "tab-active" : ""}`}
                  onClick={() => patch({ impact: t.id === "all" ? "" : t.id })}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex">
              <select
                className="select select-sm"
                value={currency}
                onChange={(e) => patch({ currency: e.target.value })}
                aria-label="สกุลเงิน"
              >
                <option value="">ทุกสกุลเงิน</option>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="date"
                className="input input-sm"
                value={start}
                min={minDay}
                max={end || maxDay}
                onChange={(e) => patch({ start: e.target.value })}
                aria-label="ตั้งแต่วันที่"
              />
              <input
                type="date"
                className="input input-sm"
                value={end}
                min={start || minDay}
                max={maxDay}
                onChange={(e) => patch({ end: e.target.value })}
                aria-label="ถึงวันที่"
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={resetFilters}
                disabled={!hasFilter}
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between text-sm text-base-content/70">
        <span>
          {isPending
            ? "กำลังโหลด…"
            : `พบ ${total.toLocaleString("th-TH")} รายการ`}
        </span>
        <span>เรียงจากล่าสุด · แสดงหน้าละ {PAGE_SIZE} รายการ</span>
      </div>

      {/* Data states */}
      {isPending && <EventGridSkeleton count={12} />}

      {isError && (
        <ErrorState
          message={
            error instanceof Error
              ? error.message
              : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
          }
          onRetry={() => void refetch()}
          retrying={isFetching}
        />
      )}

      {data && data.data.length === 0 && (
        <EmptyState
          title="ไม่พบเหตุการณ์ที่ตรงกับเงื่อนไข"
          description="ลองเปลี่ยนวันที่ ระดับความสำคัญ สกุลเงิน หรือคำค้นหา"
        >
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={resetFilters}
          >
            ล้างตัวกรอง
          </button>
        </EmptyState>
      )}

      {data && data.data.length > 0 && (
        <>
          <div
            className={`grid gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${isPlaceholderData ? "opacity-50" : ""}`}
          >
            {data.data.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            disabled={isPlaceholderData}
            onChange={(p) => patch({ page: String(p) }, true)}
          />
        </>
      )}
    </div>
  );
}
