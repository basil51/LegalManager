'use client';

import React from 'react';

type Props = {
  url: string;
  className?: string;
  title?: string;
};

export default function PdfEmbedViewer({ url, className, title }: Props) {
  // For blob URLs, embed directly. For API URLs, use the inline parameter
  const embedUrl = url.startsWith('blob:') 
    ? url 
    : url.includes('inline=true') 
      ? url 
      : `${url}${url.includes('?') ? '&' : '?'}inline=true`;
  
  return (
    <div className={className} style={{ height: '70vh' }}>
      <embed
        src={embedUrl}
        type="application/pdf"
        width="100%"
        height="100%"
        className="border rounded"
        title={title || 'PDF'}
      />
    </div>
  );
}


