import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, Download, Eye, Trash2 } from 'lucide-react';
import api from '../api';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/currency';

const Records = () => {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      const res = await api.get('invoices/');
      setRecords(res.data);
    } catch (error) {
      toast.error('Failed to load records');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.delete(`invoices/${id}/`);
        toast.success('Invoice deleted');
        fetchRecords();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const filteredRecords = records.filter(r => 
    r.invoice_id?.toLowerCase().includes(search.toLowerCase()) || 
    r.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><FileText className="text-blue-500"/> Invoice Records</h1>
          <p className="text-slate-500">View and manage all your generated invoices.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search invoice or customer..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl w-full md:w-80 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <th className="p-4 font-semibold">Invoice ID</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold text-right">Total</th>
                <th className="p-4 font-semibold text-right">Balance</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">Loading records...</td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 flex flex-col items-center">
                    <div className="bg-slate-100 p-4 rounded-full mb-3"><FileText size={24} className="text-slate-400"/></div>
                    <p>No invoices found.</p>
                    <Link to="/create" className="text-blue-600 hover:underline mt-2 text-sm font-medium">Create your first invoice</Link>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{record.invoice_id}</td>
                    <td className="p-4 font-medium text-slate-700">{record.customer_name}</td>
                    <td className="p-4 text-slate-600 text-sm">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-right text-slate-800">{formatCurrency(record.total_amount)}</td>
                    <td className="p-4 font-bold text-right text-red-600">{formatCurrency(record.balance)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/records/${record.id}`} className="p-2 text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors" title="View Detail">
                          <Eye size={18} />
                        </Link>
                        <Link 
                          to={`/records/${record.id}`} 
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(record.id)} 
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Records;
