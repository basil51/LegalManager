'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import PermissionGuard from './PermissionGuard';

interface SidebarLinksProps {
  compact?: boolean;
  locale: string;
}

export default function SidebarLinks({ compact = false, locale }: SidebarLinksProps) {
  const t = useTranslations();
  const baseClass =
    'block w-full text-start px-3 py-2 rounded-md hover:bg-gray-100 transition-colors';
  
  return (
    <div className={compact ? 'flex gap-2 overflow-x-auto' : 'space-y-1'}>
      <Link href={`/${locale}`} className={baseClass}>
        {t('Dashboard.title')}
      </Link>
      <PermissionGuard resource="cases" action="read">
        <Link href={`/${locale}/cases`} className={baseClass}>
          {t('Dashboard.cases.title')}
        </Link>
      </PermissionGuard>
      <PermissionGuard resource="clients" action="read">
        <Link href={`/${locale}/clients`} className={baseClass}>
          {t('Dashboard.clients.title')}
        </Link>
      </PermissionGuard>
      <PermissionGuard resource="documents" action="read">
        <Link href={`/${locale}/documents`} className={baseClass}>
          {t('Dashboard.documents.title')}
        </Link>
      </PermissionGuard>
      <PermissionGuard resource="appointments" action="read">
        <Link href={`/${locale}/calendar`} className={baseClass}>
          {t('Dashboard.calendar.title')}
        </Link>
      </PermissionGuard>
    </div>
  );
}
