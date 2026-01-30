'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const LocaleContext = createContext();

export function LocaleProvider({ children, locale }) {
  const [currentLocale, setCurrentLocale] = useState('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load saved locale from localStorage on mount
    const savedLocale = localStorage.getItem('preferredLocale');
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'kh')) {
      setCurrentLocale(savedLocale);
    } else {
      setCurrentLocale(locale || 'en');
    }
    setMounted(true);
  }, [locale]);

  const updateLocale = (newLocale) => {
    setCurrentLocale(newLocale);
    localStorage.setItem('preferredLocale', newLocale);
  };

  return (
    <LocaleContext.Provider value={{ locale: mounted ? currentLocale : locale, setLocale: updateLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

