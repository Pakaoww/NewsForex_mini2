// Vercel Serverless Function: GET /api/calendar
// ไฟล์นี้ใช้ไวยากรณ์ ESM (export default) ต้องมี "type": "module" ใน package.json (เทมเพลต Vite ใส่ให้อยู่แล้ว)
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'api', '_data');
const IMPACTS = new Set(['high', 'medium', 'low', 'holiday', 'unknown']);
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 500;
const NOTE = 'Historical dataset (Forex Factory Calendar, up to 2025-04-07). Not live data.';

const yearCache = new Map(); // เก็บปีที่โหลดแล้วไว้ใน memory ของ instance

function loadMeta() {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'meta.json'), 'utf8'));
}
function loadYear(y) {
  if (!yearCache.has(y)) {
    const file = path.join(DATA_DIR, `${y}.json`);
    // ไฟล์ปี = { details: [ข้อความรายละเอียด...], events: [...] } (event.detail เป็น index ใน details)
    yearCache.set(y, fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { details: [], events: [] });
  }
  return yearCache.get(y);
}

function parseDate(value, name, endOfDay) {
  if (!value) return null;
  // รับ YYYY-MM-DD หรือ ISO 8601 เต็ม
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const ms = Date.parse(isDateOnly ? `${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z` : value);
  if (Number.isNaN(ms)) throw new BadRequest(`Invalid "${name}": use YYYY-MM-DD or ISO 8601`);
  return ms;
}
function parseIntParam(value, name, def, min, max) {
  if (value === undefined || value === '') return def;
  if (!/^\d+$/.test(value)) throw new BadRequest(`"${name}" must be a non-negative integer`);
  const n = Number(value);
  if (n < min || n > max) throw new BadRequest(`"${name}" must be between ${min} and ${max}`);
  return n;
}
class BadRequest extends Error {}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  try {
    const q = req.query || {};
    const first = (v) => (Array.isArray(v) ? v[0] : v);

    const currencies = first(q.currency)
      ? first(q.currency).split(',').map((s) => s.trim().toUpperCase()).filter(Boolean)
      : null;
    if (currencies && currencies.some((c) => !/^[A-Z]{2,4}$/.test(c))) {
      throw new BadRequest('"currency" must be comma-separated codes, e.g. USD,EUR');
    }
    const impacts = first(q.impact)
      ? first(q.impact).split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
      : null;
    if (impacts && impacts.some((i) => !IMPACTS.has(i))) {
      throw new BadRequest('"impact" must be one or more of: high, medium, low, holiday, unknown');
    }
    const search = (first(q.search) || '').trim().toLowerCase();
    if (search.length > 100) throw new BadRequest('"search" is too long (max 100)');

    const startMs = parseDate(first(q.start), 'start', false);
    const endMs = parseDate(first(q.end), 'end', true);
    if (startMs !== null && endMs !== null && startMs > endMs) {
      throw new BadRequest('"start" must not be after "end"');
    }
    const limit = parseIntParam(first(q.limit), 'limit', DEFAULT_LIMIT, 1, MAX_LIMIT);
    const offset = parseIntParam(first(q.offset), 'offset', 0, 0, 10_000_000);
    const order = (first(q.order) || 'asc').toLowerCase();
    if (order !== 'asc' && order !== 'desc') throw new BadRequest('"order" must be asc or desc');

    // โหลดเฉพาะปีที่อยู่ในช่วง start-end
    const { years, min, max } = loadMeta();
    const lo = startMs !== null ? new Date(startMs).getUTCFullYear() : -Infinity;
    const hi = endMs !== null ? new Date(endMs).getUTCFullYear() : Infinity;
    const wanted = years.filter((y) => y >= lo && y <= hi);

    const startIso = startMs !== null ? new Date(startMs).toISOString() : null;
    const endIso = endMs !== null ? new Date(endMs).toISOString() : null;

    let result = [];
    for (const y of wanted) {
      const { events, details } = loadYear(y);
      for (const ev of events) {
        if (startIso && ev.time < startIso) continue;
        if (endIso && ev.time > endIso) continue;
        if (currencies && !currencies.includes(ev.currency)) continue;
        if (impacts && !impacts.includes(ev.impact)) continue;
        if (search && !(ev.event || '').toLowerCase().includes(search)) continue;
        result.push([ev, details]);
      }
    }
    if (order === 'desc') result.reverse();

    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json({
      success: true,
      total: result.length,
      limit,
      offset,
      note: NOTE,
      range: { min, max }, // ช่วงเวลาที่ชุดข้อมูลครอบคลุม (UTC)
      // แปลง index ของ detail เป็นข้อความเฉพาะรายการในหน้านี้
      data: result.slice(offset, offset + limit).map(([ev, details]) => ({
        ...ev,
        detail: ev.detail === null || ev.detail === undefined ? null : details[ev.detail] ?? null,
      })),
    });
  } catch (err) {
    if (err instanceof BadRequest) {
      return res.status(400).json({ success: false, error: err.message });
    }
    console.error(err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
