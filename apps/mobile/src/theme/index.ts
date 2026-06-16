export const theme = {
  colors: {
    primary: "#6366f1",
    primaryDark: "#4f46e5",
    secondary: "#a78bfa",
    background: "#09090b",
    surface: "#18181b",
    surfaceLight: "#27272a",
    text: "#f4f4f5",
    textSecondary: "#a1a1aa",
    textMuted: "#71717a",
    border: "#27272a",
    error: "#ef4444",
    success: "#22c55e",
    warning: "#f59e0b",
    info: "#3b82f6",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 24,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: "700" as const, lineHeight: 40 },
    h2: { fontSize: 24, fontWeight: "600" as const, lineHeight: 32 },
    h3: { fontSize: 20, fontWeight: "600" as const, lineHeight: 28 },
    body: { fontSize: 16, fontWeight: "400" as const, lineHeight: 24 },
    caption: { fontSize: 13, fontWeight: "400" as const, lineHeight: 20 },
    label: { fontSize: 12, fontWeight: "500" as const, lineHeight: 16 },
  },
} as const;

export type Theme = typeof theme;
