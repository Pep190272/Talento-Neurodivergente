'use client'
import { useState, useEffect } from 'react';
import { translations } from '../utils/translations';
import { extendedTranslations } from '../utils/translations_extended';

export function useLanguage() {
  const [currentLang, setCurrentLang] = useState('es');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('app_language') || 'es';
      setCurrentLang(savedLang);
    }

    const handleLanguageChange = (event) => {
      setCurrentLang(event.detail.language);
    };

    window.addEventListener('languageChanged', handleLanguageChange);

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  const changeLanguage = (langCode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_language', langCode);
      setCurrentLang(langCode);

      const event = new CustomEvent('languageChanged', {
        detail: { language: langCode }
      });
      window.dispatchEvent(event);
    }
  };

  const t = (key) => {
    if (!isClient) return '';

    const keys = key.split('.');
    let value = extendedTranslations[currentLang];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }

    return value || key;
  };

  return { currentLang, language: currentLang, changeLanguage, t, isClient };
}
