import React from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';

const PrintButton = ({ componentRef }) => {
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Invoice',
  });

  return (
    <button 
      onClick={handlePrint} 
      className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-sm transition-colors whitespace-nowrap"
    >
      <Printer size={18} /> Print Invoice
    </button>
  );
};

export default PrintButton;
