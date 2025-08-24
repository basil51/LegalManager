'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { apiClient, Case, CreateCaseDto, UpdateCaseDto, CaseStatus, CaseType, Client, Court, User } from '@/lib/api-client';

interface CaseFormProps {
  caseData?: Case;
  onSubmit: (data: CreateCaseDto | UpdateCaseDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function CaseForm({ caseData, onSubmit, onCancel, loading = false }: CaseFormProps) {
  const t = useTranslations();
  const [formData, setFormData] = useState<CreateCaseDto>({
    clientId: '',
    courtId: undefined,
    assignedLawyerId: '',
    case_number: '',
    title: '',
    description: '',
    status: CaseStatus.OPEN,
    type: CaseType.OTHER,
    filing_date: null,
    hearing_date: null,
    notes: '',
    is_active: true,
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [lawyers, setLawyers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [refreshingClients, setRefreshingClients] = useState(false);

  useEffect(() => {
    if (caseData) {
      setFormData({
        clientId: caseData.client.id,
        courtId: caseData.court?.id || undefined,
        assignedLawyerId: caseData.assigned_lawyer.id,
        case_number: caseData.case_number,
        title: caseData.title,
        description: caseData.description || '',
        status: caseData.status,
        type: caseData.type,
        filing_date: caseData.filing_date,
        hearing_date: caseData.hearing_date,
        notes: caseData.notes || '',
        is_active: caseData.is_active,
      });
    }
  }, [caseData]);

  useEffect(() => {
    fetchFormData();
  }, []); // Empty dependency array - only run on mount

  const fetchFormData = async () => {
    try {
      setLoadingData(true);
      console.log('Fetching form data...');
      
      const [clientsData, courtsData, lawyersData] = await Promise.all([
        apiClient.getClients(),
        apiClient.getCourts(),
        apiClient.getUsers(),
      ]);
      
      console.log('Clients data:', clientsData);
      console.log('Courts data:', courtsData);
      console.log('Lawyers data:', lawyersData);
      
      setClients(clientsData);
      setCourts(courtsData);
      setLawyers(lawyersData);
    } catch (error) {
      console.error('Error fetching form data:', error);
      // Show error to user
      alert(`Error loading form data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingData(false);
    }
  };

  const refreshClients = async () => {
    try {
      setRefreshingClients(true);
      const clientsData = await apiClient.getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Error refreshing clients:', error);
    } finally {
      setRefreshingClients(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = t('Cases.requiredField');
    }
    if (!formData.assignedLawyerId) {
      newErrors.assignedLawyerId = t('Cases.requiredField');
    }
    if (!formData.case_number.trim()) {
      newErrors.case_number = t('Cases.requiredField');
    }
    if (!formData.title.trim()) {
      newErrors.title = t('Cases.requiredField');
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
      // Prepare data for API - convert empty strings to null/undefined and format dates
      const apiData = {
        ...formData,
        courtId: formData.courtId || undefined, // Convert empty string to undefined
        filing_date: formData.filing_date ? new Date(formData.filing_date).toISOString() : null,
        hearing_date: formData.hearing_date ? new Date(formData.hearing_date).toISOString() : null,
      };
      
      await onSubmit(apiData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleInputChange = (field: keyof CreateCaseDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">{t('Common.loading')}</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Case Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Cases.caseNumber')} *
          </label>
          <input
            type="text"
            value={formData.case_number}
            onChange={(e) => handleInputChange('case_number', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.case_number ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('Cases.placeholder.caseNumber')}
          />
          {errors.case_number && (
            <p className="mt-1 text-sm text-red-600">{errors.case_number}</p>
          )}
        </div>

        {/* Case Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Cases.caseTitle')} *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('Cases.placeholder.caseTitle')}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Client */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">
              {t('Cases.client')} *
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={refreshClients}
                disabled={refreshingClients}
                className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {refreshingClients ? t('Cases.select.refreshing') : t('Cases.select.refresh')}
              </button>
              <button
                type="button"
                onClick={() => {
                  const currentLocale = window.location.pathname.split('/')[1] || 'en';
                  window.open(`/${currentLocale}/clients/new`, '_blank');
                }}
                className="text-xs text-green-600 hover:text-green-800"
              >
                {t('Cases.select.addNew')}
              </button>
            </div>
          </div>
          <select
            value={formData.clientId}
            onChange={(e) => handleInputChange('clientId', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.clientId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">{t('Cases.select.selectClient')}</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.first_name} {client.last_name}
              </option>
            ))}
          </select>
          {errors.clientId && (
            <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>
          )}
        </div>

        {/* Assigned Lawyer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Cases.assignedLawyer')} *
          </label>
          <select
            value={formData.assignedLawyerId}
            onChange={(e) => handleInputChange('assignedLawyerId', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.assignedLawyerId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">{t('Cases.select.selectLawyer')}</option>
            {lawyers.map((lawyer) => (
              <option key={lawyer.id} value={lawyer.id}>
                {lawyer.display_name}
              </option>
            ))}
          </select>
          {errors.assignedLawyerId && (
            <p className="mt-1 text-sm text-red-600">{errors.assignedLawyerId}</p>
          )}
        </div>

        {/* Court */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Cases.court')}
          </label>
          <select
            value={formData.courtId || ''}
            onChange={(e) => handleInputChange('courtId', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('Cases.select.selectCourt')}</option>
            {courts.map((court) => (
              <option key={court.id} value={court.id}>
                {court.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Cases.statusLabel')}
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value as CaseStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={CaseStatus.OPEN}>{t('Cases.status.open')}</option>
            <option value={CaseStatus.CLOSED}>{t('Cases.status.closed')}</option>
            <option value={CaseStatus.PENDING}>{t('Cases.status.pending')}</option>
            <option value={CaseStatus.ON_HOLD}>{t('Cases.status.on_hold')}</option>
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Cases.typeLabel')}
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value as CaseType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={CaseType.CIVIL}>{t('Cases.type.civil')}</option>
            <option value={CaseType.CRIMINAL}>{t('Cases.type.criminal')}</option>
            <option value={CaseType.FAMILY}>{t('Cases.type.family')}</option>
            <option value={CaseType.CORPORATE}>{t('Cases.type.corporate')}</option>
            <option value={CaseType.REAL_ESTATE}>{t('Cases.type.real_estate')}</option>
            <option value={CaseType.OTHER}>{t('Cases.type.other')}</option>
          </select>
        </div>

        {/* Filing Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Cases.filingDate')}
          </label>
          <input
            type="date"
            value={formData.filing_date || ''}
            onChange={(e) => handleInputChange('filing_date', e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Hearing Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Cases.hearingDate')}
          </label>
          <input
            type="date"
            value={formData.hearing_date || ''}
            onChange={(e) => handleInputChange('hearing_date', e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('Cases.description')}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t('Cases.placeholder.caseDescription')}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('Cases.notes')}
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t('Cases.placeholder.notes')}
        />
      </div>

      {/* Active Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => handleInputChange('is_active', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
          {formData.is_active ? t('Cases.active') : t('Cases.inactive')}
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          {t('Cases.cancel')}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('Common.loading') : t('Cases.save')}
        </button>
      </div>
    </form>
  );
}
