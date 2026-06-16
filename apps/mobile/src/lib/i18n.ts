// ─────────────────────────────────────────────────────────
// i18n — Mobile (i18next + react-i18next)
// ─────────────────────────────────────────────────────────
// Configures i18next for the Expo app.
// Turkish-first: tr is the default locale, en is fallback.
// Detects device locale via expo-localization.
// ─────────────────────────────────────────────────────────

import { getLocales } from "expo-localization";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../../messages/en.json";
import tr from "../../messages/tr.json";

const deviceLanguage = getLocales()?.[0]?.languageCode ?? "tr";
const supportedLanguages = ["tr", "en"] as const;
export type SupportedLocale = (typeof supportedLanguages)[number];

function detectLanguage(): SupportedLocale {
  if (supportedLanguages.includes(deviceLanguage as SupportedLocale)) {
    return deviceLanguage as SupportedLocale;
  }
  return "tr";
}

void i18next.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
  },
  lng: detectLanguage(),
  fallbackLng: "tr",
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: "v4",
});

export default i18next;
