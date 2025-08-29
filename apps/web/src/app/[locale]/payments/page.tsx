'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiClient, Payment, PaymentStatus, Invoice, Client } from '@/lib/api-client';
import { useToast } from '@/contexts/ToastContext';
import { CreatePaymentGuard, DeletePaymentGuard } from '@/components/PermissionGuard';

export default function PaymentsPage() {
  const t = useTranslations();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | ''>('');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<string>('');

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/en/login');
      return;
    }
    
    loadData();
    loadPayments();
  }, [router]);

  const loadData = async () => {
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

  const loadPayments = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      if (selectedStatus) filters.status = selectedStatus;
      if (selectedClient) filters.clientId = selectedClient;
      if (selectedInvoice) filters.invoiceId = selectedInvoice;
      
      const paymentsData = await apiClient.getPayments(filters);
      setPayments(paymentsData);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to fetch payments');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadPayments();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedClient('');
    setSelectedInvoice('');
    loadPayments();
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm(t('Payments.deleteConfirm'))) {
      return;
    }

    try {
      await apiClient.deletePayment(id);
      addToast('success', t('Payments.deleteSuccess'));
      await loadPayments();
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to delete payment');
      console.error('Error deleting payment:', err);
    }
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case PaymentStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case PaymentStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case PaymentStatus.CANCELLED:
        return 'bg-gray-100 text-gray-600';
      case PaymentStatus.REFUNDED:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('Common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('Payments.title')}</h1>
        <CreatePaymentGuard>
          <button
            onClick={() => router.push('/payments/new')}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            {t('Payments.createPayment')}
          </button>
        </CreatePaymentGuard>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Payments.search')}
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('Payments.searchPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Payments.statusLabel')}
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as PaymentStatus | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('Payments.allStatuses')}</option>
              <option value={PaymentStatus.PENDING}>{t('Payments.status.pending')}</option>
              <option value={PaymentStatus.COMPLETED}>{t('Payments.status.completed')}</option>
              <option value={PaymentStatus.FAILED}>{t('Payments.status.failed')}</option>
              <option value={PaymentStatus.CANCELLED}>{t('Payments.status.cancelled')}</option>
              <option value={PaymentStatus.REFUNDED}>{t('Payments.status.refunded')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Payments.client')}
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('Payments.allClients')}</option>
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
              value={selectedInvoice}
              onChange={(e) => setSelectedInvoice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('Payments.allInvoices')}</option>
              {invoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoice_number} - {invoice.client.first_name} {invoice.client.last_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            {t('Common.search')}
          </button>
          <button
            onClick={handleClearFilters}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            {t('Common.clear')}
          </button>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {t('Payments.noPayments')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Payments.paymentDate')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Payments.client')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Payments.invoice')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Payments.amount')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Payments.paymentMethod')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Payments.statusLabel')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Payments.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payment.payment_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.client.first_name} {payment.client.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.invoice ? payment.invoice.invoice_number : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.payment_method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {t(`Payments.status.${payment.status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/payments/${payment.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {t('Common.view')}
                        </button>
                        <button
                          onClick={() => router.push(`/payments/${payment.id}/edit`)}
                          className="text-green-600 hover:text-green-900"
                        >
                          {t('Common.edit')}
                        </button>
                        <DeletePaymentGuard>
                          <button
                            onClick={() => handleDeletePayment(payment.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            {t('Common.delete')}
                          </button>
                        </DeletePaymentGuard>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
