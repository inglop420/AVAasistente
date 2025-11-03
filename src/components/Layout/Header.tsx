import React from 'react';
import { Menu, Bell } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
  </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;