'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiClient, CreateTrustAccountDto, UpdateTrustAccountDto } from '@/lib/api-client';
import TrustAccountForm from '@/components/TrustAccountForm';
import { CreateTrustAccountGuard } from '@/components/PermissionGuard';
import { useToast } from '@/contexts/ToastContext';

export default function NewTrustAccountPage() {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (formData: CreateTrustAccountDto | UpdateTrustAccountDto) => {
    try {
      setLoading(true);
      await apiClient.createTrustAccount(formData as CreateTrustAccountDto);
      addToast('success', t('TrustAccounts.createSuccess'));
      
      const currentLocale = window.location.pathname.split('/')[1] || 'en';
      router.push(`/${currentLocale}/trust-accounts`);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to create trust account');
      console.error('Error creating trust account:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const currentLocale = window.location.pathname.split('/')[1] || 'en';
    router.push(`/${currentLocale}/trust-accounts`);
  };

  return (
    <CreateTrustAccountGuard fallback={
      <div className="space-y-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {t('Common.noPermission')}
        </div>
      </div>
    }>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t('TrustAccounts.createAccount')}</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <TrustAccountForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      </div>
    </CreateTrustAccountGuard>
  );
}
