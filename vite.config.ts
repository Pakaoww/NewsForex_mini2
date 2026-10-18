import { defineConfig } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

interface ApiRequest {
  method?: string;
  query: Record<string, string>;
}
interface ApiResponse {
  status: (code: number) => ApiResponse;
  setHeader: (key: string, value: string) => void;
  json: (body: unknown) => void;
}
type ApiHandler = (req: ApiRequest, res: ApiResponse) => unknown;

// ให้ `npm run dev` เรียก /api/calendar ได้เลยโดยไม่ต้องใช้ Vercel CLI
// (บน Vercel จริง ไฟล์ api/calendar.js จะถูกรันเป็น serverless function เอง)
function devApi(): Plugin {
  return {
    name: "dev-api",
    configureServer(server) {
      server.middlewares.use("/api/calendar", async (req, res) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        const query = Object.fromEntries(url.searchParams);
        const shim: ApiResponse = {
          status(code) {
            res.statusCode = code;
            return shim;
          },
          setHeader: (key, value) => {
            res.setHeader(key, value);
          },
          json(body) {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(body));
          },
        };
        try {
          const mod = (await server.ssrLoadModule("/api/calendar.js")) as {
            default: ApiHandler;
          };
          mod.default({ method: req.method, query }, shim);
        } catch (err) {
          console.error(err);
          shim.status(500).json({ success: false, error: "Dev API error" });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devApi()],
});
