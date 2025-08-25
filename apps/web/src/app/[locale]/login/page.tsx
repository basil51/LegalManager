'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    display_name: '',
    tenant_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const currentLocale = window.location.pathname.split('/')[1] || 'en';
      // Use full navigation to ensure Providers/layout re-initialize properly
      window.location.replace(`/${currentLocale}`);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4003/api/v1';
      const requestData = isLogin ? { email: formData.email, password: formData.password } : formData;
      console.log('Sending request to:', `${apiUrl}${endpoint}`, requestData);
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('API Response:', { status: response.status, data });

      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.access_token);
          setMessage(`✅ ${t('Auth.loginSuccess', { name: data.user.display_name })}`);
          // Redirect immediately with full reload to avoid transient blank state
          const currentLocale = window.location.pathname.split('/')[1] || 'en';
          window.location.replace(`/${currentLocale}`);
        } else {
          setMessage(`✅ ${t('Auth.registerSuccess')}`);
          setIsLogin(true);
        }
      } else {
        setMessage(`❌ Error: ${data.message || 'Something went wrong'}`);
      }
          } catch (error) {
        setMessage(`❌ ${t('Auth.networkError')}`);
      } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{t('Home.title')}</h1>
        <LanguageSwitcher />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex mb-4">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-l-lg font-medium ${
              isLogin
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t('Auth.login')}
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-r-lg font-medium ${
              !isLogin
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t('Auth.register')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Auth.email')}
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('Auth.emailPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Auth.password')}
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('Auth.passwordPlaceholder')}
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Auth.displayName')}
                </label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('Auth.displayNamePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Auth.tenantName')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.tenant_name}
                  onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('Auth.tenantNamePlaceholder')}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('Auth.processing') : isLogin ? t('Auth.login') : t('Auth.register')}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-md ${
            message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p><strong>{t('Auth.testCredentials')}</strong></p>
          <p>{t('Auth.testEmail')}</p>
          <p>{t('Auth.testPassword')}</p>
          <button
            type="button"
            onClick={() => {
              setFormData({
                email: 'admin@legalfirm.com',
                password: 'password123',
                display_name: '',
                tenant_name: '',
              });
            }}
            className="mt-2 px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
          >
            {t('Auth.fillTestCredentials')}
          </button>
        </div>
      </div>
    </main>
  );
}
