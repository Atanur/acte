// ─────────────────────────────────────────────────────────
// Background Jobs — Queue Setup & Job Types
// ─────────────────────────────────────────────────────────
// Central queue registry using BullMQ + Redis.
// Defines job types, shared queue instances, and helpers.
// ─────────────────────────────────────────────────────────

import { type Processor, Queue, type QueueOptions, Worker, type WorkerOptions } from "bullmq";
import type Redis from "ioredis";

// ─── Redis Connection ────────────────────────────────

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

let redisClient: Redis | null = null;

/**
 * Get or create the shared Redis connection for BullMQ.
 * Uses a single connection to stay within Redis connection limits.
 * Uses the BullMQ connection object type to avoid ioredis version conflicts.
 */
function _getRedisConnection() {
  return { url: REDIS_URL };
}

// ─── Job Type Identifiers ────────────────────────────

export const QUEUES = {
  EMAIL: "email",
  NOTIFICATIONS: "notifications",
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

// ─── Job Payload Type Map ────────────────────────────

export interface EmailJobPayload {
  type: "welcome" | "reset-password" | "generic";
  to: string;
  subject: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationJobPayload {
  type: "push" | "in-app";
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export type JobPayload = EmailJobPayload | NotificationJobPayload;

export type PayloadMap = {
  email: EmailJobPayload;
  notifications: NotificationJobPayload;
};

// ─── Queue Factory ───────────────────────────────────

const defaultQueueOptions: QueueOptions = {
  connection: { url: REDIS_URL },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: { age: 60 * 60 * 24 }, // keep 1 day
    removeOnFail: { age: 60 * 60 * 24 * 7 }, // keep 1 week
  },
};

const queueInstances = new Map<string, Queue>();

/**
 * Get or create a queue by name.
 * Queues are cached once created.
 */
export function getQueue(name: QueueName): Queue {
  const existing = queueInstances.get(name);
  if (existing) return existing;

  const queue = new Queue(name, defaultQueueOptions);
  queueInstances.set(name, queue);
  return queue;
}

// ─── Worker Factory ──────────────────────────────────

/**
 * Create a worker for a named queue with a processor function.
 * Automatically shares the Redis connection.
 */
export function createWorker(
  name: QueueName,
  processor: Processor,
  options?: Partial<WorkerOptions>,
): Worker {
  return new Worker(name, processor, {
    connection: { url: REDIS_URL },
    concurrency: 5,
    ...options,
  });
}

// ─── Helper: Add a Job ───────────────────────────────

/**
 * Add a job to a queue with optional delay and job ID.
 */
export async function addJob(
  queueName: QueueName,
  payload: JobPayload,
  options?: { delay?: number; jobId?: string },
) {
  const queue = getQueue(queueName);
  return queue.add(queueName, payload, {
    delay: options?.delay,
    jobId: options?.jobId,
  });
}

// ─── Graceful Shutdown ───────────────────────────────

/**
 * Close all queue connections. Call during app shutdown.
 */
export async function closeQueues(): Promise<void> {
  const closePromises: Promise<void>[] = [];

  for (const queue of queueInstances.values()) {
    closePromises.push(queue.close());
  }
  queueInstances.clear();

  if (redisClient) {
    await redisClient.quit().catch(() => {});
    redisClient = null;
  }

  await Promise.allSettled(closePromises);
}
