import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { byIdsQuery, eventQuery, listQuery, metaQuery } from "../api/queries";
import type { CalendarParams } from "../types/calendar";

/** รายการเหตุการณ์ (Server State -> TanStack Query เท่านั้น) */
export function useEvents(
  params: CalendarParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...listQuery(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

/** เหตุการณ์เดียวตาม id (หน้า Detail) */
export function useEvent(id: string | undefined) {
  return useQuery({
    ...eventQuery(id ?? ""),
    enabled: Boolean(id),
  });
}

/** หลายเหตุการณ์ตาม id (หน้า Collection — Zustand เก็บแค่ id) */
export function useEventsByIds(ids: string[]) {
  return useQuery({
    ...byIdsQuery(ids),
    enabled: ids.length > 0,
    placeholderData: keepPreviousData,
  });
}

/** ช่วงเวลาที่ชุดข้อมูลครอบคลุม */
export function useDatasetMeta() {
  return useQuery(metaQuery());
}
