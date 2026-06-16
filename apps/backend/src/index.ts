import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { auth } from "./lib/auth";
import { metricsHandler, metricsMiddleware } from "./lib/metrics";
import { configureOpenAPI } from "./lib/openapi";
import { rateLimiter } from "./middleware/rate-limit";
import healthRoutes from "./routes/health";

const app = new OpenAPIHono();

// ─── ALLOWED ORIGINS ─────────────────────────────────
const ALLOWED_ORIGINS = ["http://localhost:3000", "http://localhost:4000", "exp://localhost:8081"];

// ─── Middleware ──────────────────────────────────────
app.use("*", logger());
app.use("*", metricsMiddleware());

// ─── Secure Headers (with CSP) ──────────────────────
app.use(
  "*",
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"], // for Scalar UI
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https://cdn.jsdelivr.net"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net", ...ALLOWED_ORIGINS],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
    strictTransportSecurity: "max-age=31536000; includeSubDomains; preload",
    xContentTypeOptions: "nosniff",
    referrerPolicy: "strict-origin-when-cross-origin",
    xFrameOptions: "DENY",
    xXssProtection: "0", // Deprecated but still served by some clients
  }),
);

// ─── CORS ────────────────────────────────────────────
app.use(
  "*",
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  }),
);

// ─── Rate Limiting ───────────────────────────────────
app.use(
  "/api/*",
  rateLimiter({
    max: 100,
    windowMs: 60_000, // 1 minute
  }),
);

// ─── Auth Routes ─────────────────────────────────────
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

// ─── Health Routes ───────────────────────────────────
app.route("/api/health", healthRoutes);

// ─── Demo: App Info ──────────────────────────────────
app.get("/api/info", (c) => {
  return c.json({
    app: "Acte",
    version: "0.1.0",
    description: "Monorepo boilerplate — Web + Backend + Mobile",
    techStack: {
      web: "Next.js 16 + React 19 + Tailwind v4",
      backend: "Hono 4 + Bun + Drizzle + Better Auth",
      mobile: "Expo SDK 56 + Expo Router",
      monorepo: "Turborepo + Bun Workspaces",
    },
    timestamp: new Date().toISOString(),
  });
});

// ─── Demo: Message ──────────────────────────────────
app.get("/api/message", (c) => {
  return c.json({
    message: "Merhaba! Backend'den gelen cevap bu 🎉",
    note: "Bu mesaj Acte backend'inden geldi. Web ve Mobile ortak API'yi kullanıyor.",
    env: process.env.NODE_ENV || "development",
  });
});

// ─── Metrics Endpoint ───────────────────────────────
app.get("/api/metrics", (c) => metricsHandler(c));

// ─── OpenAPI Documentation ──────────────────────────
configureOpenAPI(app);

// ─── Root ───────────────────────────────────────────
app.get("/", (c) => {
  return c.json({ message: "Acte API", version: "0.1.0" });
});

// ─── 404 Handler ────────────────────────────────────
app.notFound((c) => {
  return c.json(
    {
      status: "error",
      error: "NOT_FOUND",
      message: `Route not found: ${c.req.method} ${c.req.path}`,
      timestamp: new Date().toISOString(),
    },
    404,
  );
});

export default {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  fetch: app.fetch,
};
