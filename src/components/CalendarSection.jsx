import { useEffect, useRef, useState } from 'react';
import { useCalendar } from '../hooks/useCalendar';
import { addDays, rangeParams, timeOf, dayLabel, dayKey, IMPACT_LABEL } from '../lib/format';
import { Search, Bookmark, BookmarkFilled, ChevronLeft, Chevron, Arrow } from './Icons';

const TABS = [
  { id: 'all', label: 'ทั้งหมด', impact: '' },
  { id: 'high', label: 'สูง', impact: 'high' },
  { id: 'medium', label: 'ปานกลาง', impact: 'medium' },
  { id: 'low', label: 'ต่ำ', impact: 'low' },
  { id: 'unknown', label: 'ไม่ระบุ', impact: 'holiday,unknown' },
];
const SPANS = [
  { days: 1, label: 'วัน' },
  { days: 7, label: 'สัปดาห์' },
  { days: 30, label: 'เดือน' },
];
const PAGE = 50;

export default function CalendarSection({ day, setDay, minDay, maxDay, isSaved, onToggleSave, onTotal, autoFocus, onSeeAll }) {
  const [tab, setTab] = useState('all');
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [span, setSpan] = useState(1);
  const [pages, setPages] = useState(1);
  const searchRef = useRef(null);

  // รอ 300 ms หลังพิมพ์ก่อนค่อยค้นหา
  useEffect(() => {
    const t = setTimeout(() => setQuery(text.trim()), 300);
    return () => clearTimeout(t);
  }, [text]);
  useEffect(() => { if (autoFocus) searchRef.current?.focus(); }, [autoFocus]);
  useEffect(() => { setPages(1); }, [tab, query, day, span]);

  const impact = TABS.find((t) => t.id === tab).impact;
  const ready = Boolean(day);
  const { status, data, total, error, loading } = useCalendar(
    ready ? { ...rangeParams(day, span), impact, search: query, limit: Math.min(500, PAGE * pages) } : { limit: 1 },
  );
  const list = ready ? data : [];

  useEffect(() => { if (ready && !loading) onTotal?.(total); }, [ready, loading, total, onTotal]);

  // จัดกลุ่มตามวัน (กรณีเลือกช่วงมากกว่า 1 วัน)
  const groups = [];
  for (const e of list) {
    const k = dayKey(e.time);
    const g = groups[groups.length - 1];
    if (g && g.key === k) g.items.push(e);
    else groups.push({ key: k, label: dayLabel(e.time), items: [e] });
  }

  const canMore = list.length < total && PAGE * pages < 500;
  const shownStatus = ready ? status : 'loading';

  return (
    <section className="cal" id="calendar">
      <div className="eyebrow"><i /> ปฏิทินข่าว</div>
      <div className="cal-head">
        <div>
          <h2>เหตุการณ์<em>เศรษฐกิจ</em></h2>
          <p className="muted">กรองตามระดับความสำคัญ หรือค้นหาชื่อเหตุการณ์</p>
        </div>
        {onSeeAll && (
          <button className="link-btn" onClick={onSeeAll}>ดูทั้งหมด <Arrow width={16} height={16} /></button>
        )}
      </div>

      <div className="searchbar">
        <Search />
        <input
          ref={searchRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="ค้นหาชื่อเหตุการณ์ เช่น CPI, NFP, Rate…"
          aria-label="ค้นหาเหตุการณ์"
        />
      </div>

      <div className="toolbar">
        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} className={`tab${tab === t.id ? ' on' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="datebar">
          <button className="icon-btn" aria-label="วันก่อนหน้า" disabled={!ready || addDays(day, -span) < minDay} onClick={() => setDay(addDays(day, -span))}><ChevronLeft width={16} height={16} /></button>
          <input
            type="date"
            value={day || ''}
            min={minDay}
            max={maxDay}
            disabled={!ready}
            onChange={(e) => e.target.value && setDay(e.target.value)}
            aria-label="เลือกวันที่สิ้นสุดของช่วง"
          />
          <button className="icon-btn" aria-label="วันถัดไป" disabled={!ready || day >= maxDay} onClick={() => setDay(addDays(day, span) > maxDay ? maxDay : addDays(day, span))}><Chevron width={16} height={16} /></button>
          <select value={span} onChange={(e) => setSpan(Number(e.target.value))} aria-label="ช่วงเวลา">
            {SPANS.map((s) => <option key={s.days} value={s.days}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="meta-row">
        <span>พบ {ready ? total : 0} รายการ</span>
        <span>Forex Factory (ย้อนหลัง) · {ready ? dayLabel(`${day}T12:00:00+07:00`) : '…'}{span > 1 ? ` · ย้อนหลัง ${span} วัน` : ''}</span>
      </div>

      {shownStatus === 'loading' && <div className="state"><div className="spinner" /> กำลังโหลดเหตุการณ์…</div>}
      {shownStatus === 'error' && (
        <div className="state error">
          <strong>โหลดข้อมูลไม่สำเร็จ</strong>
          <span>{error}</span>
        </div>
      )}
      {shownStatus === 'empty' && (
        <div className="state empty">
          <span className="empty-icon"><Calendar2 /></span>
          <strong>ไม่มีเหตุการณ์เศรษฐกิจในช่วงนี้</strong>
          <span className="muted">ลองเปลี่ยนวันที่ ระดับความสำคัญ หรือคำค้นหา</span>
        </div>
      )}

      {shownStatus === 'success' && (
        <div className={`events${loading ? ' dim' : ''}`}>
          {groups.map((g) => (
            <div key={g.key}>
              {span > 1 && <div className="day-sep">{g.label}</div>}
              {g.items.map((e, i) => (
                <EventRow key={`${e.time}-${e.currency}-${e.event}-${i}`} e={e} saved={isSaved(e)} onToggle={() => onToggleSave(e)} />
              ))}
            </div>
          ))}
          {canMore && (
            <button className="more" disabled={loading} onClick={() => setPages((p) => p + 1)}>
              โหลดเพิ่ม ({list.length}/{total})
            </button>
          )}
          {!canMore && list.length < total && <p className="muted center">แสดง {list.length} จาก {total} รายการ — ลองกรองให้แคบลง</p>}
        </div>
      )}
    </section>
  );
}

export function EventRow({ e, saved, onToggle }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="event-wrap">
      <div className="event">
        <div className="ev-time">{timeOf(e.time)}</div>
        <div className="ev-cur">{e.currency || '—'}</div>
        <span className={`badge ${e.impact}`}>{IMPACT_LABEL[e.impact] || e.impact}</span>
        <div className="ev-name">
          {e.event || '—'}
          {e.detail && (
            <button className={`detail-toggle${open ? ' on' : ''}`} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
              รายละเอียด
            </button>
          )}
        </div>
        <dl className="ev-nums">
          <div><dt>จริง</dt><dd>{e.actual ?? '–'}</dd></div>
          <div><dt>คาดการณ์</dt><dd>{e.forecast ?? '–'}</dd></div>
          <div><dt>ก่อนหน้า</dt><dd>{e.previous ?? '–'}</dd></div>
        </dl>
        <button className={`save${saved ? ' on' : ''}`} onClick={onToggle} aria-pressed={saved} aria-label={saved ? 'ลบออกจากที่บันทึก' : 'บันทึกรายการ'}>
          {saved ? <BookmarkFilled /> : <Bookmark />}
        </button>
      </div>
      {open && e.detail && <div className="detail">{e.detail}</div>}
    </article>
  );
}

function Calendar2() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}
