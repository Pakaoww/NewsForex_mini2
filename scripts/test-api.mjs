// ทดสอบ handler โดยตรง (ไม่ต้องเปิดเซิร์ฟเวอร์):  node scripts/test-api.mjs
// ต้องรัน build-data ก่อน เพื่อให้มี api/_data/
import handler from "../api/calendar.js";

async function call(query, method = "GET") {
  return new Promise((resolve) => {
    const headers = {};
    const res = {
      status(code) {
        this.code = code;
        return this;
      },
      setHeader(k, v) {
        headers[k] = v;
      },
      json(body) {
        resolve({ code: this.code, headers, body });
      },
    };
    handler({ method, query }, res);
  });
}

let failed = 0;
function check(name, cond, extra = "") {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name} ${extra}`);
  if (!cond) failed++;
}

const base = await call({});
check(
  "default: 200 + success",
  base.code === 200 && base.body.success === true,
  `(total=${base.body.total})`,
);
check(
  "default: มี cache header",
  /s-maxage/.test(base.headers["Cache-Control"] || ""),
);
check(
  "default: limit 50",
  base.body.data.length <= 50 && base.body.limit === 50,
);
check(
  "default: field ครบ",
  [
    "id",
    "time",
    "currency",
    "impact",
    "event",
    "actual",
    "forecast",
    "previous",
  ].every((k) => k in (base.body.data[0] || {})),
);

const usd = await call({ currency: "USD" });
check(
  "currency=USD",
  usd.body.data.every((e) => e.currency === "USD"),
  `(total=${usd.body.total})`,
);
const multi = await call({ currency: "USD,EUR", limit: "500" });
check(
  "currency=USD,EUR",
  multi.body.data.every((e) => ["USD", "EUR"].includes(e.currency)),
);

const high = await call({ impact: "high" });
check(
  "impact=high",
  high.body.data.every((e) => e.impact === "high"),
  `(total=${high.body.total})`,
);

const s = await call({ search: "cpi" });
check(
  "search=cpi",
  s.body.data.every((e) => /cpi/i.test(e.event)),
  `(total=${s.body.total})`,
);

const years = JSON.parse(
  (await import("node:fs")).readFileSync("api/_data/meta.json", "utf8"),
).years;
const y = years[Math.floor(years.length / 2)];
const range = await call({
  start: `${y}-03-01`,
  end: `${y}-03-31`,
  limit: "500",
});
check(
  `range ${y}-03`,
  range.body.data.every(
    (e) => e.time >= `${y}-03-01` && e.time <= `${y}-03-31T23:59:59.999Z`,
  ),
  `(total=${range.body.total})`,
);

const p1 = await call({ limit: "3", offset: "0" });
const p2 = await call({ limit: "3", offset: "3" });
check(
  "pagination: หน้า 2 ไม่ซ้ำหน้า 1",
  p1.body.data.length > 0 &&
    p1.body.data[0].time + p1.body.data[0].event !==
      (p2.body.data[0] ? p2.body.data[0].time + p2.body.data[0].event : ""),
);
check("pagination: total คงที่", p1.body.total === p2.body.total);

const desc = await call({ order: "desc", limit: "1" });
check(
  "order=desc ได้แถวล่าสุด",
  desc.body.data[0]?.time >= base.body.data[0]?.time,
);

const byIds = await call({ ids: `${desc.body.data[0].id},2007-0` });
check(
  "ids=… คืนตามลำดับที่ขอ",
  byIds.body.data.length === 2 &&
    byIds.body.data[0].id === desc.body.data[0].id &&
    byIds.body.data[1].id === "2007-0",
);
check(
  "ids ที่ไม่มีอยู่จริง -> data ว่าง",
  (await call({ ids: "2025-9999999" })).body.data.length === 0,
);
check("ids=bad -> 400", (await call({ ids: "bad" })).code === 400);
check(
  "id ไม่ซ้ำกันในหน้าเดียว",
  new Set(base.body.data.map((e) => e.id)).size === base.body.data.length,
);

check("limit=0 -> 400", (await call({ limit: "0" })).code === 400);
check("limit=abc -> 400", (await call({ limit: "abc" })).code === 400);
check("impact=xxx -> 400", (await call({ impact: "xxx" })).code === 400);
check("start=bad -> 400", (await call({ start: "bad" })).code === 400);
check(
  "start>end -> 400",
  (await call({ start: "2024-02-01", end: "2024-01-01" })).code === 400,
);
check("POST -> 405", (await call({}, "POST")).code === 405);
check(
  "ไม่มีผลลัพธ์ -> data ว่าง",
  (await call({ search: "zzzz-no-match" })).body.data.length === 0,
);

console.log(failed ? `\n${failed} test ล้มเหลว` : "\nผ่านทุก test");
process.exit(failed ? 1 : 0);
