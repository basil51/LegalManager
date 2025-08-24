import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import Topbar from '@/components/Topbar';
import Providers from '@/components/Providers';
import SidebarLinks from '@/components/SidebarLinks';

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
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}> 
      <body className="min-h-dvh antialiased">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className="min-h-screen h-screen overflow-hidden flex bg-gray-50">
            <aside className="fixed inset-y-0 bg-zinc-200 start-0 w-64 z-30 bg-white border-s hidden md:flex md:flex-col">
              <div className="h-18 border-b bg-zinc-300 flex items-center ps-4 pe-4 font-semibold text-start p4-4">
                <h1 className="font-bold text-blue-900">{t('App.name')}</h1>
              </div>
              <nav className="p-4 space-y-2">
                <SidebarLinks locale={locale} />
              </nav>
            </aside>
            <div className="flex-1 flex flex-col ms-0 md:ms-64 h-screen overflow-hidden">
              <Topbar />
              <div className="md:hidden bg-white border-b p-2">
                {/* Mobile placeholder; could add a drawer later */}
                <SidebarLinks compact locale={locale} />
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</div>
            </div>
          </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}