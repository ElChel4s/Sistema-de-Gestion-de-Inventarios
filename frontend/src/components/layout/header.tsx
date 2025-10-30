import React from 'react';
import { useAtom } from 'jotai';
import { Bell, Search, LogOut, Menu } from 'lucide-react';
import { authAtom, logout } from '../../store/auth';
import { Button } from '../ui/button';

interface HeaderProps {
  onSidebarToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSidebarToggle }) => {
  const [auth, setAuth] = useAtom(authAtom);
  const { user } = auth;

  const handleLogout = () => {
    logout(setAuth);
  };

  if (!user) return null;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left section */}
        <div className="flex items-center">
          <button
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
            onClick={onSidebarToggle}
          >
            <Menu size={20} />
          </button>
          
          <div className="relative ml-4 lg:ml-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        
        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          
          {/* User profile */}
          <div className="flex items-center">
            <div className="hidden md:flex md:flex-col md:items-end md:mr-4">
              <span className="text-sm font-medium text-gray-900">{user.name}</span>
              <span className="text-xs text-gray-500 capitalize">{user.role}</span>
            </div>
            
            <div className="relative">
              <button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <img
                  className="h-8 w-8 rounded-full"
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                  alt={user.name}
                />
              </button>
            </div>
          </div>
          
          {/* Logout button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
            onClick={handleLogout}
            leftIcon={<LogOut size={18} />}
          >
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </Button>
        </div>
      </div>
    </header>
  );
};