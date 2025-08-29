import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import Providers from '@/components/Providers';
import AppShell from '@/components/AppShell';
import LocaleProvider from '@/components/LocaleProvider';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }, { locale: 'he' }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(locale);
  const t = await getTranslations({ locale });

  return (
    <LocaleProvider locale={locale}>
      <NextIntlClientProvider messages={messages}>
        <Providers>
          <AppShell locale={locale}>{children}</AppShell>
        </Providers>
      </NextIntlClientProvider>
    </LocaleProvider>
  );
}