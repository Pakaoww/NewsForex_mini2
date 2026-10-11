import { useCallback, useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import CalendarSection, { EventRow } from './components/CalendarSection';
import { useCalendar } from './hooks/useCalendar';
import { useSaved } from './lib/saved';
import { dayKey, dayLabel } from './lib/format';
import { Arrow, Bookmark, Calendar, Globe, Radio } from './components/Icons';

const CRUMB = { home: 'ปฏิทินข่าว', search: 'ค้นหาข่าว', saved: 'ข่าวที่บันทึก', about: 'เกี่ยวกับเรา' };

export default function App() {
  const [view, setView] = useState('home');
  const [day, setDay] = useState(null);
  const [total, setTotal] = useState(0);
  const { saved, toggle, isSaved } = useSaved();

  // ถามช่วงเวลาของชุดข้อมูลจาก API 1 ครั้ง (ไม่ได้ hardcode วันที่ไว้ในเว็บ)
  const meta = useCalendar({ limit: 1 });
  const minDay = meta.range ? dayKey(meta.range.min) : undefined;
  const maxDay = meta.range ? dayKey(meta.range.max) : undefined;
  useEffect(() => { if (maxDay && !day) setDay(maxDay); }, [maxDay, day]);

  const rangeText = meta.range ? `${dayLabel(meta.range.min)} – ${dayLabel(meta.range.max)}` : '';
  const onTotal = useCallback((n) => setTotal(n), []);
  const go = (v) => { setView(v); window.scrollTo({ top: 0 }); };

  return (
    <div className="shell">
      <Sidebar view={view} onNavigate={go} rangeText={rangeText} />

      <div className="main">
        <header className="topbar">
          <div className="crumbs"><span>NEWSFOREX</span><i>/</i><strong>{CRUMB[view]}</strong></div>
          <div className="top-right"><span className="live"><Radio width={14} height={14} /> ข่าวเศรษฐกิจ</span><span className="avatar">NF</span></div>
        </header>

        <main className="content">
          <div className="notice" role="note">
            ข้อมูลเป็นชุดข้อมูลย้อนหลัง{rangeText ? ` (${rangeText})` : ''} ไม่ใช่ข่าวสด และไม่มีเหตุการณ์ของปี 2026
          </div>

          {view === 'home' && (
            <>
              <section className="hero">
                <div className="eyebrow"><i /> ปฏิทินข่าวเศรษฐกิจ</div>
                <h1>ติดตามข่าว<br /><em>ตลาดการเงิน</em></h1>
                <p>ดูเหตุการณ์เศรษฐกิจที่อาจมีผลต่อตลาด<br />ค้นหาตามชื่อเหตุการณ์และสกุลเงิน</p>
                <div className="hero-actions">
                  <button className="btn-primary" onClick={() => document.getElementById('calendar')?.scrollIntoView({ behavior: 'smooth' })}>
                    ดูปฏิทินข่าว <Arrow width={16} height={16} />
                  </button>
                  <button className="btn-ghost" onClick={() => go('saved')}>รายการที่บันทึก <Bookmark width={16} height={16} /></button>
                </div>
                <div className="hero-crumb">ปฏิทิน <i>/</i> {day ? dayLabel(`${day}T12:00:00+07:00`) : '…'}</div>
              </section>

              <div className="stats">
                <div className="stat"><span className="stat-ic"><Calendar /></span><div><b>{total}</b><small>เหตุการณ์ในช่วงที่เลือก</small></div></div>
                <div className="stat"><span className="stat-ic"><Globe /></span><div><b>Forex</b><small>ข่าวเศรษฐกิจ</small></div></div>
                <div className="stat"><span className="stat-ic"><Bookmark /></span><div><b>{saved.length}</b><small>รายการที่บันทึก</small></div></div>
                <div className="stat last"><small>สถานะข้อมูล</small><b className="sm">ชุดข้อมูลย้อนหลัง · ถึง {meta.range ? dayLabel(meta.range.max) : '…'}</b></div>
              </div>
            </>
          )}

          {(view === 'home' || view === 'search') && (
            <CalendarSection
              day={day} setDay={setDay} minDay={minDay} maxDay={maxDay}
              isSaved={isSaved} onToggleSave={toggle} onTotal={onTotal}
              autoFocus={view === 'search'}
              onSeeAll={view === 'home' ? () => go('search') : undefined}
            />
          )}

          {meta.status === 'error' && <div className="state error"><strong>เชื่อมต่อ API ไม่ได้</strong><span>{meta.error}</span></div>}

          {view === 'saved' && (
            <section className="cal">
              <div className="eyebrow"><i /> ข่าวที่บันทึก</div>
              <h2>รายการ<em>ที่บันทึก</em></h2>
              {saved.length === 0 ? (
                <div className="state empty">
                  <strong>ยังไม่มีรายการที่บันทึก</strong>
                  <span className="muted">กดไอคอนบุ๊กมาร์กที่เหตุการณ์ในปฏิทินเพื่อเก็บไว้ที่นี่ (เก็บในเบราว์เซอร์ของคุณ)</span>
                </div>
              ) : (
                <div className="events">
                  {saved.map((e) => <EventRow key={`${e.time}|${e.currency}|${e.event}`} e={e} saved onToggle={() => toggle(e)} />)}
                </div>
              )}
            </section>
          )}

          {view === 'about' && (
            <section className="cal about">
              <div className="eyebrow"><i /> เกี่ยวกับเรา</div>
              <h2>เกี่ยวกับ<em>โปรเจกต์</em></h2>
              <p>NewsForex เป็นเว็บปฏิทินข่าวเศรษฐกิจสำหรับงานมหาวิทยาลัย สร้างด้วย React + Vite และ Vercel Serverless Function ไม่ใช้ฐานข้อมูลภายนอก</p>
              <p>ข้อมูลมาจากชุดข้อมูล <code>Ehsanrs2/Forex_Factory_Calendar</code> บน Hugging Face ซึ่งเป็นข้อมูลย้อนหลัง {rangeText && `(${rangeText})`} จึงไม่ใช่ข่าวสด และไม่ควรใช้ตัดสินใจลงทุน เวลาแสดงเป็นเวลาไทย (UTC+7)</p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
