// Type ของข้อมูลจาก API /api/calendar (ดู api/calendar.js)

export type Impact = "high" | "medium" | "low" | "holiday" | "unknown";

export interface CalendarEvent {
  /** `<ปี>-<ลำดับ>` เช่น 2025-123 — ใช้เป็น :id ใน route และเก็บใน Zustand */
  id: string;
  /** เวลา UTC (ISO 8601) */
  time: string;
  currency: string;
  impact: Impact;
  event: string;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
  detail: string | null;
}

export interface DateRange {
  min: string;
  max: string;
}

export interface CalendarResponse {
  success: true;
  total: number;
  limit: number;
  offset: number;
  note: string;
  range: DateRange;
  data: CalendarEvent[];
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}

export type SortOrder = "asc" | "desc";

/** พารามิเตอร์ที่ส่งให้ GET /api/calendar */
export interface CalendarParams {
  currency?: string;
  /** คั่นด้วยจุลภาคได้ เช่น 'holiday,unknown' */
  impact?: string;
  search?: string;
  start?: string;
  end?: string;
  limit?: number;
  offset?: number;
  order?: SortOrder;
  /** ค้นด้วย id (ใช้กับหน้ารายละเอียดและคอลเลกชัน) */
  ids?: string[];
}

export interface DetailSection {
  label: string;
  text: string;
}
