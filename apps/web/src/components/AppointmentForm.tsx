'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import Link from 'next/link';
import { apiClient, Case, Client } from '@/lib/api-client';

interface AppointmentFormProps {
  onSubmit: (data: CreateAppointmentData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

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

// Appointment type and status enums
enum AppointmentType {
  CONSULTATION = 'consultation',
  COURT_HEARING = 'court_hearing',
  CLIENT_MEETING = 'client_meeting',
  DOCUMENT_REVIEW = 'document_review',
  PHONE_CALL = 'phone_call',
  VIDEO_CALL = 'video_call',
  OTHER = 'other'
}

enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show'
}

export default function AppointmentForm({ onSubmit, onCancel, loading = false }: AppointmentFormProps) {
  const t = useTranslations();
  const [formData, setFormData] = useState<CreateAppointmentData>({
    title: '',
    description: '',
    scheduled_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    duration_minutes: 60,
    location: '',
    notes: '',
    type: AppointmentType.OTHER,
    status: AppointmentStatus.SCHEDULED,
    clientId: '',
    caseId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      const [clientsData, casesData] = await Promise.all([
        apiClient.getClients(),
        apiClient.getCases(),
      ]);
      setClients(clientsData);
      setCases(casesData);
    } catch (err) {
      console.error('Error loading form data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = t('Common.requiredField', { default: 'This field is required' });
    }
    if (!formData.scheduled_at) {
      newErrors.scheduled_at = t('Common.requiredField', { default: 'This field is required' });
    }
    if (formData.duration_minutes <= 0) {
      newErrors.duration_minutes = t('Common.requiredField', { default: 'Duration must be greater than 0' });
    }
    if (!formData.type) {
      newErrors.type = t('Common.requiredField', { default: 'This field is required' });
    }
    if (!formData.status) {
      newErrors.status = t('Common.requiredField', { default: 'This field is required' });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Convert datetime-local input to ISO string
      let isoDateString;
      try {
        const dateFromForm = new Date(formData.scheduled_at);
        
        if (isNaN(dateFromForm.getTime())) {
          throw new Error('Invalid date from form');
        }
        
        isoDateString = dateFromForm.toISOString();
      } catch (error) {
        console.error('Date conversion error:', error);
        setErrors({ scheduled_at: 'Invalid date format. Please select a valid date and time.' });
        return;
      }

      const apiData = {
        ...formData,
        scheduled_at: isoDateString,
        clientId: formData.clientId || undefined,
        caseId: formData.caseId || undefined,
      };
      
      await onSubmit(apiData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleInputChange = (field: keyof CreateAppointmentData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // When a case is selected, automatically set the client to the case's client
      if (field === 'caseId' && value) {
        const selectedCase = cases.find(c => c.id === value);
        if (selectedCase && selectedCase.client) {
          newData.clientId = selectedCase.client.id;
        }
      }
      
      // When case is cleared, also clear the client
      if (field === 'caseId' && !value) {
        newData.clientId = '';
      }
      
      return newData;
    });
    
    // Clear error when user makes changes
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getAppointmentTypeLabel = (type: string): string => {
    return t(`Appointments.type.${type}`, { default: type.replace('_', ' ') });
  };

  const getAppointmentStatusLabel = (status: string): string => {
    return t(`Appointments.status.${status}`, { default: status.replace('_', ' ') });
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">{t('Common.loading')}</div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Appointments.titleLabel')} *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('Appointments.titleLabel')}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Appointments.typeLabel')} *
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.type ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {Object.values(AppointmentType).map(type => (
              <option key={type} value={type}>
                {getAppointmentTypeLabel(type)}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Appointments.statusLabel')} *
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.status ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {Object.values(AppointmentStatus).map(status => (
              <option key={status} value={status}>
                {getAppointmentStatusLabel(status)}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status}</p>
          )}
        </div>

        {/* Case */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Cases.case')}
          </label>
          <select
            value={formData.caseId}
            onChange={(e) => handleInputChange('caseId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('Appointments.select.selectCase')}</option>
            {cases.map(caseItem => (
              <option key={caseItem.id} value={caseItem.id}>
                {caseItem.case_number} - {caseItem.title}
              </option>
            ))}
          </select>
        </div>

        {/* Client */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Clients.client')}
          </label>
          {formData.caseId ? (
            // Show read-only client when case is selected
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
              {(() => {
                const selectedCase = cases.find(c => c.id === formData.caseId);
                return selectedCase?.client 
                  ? `${selectedCase.client.first_name} ${selectedCase.client.last_name} ${t('Appointments.select.autoAssigned')}`
                  : t('Appointments.select.noClientAssigned');
              })()}
            </div>
          ) : (
            // Allow client selection when no case is selected
            <select
              value={formData.clientId}
              onChange={(e) => handleInputChange('clientId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('Appointments.select.selectClient')}</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.first_name} {client.last_name}
                </option>
              ))}
            </select>
          )}
          {formData.caseId && (
            <p className="mt-1 text-xs text-gray-500">
              {t('Appointments.select.clientAutoAssigned')}
            </p>
          )}
        </div>

        {/* Scheduled Date & Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Appointments.dateTime')} *
          </label>
          <input
            type="datetime-local"
            value={formData.scheduled_at}
            onChange={(e) => handleInputChange('scheduled_at', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.scheduled_at ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.scheduled_at && (
            <p className="mt-1 text-sm text-red-600">{errors.scheduled_at}</p>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Appointments.duration')} ({t('Appointments.minutes')}) *
          </label>
          <input
            type="number"
            min="15"
            step="15"
            value={formData.duration_minutes}
            onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.duration_minutes ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.duration_minutes && (
            <p className="mt-1 text-sm text-red-600">{errors.duration_minutes}</p>
          )}
        </div>

        {/* Location */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Appointments.location')}
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('Appointments.placeholder.location')}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('Appointments.description')}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t('Appointments.placeholder.description')}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('Appointments.notes')}
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t('Appointments.placeholder.notes')}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          {t('Appointments.cancel')}
        </button>
        <button
          type="submit" 
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? t('Common.loading', { default: 'Loading...' }) : t('Appointments.save')}
        </button>
      </div>
    </form>
  );
}
