import { useCallback, useEffect, useState } from 'react';

// เก็บรายการที่บันทึกไว้ใน localStorage ของเบราว์เซอร์ (ไม่ใช้ฐานข้อมูล)
const KEY = 'newsflow.saved';
export const eventId = (e) => `${e.time}|${e.currency}|${e.event}`;

function read() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function useSaved() {
  const [saved, setSaved] = useState(read);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch { /* ใช้ต่อได้แม้เขียนไม่ได้ */ }
  }, [saved]);

  const toggle = useCallback((e) => {
    setSaved((list) => {
      const id = eventId(e);
      return list.some((x) => eventId(x) === id) ? list.filter((x) => eventId(x) !== id) : [...list, e];
    });
  }, []);

  return { saved, toggle, isSaved: (e) => saved.some((x) => eventId(x) === eventId(e)) };
}
