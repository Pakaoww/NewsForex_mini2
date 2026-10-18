# NewsForex · ปฏิทินข่าวเศรษฐกิจ (Mini Project 2)

Modern Decoupled SPA: **React 19 + Vite + TypeScript + React Router v7 + Zustand (persist) + TanStack Query v5 + Tailwind CSS + DaisyUI**
ข้อมูลมาจาก API ที่กลุ่มพัฒนาเอง `/api/calendar` (Vercel Serverless Function) อ่านจาก Hugging Face dataset
`Ehsanrs2/Forex_Factory_Calendar` — **เป็นข้อมูลย้อนหลัง (2007 – เม.ย. 2025) ไม่ใช่ข่าวสด และไม่มีเหตุการณ์ปี 2026**
(ชุดข้อมูลมี 83,427 รายการ)

## วิธีรัน
```bash
npm install
npm run dev          # http://localhost:5173  (vite.config.ts มี middleware เรียก api/calendar.js ให้เอง)
npm run typecheck    # ตรวจ TypeScript
npm run build        # build ไปที่ dist/
npm run test:api     # ทดสอบ API
```
ข้อมูลรายปีอยู่ใน `api/_data/` แล้ว (สร้างใหม่ได้ด้วย `npm run data` เมื่อมีไฟล์ CSV ที่ `data/raw/`)

## หน้าของระบบ (ตรงตามโจทย์ 5 หน้า)
| Route | หน้า | รายละเอียด |
|---|---|---|
| `/` | รายการข่าว (Items) | หน้าละ 24 รายการ (≥ 20) ค้นหา/กรองระดับผลกระทบ/สกุลเงิน/ช่วงวันที่ + แบ่งหน้า (ตัวกรองเก็บใน URL) |
| `/event/:id` | รายละเอียด (Detail, Dynamic Route) | ค่าจริง/คาดการณ์/ก่อนหน้า, คำอธิบายเหตุการณ์, ผลย้อนหลังของเหตุการณ์ที่ชื่อคล้ายกัน |
| `/collection` | คอลเลกชันส่วนตัว | กด “เก็บ” จากการ์ดหรือหน้า Detail — คงอยู่หลังรีเฟรช (LocalStorage) |
| `/about` | เกี่ยวกับเรา | ข้อมูลสมาชิก + ที่มาของข้อมูล (API Attribution) พร้อมลิงก์ |
| `/stats` | **หน้าพิเศษ (Extended Page)** | แดชบอร์ดสถิติผลกระทบของข่าวรายปี แยกตามระดับและสกุลเงิน |

## สถาปัตยกรรม State (ไม่ซ้ำซ้อน)
- **Zustand** (`src/store/useAppStore.ts`) — Client State เท่านั้น: `savedIds` (เฉพาะ **id** ของคอลเลกชัน) และ `theme`
  ใช้ `persist` middleware เก็บลง LocalStorage (`partialize` เก็บเฉพาะสองค่านี้) **ไม่เก็บข้อมูลเหตุการณ์จากเซิร์ฟเวอร์**
- **TanStack Query** (`src/api/queries.ts`, `src/hooks/useCalendar.ts`) — Server State ทั้งหมด: รายการ, รายละเอียด,
  คอลเลกชัน (ดึงจาก id ที่เก็บไว้ในครั้งเดียวด้วย `ids=`), สถิติ พร้อม cache และ `staleTime`
  (list 10 นาที, detail 1 ชม., meta ไม่หมดอายุ เพราะเป็นข้อมูลย้อนหลัง)
- ตัวกรองหน้ารายการเก็บใน URL (`useSearchParams`) จึงแชร์ลิงก์/กดย้อนกลับได้

## Routing
`createBrowserRouter` ใน `src/router.tsx` — Root Layout (`RootLayout`) + `<Outlet/>`, `<NavLink>` (เมนูบนจอใหญ่ / dock ล่างบนมือถือ),
`useParams` ที่ `/event/:id`, `ErrorBoundary` ระดับ router และหน้า 404 (`vercel.json` มี rewrite ให้ refresh ทุก route ได้)

## UI/UX
- ทุกจุดที่เรียก API มี **Skeleton** ระหว่างโหลด และ **Error State + ปุ่ม “ลองใหม่อีกครั้ง”** (`ErrorState`) รวมถึง Empty State
- Responsive (มือถือ/แท็บเล็ต/เดสก์ท็อป) ด้วย Tailwind + DaisyUI, มีโหมดสว่าง/มืด

## TypeScript
`strict: true`, ไม่ใช้ `any` — type ของ API อยู่ที่ `src/types/calendar.ts`, response ถูกตรวจด้วย type guard ใน `src/api/calendar.ts`,
Zustand store แยก `AppState` / `AppActions` ชัดเจน

## API  GET /api/calendar
| parameter | ความหมาย |
|---|---|
| `ids` | **(ใหม่)** ค้นด้วย id คั่นด้วยจุลภาค เช่น `2025-1324,2024-10` (สูงสุด 200) — คืนตามลำดับที่ขอ ไม่สนตัวกรองอื่น |
| `currency` | `USD,EUR` (คั่นด้วยจุลภาค) |
| `impact` | `high` `medium` `low` `holiday` `unknown` (คั่นด้วยจุลภาคได้) |
| `search` | ค้นหาชื่อเหตุการณ์ |
| `start`, `end` | `YYYY-MM-DD` หรือ ISO 8601 |
| `limit`, `offset` | แบ่งหน้า (ค่าเริ่มต้น 50, สูงสุด 500) |
| `order` | `asc` (ค่าเริ่มต้น) / `desc` |

ผลลัพธ์: `{ success, total, limit, offset, note, range:{min,max}, data:[{id,time,currency,impact,event,actual,forecast,previous,detail}] }`
`time` เป็น UTC (หน้าเว็บแปลงเป็นเวลาไทย UTC+7) · `id` = `<ปี>-<ลำดับในไฟล์ปี>` ตัวอย่างข้อมูล: `sample-data/events.sample.json`

## โครงสร้างโฟลเดอร์
```
api/            serverless function + ข้อมูลรายปี (api/_data)
sample-data/    ไฟล์ตัวอย่างข้อมูล .json
scripts/        build-data / test-api
screenshots/    ภาพหน้าจอทุกหน้า (ใส่ก่อนส่งงาน)
public/team/    รูปสมาชิก (แก้ที่ src/data/team.ts)
src/
  api/          fetch client + query options (TanStack Query)
  components/   RootLayout, EventCard, Skeletons, ErrorState, ...
  hooks/        useEvents / useEvent / useEventsByIds / useDatasetMeta
  pages/        Items, EventDetail, Collection, About, Stats, NotFound
  store/        Zustand store (persist)
  types/        TypeScript types ของ API
  lib/ data/    format helpers, queryClient, ข้อมูลทีม
```

## Deploy (Vercel)
`git add . && git commit -m "mini project 2" && git push` แล้วเชื่อม repo กับ Vercel (Framework: Vite)
ตรวจ: `https://<โดเมน>/api/calendar?limit=3` ต้องได้ JSON ที่มี `"success": true`
