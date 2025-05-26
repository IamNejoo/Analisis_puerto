import React from 'react';
import { PortMap } from '../map/PortMap';
import { PortMapLegend } from '../map/PortMapLegend';
import type { Filters } from '../../types';

interface MapPanelProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filters: Filters;
  getColorForOcupacion: (value: number) => string;
}

export const MapPanel: React.FC<MapPanelProps> = ({
  activeTab,
  setActiveTab,
  filters,
  getColorForOcupacion
}) => {
  return (
    <div className="col-span-8 bg-white rounded-lg shadow-md p-4 h-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg text-gray-800">Mapa de Terminal</h3>
        <div className="flex space-x-1">
          <button 
            className={`px-3 py-1 rounded text-sm ${activeTab === 'operativo' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} transition-colors hover:bg-opacity-90`} 
            onClick={() => setActiveTab('operativo')}
          >
            Operativo
          </button>
          <button 
            className={`px-3 py-1 rounded text-sm ${activeTab === 'analitico' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} transition-colors hover:bg-opacity-90`} 
            onClick={() => setActiveTab('analitico')}
          >
            Analítico
          </button>
          <button 
            className={`px-3 py-1 rounded text-sm ${activeTab === 'planificacion' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} transition-colors hover:bg-opacity-90`} 
            onClick={() => setActiveTab('planificacion')}
          >
            Planificación
          </button>
        </div>
      </div>
      
      {/* Map Component */}
      <PortMap 
        filters={filters} 
        getColorForOcupacion={getColorForOcupacion} 
      />
      
      {/* Map Legend */}
      <PortMapLegend />
    </div>
  );
};