import { useState, useEffect, useCallback } from 'react';
import { translations } from '../i18n/locales';

type Language = 'en' | 'ar';

export const useLocalization = () => {
  const [lang, setLang] = useState<Language>(() => {
    const savedLang = localStorage.getItem('language');
    return (savedLang === 'en' || savedLang === 'ar') ? savedLang : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang(prevLang => prevLang === 'en' ? 'ar' : 'en');
  }, []);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let result: any = translations[lang];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation is missing
        let fallbackResult: any = translations['en'];
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
        }
        return fallbackResult || key;
      }
    }
    return result || key;
  }, [lang]);

  return { lang, toggleLang, t };
};
