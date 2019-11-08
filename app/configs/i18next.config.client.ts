import i18n, { InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";
import config from "./app.config";
import en from "../locales/en/translation.json";
import de from "../locales/de/translation.json";

const i18nextOptions: InitOptions = {
  interpolation: {
    escapeValue: false
  },
  fallbackLng: config.fallbackLng,
  whitelist: config.languages,
  resources: {
    en: {
      translation: en
    },
    de: {
      translation: de
    }
  }
};

i18n.use(initReactI18next);

// initialize if not already initialized
if (!i18n.isInitialized) {
  i18n.init(i18nextOptions);
}

export default i18n;
