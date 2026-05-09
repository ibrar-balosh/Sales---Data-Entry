import React, { useState, useEffect } from 'react';
import { FileText, TrendingUp, Users, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
    <div className={`p-4 rounded-xl ${color}`}>
      <Icon className="text-white" size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('dashboard/');
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching dashboard stats', error);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  const chartData = stats?.recent_invoices?.map(entry => ({
    name: entry.invoice_id,
    amount: parseFloat(entry.total_amount)
  })).reverse() || [];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Welcome back! Here's what's happening with your sales today.</p>
        </div>
        <Link to="/create" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-blue-500/30 text-center w-full md:w-auto">
          + New Invoice
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Invoices" value={stats?.total_invoices || 0} icon={FileText} color="bg-blue-500" />
        <StatCard title="Total Revenue" value={formatCurrency(stats?.total_sales)} icon={Wallet} color="bg-emerald-500" />
        <StatCard title="Active Customers" value={stats?.total_customers || 0} icon={Users} color="bg-indigo-500" />
        <StatCard title="Pending Payments" value={formatCurrency(stats?.pending_payments)} icon={TrendingUp} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Revenue</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `Rs ${value}`} width={80} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(value) => [formatCurrency(value), 'Revenue']} />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Recent Invoices</h3>
            <Link to="/records" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all</Link>
          </div>
          <div className="space-y-4">
            {stats?.recent_invoices?.map((entry, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex flex-col overflow-hidden">
                  <span className="font-semibold text-slate-800 truncate">{entry.customer_name}</span>
                  <span className="text-xs text-slate-500">{entry.invoice_id} • {new Date(entry.date).toLocaleDateString()}</span>
                </div>
                <div className="font-bold text-slate-700 whitespace-nowrap pl-4">
                  {formatCurrency(entry.total_amount)}
                </div>
              </div>
            ))}
            {(!stats?.recent_invoices || stats.recent_invoices.length === 0) && (
              <div className="text-center text-slate-500 py-8">No recent invoices</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
