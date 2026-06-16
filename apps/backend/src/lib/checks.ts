// ─────────────────────────────────────────────────────────
// Health Checks
// ─────────────────────────────────────────────────────────
// Verifiable checks for liveness / readiness probes.
// ─────────────────────────────────────────────────────────

import { promises as fs } from "node:fs";

// ─── Types ─────────────────────────────────────────────

export interface CheckResult {
  status: "healthy" | "degraded" | "skipped" | "unhealthy";
  message: string;
  latencyMs?: number;
}

export interface CheckReport {
  database: CheckResult;
  redis: CheckResult;
  disk: CheckResult;
}

// ─── Configuration ─────────────────────────────────────

const DISK_THRESHOLD_WARN = 0.9; // 90% used -> degraded
const DISK_THRESHOLD_CRIT = 0.95; // 95% used -> unhealthy

// ─── Database Check ────────────────────────────────────

/**
 * Check database connectivity by running a simple query.
 * Skips if DATABASE_URL is not configured.
 */
export async function checkDatabase(): Promise<CheckResult> {
  const start = performance.now();

  if (!process.env.DATABASE_URL) {
    return {
      status: "skipped",
      message: "DATABASE_URL not configured",
      latencyMs: 0,
    };
  }

  try {
    // Try to query the database using Drizzle if available, or a raw fetch
    // We use a simple HTTP check via the database URL to verify connectivity
    // Since the exact DB library may vary, we import it dynamically
    const { db } = await import("db");
    await db.execute?.(sql`SELECT 1`);
    const latencyMs = Math.round(performance.now() - start);
    return {
      status: "healthy",
      message: "Database reachable",
      latencyMs,
    };
  } catch {
    // Fallback: try a raw TCP connection as a basic connectivity check
    try {
      const url = new URL(process.env.DATABASE_URL);
      const host = url.hostname;
      const port = Number(url.port) || 5432;

      // Simple socket check
      const { connect } = await import("node:net");
      await new Promise<void>((resolve, reject) => {
        const socket = connect(port, host, () => {
          socket.end();
          resolve();
        });
        socket.on("error", reject);
        socket.setTimeout(5_000, () => {
          socket.destroy();
          reject(new Error("Connection timeout"));
        });
      });

      const latencyMs = Math.round(performance.now() - start);
      return {
        status: "degraded",
        message: "Database port open but query failed — may need migration",
        latencyMs,
      };
    } catch (err) {
      const latencyMs = Math.round(performance.now() - start);
      return {
        status: "unhealthy",
        message: `Database unreachable: ${err instanceof Error ? err.message : "unknown error"}`,
        latencyMs,
      };
    }
  }
}

// Helper for tagged template SQL
const sql = String.raw;

// ─── Redis Check ───────────────────────────────────────

/**
 * Check Redis connectivity. Skips if REDIS_URL is not configured.
 */
export async function checkRedis(): Promise<CheckResult> {
  if (!process.env.REDIS_URL) {
    return {
      status: "skipped",
      message: "REDIS_URL not configured",
      latencyMs: 0,
    };
  }

  const start = performance.now();

  try {
    const url = new URL(process.env.REDIS_URL);
    const host = url.hostname;
    const port = Number(url.port) || 6379;

    // Simple TCP socket check
    const { connect } = await import("node:net");
    await new Promise<void>((resolve, reject) => {
      const socket = connect(port, host, () => {
        socket.end();
        resolve();
      });
      socket.on("error", reject);
      socket.setTimeout(3_000, () => {
        socket.destroy();
        reject(new Error("Connection timeout"));
      });
    });

    const latencyMs = Math.round(performance.now() - start);
    return {
      status: "healthy",
      message: "Redis reachable",
      latencyMs,
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      status: "unhealthy",
      message: `Redis unreachable: ${err instanceof Error ? err.message : "unknown error"}`,
      latencyMs,
    };
  }
}

// ─── Disk Check ────────────────────────────────────────

/**
 * Check available disk space on the volume hosting the app.
 */
export async function checkDisk(): Promise<CheckResult> {
  const start = performance.now();

  try {
    // Use fs.statfs if available (Node 18+), fallback to a basic stat
    const stats = await fs.statfs("/");
    const total = stats.blocks * stats.bsize;
    const free = stats.bfree * stats.bsize;
    const used = total - free;
    const usageRatio = total > 0 ? used / total : 0;

    const latencyMs = Math.round(performance.now() - start);

    if (usageRatio >= DISK_THRESHOLD_CRIT) {
      return {
        status: "unhealthy",
        message: `Disk usage critical: ${(usageRatio * 100).toFixed(1)}%`,
        latencyMs,
      };
    }

    if (usageRatio >= DISK_THRESHOLD_WARN) {
      return {
        status: "degraded",
        message: `Disk usage high: ${(usageRatio * 100).toFixed(1)}%`,
        latencyMs,
      };
    }

    return {
      status: "healthy",
      message: `Disk usage: ${(usageRatio * 100).toFixed(1)}%`,
      latencyMs,
    };
  } catch {
    // statfs may not be available in all runtimes
    const latencyMs = Math.round(performance.now() - start);
    return {
      status: "skipped",
      message: "Disk check not available on this platform",
      latencyMs,
    };
  }
}

// ─── Aggregate Check ───────────────────────────────────

/**
 * Run all health checks in parallel and return a summary.
 */
export async function runAllChecks(): Promise<CheckReport> {
  const [database, redis, disk] = await Promise.all([checkDatabase(), checkRedis(), checkDisk()]);

  return { database, redis, disk };
}

/**
 * Determine overall readiness status from a check report.
 */
export function overallStatus(report: CheckReport): "healthy" | "degraded" | "unhealthy" {
  const statuses = [report.database.status, report.redis.status, report.disk.status];

  if (statuses.includes("unhealthy")) return "unhealthy";
  if (statuses.includes("degraded")) return "degraded";
  return "healthy";
}
