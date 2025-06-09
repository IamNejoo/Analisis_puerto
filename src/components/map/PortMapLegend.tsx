// src/components/map/PortMapLegend.tsx - VERSIÓN COMPACTA
import React from 'react';

export const PortMapLegend: React.FC = () => {
  const legendItems = [
    { color: '#10b981', label: 'Bajo (< 70%)', range: '< 70%' },
    { color: '#f59e0b', label: 'Medio (70-85%)', range: '70-85%' },
    { color: '#ef4444', label: 'Alto (> 85%)', range: '> 85%' }
  ];

  return (
    <div className="flex items-center space-x-4 text-xs">
      <span className="font-medium text-gray-700">Ocupación:</span>
      {legendItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-gray-600">{item.range}</span>
        </div>
      ))}
    </div>
  );
};