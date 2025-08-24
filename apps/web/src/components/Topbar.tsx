'use client';

import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useRouter, usePathname } from 'next/navigation';

export default function Topbar() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  const title = (() => {
    const segments = pathname?.split('/').filter(Boolean) ?? [];
    const afterLocale = segments.slice(1);
    const first = afterLocale[0];
    const second = afterLocale[1];
    if (first === 'dashboard' && second === 'calendar') {
      return t('Dashboard.calendar.title');
    }
    return t('Dashboard.title');
  })();

  const handleLogout = () => {
    localStorage.removeItem('token');
    // default to English root
    router.push('/en');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors cursor-pointer"
            >
              {t('Dashboard.logout')}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}


