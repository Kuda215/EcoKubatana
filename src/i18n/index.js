import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import sn from './locales/sn.json';
import nd from './locales/nd.json';

// Only en/sn/nd have real translations right now. Other language codes the
// Settings page offers (sw/fr/pt) fall back to English via fallbackLng until
// their own locale files are added.
export const SUPPORTED_LANGUAGES = ['en', 'sn', 'nd'];

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      sn: { translation: sn },
      nd: { translation: nd },
    },
    lng: localStorage.getItem('ecokubatana_language') || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
