// src/components/shared/OccupancyInfoBadge.tsx
import React from 'react';
import { Info } from 'lucide-react';

interface OccupancyInfoBadgeProps {
  bahiasReservadas: number;
  ocupacionReal: number;
  showInfo?: boolean;
}

export const OccupancyInfoBadge: React.FC<OccupancyInfoBadgeProps> = ({
  bahiasReservadas,
  ocupacionReal,
  showInfo = true
}) => {
  return (
    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full text-xs">
      <span className="font-medium text-blue-700">
        Bahías: {bahiasReservadas}
      </span>
      <span className="text-blue-500">•</span>
      <span className="font-medium text-blue-700">
        Ocupación: {ocupacionReal.toFixed(1)}%
      </span>
      {showInfo && (
        <div className="group relative">
          <Info size={12} className="text-blue-600 cursor-help" />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
            <p className="mb-1">
              <strong>Bahías reservadas:</strong> Columnas asignadas exclusivamente a esta segregación
            </p>
            <p>
              <strong>Ocupación real:</strong> Porcentaje de TEUs vs capacidad máxima de las bahías
            </p>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};