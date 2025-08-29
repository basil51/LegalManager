'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiClient, Invoice, Client, PaymentStatus, PaymentMethod } from '@/lib/api-client';
import { useToast } from '@/contexts/ToastContext';
import { CreatePaymentGuard } from '@/components/PermissionGuard';

export default function CreatePaymentPage() {
  const t = useTranslations();
  const router = useRouter();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  const [formData, setFormData] = useState({
    clientId: '',
    invoiceId: '',
    amount: '',
    payment_date: '',
    payment_method: PaymentMethod.CASH,
    status: PaymentStatus.COMPLETED,
    reference_number: '',
    notes: '',
  });

  // Check authentication and load data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/en/login');
      return;
    }
    
    loadFormData();
  }, [router]);

  const loadFormData = async () => {
    try {
      setLoading(true);
      const [invoicesData, clientsData] = await Promise.all([
        apiClient.getInvoices(),
        apiClient.getClients(),
      ]);
      setInvoices(invoicesData);
      setClients(clientsData);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClientChange = (clientId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      clientId: clientId,
      invoiceId: '' // Reset invoice when client changes
    }));
  };

  const handleInvoiceChange = (invoiceId: string) => {
    setFormData(prev => ({ ...prev, invoiceId: invoiceId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId) {
      addToast('error', t('Payments.errors.clientRequired'));
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      addToast('error', t('Payments.errors.amountRequired'));
      return;
    }

    try {
      setSubmitting(true);
      
      const paymentData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      await apiClient.createPayment(paymentData);
      addToast('success', t('Payments.createSuccess'));
      router.push('/payments');
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to create payment');
      console.error('Error creating payment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('Common.loading')}</div>
      </div>
    );
  }

  return (
    <CreatePaymentGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{t('Payments.createPayment')}</h1>
          <button
            onClick={() => router.back()}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            {t('Common.cancel')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('Payments.basicInformation')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Payments.client')} *
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">{t('Payments.selectClient')}</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Payments.invoice')}
                </label>
                <select
                  value={formData.invoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('Payments.selectInvoice')}</option>
                  {invoices
                    .filter(invoice => !formData.clientId || invoice.client.id === formData.clientId)
                    .map((invoice) => (
                      <option key={invoice.id} value={invoice.id}>
                        {invoice.invoice_number} - {formatCurrency(invoice.total_amount)}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Payments.amount')} *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder={t('Payments.amountPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Payments.paymentDate')}
                </label>
                <input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => handleInputChange('payment_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Payments.paymentMethodLabel')}
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => handleInputChange('payment_method', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={PaymentMethod.CASH}>{t('Payments.paymentMethod.cash')}</option>
                  <option value={PaymentMethod.CHECK}>{t('Payments.paymentMethod.check')}</option>
                  <option value={PaymentMethod.BANK_TRANSFER}>{t('Payments.paymentMethod.bankTransfer')}</option>
                  <option value={PaymentMethod.CREDIT_CARD}>{t('Payments.paymentMethod.creditCard')}</option>
                  <option value={PaymentMethod.DEBIT_CARD}>{t('Payments.paymentMethod.debitCard')}</option>
                  <option value={PaymentMethod.OTHER}>{t('Payments.paymentMethod.other')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Payments.statusLabel')}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={PaymentStatus.PENDING}>{t('Payments.status.pending')}</option>
                  <option value={PaymentStatus.COMPLETED}>{t('Payments.status.completed')}</option>
                  <option value={PaymentStatus.FAILED}>{t('Payments.status.failed')}</option>
                  <option value={PaymentStatus.CANCELLED}>{t('Payments.status.cancelled')}</option>
                  <option value={PaymentStatus.REFUNDED}>{t('Payments.status.refunded')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Payments.referenceNumber')}
                </label>
                <input
                  type="text"
                  value={formData.reference_number}
                  onChange={(e) => handleInputChange('reference_number', e.target.value)}
                  placeholder={t('Payments.referenceNumberPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('Payments.additionalInformation')}</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Payments.notes')}
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                placeholder={t('Payments.notesPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              {t('Common.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
            >
              {submitting ? t('Common.saving') : t('Payments.createPayment')}
            </button>
          </div>
        </form>
      </div>
    </CreatePaymentGuard>
  );
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
