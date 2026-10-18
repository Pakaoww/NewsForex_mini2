import { Link } from "react-router";
import type { CalendarEvent } from "../types/calendar";
import { dayLabel, timeOf } from "../lib/format";
import ImpactBadge from "./ImpactBadge";
import SaveButton from "./SaveButton";

interface Props {
  event: CalendarEvent;
}

function Stat({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-lg bg-base-200 px-2 py-1.5">
      <dt className="text-[11px] text-base-content/60">{label}</dt>
      <dd className="font-medium tabular-nums truncate">{value ?? "–"}</dd>
    </div>
  );
}

export default function EventCard({ event }: Props) {
  return (
    <article className="card card-border bg-base-100 transition-shadow hover:shadow-md">
      <div className="card-body gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <ImpactBadge impact={event.impact} />
          <span className="badge badge-outline font-mono">
            {event.currency || "—"}
          </span>
          <span className="ml-auto text-xs text-base-content/60">
            {dayLabel(event.time)} · {timeOf(event.time)}
          </span>
        </div>

        <h3 className="card-title min-h-12 items-start text-base leading-snug">
          <Link to={`/event/${event.id}`} className="hover:text-primary">
            {event.event || "—"}
          </Link>
        </h3>

        <dl className="grid grid-cols-3 gap-2 text-center text-sm">
          <Stat label="จริง" value={event.actual} />
          <Stat label="คาดการณ์" value={event.forecast} />
          <Stat label="ก่อนหน้า" value={event.previous} />
        </dl>

        <div className="card-actions items-center justify-between">
          <Link to={`/event/${event.id}`} className="btn btn-ghost btn-sm">
            ดูรายละเอียด
          </Link>
          <SaveButton id={event.id} />
        </div>
      </div>
    </article>
  );
}
