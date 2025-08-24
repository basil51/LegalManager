'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PdfCanvasViewer from '@/components/viewers/PdfCanvasViewer';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4003/api/v1';

function isPdf(url: string) {
  return /\.pdf($|\?)/i.test(url);
}
function isImage(url: string) {
  return /\.(png|jpe?g|gif|webp|bmp|svg)($|\?)/i.test(url);
}
function isOffice(url: string) {
  return /\.(docx?|xlsx?|pptx?)($|\?)/i.test(url);
}

export default function ViewerPage() {
  const sp = useSearchParams();
  const src = sp.get('src');
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const type = useMemo(() => {
    if (!src) return 'unknown';
    if (isPdf(src)) return 'pdf';
    if (isImage(src)) return 'image';
    if (isOffice(src)) return 'office';
    return 'unknown';
  }, [src]);

  useEffect(() => {
    let aborted = false;
    async function run() {
      if (!src) { setErr('Missing ?src='); return; }
      setErr(null);
      setResolvedUrl(null);

      if (type === 'pdf') {
        setResolvedUrl(src);
        return;
      }
      if (type === 'image') {
        setResolvedUrl(src);
        return;
      }
      if (type === 'office') {
        try {
          const url = `${API.replace(/\/$/, '')}/documents/convert?fileUrl=${encodeURIComponent(src)}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Convert failed (${res.status})`);
          const blob = await res.blob();
          if (aborted) return;
          setResolvedUrl(URL.createObjectURL(blob));
          return;
        } catch (e: any) {
          setErr(e?.message || 'Conversion error');
          return;
        }
      }
      setErr('Unsupported file type. Try PDF, image, or Office (docx/xlsx/pptx).');
    }
    run();
    return () => { aborted = true; };
  }, [src, type]);

  if (!src) return <div className="p-4">Pass a file URL as <code>?src=</code> query param.</div>;
  if (err) return <div className="p-4 text-red-600">Error: {err}</div>;

  if (type === 'image' && resolvedUrl) {
    return (
      <main className="p-4">
        <img src={resolvedUrl} alt="" className="max-w-full h-auto border rounded shadow" />
      </main>
    );
  }

  if (resolvedUrl) {
    return (
      <main className="p-4">
        <PdfCanvasViewer url={resolvedUrl} />
      </main>
    );
  }

  return <div className="p-4">Preparing preview…</div>;
}
