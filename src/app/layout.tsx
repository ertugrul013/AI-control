import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/600.css';
import './globals.css';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'AIControl',
  description: 'AI governance for small and medium businesses',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={await getMessages()}>{children}</NextIntlClientProvider>
        <Toaster theme="system" position="bottom-right" />
      </body>
    </html>
  );
}
