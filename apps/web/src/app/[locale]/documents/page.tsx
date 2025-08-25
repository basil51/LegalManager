'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiClient, Document, DocumentType, Case, Client } from '@/lib/api-client';
import DocumentUploadModal from '@/components/DocumentUploadModal';
import PdfEmbedViewer from '@/components/viewers/PdfEmbedViewer';
import { useToast } from '@/contexts/ToastContext';
import { UploadDocumentGuard, DeleteDocumentGuard } from '@/components/PermissionGuard';

export default function DocumentsPage() {
  const t = useTranslations();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { addToast } = useToast();

  const [expandedDocumentId, setExpandedDocumentId] = useState<string | null>(null);
  const [inlinePreviewUrl, setInlinePreviewUrl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<DocumentType | ''>('');
  const [selectedCase, setSelectedCase] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [tagsFilter, setTagsFilter] = useState<string>('');

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Documents page - Authentication check:', { 
      hasToken: !!token, 
      tokenLength: token?.length,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
    });
    
    if (!token) {
      console.log('No token found, redirecting to login');
      router.push('/en/login');
      return;
    }
    
    console.log('Token found, proceeding with data loading');
    loadData();
    loadDocuments();
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

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      if (selectedType) filters.type = selectedType;
      if (selectedCase) filters.caseId = selectedCase;
      if (selectedClient) filters.clientId = selectedClient;
      if (tagsFilter) {
        const tags = tagsFilter.split(',').map(tag => tag.trim()).filter(Boolean);
        if (tags.length > 0) filters.tags = tags;
      }
      
      const documentsData = await apiClient.getDocuments(filters);
      setDocuments(documentsData);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to fetch documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = async () => {
    await loadDocuments();
    setShowUploadModal(false);
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await apiClient.deleteDocument(id);
      addToast('success', t('Documents.deleteSuccess'));
      await loadDocuments();
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to delete document');
      console.error('Error deleting document:', err);
    }
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      const blob = await apiClient.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.original_filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to download document');
      console.error('Error downloading document:', err);
    }
  };



  const handleToggleInlinePreview = async (doc: Document) => {
    try {
      if (expandedDocumentId === doc.id) {
        // Close the inline preview
        setExpandedDocumentId(null);
        if (inlinePreviewUrl && inlinePreviewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(inlinePreviewUrl);
        }
        setInlinePreviewUrl(null);
      } else {
        // Open inline preview
        setExpandedDocumentId(doc.id);
        
        if (doc.mime_type === 'application/pdf') {
          // Create blob URL with proper authentication
          const blob = await apiClient.downloadDocument(doc.id);
          // Create a new blob with a filename hint (though browsers may still ignore it)
          const url = URL.createObjectURL(blob);
          setInlinePreviewUrl(url);
        } else if (doc.mime_type.startsWith('image/')) {
          const url = await apiClient.getDocumentDownloadUrl(doc.id);
          setInlinePreviewUrl(url);
        }
      }
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to load inline preview');
      console.error('Error loading inline preview:', err);
    }
  };

  const isPreviewable = (mimeType: string): boolean => {
    // Images
    if (mimeType.startsWith('image/')) return true;
    
    // PDF
    if (mimeType === 'application/pdf') return true;
    return false;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDocumentTypeLabel = (type: DocumentType): string => {
    const typeLabels: Record<DocumentType, string> = {
      [DocumentType.CONTRACT]: t('Documents.type.contract'),
      [DocumentType.EVIDENCE]: t('Documents.type.evidence'),
      [DocumentType.COURT_FILING]: t('Documents.type.court_filing'),
      [DocumentType.CORRESPONDENCE]: t('Documents.type.correspondence'),
      [DocumentType.INVOICE]: t('Documents.type.invoice'),
      [DocumentType.RECEIPT]: t('Documents.type.receipt'),
      [DocumentType.OTHER]: t('Documents.type.other'),
    };
    return typeLabels[type] || type;
  };

  const normalizeTags = (tagsField: unknown): string[] => {
    if (Array.isArray(tagsField)) {
      return tagsField as string[];
    }
    if (typeof tagsField === 'string') {
      try {
        const parsed = JSON.parse(tagsField);
        return Array.isArray(parsed) ? (parsed as string[]) : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // Load documents when filters change
  useEffect(() => {
    loadDocuments();
  }, [searchTerm, selectedType, selectedCase, selectedClient, tagsFilter]);

  const filteredDocuments = documents;

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
        <h1 className="text-2xl font-bold text-gray-900">{t('Documents.title')}</h1>
        <UploadDocumentGuard>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('Documents.uploadDocument')}
          </button>
        </UploadDocumentGuard>
      </div>

      {/* Preview Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Preview is available for PDF files and images. Office documents are downloadable only.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Documents.search')}
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('Documents.search')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Documents.typeLabel')}
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as DocumentType | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('Documents.allTypes')}</option>
              {Object.values(DocumentType).map(type => (
                <option key={type} value={type}>
                  {getDocumentTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>

          {/* Case Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Documents.case')}
            </label>
            <select
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('Documents.allCases')}</option>
              {cases.map(caseItem => (
                <option key={caseItem.id} value={caseItem.id}>
                  {caseItem.case_number} - {caseItem.title}
                </option>
              ))}
            </select>
          </div>

          {/* Client Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Documents.client')}
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('Documents.allClients')}</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.first_name} {client.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Documents.tags')}
            </label>
            <input
              type="text"
              value={tagsFilter}
              onChange={(e) => setTagsFilter(e.target.value)}
              placeholder={t('Documents.tagsPlaceholder') || 'tag1, tag2'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {t('Documents.title')} ({filteredDocuments.length})
          </h2>
        </div>
        
        {filteredDocuments.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            {searchTerm || selectedType || selectedCase || selectedClient 
              ? 'No documents match your filters.' 
              : t('Documents.noDocuments')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Documents.title')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Documents.typeLabel')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Documents.case')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Documents.client')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Documents.fileSize')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Documents.uploadedAt')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Documents.tags')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((document) => (
                  <React.Fragment key={document.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {document.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {document.original_filename}
                          </div>
                          {document.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {document.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getDocumentTypeLabel(document.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {document.case ? (
                          <button
                            onClick={() => {
                              const currentLocale = window.location.pathname.split('/')[1] || 'en';
                              router.push(`/${currentLocale}/cases/${document.case!.id}`);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {document.case.case_number}
                          </button>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {document.client ? (
                          <button
                            onClick={() => {
                              const currentLocale = window.location.pathname.split('/')[1] || 'en';
                              router.push(`/${currentLocale}/clients/${document.client!.id}`);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {document.client.first_name} {document.client.last_name}
                          </button>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatFileSize(document.file_size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(document.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-wrap gap-1">
                          {(() => {
                            const arr = normalizeTags((document as any).tags);
                            return arr.length > 0
                              ? arr.map((tag) => (
                                  <span key={tag} className="inline-flex px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                                    {tag}
                                  </span>
                                ))
                              : <span className="text-gray-400">-</span>;
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {isPreviewable(document.mime_type) && (
                            <button
                              onClick={() => handleToggleInlinePreview(document)}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              {expandedDocumentId === document.id ? 'Hide' : 'Show'}
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadDocument(document)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {t('Documents.download')}
                          </button>
                          <DeleteDocumentGuard>
                            <button
                              onClick={() => handleDeleteDocument(document.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              {t('Documents.delete')}
                            </button>
                          </DeleteDocumentGuard>
                        </div>
                      </td>
                    </tr>
                    {expandedDocumentId === document.id && inlinePreviewUrl && (
                      <tr key={`${document.id}-preview`}>
                        <td colSpan={8} className="px-6 py-4 bg-gray-50">
                          <div className="w-full">
                            {document.mime_type === 'application/pdf' ? (
                              <PdfEmbedViewer
                                url={inlinePreviewUrl}
                                title={document.title}
                                className="w-full"
                              />
                            ) : document.mime_type.startsWith('image/') ? (
                              <div className="flex justify-center">
                                <img 
                                  src={inlinePreviewUrl} 
                                  alt={document.title} 
                                  className="max-w-full max-h-96 border rounded shadow"
                                />
                              </div>
                            ) : (
                              <div className="text-center text-gray-500 py-8">
                                Preview not available for this file type
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <DocumentUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
          cases={cases}
          clients={clients}
        />
      )}


    </div>
  );
}
