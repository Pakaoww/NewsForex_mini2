import { useEffect, useState } from 'react';

// เรียก /api/calendar (relative URL ใช้โดเมนเดียวกับเว็บ)
// คืนค่า { status, data, total, range, note, error }
// status: 'loading' | 'error' | 'empty' | 'success'
export function useCalendar(params = {}) {
  const [state, setState] = useState({ loading: true, data: [], total: 0, range: null, note: '', error: null });
  const key = JSON.stringify(params);

  useEffect(() => {
    const controller = new AbortController();
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(JSON.parse(key))) {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    }
    setState((s) => ({ ...s, loading: true, error: null }));

    fetch(`/api/calendar?${qs}`, { signal: controller.signal })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) throw new Error(json?.error || `HTTP ${res.status}`);
        setState({ loading: false, data: json.data, total: json.total, range: json.range, note: json.note, error: null });
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setState({ loading: false, data: [], total: 0, range: null, note: '', error: err.message });
      });

    return () => controller.abort();
  }, [key]);

  const status = state.error ? 'error' : state.loading && !state.data.length ? 'loading' : !state.data.length ? 'empty' : 'success';
  return { ...state, status };
}
