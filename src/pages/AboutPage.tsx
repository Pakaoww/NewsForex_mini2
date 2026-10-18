import { ExternalIcon } from "../components/Icons";
import { useDatasetMeta } from "../hooks/useCalendar";
import { dayLabel } from "../lib/format";
import { API_SOURCES, TEAM } from "../data/team";

const TECH_STACK: string[] = [
  "React 19",
  "Vite",
  "TypeScript",
  "React Router v7",
  "Zustand (persist)",
  "TanStack Query v5",
  "Tailwind CSS",
  "DaisyUI",
  "Vercel Serverless",
];

export default function AboutPage() {
  const meta = useDatasetMeta();
  const rangeText = meta.data
    ? `${dayLabel(meta.data.range.min)} – ${dayLabel(meta.data.range.max)}`
    : "";

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-medium text-primary">เกี่ยวกับเรา</p>
        <h1 className="font-heading text-3xl font-semibold">
          ผู้พัฒนา<span className="text-primary">โปรเจกต์</span>
        </h1>
        <p className="mt-1 text-base-content/70">
          NewsForex เป็นเว็บปฏิทินข่าวเศรษฐกิจ สร้างเป็นงาน Mini Project 2 ด้วย
          Modern Decoupled SPA โดยแยก Client State (Zustand) ออกจาก Server State
          (TanStack Query)
        </p>
      </section>

      <section aria-labelledby="team-title">
        <h2 id="team-title" className="mb-4 text-xl font-semibold">
          สมาชิกในกลุ่ม
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((m) => (
            <article
              key={m.studentId + m.fullName}
              className="card card-border bg-base-100"
            >
              <div className="card-body items-center gap-3 text-center">
                <div className="avatar">
                  <div className="w-28 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-base-100">
                    <img
                      src={m.photo}
                      alt={`รูปถ่ายของ ${m.fullName}`}
                      loading="lazy"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{m.fullName}</h3>
                  <p className="text-sm text-base-content/70">
                    ชื่อเล่น: {m.nickname}
                  </p>
                  <p className="font-mono text-sm">
                    รหัสนักศึกษา {m.studentId}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="api-title"
        className="card card-border bg-base-100"
      >
        <div className="card-body gap-4">
          <h2 id="api-title" className="card-title text-xl">
            ที่มาของข้อมูล (API Attribution)
          </h2>
          <p className="text-sm text-base-content/70">
            ข้อมูลเป็นชุดข้อมูลย้อนหลัง{rangeText ? ` (${rangeText})` : ""}{" "}
            ไม่ใช่ข่าวสด และไม่ควรใช้ตัดสินใจลงทุน เวลาแสดงเป็นเวลาไทย (UTC+7)
          </p>
          <ul className="space-y-3">
            {API_SOURCES.map((s) => (
              <li key={s.url} className="rounded-lg bg-base-200 p-3">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary inline-flex items-center gap-1 font-medium"
                >
                  {s.name}
                  <ExternalIcon width={14} height={14} />
                </a>
                <p className="mt-1 text-sm text-base-content/70">
                  {s.description}
                </p>
                <p className="mt-1 break-all font-mono text-xs text-base-content/50">
                  {s.url}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="tech-title">
        <h2 id="tech-title" className="mb-3 text-xl font-semibold">
          เทคโนโลยีที่ใช้
        </h2>
        <div className="flex flex-wrap gap-2">
          {TECH_STACK.map((t) => (
            <span key={t} className="badge badge-outline badge-lg">
              {t}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
