'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  display_name: string;
  tenant: {
    id: string;
    name: string;
  };
  roles: string[];
}

export default function DashboardPage() {
  const t = useTranslations();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      const currentLocale = window.location.pathname.split('/')[1] || 'en';
      router.push(`/${currentLocale}/login`);
      return;
    }

    // Fetch user profile
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4005/api/v1';
    fetch(`${apiUrl}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        return response.json();
      })
      .then(data => {
        setUser(data);
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
        localStorage.removeItem('token');
        const currentLocale = window.location.pathname.split('/')[1] || 'en';
        router.push(`/${currentLocale}/login`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('Common.loading')}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{t('Dashboard.userInfo')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('Dashboard.name')}</label>
              <p className="mt-1 text-sm text-gray-900">{user.display_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('Dashboard.email')}</label>
              <p className="mt-1 text-sm text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('Dashboard.organization')}</label>
              <p className="mt-1 text-sm text-gray-900">{user.tenant.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('Dashboard.roles')}</label>
              <p className="mt-1 text-sm text-gray-900">{user.roles.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium mb-2">{t('Dashboard.cases.title')}</h3>
            <p className="text-gray-600 text-sm mb-4">{t('Dashboard.cases.description')}</p>
            <Link href="/cases" className="block w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors text-center">
              {t('Dashboard.cases.button')}
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium mb-2">{t('Dashboard.clients.title')}</h3>
            <p className="text-gray-600 text-sm mb-4">{t('Dashboard.clients.description')}</p>
            <Link href="/clients" className="block w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors text-center">
              {t('Dashboard.clients.button')}
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium mb-2">{t('Dashboard.documents.title')}</h3>
            <p className="text-gray-600 text-sm mb-4">{t('Dashboard.documents.description')}</p>
            <Link href="/documents" className="block w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition-colors text-center">
              {t('Dashboard.documents.button')}
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium mb-2">{t('Dashboard.invoices.title')}</h3>
            <p className="text-gray-600 text-sm mb-4">{t('Dashboard.invoices.description')}</p>
            <Link href="/invoices" className="block w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors text-center">
              {t('Dashboard.invoices.button')}
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium mb-2">{t('Dashboard.calendar.title')}</h3>
            <p className="text-gray-600 text-sm mb-4">{t('Dashboard.calendar.description')}</p>
            <Link href="/calendar" className="block w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors text-center">
              {t('Dashboard.calendar.button')}
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">{t('Dashboard.recentActivity')}</h2>
          <div className="text-gray-600 text-sm">
            <p>{t('Dashboard.noActivity')}</p>
            <p className="mt-2">{t('Dashboard.activityDescription')}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
