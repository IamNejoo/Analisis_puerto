// src/components/dashboard/MapPanel.tsx - CORREGIDO
import React from 'react';
import { MultiLevelMap } from '../map/MultiLevelMap';
import { PortMapLegend } from '../map/PortMapLegend';
import { MapKPIOverlay } from '../map/MapKPIOverlay';
import { TimeControl } from '../shared/TimeControl';
import { useViewNavigation } from '../../contexts/ViewNavigationContext';
import type { Filters, TimeState } from '../../types';
import { ZoomOut, RotateCcw } from 'lucide-react';

interface MapPanelProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filters: Filters;
  getColorForOcupacion: (value: number) => string;
  timeState?: TimeState | null;
  isLoading?: boolean;
  blockCapacities?: Record<string, number>;
}

export const MapPanel: React.FC<MapPanelProps> = ({
  activeTab,
  setActiveTab,
  filters,
  getColorForOcupacion,
  timeState,
  isLoading = false,
  blockCapacities
}) => {
  const {
    viewState,
    zoomTransition,
    zoomToPatio,
    zoomToBloque,
    zoomOut,
    zoomToTerminal,
    getNavigationPath
  } = useViewNavigation();

  const getViewTitle = () => {
    const path = getNavigationPath();
    return `Mapa de Terminal${path.length > 1 ? ` - ${path.slice(1).join(' > ')}` : ''}`;
  };

  const getViewDescription = () => {
    switch (viewState.level) {
      case 'terminal': return 'Vista general de todo el terminal portuario';
      case 'patio': return `Vista macro del patio ${viewState.selectedPatio} - Distribución de bloques`;
      case 'bloque': return `Vista micro del bloque ${viewState.selectedBloque} - Bahías individuales`;
      default: return '';
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-white rounded-lg shadow-md relative">
      {/* CONTROL DE TIEMPO - SIEMPRE VISIBLE ARRIBA DEL MAPA */}
      <TimeControl className="m-4 mb-0" />

      <div className="flex flex-col h-full p-4 pt-2">
        {/* Header */}
        <div className="flex justify-between items-center mb-3 flex-shrink-0">
          <div>
            <h3 className="font-bold text-lg text-gray-800">{getViewTitle()}</h3>
            <p className="text-sm text-gray-600">{getViewDescription()}</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Navegación */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={zoomToTerminal}
                disabled={viewState.level === 'terminal'}
                className={`p-2 rounded transition-colors ${viewState.level === 'terminal'
                  ? 'bg-blue-600 text-white cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-200'
                  }`}
                title="Vista General"
              >
                <ZoomOut size={16} />
              </button>
              <button
                onClick={zoomOut}
                disabled={viewState.level === 'terminal'}
                className={`p-2 rounded transition-colors ${viewState.level === 'terminal'
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-200'
                  }`}
                title="Nivel Anterior"
              >
                <RotateCcw size={16} />
              </button>
            </div>
            {/* Tabs */}
            <div className="flex space-x-1">
              <button
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${activeTab === 'operativo'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                onClick={() => setActiveTab('operativo')}
              >
                Operativo
              </button>
              <button
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${activeTab === 'analitico'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                onClick={() => setActiveTab('analitico')}
              >
                Analítico
              </button>
              <button
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${activeTab === 'planificacion'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                onClick={() => setActiveTab('planificacion')}
              >
                Planificación
              </button>
            </div>
          </div>
        </div>

        {/* Contenido del mapa - CONTENEDOR RELATIVO */}
        <div className="flex-1 min-h-0 relative">
          <MultiLevelMap
            viewState={viewState}
            filters={filters}
            zoomTransition={zoomTransition}
            onZoomToPatio={zoomToPatio}
            onZoomToBloque={zoomToBloque}
            onZoomOut={zoomOut}
            onZoomToTerminal={zoomToTerminal}
            getColorForOcupacion={getColorForOcupacion}
            blockCapacities={blockCapacities}
          />

          {/* KPIs Overlay - SOLO EN VISTA TERMINAL */}
          {viewState.level === 'terminal' && (
            <MapKPIOverlay
              dataFilePath="/data/resultados_congestion_SAI_2022.csv"
              blockCapacities={blockCapacities}
            />
          )}

          {/* Overlay de carga */}
          {isLoading && !zoomTransition && (
            <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-30">
              <div className="bg-white rounded-lg shadow-lg px-4 py-3 flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-gray-700">Actualizando datos...</span>
              </div>
            </div>
          )}
        </div>

        {/* Leyenda solo en terminal */}
        {viewState.level === 'terminal' && (
          <div className="flex-shrink-0 mt-3">
            <PortMapLegend />
          </div>
        )}

        {/* Etiquetas de nivel en la esquina inferior izquierda */}
        <div className="absolute bottom-4 left-4 flex flex-col space-y-1 z-10">
          <div className={`px-2 py-1 rounded text-xs font-medium ${viewState.level === 'terminal' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>General</div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${viewState.level === 'patio' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>Macro</div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${viewState.level === 'bloque' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>Micro</div>
        </div>
      </div>
    </div>
  );
};