import React from 'react';
import InvoicePrint from './InvoicePrint';

const InvoicePreview = ({ invoice, user, componentRef }) => {
  return (
    <div className="bg-slate-200 p-4 md:p-8 rounded-xl flex justify-center overflow-x-auto shadow-inner w-full min-h-[500px]">
      <div className="shadow-2xl scale-[0.4] sm:scale-50 md:scale-75 lg:scale-100 transform origin-top transition-transform h-fit">
        <InvoicePrint ref={componentRef} invoice={invoice} user={user} />
      </div>
    </div>
  );
};

export default InvoicePreview;
