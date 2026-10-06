import i18n from "i18next";
import { initReactI18next } from "react-i18next";

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    compatibilityJSON: "v4",
    lng: "en",
    fallbackLng: "en",
    resources: {
      en: { translation: {} },
    },
    interpolation: { escapeValue: false },
  });
}

export default i18n;
