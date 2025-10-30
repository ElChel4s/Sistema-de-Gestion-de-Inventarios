import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { authAtom, checkAuth } from '../../store/auth';
import { Sidebar } from './sidebar';
import { Header } from './header';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [auth, setAuth] = useAtom(authAtom);
  const { isAuthenticated } = auth;
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth(setAuth);
  }, [setAuth]);

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onSidebarToggle={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};