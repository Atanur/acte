// ─── API Types ───────────────────────────────────────────
export interface ApiResponse<T> {
  status: "ok" | "error";
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── User Types ──────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── App Config ──────────────────────────────────────────
export interface AppConfig {
  apiUrl: string;
  appName: string;
  version: string;
}
