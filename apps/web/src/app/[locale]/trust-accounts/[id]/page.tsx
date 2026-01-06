'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiClient, TrustAccount, TrustTransaction, TrustTransactionType, CreateTrustTransactionDto } from '@/lib/api-client';
import { useToast } from '@/contexts/ToastContext';
import { CreateTrustAccountGuard, DeleteTrustAccountGuard } from '@/components/PermissionGuard';
import Link from 'next/link';

export default function TrustAccountDetailPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  
  const [account, setAccount] = useState<TrustAccount | null>(null);
  const [transactions, setTransactions] = useState<TrustTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionFormData, setTransactionFormData] = useState<CreateTrustTransactionDto>({
    trust_account_id: '',
    transaction_type: TrustTransactionType.DEPOSIT,
    amount: 0,
    transaction_date: new Date().toISOString().split('T')[0],
  });

  const accountId = params.id as string;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/en/login');
      return;
    }
    
    loadAccountData();
  }, [accountId, router]);

  const loadAccountData = async () => {
    try {
      setLoading(true);
      const [accountData, transactionsData] = await Promise.all([
        apiClient.getTrustAccountById(accountId),
        apiClient.getTrustAccountTransactions(accountId),
      ]);
      setAccount(accountData);
      setTransactions(transactionsData);
      setTransactionFormData(prev => ({ ...prev, trust_account_id: accountId }));
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to fetch trust account data');
      console.error('Error fetching trust account data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm(t('TrustAccounts.confirmDelete'))) {
      return;
    }

    try {
      await apiClient.deleteTrustAccount(accountId);
      addToast('success', t('TrustAccounts.deleteSuccess'));
      const currentLocale = window.location.pathname.split('/')[1] || 'en';
      router.push(`/${currentLocale}/trust-accounts`);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to delete trust account');
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionFormData.amount || transactionFormData.amount <= 0) {
      addToast('error', t('TrustAccounts.errors.amountRequired'));
      return;
    }

    try {
      await apiClient.createTrustTransaction(accountId, transactionFormData);
      addToast('success', t('TrustAccounts.transactionCreated'));
      setShowTransactionForm(false);
      setTransactionFormData({
        trust_account_id: accountId,
        transaction_type: TrustTransactionType.DEPOSIT,
        amount: 0,
        transaction_date: new Date().toISOString().split('T')[0],
      });
      loadAccountData();
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to create transaction');
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

  const getTransactionTypeColor = (type: TrustTransactionType) => {
    switch (type) {
      case TrustTransactionType.DEPOSIT:
      case TrustTransactionType.INTEREST:
        return 'text-green-600';
      case TrustTransactionType.WITHDRAWAL:
      case TrustTransactionType.FEE:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('Common.loading')}</div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {t('TrustAccounts.accountNotFound')}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('TrustAccounts.accountNumber')}: {account.account_number}</h1>
          <p className="text-gray-600 mt-1">
            {account.client.first_name} {account.client.last_name}
            {account.case && ` - ${account.case.case_number}`}
          </p>
        </div>
        <div className="flex gap-2">
          <CreateTrustAccountGuard>
            <button
              onClick={() => setShowTransactionForm(!showTransactionForm)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              {t('TrustAccounts.createTransaction')}
            </button>
          </CreateTrustAccountGuard>
          <DeleteTrustAccountGuard>
            <button
              onClick={handleDeleteAccount}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
            >
              {t('Common.delete')}
            </button>
          </DeleteTrustAccountGuard>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('TrustAccounts.basicInformation')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('TrustAccounts.accountNumber')}</label>
            <p className="mt-1 text-sm text-gray-900">{account.account_number}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('TrustAccounts.balance')}</label>
            <p className="mt-1 text-sm font-bold text-gray-900">{formatCurrency(Number(account.balance))}</p>
          </div>
          {account.bank_name && (
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('TrustAccounts.bankName')}</label>
              <p className="mt-1 text-sm text-gray-900">{account.bank_name}</p>
            </div>
          )}
          {account.bank_account_number && (
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('TrustAccounts.bankAccountNumber')}</label>
              <p className="mt-1 text-sm text-gray-900">{account.bank_account_number}</p>
            </div>
          )}
          {account.routing_number && (
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('TrustAccounts.routingNumber')}</label>
              <p className="mt-1 text-sm text-gray-900">{account.routing_number}</p>
            </div>
          )}
          {account.notes && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">{t('TrustAccounts.notes')}</label>
              <p className="mt-1 text-sm text-gray-900">{account.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Form */}
      {showTransactionForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{t('TrustAccounts.createTransaction')}</h2>
          <form onSubmit={handleCreateTransaction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('TrustAccounts.transactionType')} *
                </label>
                <select
                  value={transactionFormData.transaction_type}
                  onChange={(e) => setTransactionFormData(prev => ({ ...prev, transaction_type: e.target.value as TrustTransactionType }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {Object.values(TrustTransactionType).map((type) => (
                    <option key={type} value={type}>
                      {t(`TrustAccounts.transactionTypes.${type}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('TrustAccounts.amount')} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={transactionFormData.amount}
                  onChange={(e) => setTransactionFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('TrustAccounts.transactionDate')} *
                </label>
                <input
                  type="date"
                  value={transactionFormData.transaction_date}
                  onChange={(e) => setTransactionFormData(prev => ({ ...prev, transaction_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('TrustAccounts.referenceNumber')}
                </label>
                <input
                  type="text"
                  value={transactionFormData.reference_number || ''}
                  onChange={(e) => setTransactionFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('TrustAccounts.description')}
              </label>
              <textarea
                value={transactionFormData.description || ''}
                onChange={(e) => setTransactionFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTransactionForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                {t('Common.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                {t('Common.save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">{t('TrustAccounts.transactions')}</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('TrustAccounts.transactionDate')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('TrustAccounts.transactionType')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('TrustAccounts.amount')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('TrustAccounts.description')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('TrustAccounts.referenceNumber')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('Common.createdBy')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  {t('TrustAccounts.noTransactions')}
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.transaction_date)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getTransactionTypeColor(transaction.transaction_type)}`}>
                    {t(`TrustAccounts.transactionTypes.${transaction.transaction_type}`)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getTransactionTypeColor(transaction.transaction_type)}`}>
                    {transaction.transaction_type === TrustTransactionType.DEPOSIT || transaction.transaction_type === TrustTransactionType.INTEREST
                      ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {transaction.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.reference_number || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.created_by.display_name}
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
