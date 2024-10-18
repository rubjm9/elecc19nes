import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./translations/enUS/translation.json";
import translationES from "./translations/esES/translation.json";

// Creating object with the variables of imported translation files
const resources = {
  enUS: {
    translation: translationEN,
  },
  esES: {
    translation: translationES,
  },
};

const currentLanguage =
  JSON.parse(localStorage.getItem("language")) === "" ||
  !JSON.parse(localStorage.getItem("language"))
    ? "esES"
    : JSON.parse(localStorage.getItem("language"));

i18n.use(initReactI18next).init({
  resources,
  lng: currentLanguage, // default language
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
