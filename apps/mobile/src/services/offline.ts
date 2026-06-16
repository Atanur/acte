// ─────────────────────────────────────────────────────────
// Offline-first — API Call Queue with AsyncStorage + NetInfo
// ─────────────────────────────────────────────────────────
// Queues API calls when the device is offline and replays
// them in FIFO order once connectivity is restored.
// Uses NetInfo for connectivity detection and AsyncStorage
// for persistent queue storage.
// ─────────────────────────────────────────────────────────

import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";

// ─── Types ────────────────────────────────────────────

export interface QueuedRequest {
  /** Unique ID for deduplication and tracking */
  id: string;
  /** HTTP method */
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Full URL (or path relative to API base) */
  url: string;
  /** Optional request body (JSON-serializable) */
  body?: unknown;
  /** Custom headers for this request */
  headers?: Record<string, string>;
  /** Timestamp when the request was queued */
  queuedAt: string;
  /** Number of times replay has been attempted */
  retryCount: number;
}

type OfflineCallback = () => void;

// ─── Constants ───────────────────────────────────────

const STORAGE_KEY = "@acte/offline-queue";
const MAX_RETRIES = 5;

// ─── Queue State ─────────────────────────────────────

let isProcessing = false;
let isOnline = true;
let unsubscribe: (() => void) | null = null;
let onReplayCallbacks: OfflineCallback[] = [];

// ─── NetInfo Subscription ────────────────────────────

/**
 * Start listening to network connectivity changes.
 * Automatically replays the queue when the device comes back online.
 * Call once at app startup.
 */
export function startOfflineListening(): void {
  // Register the NetInfo listener
  unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    const wasOffline = !isOnline;
    isOnline = state.isConnected ?? false;

    if (wasOffline && isOnline) {
      console.log("[Offline] Network restored — replaying queued requests");
      replayQueue();
    }
  });
}

/**
 * Stop listening to network changes and clean up.
 * Call on app unmount or when the feature is disabled.
 */
export function stopOfflineListening(): void {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}

// ─── Queue Operations ────────────────────────────────

/**
 * Read the current queue from AsyncStorage.
 */
async function getQueue(): Promise<QueuedRequest[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QueuedRequest[]) : [];
  } catch (error) {
    console.error("[Offline] Failed to read queue from storage:", error);
    return [];
  }
}

/**
 * Persist the queue to AsyncStorage.
 */
async function saveQueue(queue: QueuedRequest[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("[Offline] Failed to save queue to storage:", error);
  }
}

/**
 * Enqueue a failed request for later replay.
 * Returns the generated request ID.
 */
export async function enqueueRequest(
  method: QueuedRequest["method"],
  url: string,
  body?: unknown,
  headers?: Record<string, string>,
): Promise<string> {
  const request: QueuedRequest = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    method,
    url,
    body,
    headers,
    queuedAt: new Date().toISOString(),
    retryCount: 0,
  };

  const queue = await getQueue();
  queue.push(request);
  await saveQueue(queue);

  console.log(`[Offline] Request queued: ${method} ${url} (id=${request.id})`);
  return request.id;
}

/**
 * Remove a request from the queue by its ID (e.g., after success).
 */
export async function dequeueRequest(id: string): Promise<void> {
  const queue = await getQueue();
  const filtered = queue.filter((req) => req.id !== id);
  if (filtered.length !== queue.length) {
    await saveQueue(filtered);
  }
}

/**
 * Get the current number of queued requests.
 */
export async function getQueueLength(): Promise<number> {
  const queue = await getQueue();
  return queue.length;
}

/**
 * Clear all queued requests.
 */
export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
  console.log("[Offline] Queue cleared");
}

// ─── Replay Logic ───────────────────────────────────

/**
 * Replay all queued requests in FIFO order.
 * Failed requests are retried up to MAX_RETRIES times, then dropped.
 */
export async function replayQueue(): Promise<void> {
  if (isProcessing) {
    console.log("[Offline] Already processing queue — skipping");
    return;
  }

  isProcessing = true;
  const queue = await getQueue();

  if (queue.length === 0) {
    isProcessing = false;
    return;
  }

  console.log(`[Offline] Replaying ${queue.length} queued requests`);

  const remaining: QueuedRequest[] = [];

  for (const request of queue) {
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: {
          "Content-Type": "application/json",
          ...request.headers,
        },
        body: request.body ? JSON.stringify(request.body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      console.log(`[Offline] Replayed successfully: ${request.method} ${request.url}`);
    } catch (_error) {
      request.retryCount += 1;

      if (request.retryCount < MAX_RETRIES) {
        remaining.push(request);
        console.warn(
          `[Offline] Replay failed (attempt ${request.retryCount}/${MAX_RETRIES}): ${request.method} ${request.url}`,
        );
      } else {
        console.error(
          `[Offline] Dropping request after ${MAX_RETRIES} failed attempts: ${request.method} ${request.url}`,
        );
      }
    }
  }

  await saveQueue(remaining);
  isProcessing = false;

  // Notify subscribers
  onReplayCallbacks.forEach((cb) => { cb(); });
}

// ─── Subscriptions ────────────────────────────────────

/**
 * Register a callback that fires after queue replay completes.
 * Returns an unsubscribe function.
 */
export function onReplayComplete(callback: OfflineCallback): () => void {
  onReplayCallbacks.push(callback);
  return () => {
    onReplayCallbacks = onReplayCallbacks.filter((cb) => cb !== callback);
  };
}

/**
 * Check whether the device is currently online.
 */
export function isCurrentlyOnline(): boolean {
  return isOnline;
}
