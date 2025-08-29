'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PdfEmbedViewer from '@/components/viewers/PdfEmbedViewer';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4005/api/v1';

function isPdf(url: string) {
  return /\.pdf($|\?)/i.test(url);
}
function isImage(url: string) {
  return /\.(png|jpe?g|gif|webp|bmp|svg)($|\?)/i.test(url);
}

export default function ViewerPage() {
  const sp = useSearchParams();
  const src = sp.get('src');
  const id = sp.get('id');
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const type = useMemo(() => {
    if (src) {
      if (isPdf(src)) return 'pdf';
      if (isImage(src)) return 'image';
    }
    if (id) return 'pdf';
    return 'unknown';
  }, [src, id]);

  useEffect(() => {
    let aborted = false;
    async function run() {
      if (!src && !id) { setErr('Missing ?src= or ?id='); return; }
      setErr(null);
      setResolvedUrl(null);

      if (type === 'pdf') {
        if (src) {
          setResolvedUrl(src);
          return;
        }
        if (id) {
          try {
            const res = await fetch(`${API.replace(/\/$/, '')}/documents/${id}/download?inline=true`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
              },
            });
            if (!res.ok) throw new Error(`Download failed (${res.status})`);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            if (aborted) return;
            setResolvedUrl(url);
            return;
          } catch (e: any) {
            setErr(e?.message || 'Failed to load');
            return;
          }
        }
      }
      if (type === 'image') {
        setResolvedUrl(src);
        return;
      }
      setErr('Unsupported file type. Try PDF or image.');
    }
    run();
    return () => { aborted = true; };
  }, [src, id, type]);

  if (!src && !id) return <div className="p-4">Pass a file URL as <code>?src=</code> query param or document ID as <code>?id=</code>.</div>;
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
        <PdfEmbedViewer url={resolvedUrl} />
      </main>
    );
  }

  return <div className="p-4">Preparing preview…</div>;
}
