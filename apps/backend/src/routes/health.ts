// ─────────────────────────────────────────────────────────
// Health Check — Routes
// ─────────────────────────────────────────────────────────
// Provides liveness, readiness, and summary endpoints.
// ─────────────────────────────────────────────────────────

import { Hono } from "hono";
import { overallStatus, runAllChecks } from "../lib/checks";

const health = new Hono();

// ─── Package Info ──────────────────────────────────────
// Read version from package.json at startup
const pkg: { version: string } = (() => {
  try {
    return require("../../package.json");
  } catch {
    return { version: "0.0.0" };
  }
})();

// ─── GET /api/health/liveness — Simple alive check ────
health.get("/liveness", (c) => {
  return c.json({
    status: "alive",
    timestamp: new Date().toISOString(),
  });
});

// ─── GET /api/health/readiness — Deep check ───────────
health.get("/readiness", async (c) => {
  const report = await runAllChecks();
  const status = overallStatus(report);

  const httpStatus = status === "healthy" ? 200 : status === "degraded" ? 200 : 503;

  return c.json(
    {
      status,
      checks: report,
      timestamp: new Date().toISOString(),
    },
    httpStatus,
  );
});

// ─── GET /api/health — Summary ────────────────────────
health.get("/", async (c) => {
  const report = await runAllChecks();
  const status = overallStatus(report);

  const httpStatus = status === "unhealthy" ? 503 : 200;

  return c.json(
    {
      status,
      version: pkg.version,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks: report,
    },
    httpStatus,
  );
});

export default health;
