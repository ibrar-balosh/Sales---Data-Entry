import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency, getAmountInWords } from '../utils/currency';
import { Briefcase } from 'lucide-react';

const InvoicePrint = forwardRef(({ invoice, user }, ref) => {
  if (!invoice) return null;

  return (
    <div ref={ref} className="bg-white p-8 w-[210mm] min-h-[297mm] mx-auto text-black font-sans box-border" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      
      {/* Header Section */}
      <div className="flex justify-between items-start border-b-2 border-indigo-200 pb-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-xl">
            <Briefcase className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight uppercase">
              {user?.profile?.company_name || 'Kaleem Aryan'}
            </h1>
            <p className="text-slate-600 mt-1 text-sm">{user?.profile?.address || 'DR. BANO ROAD'}</p>
            <p className="text-slate-600 text-sm">Phone no.: {user?.profile?.phone || '3343031442'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Original For Recipient</p>
          <h2 className="text-4xl font-bold text-indigo-100 uppercase tracking-widest mt-4">Invoice</h2>
        </div>
      </div>

      {/* Customer & Invoice Details */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">Bill To</h3>
          <p className="font-bold text-lg text-slate-900">{invoice.customer_name}</p>
          <p className="text-slate-700 text-sm mt-1">Contact No.: {invoice.customer_phone}</p>
          <p className="text-slate-700 text-sm mt-1 max-w-[250px] leading-snug">{invoice.customer_address}</p>
        </div>
        <div className="text-right">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">Invoice Details</h3>
          <p className="text-slate-900 font-semibold text-lg">{invoice.invoice_id}</p>
          <p className="text-slate-700 text-sm mt-1">Date: {new Date(invoice.date).toLocaleDateString('en-GB').replace(/\//g, '-')}</p>
          <p className="text-slate-700 text-sm mt-1">Time: {new Date(invoice.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-left border-collapse mb-8">
        <thead>
          <tr className="bg-[#938BE4] text-white text-sm">
            <th className="py-2 px-3 font-bold border border-[#938BE4] w-12 text-center">#</th>
            <th className="py-2 px-3 font-bold border border-[#938BE4]">Item Name</th>
            <th className="py-2 px-3 font-bold border border-[#938BE4] text-center w-20">Quantity</th>
            <th className="py-2 px-3 font-bold border border-[#938BE4] text-center">Price/Unit</th>
            <th className="py-2 px-3 font-bold border border-[#938BE4] text-center">Discount</th>
            <th className="py-2 px-3 font-bold border border-[#938BE4] text-center w-16">GST</th>
            <th className="py-2 px-3 font-bold border border-[#938BE4] text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items && invoice.items.length > 0 ? (
            invoice.items.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-200 text-sm">
                <td className="py-3 px-3 text-center text-slate-600">{idx + 1}</td>
                <td className="py-3 px-3 font-bold text-slate-800">{item.product_name_snapshot}</td>
                <td className="py-3 px-3 text-center text-slate-700">{item.quantity}</td>
                <td className="py-3 px-3 text-center text-slate-700">{formatCurrency(item.price_per_unit)}</td>
                <td className="py-3 px-3 text-center text-slate-700">{item.discount_percentage}%</td>
                <td className="py-3 px-3 text-center text-slate-700">{item.gst_percentage}%</td>
                <td className="py-3 px-3 text-right font-bold text-slate-900">{formatCurrency(item.final_amount)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="py-8 text-center text-slate-500 italic border-b border-slate-200">No items found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Footer Section */}
      <div className="flex justify-between items-start pt-4 mt-auto">
        <div className="w-1/2 pr-8">
          <div className="mb-6">
            <h4 className="text-sm font-bold text-slate-900 uppercase mb-1">Invoice Amount In Words</h4>
            <p className="text-slate-700 text-sm leading-relaxed">
              {getAmountInWords(invoice.total_amount)}
            </p>
          </div>
          
          <div className="mb-6">
            <h4 className="text-sm font-bold text-slate-900 uppercase mb-1">Terms And Conditions</h4>
            <p className="text-slate-700 text-sm">Thank you for doing business with us.</p>
            {invoice.remarks && <p className="text-slate-700 text-sm mt-2 font-medium">Remarks: {invoice.remarks}</p>}
          </div>

          <div className="mt-8">
            <QRCodeSVG value={`Invoice: ${invoice.invoice_id}\nTotal: ${formatCurrency(invoice.total_amount)}\nDate: ${new Date(invoice.date).toLocaleDateString()}`} size={80} />
          </div>
        </div>

        <div className="w-[320px]">
          <div className="bg-[#938BE4] text-white flex justify-between px-4 py-2 font-bold text-lg mb-4">
            <span>Total</span>
            <span>{formatCurrency(invoice.total_amount)}</span>
          </div>
          
          <div className="space-y-3 px-4 text-sm text-slate-800">
            <div className="flex justify-between">
              <span>Received</span>
              <span className="font-semibold">{formatCurrency(invoice.received_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Balance</span>
              <span className="font-semibold">{formatCurrency(invoice.balance)}</span>
            </div>
            
            {/* Real Previous/Current Balance from Backend */}
            <div className="flex justify-between pt-2 border-t border-slate-200">
              <span>Previous Balance</span>
              <span className="font-semibold">{formatCurrency(invoice.previous_balance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Current Balance</span>
              <span className="font-bold">{formatCurrency(invoice.new_balance)}</span>
            </div>
            <div className="border-b-2 border-slate-800 pt-1"></div>
          </div>

          <div className="mt-20 text-center">
            <p className="text-slate-600 text-sm mb-8">For: {user?.profile?.company_name || 'Kaleem Aryan'}</p>
            <p className="font-[cursive] text-3xl text-slate-400 mb-2">{user?.first_name || 'Kaleem Aryan'}</p>
            <div className="border-t border-slate-800 mx-10 pt-2">
              <p className="text-sm font-bold text-slate-900">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
});

export default InvoicePrint;
