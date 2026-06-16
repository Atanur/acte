import { z } from "zod";

// ─── Auth Schemas ────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Geçerli bir email adresi girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır").max(100),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır").max(50),
});

// ─── Common Schemas ──────────────────────────────────────
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

// ─── Type Inference ──────────────────────────────────────
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
