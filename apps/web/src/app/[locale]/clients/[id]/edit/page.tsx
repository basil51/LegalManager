'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiClient, Client, UpdateClientDto } from '@/lib/api-client';
import ClientForm from '@/components/ClientForm';
import { EditClientGuard } from '@/components/PermissionGuard';

interface EditClientPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default function EditClientPage({ params }: EditClientPageProps) {
  const t = useTranslations();
  const router = useRouter();
  const [clientData, setClientData] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    try {
      const { id } = await params;
      setLoading(true);
      setError(null);
      
      const data = await apiClient.getClientById(id);
      setClientData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch client');
      console.error('Error fetching client:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: UpdateClientDto) => {
    try {
      const { id } = await params;
      setSubmitting(true);
      setError(null);
      
      await apiClient.updateClient(id, formData);
      
      // Redirect to clients list with success message
      const { locale } = await params;
      router.push(`/${locale}/clients`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update client');
      console.error('Error updating client:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    const { locale } = await params;
    router.push(`/${locale}/clients`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg">{t('Common.loading')}</div>
      </div>
    );
  }

  if (error && !clientData) {
    return (
      <div className="space-y-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          Back to Clients
        </button>
      </div>
    );
  }

  return (
    <EditClientGuard fallback={
      <div className="space-y-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          You don't have permission to edit clients.
        </div>
      </div>
    }>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{t('Clients.editClient')}</h1>
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
            clientData={clientData || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={submitting}
          />
        </div>
      </div>
    </EditClientGuard>
  );
}
