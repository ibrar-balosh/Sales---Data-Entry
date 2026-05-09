import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { Download, Loader2 } from 'lucide-react';

const DownloadButton = ({ componentRef, filename }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!componentRef.current) return;
    
    setIsDownloading(true);
    
    const element = componentRef.current;
    
    const opt = {
      margin:       0,
      filename:     filename || 'Invoice.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().from(element).set(opt).save();
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload} 
      disabled={isDownloading}
      className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-6 py-2.5 border-2 border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors whitespace-nowrap disabled:opacity-50"
    >
      {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} 
      {isDownloading ? 'Generating...' : 'Download PDF'}
    </button>
  );
};

export default DownloadButton;
