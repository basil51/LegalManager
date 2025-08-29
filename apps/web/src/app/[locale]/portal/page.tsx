'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiClient, Invoice, Payment, Case } from '@/lib/api-client';
import { useToast } from '@/contexts/ToastContext';

export default function ClientPortalPage() {
  const t = useTranslations();
  const router = useRouter();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payments' | 'cases'>('overview');

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/en/login');
      return;
    }
    
    loadClientData();
  }, [router]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      // For now, we'll load all data. In a real implementation, 
      // this would be filtered by the current client's ID
      const [invoicesData, paymentsData, casesData] = await Promise.all([
        apiClient.getInvoices(),
        apiClient.getPayments(),
        apiClient.getCases(),
      ]);
      setInvoices(invoicesData);
      setPayments(paymentsData);
      setCases(casesData);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching client data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'sent':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600';
      case 'partially_paid':
      case 'refunded':
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

  const getTotalOutstanding = () => {
    return invoices.reduce((total, invoice) => {
      const totalPaid = payments
        .filter(payment => payment.invoice?.id === invoice.id)
        .reduce((sum, payment) => sum + payment.amount, 0);
      return total + (invoice.total_amount - totalPaid);
    }, 0);
  };

  const getTotalPaid = () => {
    return payments.reduce((total, payment) => total + payment.amount, 0);
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
        <h1 className="text-2xl font-bold text-gray-900">{t('Portal.title')}</h1>
        <div className="text-sm text-gray-600">
          {t('Portal.welcomeMessage')}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('Portal.overview')}
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'invoices'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('Portal.invoices')} ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('Portal.payments')} ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('cases')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cases'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('Portal.cases')} ({cases.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('Portal.totalInvoices')}</h3>
                <p className="text-3xl font-bold text-blue-600">{invoices.length}</p>
                <p className="text-sm text-gray-600 mt-2">{t('Portal.totalAmount')}: {formatCurrency(invoices.reduce((sum, invoice) => sum + invoice.total_amount, 0))}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('Portal.totalPaid')}</h3>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(getTotalPaid())}</p>
                <p className="text-sm text-gray-600 mt-2">{t('Portal.paymentsCount')}: {payments.length}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('Portal.outstanding')}</h3>
                <p className="text-3xl font-bold text-red-600">{formatCurrency(getTotalOutstanding())}</p>
                <p className="text-sm text-gray-600 mt-2">{t('Portal.requiresAttention')}</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Portal.recentActivity')}</h3>
              
              <div className="space-y-4">
                {invoices.slice(0, 5).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
                      <p className="text-sm text-gray-600">{formatDate(invoice.issue_date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(invoice.total_amount)}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {t(`Invoices.status.${invoice.status}`)}
                      </span>
                    </div>
                  </div>
                ))}
                
                {invoices.length === 0 && (
                  <p className="text-gray-500 text-center py-4">{t('Portal.noRecentActivity')}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {invoices.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {t('Portal.noInvoices')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Portal.invoiceNumber')}
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Portal.issueDate')}
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Portal.dueDate')}
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Portal.amount')}
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Portal.status')}
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
                          {formatDate(invoice.issue_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(invoice.due_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(invoice.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                            {t(`Invoices.status.${invoice.status}`)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {payments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {t('Portal.noPayments')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Portal.paymentDate')}
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Portal.invoice')}
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Portal.amount')}
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Portal.method')}
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Portal.status')}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'cases' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {cases.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {t('Portal.noCases')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Portal.caseNumber')}
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Portal.title')}
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Portal.type')}
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Portal.status')}
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Portal.assignedLawyer')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cases.map((case_) => (
                      <tr key={case_.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {case_.case_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {case_.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {t(`Cases.type.${case_.type}`)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(case_.status)}`}>
                            {t(`Cases.status.${case_.status}`)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {case_.assigned_lawyer.display_name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
