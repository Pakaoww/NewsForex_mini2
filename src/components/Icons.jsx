const base = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
const I = (children) => (props) => <svg {...base} {...props}>{children}</svg>;

export const Home = I(<><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>);
export const Search = I(<><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>);
export const Bookmark = I(<path d="M6 3h12v18l-6-4-6 4z" />);
export const BookmarkFilled = (props) => <svg {...base} fill="currentColor" {...props}><path d="M6 3h12v18l-6-4-6 4z" /></svg>;
export const Info = I(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></>);
export const Calendar = I(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>);
export const Globe = I(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>);
export const Arrow = I(<><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></>);
export const Radio = I(<><circle cx="12" cy="12" r="2" /><path d="M7.8 7.8a6 6 0 000 8.4M16.2 7.8a6 6 0 010 8.4M4.9 4.9a10 10 0 000 14.2M19.1 4.9a10 10 0 010 14.2" /></>);
export const Chevron = I(<path d="M9 6l6 6-6 6" />);
export const ChevronLeft = I(<path d="M15 6l-6 6 6 6" />);
export const News = I(<><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>);
