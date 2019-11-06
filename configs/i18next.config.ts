import i18n from "i18next";
import i18nextBackend from "i18next-node-fs-backend";
import config from "./app.config";

const i18nextOptions = {
  backend: {
    // path where resources get loaded from
    loadPath: "./locales/{{lng}}/{{ns}}.json",

    // path to post missing resources
    addPath: "./locales/{{lng}}/{{ns}}.missing.json",

    // jsonIndent to use when storing json files
    jsonIndent: 2
  },
  interpolation: {
    escapeValue: false
  },
  saveMissing: true,
  fallbackLng: config.fallbackLng,
  whitelist: config.languages,
  react: {
    wait: false
  }
};

i18n.use(i18nextBackend);

// initialize if not already initialized
if (!i18n.isInitialized) {
  i18n.init(i18nextOptions);
}

export default i18n;
