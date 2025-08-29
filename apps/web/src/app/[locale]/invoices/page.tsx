'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiClient, Invoice, InvoiceStatus, Case, Client } from '@/lib/api-client';
import { useToast } from '@/contexts/ToastContext';
import { CreateInvoiceGuard, DeleteInvoiceGuard } from '@/components/PermissionGuard';

export default function InvoicesPage() {
  const t = useTranslations();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | ''>('');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedCase, setSelectedCase] = useState<string>('');

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/en/login');
      return;
    }
    
    loadData();
    loadInvoices();
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [casesData, clientsData] = await Promise.all([
        apiClient.getCases(),
        apiClient.getClients(),
      ]);
      setCases(casesData);
      setClients(clientsData);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      if (selectedStatus) filters.status = selectedStatus;
      if (selectedClient) filters.clientId = selectedClient;
      if (selectedCase) filters.caseId = selectedCase;
      
      const invoicesData = await apiClient.getInvoices(filters);
      setInvoices(invoicesData);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to fetch invoices');
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadInvoices();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedClient('');
    setSelectedCase('');
    loadInvoices();
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm(t('Invoices.deleteConfirm'))) {
      return;
    }

    try {
      await apiClient.deleteInvoice(id);
      addToast('success', t('Invoices.deleteSuccess'));
      await loadInvoices();
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to delete invoice');
      console.error('Error deleting invoice:', err);
    }
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return 'bg-gray-100 text-gray-800';
      case InvoiceStatus.SENT:
        return 'bg-blue-100 text-blue-800';
      case InvoiceStatus.PAID:
        return 'bg-green-100 text-green-800';
      case InvoiceStatus.OVERDUE:
        return 'bg-red-100 text-red-800';
      case InvoiceStatus.CANCELLED:
        return 'bg-gray-100 text-gray-600';
      case InvoiceStatus.PARTIALLY_PAID:
        return 'bg-yellow-100 text-yellow-800';
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
        <h1 className="text-2xl font-bold text-gray-900">{t('Invoices.title')}</h1>
        <CreateInvoiceGuard>
          <button
            onClick={() => router.push('/invoices/new')}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            {t('Invoices.createInvoice')}
          </button>
        </CreateInvoiceGuard>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Invoices.search')}
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('Invoices.searchPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Invoices.statusLabel')}
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as InvoiceStatus | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('Invoices.allStatuses')}</option>
              <option value={InvoiceStatus.DRAFT}>{t('Invoices.status.draft')}</option>
              <option value={InvoiceStatus.SENT}>{t('Invoices.status.sent')}</option>
              <option value={InvoiceStatus.PAID}>{t('Invoices.status.paid')}</option>
              <option value={InvoiceStatus.OVERDUE}>{t('Invoices.status.overdue')}</option>
              <option value={InvoiceStatus.CANCELLED}>{t('Invoices.status.cancelled')}</option>
              <option value={InvoiceStatus.PARTIALLY_PAID}>{t('Invoices.status.partiallyPaid')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Invoices.client')}
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('Invoices.allClients')}</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.first_name} {client.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Invoices.case')}
            </label>
            <select
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('Invoices.allCases')}</option>
              {cases.map((case_) => (
                <option key={case_.id} value={case_.id}>
                  {case_.case_number} - {case_.title}
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

      {/* Invoices List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {invoices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {t('Invoices.noInvoices')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Invoices.invoiceNumber')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Invoices.client')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Invoices.case')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Invoices.totalAmount')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Invoices.balanceDue')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Invoices.statusLabel')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Invoices.dueDate')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Invoices.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.client.first_name} {invoice.client.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.case ? `${invoice.case.case_number} - ${invoice.case.title}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(invoice.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(invoice.balance_due)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {t(`Invoices.status.${invoice.status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(invoice.due_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/invoices/${invoice.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {t('Common.view')}
                        </button>
                        <button
                          onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
                          className="text-green-600 hover:text-green-900"
                        >
                          {t('Common.edit')}
                        </button>
                        <DeleteInvoiceGuard>
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            {t('Common.delete')}
                          </button>
                        </DeleteInvoiceGuard>
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
