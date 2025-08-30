'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiClient, Invoice, Payment } from '@/lib/api-client';
import { useToast } from '@/contexts/ToastContext';
import { DeleteInvoiceGuard } from '@/components/PermissionGuard';

export default function InvoiceDetailPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const invoiceId = params.id as string;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/en/login');
      return;
    }
    
    loadInvoiceData();
  }, [invoiceId, router]);

  const loadInvoiceData = async () => {
    try {
      setLoading(true);
      const [invoiceData, paymentsData] = await Promise.all([
        apiClient.getInvoiceById(invoiceId),
        apiClient.getPayments({ invoiceId }),
      ]);
      setInvoice(invoiceData);
      setPayments(paymentsData);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to fetch invoice data');
      console.error('Error fetching invoice data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!confirm(t('Invoices.deleteConfirm'))) {
      return;
    }

    try {
      await apiClient.deleteInvoice(invoiceId);
      addToast('success', t('Invoices.deleteSuccess'));
      router.push('/invoices');
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to delete invoice');
      console.error('Error deleting invoice:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600';
      case 'partially_paid':
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

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('Common.error')}</div>
      </div>
    );
  }

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const balanceDue = invoice.total_amount - totalPaid;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('Invoices.invoiceNumber')}: {invoice.invoice_number}
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => router.push(`/invoices/${invoiceId}/edit`)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            {t('Common.edit')}
          </button>
          <DeleteInvoiceGuard>
            <button
              onClick={handleDeleteInvoice}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
            >
              {t('Common.delete')}
            </button>
          </DeleteInvoiceGuard>
          <button
            onClick={() => router.back()}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            {t('Common.close')}
          </button>
        </div>
      </div>

      {/* Invoice Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('Invoices.basicInformation')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('Invoices.client')}</label>
                <p className="text-sm text-gray-900">
                  {invoice.client.first_name} {invoice.client.last_name}
                </p>
              </div>
              
              {invoice.case && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('Invoices.case')}</label>
                  <p className="text-sm text-gray-900">
                    {invoice.case.case_number} - {invoice.case.title}
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('Invoices.statusLabel')}</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                  {t(`Invoices.status.${invoice.status}`)}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('Invoices.issueDate')}</label>
                <p className="text-sm text-gray-900">
                  {invoice.issue_date ? formatDate(invoice.issue_date) : '-'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('Invoices.dueDate')}</label>
                <p className="text-sm text-gray-900">
                  {invoice.due_date ? formatDate(invoice.due_date) : '-'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('Invoices.totalAmount')}</label>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(invoice.total_amount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('Invoices.items')}</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('Invoices.description')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('Invoices.quantity')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('Invoices.unitPrice')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('Invoices.amount')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.total_amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-right">
          <div className="text-lg font-semibold text-gray-900">
            {t('Invoices.total')}: {formatCurrency(invoice.total_amount)}
          </div>
        </div>
      </div>

      {/* Payments */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payments</h2>
        
        {payments.length === 0 ? (
          <p className="text-gray-500">No payments recorded for this invoice.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payment.payment_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.payment_method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.reference_number || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Paid:</span>
            <span className="font-medium">{formatCurrency(totalPaid)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span className="text-gray-900">{t('Invoices.balanceDue')}:</span>
            <span className={balanceDue > 0 ? 'text-red-600' : 'text-green-600'}>
              {formatCurrency(balanceDue)}
            </span>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      {(invoice.notes || invoice.terms_and_conditions) && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('Invoices.additionalInformation')}</h2>
          
          <div className="space-y-4">
            {invoice.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Invoices.notes')}</label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
            
            {invoice.terms_and_conditions && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Invoices.terms')}</label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{invoice.terms_and_conditions}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
