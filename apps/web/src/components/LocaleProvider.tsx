'use client';

import { useEffect } from 'react';

interface LocaleProviderProps {
  locale: string;
  children: React.ReactNode;
}

export default function LocaleProvider({ locale, children }: LocaleProviderProps) {
  useEffect(() => {
    const isRTL = ['ar', 'he', 'fa', 'ur'].includes(locale);
    
    // Set HTML lang and dir attributes
    document.documentElement.lang = locale;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [locale]);

  return <>{children}</>;
}
