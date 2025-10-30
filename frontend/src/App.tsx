import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { authAtom, checkAuth } from './store/auth';

import { AppLayout } from './components/layout/app-layout';
import { LoginPage } from './pages/login-page';
import { DashboardPage } from './pages/dashboard-page';
import { WarehousesPage } from './pages/warehouses-page';
import { WarehouseInventoryPage } from './pages/warehouse-inventory-page';
import { ProductsPage } from './pages/products-page';
import { CategoriesPage } from './pages/categories-page';
import { UsersPage } from './pages/users-page';
import { MovementsPage } from './pages/movements-page';
import { NewMovementPage } from './pages/new-movement-page';

function App() {
  const [auth, setAuth] = useAtom(authAtom);

  useEffect(() => {
    checkAuth(setAuth);
  }, [setAuth]);

  return (
    <Router>
      <Routes>
        {/* Ruta pública de login */}
        <Route path="/login" element={
          auth.isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        } />
        
        {/* Rutas protegidas */}
        <Route 
          path="/" 
          element={
            auth.isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="warehouses" element={<WarehousesPage />} />
          <Route path="warehouses/:id" element={<WarehouseInventoryPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="movements" element={<MovementsPage />} />
          <Route path="movements/new" element={<NewMovementPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;