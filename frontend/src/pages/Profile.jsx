import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Building, Hash } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500">Manage your account information.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32 relative">
          <div className="absolute -bottom-12 left-8 w-24 h-24 rounded-full border-4 border-white bg-white flex items-center justify-center text-4xl font-bold text-blue-600 shadow-md uppercase">
            {user.first_name?.charAt(0) || user.username?.charAt(0)}
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8">
          <h2 className="text-2xl font-bold text-slate-900">{user.first_name} {user.last_name}</h2>
          <p className="text-slate-500 font-medium">@{user.username}</p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <Hash className="text-blue-500 mt-0.5" size={20} />
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account ID</p>
                <p className="font-medium text-slate-800">{user.profile?.account_id}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <Mail className="text-blue-500 mt-0.5" size={20} />
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</p>
                <p className="font-medium text-slate-800">{user.email || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <Building className="text-blue-500 mt-0.5" size={20} />
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company Name</p>
                <p className="font-medium text-slate-800">{user.profile?.company_name || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <User className="text-blue-500 mt-0.5" size={20} />
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</p>
                <p className="font-medium text-slate-800">{user.first_name} {user.last_name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
