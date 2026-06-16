// ─────────────────────────────────────────────────────────
// i18n — Web (next-intl)
// ─────────────────────────────────────────────────────────
// Configures next-intl for the Next.js app.
// Turkish-first: tr is the default locale, en is fallback.
// ─────────────────────────────────────────────────────────

import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export type Locale = (typeof routing.locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
