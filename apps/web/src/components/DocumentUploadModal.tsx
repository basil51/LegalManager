'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiClient, DocumentType, Case, Client, UploadDocumentData } from '@/lib/api-client';
import { useToast } from '@/contexts/ToastContext';

interface DocumentUploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
  cases: Case[];
  clients: Client[];
}

export default function DocumentUploadModal({ onClose, onSuccess, cases, clients }: DocumentUploadModalProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: DocumentType.OTHER,
    caseId: '',
    clientId: '',
    tags: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('DocumentUploadModal - Authentication check:', { 
      hasToken: !!token, 
      tokenLength: token?.length,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
    });
    
    if (!token) {
      console.log('No token found in upload modal, redirecting to login');
      router.push('/en/login');
      return;
    }
  }, [router]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill title with filename if title is empty
      if (!formData.title) {
        setFormData(prev => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, '') // Remove file extension
        }));
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // When a case is selected, automatically set the client to the case's client
      if (field === 'caseId' && value) {
        const selectedCase = cases.find(c => c.id === value);
        if (selectedCase && selectedCase.client) {
          newData.clientId = selectedCase.client.id;
        }
      }
      
      // When case is cleared, also clear the client
      if (field === 'caseId' && !value) {
        newData.clientId = '';
      }
      
      return newData;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedFile) {
      addToast('error', 'Please select a file to upload');
      return;
    }

    if (!formData.title.trim()) {
      addToast('error', 'Please enter a title for the document');
      return;
    }

    try {
      setIsUploading(true);

      const uploadData: UploadDocumentData = {
        file: selectedFile,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        caseId: formData.caseId || undefined,
        clientId: formData.clientId || undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : undefined,
      };

      await apiClient.uploadDocument(uploadData);
      addToast('success', t('Documents.uploadSuccess'));
      onSuccess();
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to upload document');
      console.error('Error uploading document:', err);
    } finally {
      setIsUploading(false);
    }
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">{t('Documents.uploadDocument')}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isUploading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">


          {/* File Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Documents.file')} *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                disabled={isUploading}
              />
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    Selected: {selectedFile.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                    disabled={isUploading}
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div>
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                                     <button
                     type="button"
                     onClick={() => fileInputRef.current?.click()}
                     className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                     disabled={isUploading}
                   >
                     {t('Documents.selectFile')}
                   </button>
                   <p className="mt-1 text-xs text-gray-500">
                     {t('Documents.fileTypes')}
                   </p>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Documents.title')} *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('Documents.enterTitle')}
              required
              disabled={isUploading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Documents.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('Documents.enterDescription')}
              disabled={isUploading}
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Documents.typeLabel')} *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isUploading}
            >
              {Object.values(DocumentType).map(type => (
                <option key={type} value={type}>
                  {getDocumentTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>

          {/* Case */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Documents.case')}
            </label>
            <select
              value={formData.caseId}
              onChange={(e) => handleInputChange('caseId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isUploading}
            >
              <option value="">{t('Documents.selectCase')}</option>
              {cases.map(caseItem => (
                <option key={caseItem.id} value={caseItem.id}>
                  {caseItem.case_number} - {caseItem.title}
                </option>
              ))}
            </select>
          </div>

          {/* Client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Documents.client')}
            </label>
            {formData.caseId ? (
              // Show read-only client when case is selected
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                {(() => {
                  const selectedCase = cases.find(c => c.id === formData.caseId);
                  return selectedCase?.client 
                    ? `${selectedCase.client.first_name} ${selectedCase.client.last_name} (${t('Documents.autoAssigned')})`
                    : t('Documents.noClientAssigned');
                })()}
              </div>
            ) : (
              // Allow client selection when no case is selected
              <select
                value={formData.clientId}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isUploading}
              >
                <option value="">{t('Documents.selectClient')}</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.first_name} {client.last_name}
                  </option>
                ))}
              </select>
            )}
            {formData.caseId && (
              <p className="mt-1 text-xs text-gray-500">
                {t('Documents.clientAutoAssigned')}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Documents.tags')}
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('Documents.enterTags')}
              disabled={isUploading}
            />
            <p className="mt-1 text-xs text-gray-500">
              {t('Documents.tagsExample')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isUploading}
            >
              {t('Documents.cancel')}
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFile || !formData.title.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? t('Documents.uploading') : t('Documents.uploadDocument')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
