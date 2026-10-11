# newsflow · ปฏิทินข่าวเศรษฐกิจ (React + Vite + Vercel)

หน้าเว็บ + API `/api/calendar` ที่อ่านข้อมูลจาก Hugging Face dataset `Ehsanrs2/Forex_Factory_Calendar`
**เป็นข้อมูลย้อนหลัง (2007 – เม.ย. 2025) ไม่ใช่ข่าวสด และไม่มีเหตุการณ์ปี 2026** เว็บแสดงข้อความนี้ให้เห็นตลอด

## ขั้นตอน

1. ติดตั้ง: `npm install`
2. วางไฟล์ CSV ที่ `data/raw/Forex_Factory_Calendar.csv` (สร้างโฟลเดอร์เอง; โฟลเดอร์นี้อยู่ใน .gitignore)
3. แปลงข้อมูล: `npm run data`
   (หรือ `node scripts/build-data.mjs "path/to/file.csv"`)
   ตรวจผลที่พิมพ์: หัวคอลัมน์ ค่า Impact ดิบ และจำนวนแถวต่อปี
   ได้โฟลเดอร์ `api/_data/` — **ต้อง commit ขึ้น GitHub**
4. ทดสอบ API: `npm run test:api`
5. รันเว็บในเครื่อง: `npm run dev` แล้วเปิด http://localhost:5173
   (vite.config.js มี middleware เรียก api/calendar.js ให้ ไม่ต้องใช้ Vercel CLI)
6. Deploy: `git add . && git commit -m "newsflow" && git push` (Vercel จะ deploy จาก GitHub เอง)
   ตรวจ: เปิด `https://<โดเมน>/api/calendar?limit=3` ต้องได้ JSON ที่มี `"success": true`

## API  GET /api/calendar
| parameter | ความหมาย |
|---|---|
| currency | `USD,EUR` (คั่นด้วยจุลภาค) |
| impact | `high` `medium` `low` `holiday` `unknown` (คั่นด้วยจุลภาคได้) |
| search | ค้นหาชื่อเหตุการณ์ |
| start, end | `YYYY-MM-DD` หรือ ISO 8601 |
| limit, offset | แบ่งหน้า (ค่าเริ่มต้น 50, สูงสุด 500) |
| order | `asc` (ค่าเริ่มต้น) / `desc` |

ผลลัพธ์: `{ success, total, limit, offset, note, range:{min,max}, data:[{time,currency,impact,event,actual,forecast,previous}] }`
`time` เป็น UTC; หน้าเว็บแปลงเป็นเวลาไทย (UTC+7)

## โครงสร้าง
- `api/calendar.js` — serverless function; `api/_data/<ปี>.json` — ข้อมูลแยกรายปี (โหลดเฉพาะปีที่ขอ)
- `vercel.json` — `includeFiles` ให้ข้อมูลถูกรวมเข้า function ตอน deploy
- `src/` — หน้าเว็บ (Sidebar, Hero, สถิติ, CalendarSection, ที่บันทึกใน localStorage)
- `scripts/` — แปลงข้อมูล + ทดสอบ API

## หมายเหตุ
- ขีดจำกัดขนาด function ของ Vercel ให้ตรวจที่ vercel.com/docs/functions/limitations (ตรวจจากที่นี่ไม่ได้)
