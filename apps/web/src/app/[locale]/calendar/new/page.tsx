'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AppointmentForm from '@/components/AppointmentForm';
import { CreateAppointmentGuard } from '@/components/PermissionGuard';

interface CreateAppointmentData {
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  location: string;
  notes: string;
  type: string;
  status: string;
  clientId?: string;
  caseId?: string;
}

// Function to decode JWT token and get user ID
function getUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

export default function NewAppointmentPage() {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: CreateAppointmentData) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/en/login');
        return;
      }

      const userId = getUserIdFromToken(token);
      if (!userId) {
        setError('Invalid user session');
        return;
      }

      const requestBody = {
        lawyerId: userId,
        title: formData.title,
        description: formData.description || undefined,
        scheduled_at: formData.scheduled_at,
        duration_minutes: formData.duration_minutes,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
        type: formData.type,
        status: formData.status,
        clientId: formData.clientId || undefined,
        caseId: formData.caseId || undefined,
      };

      console.log('Sending appointment request:', requestBody);

      const response = await fetch('http://localhost:4005/api/v1/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('Error response:', errorData);
        
        let errorMessage = 'Failed to create appointment';
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (Array.isArray(errorData)) {
          errorMessage = errorData.join(', ');
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData && typeof errorData === 'object') {
          const messages = [];
          for (const [key, value] of Object.entries(errorData)) {
            if (Array.isArray(value)) {
              messages.push(`${key}: ${value.join(', ')}`);
            } else if (typeof value === 'string') {
              messages.push(`${key}: ${value}`);
            }
          }
          if (messages.length > 0) {
            errorMessage = messages.join('; ');
          }
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Success response:', result);

      // Redirect to calendar with success message
      const currentLocale = window.location.pathname.split('/')[1] || 'en';
      router.push(`/${currentLocale}/calendar`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create appointment');
      console.error('Error creating appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const currentLocale = window.location.pathname.split('/')[1] || 'en';
    router.push(`/${currentLocale}/calendar`);
  };

  return (
    <CreateAppointmentGuard fallback={
      <div className="space-y-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          You don't have permission to create appointments.
        </div>
      </div>
    }>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{t('Appointments.newAppointment')}</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <AppointmentForm 
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      </div>
    </CreateAppointmentGuard>
  );
}
