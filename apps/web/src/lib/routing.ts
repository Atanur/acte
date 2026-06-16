// ─────────────────────────────────────────────────────────
// Routing config — next-intl
// ─────────────────────────────────────────────────────────
// Defines the supported locales and default locale for
// the application. Turkish (tr) is the primary locale.
// ─────────────────────────────────────────────────────────

import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["tr", "en"],
  defaultLocale: "tr",
  localePrefix: "as-needed",
});
