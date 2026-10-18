import { Link, useLocation, useNavigate, useParams } from "react-router";
import ErrorState from "../components/ErrorState";
import { ArrowLeftIcon } from "../components/Icons";
import ImpactBadge from "../components/ImpactBadge";
import SaveButton from "../components/SaveButton";
import { DetailSkeleton } from "../components/Skeletons";
import { NotFoundError } from "../api/calendar";
import { useEvent, useEvents } from "../hooks/useCalendar";
import { dayLabel, fullDayLabel, parseDetail, timeOf } from "../lib/format";
import type { CalendarEvent } from "../types/calendar";

function BigStat({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl bg-base-200 p-4 text-center">
      <div className="text-xs text-base-content/60">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">
        {value ?? "–"}
      </div>
    </div>
  );
}

/** ผลย้อนหลังของเหตุการณ์ที่ชื่อคล้ายกัน (สกุลเงินเดียวกัน ก่อนเวลาของรายการนี้) */
function RelatedHistory({ event }: { event: CalendarEvent }) {
  const hasName = event.event.trim().length > 0;
  const { data, isPending, isError, refetch, isFetching } = useEvents(
    {
      search: event.event,
      currency: event.currency || undefined,
      end: event.time,
      order: "desc",
      limit: 8,
    },
    { enabled: hasName },
  );
  if (!hasName) return null;

  const rows = (data?.data ?? []).filter((e) => e.id !== event.id).slice(0, 6);

  return (
    <section className="card card-border bg-base-100">
      <div className="card-body gap-3">
        <h2 className="card-title text-lg">
          ผลย้อนหลังของเหตุการณ์ที่ชื่อคล้ายกัน
        </h2>

        {isPending && (
          <div
            className="space-y-2"
            role="status"
            aria-label="กำลังโหลดประวัติ"
          >
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-10 w-full" />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-error">โหลดประวัติไม่สำเร็จ</span>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        )}

        {data && rows.length === 0 && (
          <p className="text-sm text-base-content/60">ไม่พบเหตุการณ์ก่อนหน้า</p>
        )}

        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>วันที่</th>
                  <th>เหตุการณ์</th>
                  <th className="text-right">จริง</th>
                  <th className="text-right">คาดการณ์</th>
                  <th className="text-right">ก่อนหน้า</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-base-200">
                    <td className="whitespace-nowrap">{dayLabel(r.time)}</td>
                    <td>
                      <Link to={`/event/${r.id}`} className="link link-hover">
                        {r.event}
                      </Link>
                    </td>
                    <td className="text-right tabular-nums">
                      {r.actual ?? "–"}
                    </td>
                    <td className="text-right tabular-nums">
                      {r.forecast ?? "–"}
                    </td>
                    <td className="text-right tabular-nums">
                      {r.previous ?? "–"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    data: event,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useEvent(id);

  // เปิดลิงก์ตรง (ไม่มีหน้าก่อนหน้า) -> กลับหน้าแรก
  const goBack = (): void => {
    if (location.key === "default") void navigate("/");
    else void navigate(-1);
  };

  const sections = event?.detail ? parseDetail(event.detail) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <button type="button" className="btn btn-ghost btn-sm" onClick={goBack}>
          <ArrowLeftIcon width={16} height={16} />
          ย้อนกลับ
        </button>
        <div className="breadcrumbs hidden text-sm sm:block">
          <ul>
            <li>
              <Link to="/">รายการข่าว</Link>
            </li>
            <li>รายละเอียด {id}</li>
          </ul>
        </div>
      </div>

      {isPending && <DetailSkeleton />}

      {isError && (
        <ErrorState
          title={
            error instanceof NotFoundError
              ? "ไม่พบเหตุการณ์นี้"
              : "โหลดข้อมูลไม่สำเร็จ"
          }
          message={
            error instanceof Error
              ? error.message
              : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
          }
          onRetry={
            error instanceof NotFoundError ? undefined : () => void refetch()
          }
          retrying={isFetching}
        />
      )}

      {event && (
        <>
          <article className="card card-border bg-base-100">
            <div className="card-body gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <ImpactBadge impact={event.impact} />
                <span className="badge badge-outline font-mono">
                  {event.currency || "—"}
                </span>
                <span className="text-sm text-base-content/60">
                  รหัส {event.id}
                </span>
              </div>

              <div>
                <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
                  {event.event || "—"}
                </h1>
                <p className="mt-1 text-sm text-base-content/70">
                  {fullDayLabel(event.time)} · {timeOf(event.time)} น. (เวลาไทย)
                  · {event.time.replace(".000Z", "Z")} UTC
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <BigStat label="ค่าจริง (Actual)" value={event.actual} />
                <BigStat label="คาดการณ์ (Forecast)" value={event.forecast} />
                <BigStat label="ก่อนหน้า (Previous)" value={event.previous} />
              </div>

              <div className="card-actions">
                <SaveButton id={event.id} size="md" />
                <Link to="/collection" className="btn btn-ghost">
                  ไปที่คอลเลกชัน
                </Link>
              </div>
            </div>
          </article>

          {sections.length > 0 ? (
            <section className="card card-border bg-base-100">
              <div className="card-body gap-4">
                <h2 className="card-title text-lg">รายละเอียดเหตุการณ์</h2>
                <dl className="space-y-4">
                  {sections.map((s, i) => (
                    <div key={`${s.label}-${i}`}>
                      {s.label && (
                        <dt className="text-sm font-semibold text-primary">
                          {s.label}
                        </dt>
                      )}
                      <dd className="text-sm leading-relaxed text-base-content/80">
                        {s.text}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>
          ) : (
            <div role="note" className="alert alert-soft">
              เหตุการณ์นี้ไม่มีคำอธิบายเพิ่มเติมในชุดข้อมูล
            </div>
          )}

          <RelatedHistory event={event} />
        </>
      )}
    </div>
  );
}
