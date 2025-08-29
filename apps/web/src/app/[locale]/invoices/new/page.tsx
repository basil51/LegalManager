'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiClient, Case, Client, InvoiceItem } from '@/lib/api-client';
import { useToast } from '@/contexts/ToastContext';
import { CreateInvoiceGuard } from '@/components/PermissionGuard';

interface InvoiceItemForm {
  description: string;
  type: 'service' | 'expense' | 'disbursement' | 'fee' | 'other';
  quantity: number;
  unit_price: number;
  amount: number;
}

export default function CreateInvoicePage() {
  const t = useTranslations();
  const router = useRouter();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  const [formData, setFormData] = useState({
    clientId: '',
    caseId: '',
    title: '',
    invoice_number: '',
    issue_date: '',
    due_date: '',
    notes: '',
    terms_and_conditions: '',
  });
  
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItemForm[]>([
    { description: '', type: 'service', quantity: 1, unit_price: 0, amount: 0 }
  ]);

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClientChange = (clientId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      clientId: clientId,
      caseId: '' // Reset case when client changes
    }));
  };

  const handleCaseChange = (caseId: string) => {
    setFormData(prev => ({ ...prev, caseId: caseId }));
  };

  const updateInvoiceItem = (index: number, field: keyof InvoiceItemForm, value: string | number) => {
    const newItems = [...invoiceItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate amount
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = field === 'quantity' ? Number(value) : newItems[index].quantity;
      const unitPrice = field === 'unit_price' ? Number(value) : newItems[index].unit_price;
      newItems[index].amount = quantity * unitPrice;
    }
    
    setInvoiceItems(newItems);
  };

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { description: '', type: 'service', quantity: 1, unit_price: 0, amount: 0 }]);
  };

  const removeInvoiceItem = (index: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    }
  };

  const getTotalAmount = () => {
    return invoiceItems.reduce((total, item) => total + item.amount, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId) {
      addToast('error', t('Invoices.errors.clientRequired'));
      return;
    }

    if (!formData.title) {
      addToast('error', t('Invoices.errors.titleRequired'));
      return;
    }

    if (invoiceItems.some(item => !item.description || item.amount <= 0)) {
      addToast('error', t('Invoices.errors.invalidItems'));
      return;
    }

    try {
      setSubmitting(true);
      
      const invoiceData = {
        ...formData,
        items: invoiceItems.map(item => ({
          description: item.description,
          type: item.type,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      };

      await apiClient.createInvoice(invoiceData);
      addToast('success', t('Invoices.createSuccess'));
      router.push('/invoices');
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to create invoice');
      console.error('Error creating invoice:', err);
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
    <CreateInvoiceGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{t('Invoices.createInvoice')}</h1>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('Invoices.basicInformation')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Invoices.title')} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={t('Invoices.titlePlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Invoices.client')} *
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">{t('Invoices.selectClient')}</option>
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
                  value={formData.caseId}
                  onChange={(e) => handleCaseChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('Invoices.selectCase')}</option>
                  {cases
                    .filter(case_ => !formData.clientId || case_.client.id === formData.clientId)
                    .map((case_) => (
                      <option key={case_.id} value={case_.id}>
                        {case_.case_number} - {case_.title}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Invoices.invoiceNumber')}
                </label>
                <input
                  type="text"
                  value={formData.invoice_number}
                  onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                  placeholder={t('Invoices.invoiceNumberPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Invoices.issueDate')}
                </label>
                <input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => handleInputChange('issue_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Invoices.dueDate')}
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleInputChange('due_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t('Invoices.items')}</h2>
              <button
                type="button"
                onClick={addInvoiceItem}
                className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors text-sm"
              >
                {t('Invoices.addItem')}
              </button>
            </div>

            <div className="space-y-4">
              {invoiceItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-end border-b border-gray-200 pb-4">
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('Invoices.description')} *
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                      placeholder={t('Invoices.descriptionPlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('Invoices.type')}
                    </label>
                    <select
                      value={item.type}
                      onChange={(e) => updateInvoiceItem(index, 'type', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="service">{t('Invoices.itemType.service')}</option>
                      <option value="expense">{t('Invoices.itemType.expense')}</option>
                      <option value="disbursement">{t('Invoices.itemType.disbursement')}</option>
                      <option value="fee">{t('Invoices.itemType.fee')}</option>
                      <option value="other">{t('Invoices.itemType.other')}</option>
                    </select>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('Invoices.quantity')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateInvoiceItem(index, 'quantity', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('Invoices.unitPrice')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateInvoiceItem(index, 'unit_price', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('Invoices.amount')}
                    </label>
                    <div className="px-3 py-2 bg-gray-100 rounded-md text-sm font-medium">
                      ${item.amount.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeInvoiceItem(index)}
                      disabled={invoiceItems.length === 1}
                      className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                    >
                      {t('Common.delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-right">
              <div className="text-lg font-semibold text-gray-900">
                {t('Invoices.total')}: ${getTotalAmount().toFixed(2)}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('Invoices.additionalInformation')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Invoices.notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  placeholder={t('Invoices.notesPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Invoices.terms')}
                </label>
                <textarea
                  value={formData.terms}
                  onChange={(e) => handleInputChange('terms', e.target.value)}
                  rows={3}
                  placeholder={t('Invoices.termsPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
              {submitting ? t('Common.saving') : t('Invoices.createInvoice')}
            </button>
          </div>
        </form>
      </div>
    </CreateInvoiceGuard>
  );
}
