'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiClient, Case, CaseStatus, CaseType } from '@/lib/api-client';
import Link from 'next/link';
import { CreateCaseGuard, EditCaseGuard, DeleteCaseGuard } from '@/components/PermissionGuard';

export default function CasesPage() {
  const t = useTranslations();
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<CaseType | ''>('');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getCases();
      setCases(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cases');
      console.error('Error fetching cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = 
      caseItem.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${caseItem.client.first_name} ${caseItem.client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || caseItem.status === statusFilter;
    const matchesType = !typeFilter || caseItem.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case CaseStatus.OPEN:
        return 'bg-green-100 text-green-800';
      case CaseStatus.CLOSED:
        return 'bg-gray-100 text-gray-800';
      case CaseStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case CaseStatus.ON_HOLD:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: CaseType) => {
    switch (type) {
      case CaseType.CIVIL:
        return 'bg-blue-100 text-blue-800';
      case CaseType.CRIMINAL:
        return 'bg-red-100 text-red-800';
      case CaseType.FAMILY:
        return 'bg-pink-100 text-pink-800';
      case CaseType.CORPORATE:
        return 'bg-purple-100 text-purple-800';
      case CaseType.REAL_ESTATE:
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg">{t('Common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('Cases.title')}</h1>
        <CreateCaseGuard>
          <Link
            href="/cases/new"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            {t('Cases.newCase')}
          </Link>
        </CreateCaseGuard>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder={t('Cases.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CaseStatus | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('Cases.filter.allCasesStatus')}</option>
              <option value={CaseStatus.OPEN}>{t('Cases.status.open')}</option>
              <option value={CaseStatus.CLOSED}>{t('Cases.status.closed')}</option>
              <option value={CaseStatus.PENDING}>{t('Cases.status.pending')}</option>
              <option value={CaseStatus.ON_HOLD}>{t('Cases.status.on_hold')}</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as CaseType | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('Cases.filter.allCasesType')}</option>
              <option value={CaseType.CIVIL}>{t('Cases.type.civil')}</option>
              <option value={CaseType.CRIMINAL}>{t('Cases.type.criminal')}</option>
              <option value={CaseType.FAMILY}>{t('Cases.type.family')}</option>
              <option value={CaseType.CORPORATE}>{t('Cases.type.corporate')}</option>
              <option value={CaseType.REAL_ESTATE}>{t('Cases.type.real_estate')}</option>
              <option value={CaseType.OTHER}>{t('Cases.type.other')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Cases List */}
      <div className="bg-white rounded-lg shadow">
        {filteredCases.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {t('Cases.noCases')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Cases.caseNumber')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Cases.caseTitle')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Cases.client')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Cases.statusLabel')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Cases.typeLabel')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Cases.assignedLawyer')}
                  </th>
                  <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Cases.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {caseItem.case_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {caseItem.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {caseItem.client.first_name} {caseItem.client.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(caseItem.status)}`}>
                        {t(`Cases.status.${caseItem.status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(caseItem.type)}`}>
                        {t(`Cases.type.${caseItem.type}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {caseItem.assigned_lawyer.display_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium space-x-2">
                      <Link
                        href={`/cases/${caseItem.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {t('Cases.view')}
                      </Link>
                      <EditCaseGuard>
                        <Link
                          href={`/cases/${caseItem.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {t('Cases.edit')}
                        </Link>
                      </EditCaseGuard>
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
