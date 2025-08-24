'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiClient, CreateCaseDto, UpdateCaseDto } from '@/lib/api-client';
import CaseForm from '@/components/CaseForm';
import { CreateCaseGuard } from '@/components/PermissionGuard';

export default function NewCasePage() {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: CreateCaseDto | UpdateCaseDto) => {
    try {
      setLoading(true);
      setError(null);
      
      await apiClient.createCase(formData as CreateCaseDto);
      
      // Redirect to cases list with success message
      const currentLocale = window.location.pathname.split('/')[1] || 'en';
      router.push(`/${currentLocale}/cases`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create case');
      console.error('Error creating case:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const currentLocale = window.location.pathname.split('/')[1] || 'en';
    router.push(`/${currentLocale}/cases`);
  };

  return (
    <CreateCaseGuard fallback={
      <div className="space-y-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          You don't have permission to create cases.
        </div>
      </div>
    }>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{t('Cases.newCase')}</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <CaseForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      </div>
    </CreateCaseGuard>
  );
}
