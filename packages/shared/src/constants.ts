// ─── App Metadata ────────────────────────────────────────
export const APP_NAME = "Acte";
export const APP_VERSION = "0.1.0";

// ─── API ─────────────────────────────────────────────────
export const API_PREFIX = "/api";
export const API_VERSION = "v1";

// ─── Pagination ──────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ─── Storage Keys ────────────────────────────────────────
export const STORAGE_KEYS = {
  AUTH_TOKEN: "acte_auth_token",
  REFRESH_TOKEN: "acte_refresh_token",
  USER: "acte_user",
} as const;

// ─── Routes ──────────────────────────────────────────────
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  SETTINGS: "/settings",
} as const;
