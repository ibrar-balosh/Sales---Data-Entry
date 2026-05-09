import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { ArrowLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import InvoicePreview from '../components/InvoicePreview';
import PrintButton from '../components/PrintButton';
import DownloadButton from '../components/DownloadButton';

const InvoiceDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`invoices/${id}/`);
        setInvoice(res.data);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchInvoice();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading invoice...</div>;
  if (!invoice) return <div className="p-8 text-center text-red-500">Invoice not found!</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-10">
      
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <Link to="/records" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium">
          <ArrowLeft size={20} /> Back to Records
        </Link>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <DownloadButton 
            componentRef={printRef} 
            filename={`Invoice-${invoice.invoice_id}.pdf`} 
          />
          <PrintButton componentRef={printRef} />
        </div>
      </div>

      {/* Invoice Preview Section */}
      <div className="flex flex-col items-center">
        <p className="text-slate-500 mb-4 text-sm font-medium uppercase tracking-widest">Document Preview</p>
        <InvoicePreview invoice={invoice} user={user} componentRef={printRef} />
      </div>

    </div>
  );
};

export default InvoiceDetail;
