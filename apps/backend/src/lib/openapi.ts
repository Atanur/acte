// ─────────────────────────────────────────────────────────
// OpenAPI / Scalar API Documentation
// ─────────────────────────────────────────────────────────
// Configures OpenAPI doc and serves Scalar UI at /api/docs.
// ─────────────────────────────────────────────────────────

import { createRoute, type OpenAPIHono, z } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import type { Hono } from "hono";

// ─── App Metadata ─────────────────────────────────────

const APP_VERSION = "0.1.0";
const APP_NAME = "Acte API";
const APP_DESCRIPTION =
  "Acte monorepo backend — Hono 4 + Bun. Provides API services for web and mobile clients.";

// ─── OpenAPI Document ────────────────────────────────

export function configureOpenAPI(app: Hono): void {
  // Cast to OpenAPIHono to register the OpenAPI routes
  const openApiApp = app as unknown as OpenAPIHono;

  // ─── Register Scalar API Reference UI ─────────────

  openApiApp.get(
    "/api/docs",
    apiReference({
      spec: {
        url: "/api/openapi.json",
      },
      pageTitle: APP_NAME,
      theme: "purple",
      darkMode: true,
    }),
  );

  // ─── Serve OpenAPI JSON ──────────────────────────

  openApiApp.get("/api/openapi.json", (c) => {
    const doc = openApiApp.getOpenAPIDocument({
      openapi: "3.1.0",
      info: {
        title: APP_NAME,
        version: APP_VERSION,
        description: APP_DESCRIPTION,
      },
      servers: [
        {
          url: "http://localhost:4000",
          description: "Local development",
        },
      ],
    });
    return c.json(doc);
  });

  // ─── Document: GET /api/health ───────────────────

  openApiApp.openapi(
    createRoute({
      method: "get",
      path: "/api/health",
      tags: ["Health"],
      summary: "Health check summary",
      description:
        "Returns a summary of all health checks including database, Redis, and disk status.",
      responses: {
        200: {
          description: "Health check passed",
          content: {
            "application/json": {
              schema: z.object({
                status: z.enum(["healthy", "degraded", "unhealthy"]),
                version: z.string(),
                uptime: z.number(),
                timestamp: z.string(),
                checks: z.object({
                  database: z.object({
                    status: z.enum(["healthy", "degraded", "skipped", "unhealthy"]),
                    message: z.string(),
                    latencyMs: z.number().optional(),
                  }),
                  redis: z.object({
                    status: z.enum(["healthy", "degraded", "skipped", "unhealthy"]),
                    message: z.string(),
                    latencyMs: z.number().optional(),
                  }),
                  disk: z.object({
                    status: z.enum(["healthy", "degraded", "skipped", "unhealthy"]),
                    message: z.string(),
                    latencyMs: z.number().optional(),
                  }),
                }),
              }),
            },
          },
        },
        503: {
          description: "Health check failed (unhealthy)",
        },
      },
    }),
    async (c) => {
      const { runAllChecks, overallStatus } = await import("./checks");
      const report = await runAllChecks();
      const status = overallStatus(report);
      const httpStatus = status === "unhealthy" ? 503 : 200;

      return c.json(
        {
          status,
          version: APP_VERSION,
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
          checks: report,
        },
        httpStatus,
      );
    },
  );

  // ─── Document: GET /api/health/liveness ─────────

  openApiApp.openapi(
    createRoute({
      method: "get",
      path: "/api/health/liveness",
      tags: ["Health"],
      summary: "Liveness probe",
      description: "Simple alive check suitable for Kubernetes liveness probes.",
      responses: {
        200: {
          description: "Service is alive",
          content: {
            "application/json": {
              schema: z.object({
                status: z.literal("alive"),
                timestamp: z.string(),
              }),
            },
          },
        },
      },
    }),
    (c) => {
      return c.json({
        status: "alive" as const,
        timestamp: new Date().toISOString(),
      });
    },
  );

  // ─── Document: GET /api/health/readiness ────────

  openApiApp.openapi(
    createRoute({
      method: "get",
      path: "/api/health/readiness",
      tags: ["Health"],
      summary: "Readiness probe",
      description:
        "Deep health check including database, Redis, and disk — suitable for Kubernetes readiness probes.",
      responses: {
        200: {
          description: "Service is ready (healthy or degraded)",
        },
        503: {
          description: "Service not ready (unhealthy)",
        },
      },
    }),
    async (c) => {
      const { runAllChecks, overallStatus } = await import("./checks");
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
    },
  );

  // ─── Document: GET /api/info ────────────────────

  openApiApp.openapi(
    createRoute({
      method: "get",
      path: "/api/info",
      tags: ["Info"],
      summary: "Application information",
      description: "Returns metadata about the running application and its tech stack.",
      responses: {
        200: {
          description: "App info retrieved",
          content: {
            "application/json": {
              schema: z.object({
                app: z.string(),
                version: z.string(),
                description: z.string(),
                techStack: z.record(z.string()),
                timestamp: z.string(),
              }),
            },
          },
        },
      },
    }),
    (c) => {
      return c.json({
        app: "Acte",
        version: APP_VERSION,
        description: "Monorepo boilerplate — Web + Backend + Mobile",
        techStack: {
          web: "Next.js 16 + React 19 + Tailwind v4",
          backend: "Hono 4 + Bun + Drizzle + Better Auth",
          mobile: "Expo SDK 56 + Expo Router",
          monorepo: "Turborepo + Bun Workspaces",
        },
        timestamp: new Date().toISOString(),
      });
    },
  );

  // ─── Document: GET /api/message ─────────────────

  openApiApp.openapi(
    createRoute({
      method: "get",
      path: "/api/message",
      tags: ["Demo"],
      summary: "Demo message",
      description: "Returns a demo message from the backend.",
      responses: {
        200: {
          description: "Demo message retrieved",
          content: {
            "application/json": {
              schema: z.object({
                message: z.string(),
                note: z.string(),
                env: z.string(),
              }),
            },
          },
        },
      },
    }),
    (c) => {
      return c.json({
        message: "Merhaba! Backend'den gelen cevap bu 🎉",
        note: "Bu mesaj Acte backend'inden geldi. Web ve Mobile ortak API'yi kullanıyor.",
        env: process.env.NODE_ENV || "development",
      });
    },
  );

  // ─── Document: GET /api/metrics ─────────────────

  openApiApp.openapi(
    createRoute({
      method: "get",
      path: "/api/metrics",
      tags: ["Monitoring"],
      summary: "Prometheus metrics",
      description: "Returns application metrics in Prometheus text format.",
      responses: {
        200: {
          description: "Metrics in Prometheus format",
          content: {
            "text/plain": {
              schema: z.string(),
            },
          },
        },
      },
    }),
    async (c) => {
      // Use c.text() to get a proper TypedResponse for OpenAPI
      const { metrics } = await import("./metrics");
      c.res.headers.set("Content-Type", "text/plain; charset=utf-8");
      c.res.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
      return c.text(metrics.render());
    },
  );
}
