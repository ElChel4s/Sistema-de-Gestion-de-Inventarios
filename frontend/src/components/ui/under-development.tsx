import React from 'react';
import { Settings } from 'lucide-react';

interface UnderDevelopmentProps {
  title: string;
}

export const UnderDevelopment: React.FC<UnderDevelopmentProps> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
      <div className="mb-6">
        <Settings size={64} className="text-gray-400 animate-spin" style={{animationDuration: '3s'}} />
      </div>
      <h2 className="text-3xl font-bold text-gray-700 mb-4">{title}</h2>
      <p className="text-xl text-gray-500 mb-6">En desarrollo</p>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg max-w-md">
        <p className="text-yellow-700">
          Esta sección está siendo desarrollada y estará disponible pronto.
        </p>
      </div>
    </div>
  );
};