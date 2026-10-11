import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ให้ `npm run dev` เรียก /api/calendar ได้เลยโดยไม่ต้องใช้ Vercel CLI
// (บน Vercel จริง ไฟล์ api/calendar.js จะถูกรันเป็น serverless function เอง)
function devApi() {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use('/api/calendar', async (req, res) => {
        const url = new URL(req.url, 'http://localhost');
        const query = Object.fromEntries(url.searchParams);
        const shim = {
          status(code) { res.statusCode = code; return shim; },
          setHeader: (k, v) => res.setHeader(k, v),
          json(body) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(body));
          },
        };
        try {
          const { default: handler } = await server.ssrLoadModule('/api/calendar.js');
          handler({ method: req.method, query }, shim);
        } catch (err) {
          console.error(err);
          shim.status(500).json({ success: false, error: 'Dev API error' });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), devApi()],
});
