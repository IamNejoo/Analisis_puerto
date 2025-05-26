import React from 'react';

export const PortMapLegend: React.FC = () => {
  return (
    <div className="mt-3 flex flex-wrap items-center text-sm text-gray-600">
      <div className="flex items-center mr-4 mb-1">
        <span className="inline-block w-3 h-3 bg-green-600 rounded-full mr-1"></span>
        <span>Disponible (&lt;70%)</span>
      </div>
      <div className="flex items-center mr-4 mb-1">
        <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>
        <span>Moderado (70-85%)</span>
      </div>
      <div className="flex items-center mr-4 mb-1">
        <span className="inline-block w-3 h-3 bg-red-600 rounded-full mr-1"></span>
        <span>Crítico (&gt;85%)</span>
      </div>
      <div className="flex items-center mr-4 mb-1">
        <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
        <span>O'Higgins</span>
      </div>
      <div className="flex items-center mr-4 mb-1">
        <span className="inline-block w-3 h-3 bg-purple-700 rounded-full mr-1"></span>
        <span>Espingón</span>
      </div>
      <div className="flex items-center mr-4 mb-1">
        <span className="inline-block w-3 h-3 bg-teal-600 rounded-full mr-1"></span>
        <span>Grúas</span>
      </div>
    </div>
  );
};