import type { DetailSection, Impact } from "../types/calendar";

// เวลาทั้งหมดแสดงเป็นเวลาไทย (UTC+7) เพื่อให้ตรงกับช่วงวันที่ที่ส่งไปที่ API
const TZ = "Asia/Bangkok";

const fmtTime = new Intl.DateTimeFormat("th-TH", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const fmtDay = new Intl.DateTimeFormat("th-TH", {
  timeZone: TZ,
  day: "numeric",
  month: "short",
  year: "numeric",
});
const fmtFull = new Intl.DateTimeFormat("th-TH", {
  timeZone: TZ,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const fmtDayParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const timeOf = (iso: string): string => fmtTime.format(new Date(iso));
export const dayLabel = (iso: string): string => fmtDay.format(new Date(iso));
export const fullDayLabel = (iso: string): string =>
  fmtFull.format(new Date(iso));
/** 'YYYY-MM-DD' ตามเวลาไทย */
export const dayKey = (iso: string): string =>
  fmtDayParts.format(new Date(iso));

/** แปลงช่วงวัน (ตามเวลาไทย) เป็น start/end ที่ API เข้าใจ */
export function dayRange(
  startDay?: string,
  endDay?: string,
): { start?: string; end?: string } {
  return {
    start: startDay ? `${startDay}T00:00:00+07:00` : undefined,
    end: endDay ? `${endDay}T23:59:59+07:00` : undefined,
  };
}

export const IMPACT_LABEL: Record<Impact, string> = {
  high: "สูง",
  medium: "ปานกลาง",
  low: "ต่ำ",
  holiday: "วันหยุด",
  unknown: "ไม่ระบุ",
};

export const IMPACT_BADGE: Record<Impact, string> = {
  high: "badge-error",
  medium: "badge-warning",
  low: "badge-success",
  holiday: "badge-info",
  unknown: "badge-ghost",
};

/**
 * detail จาก API เป็นข้อความรูปแบบ
 * "Description: ...; | Usual Effect: ...; | Next Release: ... | FF Notes: ...;"
 * แยกเป็นหัวข้อ เพื่อแสดงผลอ่านง่าย
 */
export function parseDetail(detail: string): DetailSection[] {
  return detail
    .split(/\s\|\s/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const idx = part.indexOf(":");
      const hasLabel = idx > 0 && idx <= 40;
      const label = hasLabel ? part.slice(0, idx).trim() : "";
      const text = (hasLabel ? part.slice(idx + 1) : part)
        .trim()
        .replace(/;+$/, "")
        .trim();
      return { label, text };
    })
    .filter((s) => s.text.length > 0);
}
