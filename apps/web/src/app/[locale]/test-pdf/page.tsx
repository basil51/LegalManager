'use client';

import PdfEmbedViewer from '@/components/viewers/PdfEmbedViewer';

export default function TestPdfPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">PDF Viewer Test</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Test 1: Sample PDF from Mozilla</h2>
          <div className="border rounded-lg p-4">
            <PdfEmbedViewer 
              url="https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"
              className="w-full"
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Test 2: Test Mode (No URL)</h2>
          <div className="border rounded-lg p-4">
            <PdfEmbedViewer 
              url="https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
