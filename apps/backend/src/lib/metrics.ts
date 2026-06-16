// ─────────────────────────────────────────────────────────
// Metrics — Prometheus-compatible endpoint
// ─────────────────────────────────────────────────────────
// In-memory counters exposed as Prometheus text format.
// ─────────────────────────────────────────────────────────

import type { MiddlewareHandler } from "hono";

// ─── Types ─────────────────────────────────────────────

interface RouteCounter {
  total: number;
  errors: number;
}

// ─── Metrics Store ────────────────────────────────────

class MetricsStore {
  private requestCount = 0;
  private activeRequests = 0;
  private totalErrors = 0;
  private routes = new Map<string, RouteCounter>();
  private startTime = Date.now();

  /** Increment the global request counter and per-route counter. */
  incrementRequest(method: string, path: string): void {
    this.requestCount++;
    const key = `${method}:${path}`;
    const route = this.routes.get(key) ?? { total: 0, errors: 0 };
    route.total++;
    this.routes.set(key, route);
  }

  /** Track concurrent requests. */
  incrementActive(): void {
    this.activeRequests++;
  }

  decrementActive(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
  }

  /** Record an error. */
  incrementErrors(method?: string, path?: string): void {
    this.totalErrors++;
    if (method && path) {
      const key = `${method}:${path}`;
      const route = this.routes.get(key) ?? { total: 0, errors: 0 };
      route.errors++;
      this.routes.set(key, route);
    }
  }

  /** Render all metrics in Prometheus text format. */
  render(): string {
    const lines: string[] = [];

    // Help and type metadata
    lines.push("# HELP http_requests_total Total number of HTTP requests");
    lines.push("# TYPE http_requests_total counter");
    lines.push(`http_requests_total ${this.requestCount}`);

    lines.push("");
    lines.push("# HELP http_requests_active Number of active requests");
    lines.push("# TYPE http_requests_active gauge");
    lines.push(`http_requests_active ${this.activeRequests}`);

    lines.push("");
    lines.push("# HELP http_errors_total Total number of HTTP errors");
    lines.push("# TYPE http_errors_total counter");
    lines.push(`http_errors_total ${this.totalErrors}`);

    lines.push("");
    lines.push("# HELP http_request_duration_seconds Request duration in seconds");
    lines.push("# TYPE http_request_duration_seconds histogram");
    lines.push("# HELP http_uptime_seconds Application uptime in seconds");
    lines.push("# TYPE http_uptime_seconds gauge");
    lines.push(`http_uptime_seconds ${Math.floor((Date.now() - this.startTime) / 1000)}`);

    // Per-route metrics
    this.routes.forEach((counter, key) => {
      const [method, path] = key.split(":");
      const labels = `method="${method}",path="${path}"`;

      lines.push("");
      lines.push(`# HELP http_requests_total Request count for ${method} ${path}`);
      lines.push(`# TYPE http_requests_total counter`);
      lines.push(`http_requests_total{${labels}} ${counter.total}`);

      if (counter.errors > 0) {
        lines.push(`http_errors_total{${labels}} ${counter.errors}`);
      }
    });

    lines.push("");
    return lines.join("\n");
  }
}

// ─── Singleton ────────────────────────────────────────

export const metrics = new MetricsStore();

// ─── Middleware: Track requests ───────────────────────

/**
 * Middleware that tracks request metrics (count, active, errors).
 * Must be registered early in the middleware chain.
 */
export function metricsMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    metrics.incrementActive();
    metrics.incrementRequest(c.req.method, c.req.path);

    try {
      await next();
    } catch (err) {
      metrics.incrementErrors(c.req.method, c.req.path);
      throw err; // Re-throw for error handlers
    } finally {
      metrics.decrementActive();
    }
  };
}

// ─── Metrics Endpoint ─────────────────────────────────

/**
 * Handler for GET /api/metrics — returns Prometheus-formatted text.
 */
export function metricsHandler(c: Parameters<MiddlewareHandler>[0]): Response | Promise<Response> {
  c.res.headers.set("Content-Type", "text/plain; charset=utf-8");
  c.res.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  return c.body(metrics.render());
}
