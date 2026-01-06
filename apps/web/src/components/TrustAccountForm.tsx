'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { apiClient, TrustAccount, CreateTrustAccountDto, UpdateTrustAccountDto, Client, Case } from '@/lib/api-client';

interface TrustAccountFormProps {
  accountData?: TrustAccount;
  onSubmit: (data: CreateTrustAccountDto | UpdateTrustAccountDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function TrustAccountForm({ accountData, onSubmit, onCancel, loading = false }: TrustAccountFormProps) {
  const t = useTranslations();
  const [formData, setFormData] = useState<CreateTrustAccountDto>({
    clientId: '',
    caseId: undefined,
    account_number: '',
    bank_name: '',
    bank_account_number: '',
    routing_number: '',
    initial_balance: 0,
    notes: '',
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchFormData();
  }, []);

  useEffect(() => {
    if (accountData) {
      setFormData({
        clientId: accountData.client.id,
        caseId: accountData.case?.id,
        account_number: accountData.account_number,
        bank_name: accountData.bank_name || '',
        bank_account_number: accountData.bank_account_number || '',
        routing_number: accountData.routing_number || '',
        initial_balance: Number(accountData.balance),
        notes: accountData.notes || '',
      });
    }
  }, [accountData]);

  const fetchFormData = async () => {
    try {
      setLoadingData(true);
      const [clientsData, casesData] = await Promise.all([
        apiClient.getClients(),
        apiClient.getCases(),
      ]);
      setClients(clientsData);
      setCases(casesData);
    } catch (err) {
      console.error('Error fetching form data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = t('TrustAccounts.errors.clientRequired');
    }

    if (!formData.account_number.trim()) {
      newErrors.account_number = t('TrustAccounts.errors.accountNumberRequired');
    }

    if (formData.initial_balance && formData.initial_balance < 0) {
      newErrors.initial_balance = t('TrustAccounts.errors.invalidBalance');
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
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleInputChange = (field: keyof CreateTrustAccountDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Filter cases by selected client
  const filteredCases = formData.clientId
    ? cases.filter(c => c.client.id === formData.clientId)
    : [];

  if (loadingData) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">{t('Common.loading')}</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Clients.client')} *
          </label>
          <select
            value={formData.clientId}
            onChange={(e) => {
              handleInputChange('clientId', e.target.value);
              // Clear case selection when client changes
              handleInputChange('caseId', undefined);
            }}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.clientId ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={!!accountData}
          >
            <option value="">{t('TrustAccounts.selectClient')}</option>
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

        {/* Case */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Cases.case')}
          </label>
          <select
            value={formData.caseId || ''}
            onChange={(e) => handleInputChange('caseId', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!formData.clientId}
          >
            <option value="">{t('TrustAccounts.selectCase')}</option>
            {filteredCases.map((caseItem) => (
              <option key={caseItem.id} value={caseItem.id}>
                {caseItem.case_number} - {caseItem.title}
              </option>
            ))}
          </select>
        </div>

        {/* Account Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('TrustAccounts.accountNumber')} *
          </label>
          <input
            type="text"
            value={formData.account_number}
            onChange={(e) => handleInputChange('account_number', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.account_number ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('TrustAccounts.accountNumberPlaceholder')}
            disabled={!!accountData}
          />
          {errors.account_number && (
            <p className="mt-1 text-sm text-red-600">{errors.account_number}</p>
          )}
        </div>

        {/* Bank Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('TrustAccounts.bankName')}
          </label>
          <input
            type="text"
            value={formData.bank_name}
            onChange={(e) => handleInputChange('bank_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('TrustAccounts.bankNamePlaceholder')}
          />
        </div>

        {/* Bank Account Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('TrustAccounts.bankAccountNumber')}
          </label>
          <input
            type="text"
            value={formData.bank_account_number}
            onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('TrustAccounts.bankAccountNumberPlaceholder')}
          />
        </div>

        {/* Routing Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('TrustAccounts.routingNumber')}
          </label>
          <input
            type="text"
            value={formData.routing_number}
            onChange={(e) => handleInputChange('routing_number', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('TrustAccounts.routingNumberPlaceholder')}
          />
        </div>

        {/* Initial Balance */}
        {!accountData && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('TrustAccounts.initialBalance')}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.initial_balance || 0}
              onChange={(e) => handleInputChange('initial_balance', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.initial_balance ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('TrustAccounts.initialBalancePlaceholder')}
            />
            {errors.initial_balance && (
              <p className="mt-1 text-sm text-red-600">{errors.initial_balance}</p>
            )}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('TrustAccounts.notes')}
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t('TrustAccounts.notesPlaceholder')}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          {t('Common.cancel')}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('Common.loading') : t('Common.save')}
        </button>
      </div>
    </form>
  );
}
