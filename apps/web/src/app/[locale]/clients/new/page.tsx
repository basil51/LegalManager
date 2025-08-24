'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiClient, CreateClientDto, UpdateClientDto } from '@/lib/api-client';
import ClientForm from '@/components/ClientForm';
import { CreateClientGuard } from '@/components/PermissionGuard';

export default function NewClientPage() {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: CreateClientDto | UpdateClientDto) => {
    try {
      setLoading(true);
      setError(null);
      
      await apiClient.createClient(formData as CreateClientDto);
      
      // Redirect to clients list with success message
      const currentLocale = window.location.pathname.split('/')[1] || 'en';
      router.push(`/${currentLocale}/clients`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client');
      console.error('Error creating client:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const currentLocale = window.location.pathname.split('/')[1] || 'en';
    router.push(`/${currentLocale}/clients`);
  };

  return (
    <CreateClientGuard fallback={
      <div className="space-y-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          You don't have permission to create clients.
        </div>
      </div>
    }>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{t('Clients.newClient')}</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <ClientForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      </div>
    </CreateClientGuard>
  );
}
