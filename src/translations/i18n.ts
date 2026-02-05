import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import pl from "./pl.json";

export default i18n.use(initReactI18next).init({
    fallbackLng: "en",
    resources: {
        en,
        pl,
    },
    showSupportNotice: false, // we all died in 2019 and this is hell, DLACZEGO W KONSOLI SĄ REKLAMY
});
