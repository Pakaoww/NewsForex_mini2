import type { CalendarParams, CalendarResponse } from "../types/calendar";

/** error ที่เกิดจากเรียก API ไม่สำเร็จ (HTTP error / response ผิดรูปแบบ) */
export class ApiError extends Error {
  readonly status: number | null;
  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** ไม่พบรายการตาม id */
export class NotFoundError extends Error {
  constructor(id: string) {
    super(`ไม่พบเหตุการณ์รหัส ${id}`);
    this.name = "NotFoundError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCalendarResponse(value: unknown): value is CalendarResponse {
  return (
    isRecord(value) &&
    value.success === true &&
    typeof value.total === "number" &&
    Array.isArray(value.data) &&
    isRecord(value.range)
  );
}

function buildQuery(params: CalendarParams): string {
  const qs = new URLSearchParams();
  const set = (key: string, value: string | number | undefined): void => {
    if (value !== undefined && value !== "") qs.set(key, String(value));
  };
  set("currency", params.currency);
  set("impact", params.impact);
  set("search", params.search);
  set("start", params.start);
  set("end", params.end);
  set("limit", params.limit);
  set("offset", params.offset);
  set("order", params.order);
  if (params.ids && params.ids.length > 0) set("ids", params.ids.join(","));
  return qs.toString();
}

export async function fetchCalendar(
  params: CalendarParams,
  signal?: AbortSignal,
): Promise<CalendarResponse> {
  let res: Response;
  try {
    res = await fetch(`/api/calendar?${buildQuery(params)}`, { signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError(
      "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่",
    );
  }

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok || !isCalendarResponse(json)) {
    const message =
      isRecord(json) && typeof json.error === "string"
        ? json.error
        : `HTTP ${res.status}`;
    throw new ApiError(message, res.status);
  }
  return json;
}
