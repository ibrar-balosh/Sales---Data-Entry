import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react';
import api from '../api';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/currency';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', stock_quantity: '', gst_percentage: 0
  });

  const fetchProducts = async () => {
    try {
      const res = await api.get('products/');
      setProducts(res.data);
    } catch (error) {
      toast.error('Failed to load products');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        gst_percentage: parseFloat(formData.gst_percentage || 0)
      };

      if (editingId) {
        await api.put(`products/${editingId}/`, payload);
        toast.success('Product updated');
      } else {
        await api.post('products/', payload);
        toast.success('Product created');
      }
      setShowModal(false);
      setFormData({ name: '', description: '', price: '', stock_quantity: '', gst_percentage: 0 });
      setEditingId(null);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`products/${id}/`);
        toast.success('Product deleted');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const openEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock_quantity: product.stock_quantity,
      gst_percentage: product.gst_percentage
    });
    setEditingId(product.id);
    setShowModal(true);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Package className="text-blue-500"/> Inventory / Products</h1>
          <p className="text-slate-500">Manage your product catalog, pricing, and stock levels.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl w-full sm:w-64 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button 
            onClick={() => { setEditingId(null); setFormData({name:'', description:'', price:'', stock_quantity:'', gst_percentage:0}); setShowModal(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <th className="p-4 font-semibold">Product Name</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold text-right">Unit Price</th>
                <th className="p-4 font-semibold text-center">In Stock</th>
                <th className="p-4 font-semibold text-center">GST %</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-500">Loading inventory...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-500">No products found.</td></tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{p.name}</td>
                    <td className="p-4 text-slate-600 text-sm truncate max-w-xs">{p.description || '-'}</td>
                    <td className="p-4 text-right font-medium text-slate-700">{formatCurrency(p.price)}</td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.stock_quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {p.stock_quantity} units
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center text-slate-600">{p.gst_percentage}%</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"><Pencil size={18} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-xl animate-fade-in overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold text-slate-900 mb-6">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price (Rs) *</label>
                  <input required type="number" step="0.01" min="0" name="price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Initial Stock *</label>
                  <input required type="number" min="0" name="stock_quantity" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Default GST %</label>
                <input type="number" step="0.01" min="0" name="gst_percentage" value={formData.gst_percentage} onChange={e => setFormData({...formData, gst_percentage: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea name="description" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-sm shadow-blue-500/30">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
