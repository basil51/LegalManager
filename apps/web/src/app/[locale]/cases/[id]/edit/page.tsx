'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiClient, Case, UpdateCaseDto } from '@/lib/api-client';
import CaseForm from '@/components/CaseForm';
import { EditCaseGuard } from '@/components/PermissionGuard';

interface EditCasePageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default function EditCasePage({ params }: EditCasePageProps) {
  const t = useTranslations();
  const router = useRouter();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCaseData();
  }, []);

  const fetchCaseData = async () => {
    try {
      const { id } = await params;
      setLoading(true);
      setError(null);
      
      const data = await apiClient.getCaseById(id);
      setCaseData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch case');
      console.error('Error fetching case:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: UpdateCaseDto) => {
    try {
      const { id } = await params;
      setSubmitting(true);
      setError(null);
      
      await apiClient.updateCase(id, formData);
      
      // Redirect to cases list with success message
      const { locale } = await params;
      router.push(`/${locale}/cases`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update case');
      console.error('Error updating case:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    const { locale } = await params;
    router.push(`/${locale}/cases`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg">{t('Common.loading')}</div>
      </div>
    );
  }

  if (error && !caseData) {
    return (
      <div className="space-y-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          Back to Cases
        </button>
      </div>
    );
  }

  return (
    <EditCaseGuard fallback={
      <div className="space-y-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          You don't have permission to edit cases.
        </div>
      </div>
    }>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{t('Cases.editCase')}</h1>
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
            caseData={caseData || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={submitting}
          />
        </div>
      </div>
    </EditCaseGuard>
  );
}
