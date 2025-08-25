'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Document } from '@/lib/api-client';
import { apiClient } from '@/lib/api-client';
import PdfEmbedViewer from './viewers/PdfEmbedViewer';

interface DocumentPreviewModalProps {
  document: Document;
  onClose: () => void;
}

export default function DocumentPreviewModal({ document, onClose }: DocumentPreviewModalProps) {
  const t = useTranslations();
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get file extension from original filename
  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const fileExtension = getFileExtension(document.original_filename);

  useEffect(() => {
    let blobUrl: string | null = null;
    const loadDocument = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('DocumentPreviewModal: Loading document for:', document.id);
        
        if (fileExtension === 'pdf') {
          const blob = await apiClient.downloadDocument(document.id);
          blobUrl = URL.createObjectURL(blob);
          setDocumentUrl(blobUrl);
        } else if (document.mime_type.startsWith('image/')) {
          const url = await apiClient.getDocumentDownloadUrl(document.id);
          setDocumentUrl(url);
        } else {
          const url = await apiClient.getDocumentDownloadUrl(document.id);
          setDocumentUrl(url);
        }
      } catch (err) {
        console.error('DocumentPreviewModal: Error loading document:', err);
        setError(err instanceof Error ? err.message : 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [document.id, fileExtension, document.mime_type]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{document.title}</h2>
            <p className="text-sm text-gray-500">{document.original_filename}</p>
            <p className="text-xs text-gray-400">Type: {document.mime_type}</p>
            <p className="text-xs text-blue-500 mt-1">Preview supports PDF and images. Other files can be downloaded.</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-lg">{t('Common.loading')}</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-red-600 mb-2">{error}</div>
                <div className="text-sm text-gray-500 mb-4">Document ID: {document.id}</div>
                <button
                  onClick={() => {
                    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4003/api/v1';
                    window.open(`${apiUrl}/documents/${document.id}/download`, '_blank');
                  }}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {t('Documents.download')}
                </button>
              </div>
            </div>
          )}

          {documentUrl && !loading && !error && (
            <div className="w-full h-[70vh] overflow-auto">
              {fileExtension === 'pdf' && (
                <div>
                  <PdfEmbedViewer 
                    url={documentUrl}
                    className="w-full"
                    title={document.title}
                  />
                </div>
              )}
              {fileExtension !== 'pdf' && document.mime_type.startsWith('image/') && (
                <div className="w-full flex justify-center">
                  <img src={documentUrl} alt={document.title || ''} className="max-w-full h-auto border rounded shadow" />
                </div>
              )}
              {fileExtension !== 'pdf' && !document.mime_type.startsWith('image/') && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-gray-500 mb-4">
                      {t('Documents.previewNotAvailable')}
                    </div>
                    <div className="text-sm text-gray-400 mb-4">
                      File type: {fileExtension} ({document.mime_type})
                    </div>
                    <button
                      onClick={() => {
                        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4003/api/v1';
                        window.open(`${apiUrl}/documents/${document.id}/download`, '_blank');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {t('Documents.download')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!documentUrl && !loading && !error && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">{t('Documents.previewNotAvailable')}</p>
              <button
                onClick={() => {
                  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4003/api/v1';
                  window.open(`${apiUrl}/documents/${document.id}/download`, '_blank');
                }}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {t('Documents.download')}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            {t('Common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
