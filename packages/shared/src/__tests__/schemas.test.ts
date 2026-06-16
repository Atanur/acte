import { describe, expect, it } from "vitest";
import { idParamSchema, loginSchema, paginationSchema, registerSchema } from "../schemas";

describe("Auth Schemas", () => {
  describe("loginSchema", () => {
    it("should accept valid login data", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "123456",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "123456",
      });
      expect(result.success).toBe(false);
    });

    it("should reject short password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "12345",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("should accept valid registration data", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "123456",
        name: "Test User",
      });
      expect(result.success).toBe(true);
    });

    it("should reject short name", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "123456",
        name: "A",
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("Common Schemas", () => {
  describe("paginationSchema", () => {
    it("should apply defaults for missing fields", () => {
      const result = paginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it("should accept custom values", () => {
      const result = paginationSchema.parse({ page: "3", limit: "50" });
      expect(result.page).toBe(3);
      expect(result.limit).toBe(50);
    });

    it("should reject limit over 100", () => {
      const result = paginationSchema.safeParse({ limit: "101" });
      expect(result.success).toBe(false);
    });
  });

  describe("idParamSchema", () => {
    it("should accept valid UUID", () => {
      const result = idParamSchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("should reject non-UUID string", () => {
      const result = idParamSchema.safeParse({ id: "not-a-uuid" });
      expect(result.success).toBe(false);
    });
  });
});
