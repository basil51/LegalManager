'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiClient, TrustAccount, Client, Case } from '@/lib/api-client';
import { useToast } from '@/contexts/ToastContext';
import { CreateTrustAccountGuard, DeleteTrustAccountGuard } from '@/components/PermissionGuard';
import Link from 'next/link';

export default function TrustAccountsPage() {
  const t = useTranslations();
  const router = useRouter();
  const [trustAccounts, setTrustAccounts] = useState<TrustAccount[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/en/login');
      return;
    }
    
    loadData();
    loadTrustAccounts();
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientsData, casesData] = await Promise.all([
        apiClient.getClients(),
        apiClient.getCases(),
      ]);
      setClients(clientsData);
      setCases(casesData);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTrustAccounts = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      if (selectedClient) filters.clientId = selectedClient;
      
      const accountsData = await apiClient.getTrustAccounts(filters);
      setTrustAccounts(accountsData);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to fetch trust accounts');
      console.error('Error fetching trust accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadTrustAccounts();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedClient('');
    loadTrustAccounts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('TrustAccounts.confirmDelete'))) {
      return;
    }

    try {
      await apiClient.deleteTrustAccount(id);
      addToast('success', t('TrustAccounts.deleteSuccess'));
      loadTrustAccounts();
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to delete trust account');
    }
  };

  if (loading && trustAccounts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('Common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('TrustAccounts.title')}</h1>
        <CreateTrustAccountGuard>
          <Link
            href="/trust-accounts/new"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            {t('TrustAccounts.createAccount')}
          </Link>
        </CreateTrustAccountGuard>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Common.search')}
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('TrustAccounts.searchPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Clients.client')}
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('TrustAccounts.allClients')}</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.first_name} {client.last_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
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
      </div>

      {/* Trust Accounts Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('TrustAccounts.accountNumber')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('Clients.client')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('Cases.case')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('TrustAccounts.bankName')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('TrustAccounts.balance')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('Common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trustAccounts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  {t('TrustAccounts.noAccounts')}
                </td>
              </tr>
            ) : (
              trustAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {account.account_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {account.client.first_name} {account.client.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {account.case ? account.case.case_number : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {account.bank_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${Number(account.balance).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Link
                        href={`/trust-accounts/${account.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {t('Common.view')}
                      </Link>
                      <DeleteTrustAccountGuard>
                        <button
                          onClick={() => handleDelete(account.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          {t('Common.delete')}
                        </button>
                      </DeleteTrustAccountGuard>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
