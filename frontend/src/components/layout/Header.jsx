import React from 'react';
import { Bell, UserCircle } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 z-10 w-full fixed top-0">
      <div className="flex items-center space-x-4 ml-64">
      </div>
      <div className="flex items-center space-x-6">
        <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
          <Bell className="h-5 w-5" />
        </button>
        <button className="text-gray-500 hover:text-gray-700 flex items-center space-x-2 focus:outline-none">
          <UserCircle className="h-6 w-6" />
          <span className="text-sm font-medium text-gray-700">Admin</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
