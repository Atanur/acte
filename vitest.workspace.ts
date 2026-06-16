import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineProject } from "vitest/config";

export default [
  // Backend project
  defineProject({
    test: {
      name: "backend",
      globals: true,
      environment: "node",
      include: ["apps/backend/src/**/*.test.ts", "apps/backend/src/**/*.spec.ts"],
    },
  }),

  // Web project (with jsdom and React Testing Library)
  defineProject({
    plugins: [react()],
    test: {
      name: "web",
      globals: true,
      environment: "jsdom",
      include: ["apps/web/src/**/*.test.{ts,tsx}", "apps/web/src/**/*.spec.{ts,tsx}"],
      setupFiles: ["./apps/web/src/__tests__/setup.ts"],
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "apps/web/src"),
      },
    },
  }),

  // Shared package project
  defineProject({
    test: {
      name: "shared",
      globals: true,
      environment: "node",
      include: ["packages/shared/src/**/*.test.ts", "packages/shared/src/**/*.spec.ts"],
    },
  }),
];
