import i18n from 'i18next';
import { initReactI18next } from "react-i18next";
import config from './app.config';

const i18nextOptions = {
  interpolation: {
    escapeValue: false
  },
  saveMissing: true,
  lng: 'en',
  fallbackLng: config.fallbackLng,
  whitelist: config.languages,
  react: {
    wait: false
  }
};

i18n
  .use(initReactI18next);

// initialize if not already initialized
if (!i18n.isInitialized) {
  i18n
    .init(i18nextOptions);
}

export default i18n;
