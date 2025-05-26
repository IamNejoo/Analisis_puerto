import React from 'react';
//import  { GaugeChart } from '../map/GaugeChart';
import type { YardOccupancyData,TimeState } from '../../types';

interface KPIPanelProps {
  currentOcupacion: number;
  currentProductividad: { bmph: number; gmph: number };
  currentTiempoCamion: number;
  ocupacionPatioData: YardOccupancyData[];
  getColorForOcupacion: (value: number) => string;
  timeState?: TimeState;
  isLoading?: boolean;
}

export const KPIPanel: React.FC<KPIPanelProps> = ({
  currentOcupacion,
  currentProductividad,
  currentTiempoCamion,
  ocupacionPatioData,
  getColorForOcupacion,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="font-bold text-lg text-gray-800 mb-4">KPIs Operativos</h3>
      
      {/* Ocupación */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Ocupación de Sitio</span>
          <span className={`text-sm font-semibold ${
            getColorForOcupacion(currentOcupacion) === '#7CB342' ? 'text-green-600' : 
            getColorForOcupacion(currentOcupacion) === '#FFA000' ? 'text-yellow-600' : 
            'text-red-600'
          }`}>
            {currentOcupacion}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="h-2.5 rounded-full" 
            style={{ 
              width: `${currentOcupacion}%`, 
              backgroundColor: getColorForOcupacion(currentOcupacion) 
            }}
          ></div>
        </div>
      </div>
      
      {/* Productividad */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Productividad de Muelle (BMPH)</span>
          <span className="text-sm font-semibold text-blue-600">
            {currentProductividad.bmph}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="h-2.5 rounded-full bg-blue-600" 
            style={{ width: `${(currentProductividad.bmph / 100) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Tiempo de ciclo */}
      <div className="mb-2">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Tiempo de Ciclo Camión (min)</span>
          <span className="text-sm font-semibold text-green-600">
            {currentTiempoCamion}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="h-2.5 rounded-full bg-green-600" 
            style={{ width: `${(currentTiempoCamion / 60) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Ocupación por tipo */}
      <div className="mt-5">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Ocupación de Patio por Tipo</h4>
        <div className="flex justify-between">
          {ocupacionPatioData.map((item, index) => (
            <div key={index} className="text-center">
              <div className="inline-block w-16 h-16 relative mb-1">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold">{item.value}%</span>
                </div>
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="8"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke={getColorForOcupacion(item.value)}
                    strokeWidth="8"
                    strokeDasharray={`${item.value * 1.76} 176`}
                  />
                </svg>
              </div>
              <p className="text-xs text-gray-600">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};