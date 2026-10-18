import { queryOptions } from "@tanstack/react-query";
import { fetchCalendar, NotFoundError } from "./calendar";
import type { CalendarEvent, CalendarParams } from "../types/calendar";

// ข้อมูลเป็นชุดย้อนหลังที่ไม่เปลี่ยน -> staleTime ยาว ลดการยิง API ซ้ำ
export const STALE = {
  list: 10 * 60 * 1000,
  detail: 60 * 60 * 1000,
  meta: Infinity,
} as const;

export const calendarKeys = {
  all: ["calendar"] as const,
  meta: () => [...calendarKeys.all, "meta"] as const,
  list: (params: CalendarParams) =>
    [...calendarKeys.all, "list", params] as const,
  event: (id: string) => [...calendarKeys.all, "event", id] as const,
  byIds: (ids: string[]) => [...calendarKeys.all, "byIds", ids] as const,
};

export const metaQuery = () =>
  queryOptions({
    queryKey: calendarKeys.meta(),
    queryFn: ({ signal }) => fetchCalendar({ limit: 1 }, signal),
    staleTime: STALE.meta,
    select: (res) => ({ range: res.range, note: res.note }),
  });

export const listQuery = (params: CalendarParams) =>
  queryOptions({
    queryKey: calendarKeys.list(params),
    queryFn: ({ signal }) => fetchCalendar(params, signal),
    staleTime: STALE.list,
  });

export const eventQuery = (id: string) =>
  queryOptions({
    queryKey: calendarKeys.event(id),
    queryFn: async ({ signal }): Promise<CalendarEvent> => {
      const res = await fetchCalendar({ ids: [id] }, signal);
      const found = res.data[0];
      if (!found) throw new NotFoundError(id);
      return found;
    },
    staleTime: STALE.detail,
    retry: (failureCount: number, error: Error) =>
      !(error instanceof NotFoundError) && failureCount < 1,
  });

export const byIdsQuery = (ids: string[]) =>
  queryOptions({
    queryKey: calendarKeys.byIds(ids),
    queryFn: ({ signal }) => fetchCalendar({ ids }, signal),
    staleTime: STALE.detail,
  });
