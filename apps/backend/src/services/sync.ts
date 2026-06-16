// ─────────────────────────────────────────────────────────
// Sync API — Backend endpoint structure for offline sync
// ─────────────────────────────────────────────────────────
// Provides a sync endpoint (`POST /api/sync`) that accepts
// a `lastSyncedAt` timestamp and returns all changes since
// that time. Uses last-writer-wins conflict resolution.
// ─────────────────────────────────────────────────────────

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// ─── Types ────────────────────────────────────────────

/** A single change record returned by the sync endpoint. */
export interface SyncChange {
  /** Table or entity name, e.g. "users", "posts" */
  table: string;
  /** Unique identifier of the changed record */
  id: string;
  /** Operation type */
  operation: "create" | "update" | "delete";
  /** The full record data (for create/update) */
  data: Record<string, unknown> | null;
  /** ISO timestamp of the change */
  changedAt: string;
  /** ID of the user/actor who made the change */
  changedBy?: string;
}

/** Payload returned by the sync endpoint. */
export interface SyncResponse {
  changes: SyncChange[];
  /** Timestamp the client should use for the next sync request */
  serverTimestamp: string;
  /** Whether there may be more changes to paginate through */
  hasMore: boolean;
}

// ─── Request Schema ───────────────────────────────────

const syncRequestSchema = z.object({
  lastSyncedAt: z
    .string()
    .datetime()
    .optional()
    .default(() => new Date(0).toISOString()),
  /** Optional: limit the response to specific entity types */
  tables: z.array(z.string()).optional(),
  /** Optional: pagination cursor */
  cursor: z.string().optional(),
  /** Maximum number of changes to return per page */
  limit: z.coerce.number().min(1).max(1000).default(100),
});

// ─── Sync Router ──────────────────────────────────────

const syncRouter = new Hono();

/**
 * POST /api/sync
 *
 * Returns all changes that occurred after `lastSyncedAt`.
 *
 * Conflict resolution strategy: **last-writer-wins**.
 * The mobile client should always trust the server's version
 * and overwrite its local data with the values returned here.
 * Any local changes not yet synced should be sent separately
 * via the normal API, then the sync endpoint will pick them up
 * on the next poll.
 */
syncRouter.post("/", zValidator("json", syncRequestSchema), async (c) => {
  const { lastSyncedAt: _lastSyncedAt, tables: _tables, cursor: _cursor, limit: _limit } = c.req.valid("json");

  // ── Placeholder: Replace with actual DB queries ─────
  // In production, query your database for rows whose
  // `updated_at` > `lastSyncedAt`. Optionally filter by
  // `tables` if provided.
  //
  // Example Drizzle query:
  //   const changes = await db
  //     .select()
  //     .from(changesTable)
  //     .where(
  //       and(
  //         gte(changesTable.changedAt, lastSyncedAt),
  //         tables ? inArray(changesTable.table, tables) : undefined,
  //       ),
  //     )
  //     .limit(limit)
  //     .offset(cursor ? parseInt(cursor) : 0)
  //     .orderBy(changesTable.changedAt);

  const changes: SyncChange[] = [];

  const serverTimestamp = new Date().toISOString();

  return c.json<SyncResponse>({
    changes,
    serverTimestamp,
    hasMore: false,
  });
});

export { syncRouter };
export type SyncRequest = z.infer<typeof syncRequestSchema>;
