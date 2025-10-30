import React, { useState } from 'react';
import { DashboardComponent } from '../components/DashboardComponent';

export const DashboardPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Panel de Control</h1>
      </div>
      
      <DashboardComponent />
    </div>
  );
};

export default DashboardPage;
