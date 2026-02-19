import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import "intl-pluralrules";
import LanguageDetector from "@os-team/i18next-react-native-language-detector";

import en from "./en.json";
import pl from "./pl.json";

export default i18n.use(LanguageDetector).use(initReactI18next).init({
    fallbackLng: "pl",
    resources: {
        en,
        pl,
    },
    showSupportNotice: false, // we all died in 2019 and this is hell, DLACZEGO W KONSOLI SĄ REKLAMY
});
