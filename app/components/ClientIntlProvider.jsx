'use client';

import { NextIntlClientProvider } from 'next-intl';
import enMessages from '../../messages/en.json';
import khMessages from '../../messages/kh.json';

const messagesMap = { en: enMessages, kh: khMessages };

export default function ClientIntlProvider({ children, locale }) {
  const messages = messagesMap[locale] || enMessages;
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
