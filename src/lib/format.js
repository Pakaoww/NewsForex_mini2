// เวลาทั้งหมดแสดงเป็นเวลาไทย (UTC+7) เพื่อให้ตรงกับช่วงวันที่ที่ส่งไปที่ API
const TZ = 'Asia/Bangkok';

const fmtTime = new Intl.DateTimeFormat('th-TH', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false });
const fmtDay = new Intl.DateTimeFormat('th-TH', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const fmtDayParts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });

export const timeOf = (iso) => fmtTime.format(new Date(iso));
export const dayLabel = (iso) => fmtDay.format(new Date(iso));
// 'YYYY-MM-DD' ตามเวลาไทย
export const dayKey = (iso) => fmtDayParts.format(new Date(iso));

export function addDays(day, n) {
  const d = new Date(`${day}T00:00:00+07:00`);
  d.setUTCDate(d.getUTCDate() + n);
  return dayKey(d.toISOString());
}

// ช่วงวันที่ (ตามเวลาไทย) ที่สิ้นสุดในวันที่เลือก ย้อนหลัง `days` วัน -> start/end เป็น ISO พร้อมโซนเวลา
export function rangeParams(day, days) {
  return {
    start: `${addDays(day, -(days - 1))}T00:00:00+07:00`,
    end: `${day}T23:59:59+07:00`,
  };
}

export const IMPACT_LABEL = { high: 'สูง', medium: 'ปานกลาง', low: 'ต่ำ', holiday: 'วันหยุด', unknown: 'ไม่ระบุ' };
