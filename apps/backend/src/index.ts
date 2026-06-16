import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "exp://localhost:8081"],
    credentials: true,
  }),
);

// ─── Health Check ────────────────────────────────────
app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "0.1.0",
  });
});

// ─── Demo: App Info ──────────────────────────────────
app.get("/api/info", (c) => {
  return c.json({
    app: "Acte",
    version: "0.1.0",
    description: "Monorepo boilerplate — Web + Backend + Mobile",
    techStack: {
      web: "Next.js 16 + React 19 + Tailwind v4",
      backend: "Hono 4 + Bun",
      mobile: "Expo SDK 56 + Expo Router",
      monorepo: "Turborepo + Bun Workspaces",
    },
    timestamp: new Date().toISOString(),
  });
});

// ─── Demo: Message ───────────────────────────────────
app.get("/api/message", (c) => {
  return c.json({
    message: "Merhaba! Backend'den gelen cevap bu 🎉",
    note: "Bu mesaj Acte backend'inden geldi. Web ve Mobile ortak API'yi kullanıyor.",
    env: process.env.NODE_ENV || "development",
  });
});

// ─── Root ────────────────────────────────────────────
app.get("/", (c) => {
  return c.json({ message: "Acte API", version: "0.1.0" });
});

export default {
  port: process.env.PORT ? parseInt(process.env.PORT) : 4000,
  fetch: app.fetch,
};
