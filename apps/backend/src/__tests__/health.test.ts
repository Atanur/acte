import { describe, expect, it } from "vitest";

describe("Health Check", () => {
  it("should return a healthy status object", () => {
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: "0.1.0",
    };

    expect(health).toHaveProperty("status", "ok");
    expect(health).toHaveProperty("version", "0.1.0");
    expect(health).toHaveProperty("timestamp");
    expect(health).toHaveProperty("uptime");
    expect(typeof health.uptime).toBe("number");
  });
});
