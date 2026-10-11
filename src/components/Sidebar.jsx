import { Home, Search, Bookmark, Info, News } from './Icons';

const ITEMS = [
  { id: 'home', label: 'หน้าหลัก', Icon: Home },
  { id: 'search', label: 'ค้นหาข่าว', Icon: Search },
  { id: 'saved', label: 'ข่าวที่บันทึก', Icon: Bookmark },
  { id: 'about', label: 'เกี่ยวกับเรา', Icon: Info },
];

export default function Sidebar({ view, onNavigate, rangeText }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark"><News width={22} height={22} /></span>
        <div>
          <div className="brand-name">NewsForex<span>.</span></div>
          <div className="brand-sub">ปฏิทินข่าวรายวัน</div>
        </div>
      </div>

      <nav className="nav" aria-label="เมนูหลัก">
        <div className="nav-title">เมนู</div>
        {ITEMS.map(({ id, label, Icon }) => (
          <button key={id} className={`nav-item${view === id ? ' active' : ''}`} onClick={() => onNavigate(id)}>
            <Icon /> {label}
          </button>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="source-card">
          <span className="dot" />
          <div>
            <strong>Forex Factory Calendar</strong>
            <small>ชุดข้อมูลย้อนหลัง</small>
          </div>
        </div>
        <div className="source-note">
          <span className="dot" />
          <div>
            <span>ไม่ใช่ข่าวสด</span>
            <small>{rangeText || 'กำลังโหลดช่วงข้อมูล…'}</small>
          </div>
        </div>
      </div>
    </aside>
  );
}
