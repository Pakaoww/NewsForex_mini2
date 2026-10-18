import { useQueries } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router";
import ErrorState from "../components/ErrorState";
import { listQuery } from "../api/queries";
import { useDatasetMeta } from "../hooks/useCalendar";
import { dayRange } from "../lib/format";
import type { CalendarParams } from "../types/calendar";

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

interface CurrencyRow {
  currency: string;
  count: number;
}

/** Extended Page: แดชบอร์ดสถิติผลกระทบของข่าวรายปี (ใช้ข้อมูลจาก API เดียวกัน นับด้วย total) */
export default function StatsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const meta = useDatasetMeta();

  const minYear = meta.data
    ? new Date(meta.data.range.min).getUTCFullYear()
    : undefined;
  const maxYear = meta.data
    ? new Date(meta.data.range.max).getUTCFullYear()
    : undefined;
  const requested = Number.parseInt(searchParams.get("year") ?? "", 10);
  const year =
    minYear !== undefined && maxYear !== undefined
      ? Number.isFinite(requested) &&
        requested >= minYear &&
        requested <= maxYear
        ? requested
        : maxYear
      : undefined;

  const yearParams: CalendarParams =
    year !== undefined ? dayRange(`${year}-01-01`, `${year}-12-31`) : {};
  // [0]=ทั้งหมด [1]=สูง [2]=ปานกลาง [3]=ต่ำ [4..]=ข่าวผลกระทบสูงแยกสกุลเงิน
  const queryParams: CalendarParams[] =
    year === undefined
      ? []
      : [
          { ...yearParams, limit: 1 },
          { ...yearParams, impact: "high", limit: 1 },
          { ...yearParams, impact: "medium", limit: 1 },
          { ...yearParams, impact: "low", limit: 1 },
          ...CURRENCIES.map(
            (c): CalendarParams => ({
              ...yearParams,
              impact: "high",
              currency: c,
              limit: 1,
            }),
          ),
        ];

  const results = useQueries({ queries: queryParams.map((p) => listQuery(p)) });

  const anyError = results.find((r) => r.isError);
  const loading =
    meta.isPending || (year !== undefined && results.some((r) => r.isPending));
  const retryAll = (): void => {
    if (meta.isError) void meta.refetch();
    results.forEach((r) => {
      if (r.isError) void r.refetch();
    });
  };

  const totalAll = results[0]?.data?.total ?? 0;
  const high = results[1]?.data?.total ?? 0;
  const medium = results[2]?.data?.total ?? 0;
  const low = results[3]?.data?.total ?? 0;
  const other = Math.max(0, totalAll - high - medium - low);

  const rows: CurrencyRow[] = CURRENCIES.map((currency, i) => ({
    currency,
    count: results[4 + i]?.data?.total ?? 0,
  })).sort((a, b) => b.count - a.count);
  const maxCount = Math.max(1, ...rows.map((r) => r.count));

  const years: number[] =
    minYear !== undefined && maxYear !== undefined
      ? Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i)
      : [];

  const listLink = (extra: Record<string, string>): string => {
    const qs = new URLSearchParams({
      start: `${year}-01-01`,
      end: `${year}-12-31`,
      ...extra,
    });
    return `/?${qs.toString()}`;
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-primary">หน้าพิเศษ</p>
          <h1 className="font-heading text-3xl font-semibold">
            สถิติ<span className="text-primary">ผลกระทบของข่าว</span>
          </h1>
          <p className="mt-1 text-sm text-base-content/70">
            เปรียบเทียบจำนวนเหตุการณ์ตามระดับความสำคัญและสกุลเงินในแต่ละปี
          </p>
        </div>
        <label>
          <span className="mb-1 block text-xs text-base-content/60">
            เลือกปี
          </span>
          <select
            className="select"
            value={year ?? ""}
            disabled={years.length === 0}
            onChange={(e) =>
              setSearchParams({ year: e.target.value }, { replace: true })
            }
            aria-label="เลือกปี"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </section>

      {(meta.isError || anyError) && (
        <ErrorState
          message={
            (meta.error ?? anyError?.error)?.message ??
            "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
          }
          onRetry={retryAll}
          retrying={results.some((r) => r.isFetching) || meta.isFetching}
        />
      )}

      {loading && !(meta.isError || anyError) && (
        <div
          className="space-y-4"
          role="status"
          aria-label="กำลังโหลดสถิติ"
          aria-busy="true"
        >
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24" />
            ))}
          </div>
          <div className="skeleton h-72 w-full" />
        </div>
      )}

      {!loading && !meta.isError && !anyError && year !== undefined && (
        <>
          {year === maxYear && (
            <div role="note" className="alert alert-soft alert-info text-sm">
              ปี {year} มีข้อมูลเพียงบางส่วนของปี (ชุดข้อมูลสิ้นสุดเดือนเมษายน
              2025)
            </div>
          )}

          <div className="stats stats-vertical w-full border border-base-300 bg-base-100 sm:stats-horizontal">
            <div className="stat">
              <div className="stat-title">เหตุการณ์ทั้งหมด</div>
              <div className="stat-value text-primary">
                {totalAll.toLocaleString("th-TH")}
              </div>
              <div className="stat-desc">
                <Link to={listLink({})} className="link">
                  ดูรายการ
                </Link>
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">ผลกระทบสูง</div>
              <div className="stat-value text-error">
                {high.toLocaleString("th-TH")}
              </div>
              <div className="stat-desc">
                {totalAll ? ((high / totalAll) * 100).toFixed(1) : "0"}%
                ของทั้งหมด
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">ปานกลาง</div>
              <div className="stat-value text-warning">
                {medium.toLocaleString("th-TH")}
              </div>
              <div className="stat-desc">
                {totalAll ? ((medium / totalAll) * 100).toFixed(1) : "0"}%
                ของทั้งหมด
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">ต่ำ</div>
              <div className="stat-value text-success">
                {low.toLocaleString("th-TH")}
              </div>
              <div className="stat-desc">
                {totalAll ? ((low / totalAll) * 100).toFixed(1) : "0"}% · อื่น ๆ{" "}
                {other.toLocaleString("th-TH")}
              </div>
            </div>
          </div>

          <section className="card card-border bg-base-100">
            <div className="card-body gap-4">
              <h2 className="card-title text-lg">
                สกุลเงินที่มีข่าวผลกระทบสูงมากที่สุด ปี {year}
              </h2>
              <ul className="space-y-3">
                {rows.map((row) => (
                  <li key={row.currency}>
                    <Link
                      to={listLink({ impact: "high", currency: row.currency })}
                      className="grid grid-cols-[3rem_1fr_3.5rem] items-center gap-3 rounded-lg p-1 hover:bg-base-200"
                      aria-label={`ดูข่าวผลกระทบสูงของ ${row.currency}`}
                    >
                      <span className="font-mono font-semibold">
                        {row.currency}
                      </span>
                      <progress
                        className="progress progress-error w-full"
                        value={row.count}
                        max={maxCount}
                      />
                      <span className="text-right tabular-nums">
                        {row.count.toLocaleString("th-TH")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
