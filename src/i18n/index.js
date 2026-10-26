import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import sn from './locales/sn.json';
import nd from './locales/nd.json';
import sw from './locales/sw.json';
import fr from './locales/fr.json';
import pt from './locales/pt.json';
import zu from './locales/zu.json';
import yo from './locales/yo.json';
import ha from './locales/ha.json';

export const SUPPORTED_LANGUAGES = ['en', 'sn', 'nd', 'zu', 'sw', 'yo', 'ha', 'fr', 'pt'];

export const LANGUAGE_LABELS = {
  en: 'English',
  sn: 'ChiShona',
  nd: 'isiNdebele',
  zu: 'isiZulu',
  sw: 'Kiswahili',
  yo: 'Yorùbá',
  ha: 'Hausa',
  fr: 'Français',
  pt: 'Português',
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      sn: { translation: sn },
      nd: { translation: nd },
      zu: { translation: zu },
      sw: { translation: sw },
      yo: { translation: yo },
      ha: { translation: ha },
      fr: { translation: fr },
      pt: { translation: pt },
    },
    lng: localStorage.getItem('ecokubatana_language') || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
