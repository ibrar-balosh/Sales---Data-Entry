import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/currency';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [formData, setFormData] = useState({
    customer: '',
    received_amount: '',
    remarks: ''
  });

  const [items, setItems] = useState([
    { product: '', quantity: 1, price_per_unit: 0, discount_percentage: 0, gst_percentage: 0 }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          api.get('customers/'),
          api.get('products/')
        ]);
        setCustomers(custRes.data);
        setProducts(prodRes.data);
      } catch (error) {
        toast.error('Failed to load data');
      }
    };
    fetchData();
  }, []);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === 'product') {
      const selectedProduct = products.find(p => p.id.toString() === value.toString());
      if (selectedProduct) {
        newItems[index].price_per_unit = selectedProduct.price;
        newItems[index].gst_percentage = selectedProduct.gst_percentage;
      }
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { product: '', quantity: 1, price_per_unit: 0, discount_percentage: 0, gst_percentage: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateItemTotal = (item) => {
    const basePrice = item.price_per_unit * item.quantity;
    const discount = basePrice * (item.discount_percentage / 100);
    const afterDiscount = basePrice - discount;
    const gst = afterDiscount * (item.gst_percentage / 100);
    return afterDiscount + gst;
  };

  const grandTotal = items.reduce((acc, item) => acc + calculateItemTotal(item), 0);
  const balance = grandTotal - (parseFloat(formData.received_amount) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer) return toast.error('Please select a customer');
    if (items.some(i => !i.product)) return toast.error('Please select products for all items');

    setLoading(true);
    try {
      const payload = {
        customer: formData.customer,
        received_amount: parseFloat(formData.received_amount) || 0,
        remarks: formData.remarks,
        items: items
      };
      await api.post('invoices/', payload);
      toast.success('Invoice created successfully!');
      navigate('/records');
    } catch (error) {
      toast.error('Failed to create invoice');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create New Invoice</h1>
        <p className="text-slate-500">Select a customer and add products to generate an invoice.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-100 pb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer *</label>
            <select required name="customer" value={formData.customer} onChange={handleFormChange} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="">Select a customer...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount Received Today (Rs)</label>
            <input name="received_amount" value={formData.received_amount} onChange={handleFormChange} type="number" step="0.01" min="0" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Products</h3>
            <button type="button" onClick={addItem} className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg"><Plus size={16}/> Add Item</button>
          </div>

          <div className="space-y-4 overflow-x-auto pb-4">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-slate-500 pb-2 border-b border-slate-200">
                <div className="col-span-4">Product</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Price (Rs)</div>
                <div className="col-span-1">Disc (%)</div>
                <div className="col-span-1">GST (%)</div>
                <div className="col-span-1 text-right">Total</div>
                <div className="col-span-1 text-center">Action</div>
              </div>

              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-center py-3 border-b border-slate-50">
                  <div className="col-span-4">
                    <select required value={item.product} onChange={e => handleItemChange(index, 'product', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm">
                      <option value="">Select product...</option>
                      {products.map(p => <option key={p.id} value={p.id} disabled={p.stock_quantity <= 0}>{p.name} ({p.stock_quantity} in stock)</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input required type="number" min="1" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                  <div className="col-span-2">
                    <input required type="number" step="0.01" value={item.price_per_unit} onChange={e => handleItemChange(index, 'price_per_unit', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-slate-50" readOnly />
                  </div>
                  <div className="col-span-1">
                    <input type="number" step="0.01" value={item.discount_percentage} onChange={e => handleItemChange(index, 'discount_percentage', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                  <div className="col-span-1">
                    <input type="number" step="0.01" value={item.gst_percentage} onChange={e => handleItemChange(index, 'gst_percentage', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-slate-50" readOnly />
                  </div>
                  <div className="col-span-1 text-right font-bold text-slate-700">
                    {formatCurrency(calculateItemTotal(item))}
                  </div>
                  <div className="col-span-1 text-center">
                    <button type="button" onClick={() => removeItem(index)} disabled={items.length === 1} className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Remarks</label>
          <textarea name="remarks" value={formData.remarks} onChange={handleFormChange} rows="2" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Thank you for your business!"></textarea>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50 rounded-xl border border-slate-200 gap-6 md:gap-4">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 w-full md:w-auto text-center sm:text-left">
            <div>
              <p className="text-sm text-slate-500 font-medium">Grand Total</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(grandTotal)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Balance Due</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(balance)}</p>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-70 whitespace-nowrap"
          >
            {loading ? 'Saving...' : 'Save & Generate Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;
