import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bell, Search, Menu } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useContext(AuthContext);

  return (
    <div className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 shadow-sm">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="md:hidden text-slate-500 hover:text-blue-600 focus:outline-none">
          <Menu size={24} />
        </button>
        
        <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 w-72 lg:w-96">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search everywhere..." 
            className="bg-transparent border-none outline-none ml-2 w-full text-sm text-slate-700"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4 md:space-x-6">
        <button className="relative text-slate-400 hover:text-blue-600 transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-800">{user?.first_name} {user?.last_name}</span>
            <span className="text-xs text-slate-500">{user?.profile?.account_id}</span>
          </div>
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md uppercase">
            {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
