// แปลงไฟล์ CSV (Forex Factory Calendar) -> JSON รายปี ใน api/_data/
// วิธีใช้:  node scripts/build-data.mjs [path-to-csv]
// ค่าเริ่มต้นของ path: data/raw/Forex_Factory_Calendar.csv   <-- TODO: วางไฟล์ CSV ของคุณที่นี่ (หรือส่ง path เป็น argument)
import fs from "node:fs";
import path from "node:path";

const CSV_PATH = process.argv[2] || "data/raw/forex_factory_cache.csv";
const OUT_DIR = "api/_data";

// ชื่อคอลัมน์ที่คาดไว้ตามหน้า dataset card (ยังไม่ได้ตรวจกับไฟล์จริง)
// สคริปต์จะเทียบกับหัวคอลัมน์จริงแบบไม่สนตัวพิมพ์ ถ้าไม่เจอจะหยุดและแจ้งเตือน
const COLS = {
  time: "DateTime",
  currency: "Currency",
  impact: "Impact",
  event: "Event",
  actual: "Actual",
  forecast: "Forecast",
  previous: "Previous",
};

if (!fs.existsSync(CSV_PATH)) {
  console.error(
    `ไม่พบไฟล์ CSV: ${CSV_PATH}\nวางไฟล์ไว้ที่ path นี้ หรือรัน: node scripts/build-data.mjs <path-to-csv>`,
  );
  process.exit(1);
}

// ตัวอ่าน CSV แบบไม่พึ่งไลบรารี รองรับ "..." , "" และขึ้นบรรทัดใหม่ในเซลล์
function* parseCsv(text) {
  let row = [],
    field = "",
    inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQ = false;
      } else field += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") yield row;
      row = [];
    } else field += ch;
  }
  if (field !== "" || row.length) {
    row.push(field);
    yield row;
  }
}

function normImpact(raw) {
  const s = (raw || "").toLowerCase();
  if (s.includes("high")) return "high";
  if (s.includes("medium")) return "medium";
  if (s.includes("low")) return "low";
  if (
    s.includes("holiday") ||
    s.includes("non-economic") ||
    s.includes("non economic")
  )
    return "holiday";
  return s.trim() || "unknown";
}

const clean = (v) => {
  const t = (v ?? "").trim();
  return t === "" ? null : t;
};

let text = fs.readFileSync(CSV_PATH, "utf8");
if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // ตัด BOM

const rows = parseCsv(text);
const header = rows.next().value;
if (!header) {
  console.error("ไฟล์ CSV ว่าง");
  process.exit(1);
}
console.log("หัวคอลัมน์ที่พบในไฟล์:", header);

const idx = {};
for (const [key, name] of Object.entries(COLS)) {
  const i = header.findIndex(
    (h) => h.trim().toLowerCase() === name.toLowerCase(),
  );
  if (i === -1) {
    console.error(
      `ไม่พบคอลัมน์ "${name}" ในไฟล์ -> แก้ค่า COLS ในสคริปต์ให้ตรงกับหัวคอลัมน์ด้านบน`,
    );
    process.exit(1);
  }
  idx[key] = i;
}

// คอลัมน์ Detail (ถ้ามี) เป็นตัวเลือก: เก็บข้อความที่ซ้ำกันครั้งเดียวต่อปีแล้วอ้างด้วย index
const detailIdx = header.findIndex((h) => h.trim().toLowerCase() === "detail");
console.log(
  detailIdx === -1
    ? "ไม่พบคอลัมน์ Detail -> ข้ามรายละเอียดข่าว"
    : "พบคอลัมน์ Detail -> เก็บรายละเอียดข่าว",
);
const detailsByYear = new Map(); // ปี -> { map: Map<ข้อความ, index>, arr: [] }
function detailIndex(year, text) {
  if (!detailsByYear.has(year))
    detailsByYear.set(year, { map: new Map(), arr: [] });
  const d = detailsByYear.get(year);
  if (!d.map.has(text)) {
    d.map.set(text, d.arr.length);
    d.arr.push(text);
  }
  return d.map.get(text);
}

const byYear = new Map();
const impactCounts = {};
let total = 0,
  skipped = 0;

for (const r of rows) {
  total++;
  const ms = Date.parse((r[idx.time] || "").trim());
  if (Number.isNaN(ms)) {
    skipped++;
    continue;
  }
  const d = new Date(ms);
  const rawImpact = r[idx.impact] || "";
  impactCounts[rawImpact] = (impactCounts[rawImpact] || 0) + 1;
  const rec = {
    time: d.toISOString(), // UTC
    currency: clean(r[idx.currency])?.toUpperCase() ?? null,
    impact: normImpact(rawImpact),
    event: clean(r[idx.event]),
    actual: clean(r[idx.actual]),
    forecast: clean(r[idx.forecast]),
    previous: clean(r[idx.previous]),
    detail: null,
  };
  const y = d.getUTCFullYear();
  const detailText = detailIdx === -1 ? null : clean(r[detailIdx]);
  if (detailText) rec.detail = detailIndex(y, detailText);
  if (!byYear.has(y)) byYear.set(y, []);
  byYear.get(y).push(rec);
}

fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

const years = [...byYear.keys()].sort((a, b) => a - b);
let bytes = 0;
for (const y of years) {
  const list = byYear
    .get(y)
    .sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0));
  const json = JSON.stringify({
    details: detailsByYear.get(y)?.arr ?? [],
    events: list,
  });
  fs.writeFileSync(path.join(OUT_DIR, `${y}.json`), json);
  bytes += Buffer.byteLength(json);
  console.log(
    `${y}: ${list.length} แถว (${(Buffer.byteLength(json) / 1024).toFixed(0)} KB)`,
  );
}
const firstList = byYear.get(years[0]);
const lastList = byYear.get(years[years.length - 1]);
fs.writeFileSync(
  path.join(OUT_DIR, "meta.json"),
  JSON.stringify({
    years,
    min: firstList[0].time,
    max: lastList[lastList.length - 1].time,
    rows: total - skipped,
    note: "Historical dataset (Ehsanrs2/Forex_Factory_Calendar). Not live data.",
  }),
);

console.log("\nค่า Impact ดิบที่พบ (ตรวจว่า map ถูกต้อง):", impactCounts);
console.log(
  `อ่านทั้งหมด ${total} แถว, ข้าม ${skipped} แถว (วันที่อ่านไม่ได้), รวม ${(bytes / 1048576).toFixed(1)} MB`,
);
