import i18n from 'i18next';
import Backend from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

i18n
  .use( Backend )
  .use( LanguageDetector )
  .use( initReactI18next )
  // https://www.i18next.com/overview/configuration-options
  .init( {
    whitelist: [ 'en-US' ],
    fallbackLng: 'en-US',
    load: 'currentOnly',
    debug: process.env.NODE_ENV === 'development',
    escapeValue: false, // React handles escaping
  } );

export default i18n;
