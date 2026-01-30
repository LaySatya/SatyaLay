'use client';

import { NextIntlClientProvider } from 'next-intl';
import { useLocale } from '../context/LocaleContext';
import enMessages from '../../messages/en.json';
import khMessages from '../../messages/kh.json';

const messagesMap = { en: enMessages, kh: khMessages };

export default function ClientIntlProvider({ children }) {
  const { locale } = useLocale();
  const messages = messagesMap[locale] || enMessages;
  
  return (
    <NextIntlClientProvider 
      locale={locale} 
      messages={messages}
      timeZone="Asia/Phnom_Penh"
    >
      {children}
    </NextIntlClientProvider>
  );
}
