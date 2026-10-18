import { Link } from "react-router";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import EventCard from "../components/EventCard";
import { EventGridSkeleton } from "../components/Skeletons";
import { useEventsByIds } from "../hooks/useCalendar";
import { useAppStore } from "../store/useAppStore";

export default function CollectionPage() {
  // Zustand เก็บแค่ id — ข้อมูลเต็มดึงจาก API (TanStack Query)
  const savedIds = useAppStore((s) => s.savedIds);
  const removeSaved = useAppStore((s) => s.removeSaved);
  const clearSaved = useAppStore((s) => s.clearSaved);

  const { data, isPending, isError, error, refetch, isFetching } =
    useEventsByIds(savedIds);

  // แสดงตามลำดับที่เก็บ และสะท้อนการลบทันทีโดยไม่ต้องรอ fetch ใหม่
  const byId = new Map((data?.data ?? []).map((e) => [e.id, e] as const));
  const events = savedIds.flatMap((id) => {
    const found = byId.get(id);
    return found ? [found] : [];
  });
  const missingIds = data ? savedIds.filter((id) => !byId.has(id)) : [];

  const handleClear = (): void => {
    if (window.confirm("ล้างคอลเลกชันทั้งหมดใช่หรือไม่?")) clearSaved();
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-primary">คอลเลกชันส่วนตัว</p>
          <h1 className="font-heading text-3xl font-semibold">
            เหตุการณ์<span className="text-primary">ที่เก็บไว้</span>
          </h1>
          <p className="mt-1 text-sm text-base-content/70">
            บันทึกในเบราว์เซอร์ของคุณ (LocalStorage) —
            เปิดเว็บครั้งต่อไปรายการยังอยู่
          </p>
        </div>
        {savedIds.length > 0 && (
          <button
            type="button"
            className="btn btn-outline btn-error btn-sm"
            onClick={handleClear}
          >
            ล้างทั้งหมด ({savedIds.length})
          </button>
        )}
      </section>

      {savedIds.length === 0 && (
        <EmptyState
          title="ยังไม่มีรายการในคอลเลกชัน"
          description="กดปุ่ม “เก็บ” ที่การ์ดเหตุการณ์ในหน้ารายการข่าวเพื่อเพิ่มที่นี่"
        >
          <Link to="/" className="btn btn-primary btn-sm">
            ไปเลือกเหตุการณ์
          </Link>
        </EmptyState>
      )}

      {savedIds.length > 0 && isPending && (
        <EventGridSkeleton count={Math.min(savedIds.length, 6)} />
      )}

      {savedIds.length > 0 && isError && (
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

      {missingIds.length > 0 && (
        <div role="alert" className="alert alert-warning alert-soft">
          <span>พบ {missingIds.length} รายการที่ไม่มีในชุดข้อมูลแล้ว</span>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => missingIds.forEach(removeSaved)}
          >
            ลบรายการเหล่านี้
          </button>
        </div>
      )}

      {events.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
