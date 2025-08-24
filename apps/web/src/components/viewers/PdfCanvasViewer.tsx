'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source to a simple URL that will work
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

type Props = {
  url: string;
  scale?: number;
  className?: string;
  headers?: Record<string, string>;
};

export default function PdfCanvasViewer({ url, scale = 1.2, className, headers }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const pdf = await pdfjsLib.getDocument({ 
          url, 
          withCredentials: false,
          httpHeaders: headers
        }).promise;
        if (cancelled) return;
        const pages = pdf.numPages;

        // Clear previous canvases
        if (containerRef.current) containerRef.current.innerHTML = '';

        for (let n = 1; n <= pages; n++) {
          const page = await pdf.getPage(n);
          if (cancelled) return;

          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.className = 'mb-4 max-w-full shadow border rounded';
          const context = canvas.getContext('2d')!;
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (containerRef.current) containerRef.current.appendChild(canvas);
          await page.render({ canvasContext: context, viewport, canvas }).promise;
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load PDF');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [url, scale]);

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className={className}>
      {loading && <div className="p-3 text-sm text-gray-600">Loading PDF…</div>}
      <div ref={containerRef} className="overflow-auto" />
    </div>
  );
}
