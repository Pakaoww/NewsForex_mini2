export function EventCardSkeleton() {
  return (
    <div className="card card-border bg-base-100" aria-hidden="true">
      <div className="card-body gap-3 p-4">
        <div className="flex items-center gap-2">
          <div className="skeleton h-5 w-14" />
          <div className="skeleton h-5 w-12" />
          <div className="skeleton ml-auto h-4 w-24" />
        </div>
        <div className="skeleton h-5 w-4/5" />
        <div className="skeleton h-4 w-2/5" />
        <div className="grid grid-cols-3 gap-2">
          <div className="skeleton h-12" />
          <div className="skeleton h-12" />
          <div className="skeleton h-12" />
        </div>
        <div className="flex justify-between">
          <div className="skeleton h-8 w-24" />
          <div className="skeleton h-8 w-20" />
        </div>
      </div>
    </div>
  );
}

export function EventGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      role="status"
      aria-label="กำลังโหลดข้อมูล"
      aria-busy="true"
    >
      {Array.from({ length: count }, (_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div
      className="card card-border bg-base-100"
      role="status"
      aria-label="กำลังโหลดรายละเอียด"
      aria-busy="true"
    >
      <div className="card-body gap-4">
        <div className="flex gap-2">
          <div className="skeleton h-6 w-16" />
          <div className="skeleton h-6 w-14" />
        </div>
        <div className="skeleton h-8 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="grid grid-cols-3 gap-3">
          <div className="skeleton h-20" />
          <div className="skeleton h-20" />
          <div className="skeleton h-20" />
        </div>
        <div className="skeleton h-24 w-full" />
        <div className="skeleton h-24 w-full" />
      </div>
    </div>
  );
}
