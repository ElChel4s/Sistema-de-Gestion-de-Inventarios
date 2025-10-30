import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Warehouse, 
  Package, 
  Tag, 
  Users, 
  MoveRight,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  
  const navItems: NavItem[] = [
    {
      name: 'Panel Principal',
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: 'Almacenes',
      path: '/warehouses',
      icon: <Warehouse size={20} />,
    },
    {
      name: 'Productos',
      path: '/products',
      icon: <Package size={20} />,
    },
    {
      name: 'Categorías',
      path: '/categories',
      icon: <Tag size={20} />,
    },
    {
      name: 'Usuarios',
      path: '/users',
      icon: <Users size={20} />,
    },
    {
      name: 'Movimientos',
      path: '/movements',
      icon: <MoveRight size={20} />,
    },
    {
      name: 'Configuración',
      path: '/settings',
      icon: <Settings size={20} />,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-blue-700 to-blue-900 text-white transition-transform duration-300 ease-in-out transform lg:translate-x-0 lg:static lg:inset-auto lg:flex",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full w-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-blue-800">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Warehouse size={24} className="text-white" />
              <span className="text-xl font-bold">Sistema de Almacén</span>
            </Link>
            <button
              className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-blue-800 lg:hidden"
              onClick={onToggle}
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-800 text-white font-medium"
                      : "text-blue-100 hover:bg-blue-800/50"
                  )}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                  
                  {isActive && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-blue-400" />
                  )}
                </Link>
              );
            })}
          </nav>
          
          {/* Sidebar footer */}
          <div className="p-4 border-t border-blue-800">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Warehouse size={20} className="text-blue-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Sistema de Almacén</p>
                <p className="text-xs text-blue-300">v0.1.0</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Mobile toggle button */}
      <button
        className="fixed bottom-4 right-4 p-3 rounded-full bg-blue-600 text-white shadow-lg z-20 lg:hidden"
        onClick={onToggle}
      >
        <Menu size={24} />
      </button>
    </>
  );
};