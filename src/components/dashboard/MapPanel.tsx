// src/components/dashboard/MapPanel.tsx - ACTUALIZACIÓN COMPLETA
import React from 'react';
import { useViewNavigation } from '../../contexts/ViewNavigationContext';
import { ChevronLeft, Home } from 'lucide-react';
import type { Filters } from '../../types';
import { MultiLevelMap } from '../map/MultiLevelMap';
import { PortMapLegend } from '../map/PortMapLegend';
import { MapKPIOverlay } from '../map/MapKPIOverlay'; // IMPORTAR AQUÍ

interface MapPanelProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filters: Filters;
  getColorForOcupacion: (value: number) => string;
  timeState: any;
  isLoading: boolean;
  blockCapacities?: Record<string, number>;
}

export const MapPanel: React.FC<MapPanelProps> = ({
  filters,
  getColorForOcupacion,
  blockCapacities
}) => {
  const { viewState, zoomOut, zoomToTerminal, zoomToPatio, zoomToBloque } = useViewNavigation();
  const [zoomTransition, setZoomTransition] = React.useState(false);

  const handleZoomToPatio = React.useCallback((patioId: string) => {
    console.log('🔍 MapPanel: Zoom to patio:', patioId);
    setZoomTransition(true);
    setTimeout(() => {
      zoomToPatio(patioId);
      setZoomTransition(false);
    }, 300);
  }, [zoomToPatio]);

  const handleZoomToBloque = React.useCallback((patioId: string, bloqueId: string) => {
    setZoomTransition(true);
    setTimeout(() => {
      zoomToBloque(patioId, bloqueId);
      setZoomTransition(false);
    }, 300);
  }, [zoomToBloque]);

  const handleZoomOut = React.useCallback(() => {
    setZoomTransition(true);
    setTimeout(() => {
      zoomOut();
      setZoomTransition(false);
    }, 300);
  }, [zoomOut]);

  const handleZoomToTerminal = React.useCallback(() => {
    setZoomTransition(true);
    setTimeout(() => {
      zoomToTerminal();
      setZoomTransition(false);
    }, 300);
  }, [zoomToTerminal]);

  return (
    <div className="relative h-full flex flex-col bg-white rounded-lg overflow-hidden">
      {/* Header con título y navegación integrada */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          {/* Título del mapa */}
          <h2 className="text-lg font-semibold text-gray-800">
            Mapa de Terminal - {viewState.selectedPatio || 'Vista General'}
          </h2>

          {/* Controles del header (búsqueda, etc) - espacio para futuras opciones */}
          <div className="flex items-center space-x-4">
            {/* Aquí pueden ir controles adicionales */}
          </div>
        </div>

        {/* Segunda línea con descripción y navegación */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {viewState.level === 'terminal'
              ? 'Vista general del terminal portuario'
              : `Vista macro del patio ${viewState.selectedPatio} - Distribución de bloques`
            }
          </p>

          {/* Controles de navegación */}
          <div className="flex items-center space-x-2">
            {viewState.level !== 'terminal' && (
              <button
                onClick={handleZoomOut}
                className="flex items-center px-3 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                <ChevronLeft size={14} className="mr-1" />
                Volver
              </button>
            )}

            <button
              onClick={handleZoomToTerminal}
              className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewState.level === 'terminal'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              disabled={viewState.level === 'terminal'}
            >
              <Home size={14} className="mr-1" />
              Terminal
            </button>

            {/* Breadcrumbs compactos */}
            {viewState.selectedPatio && (
              <>
                <span className="text-gray-400 text-sm">›</span>
                <span className="px-3 py-1 bg-blue-100 border border-blue-300 rounded-md text-sm font-medium text-blue-700">
                  {viewState.selectedPatio}
                </span>
              </>
            )}

            {viewState.level === 'patio' && (
              <span className="px-3 py-1 bg-green-100 border border-green-300 rounded-md text-sm font-medium text-green-700 ml-2">
                Vista Macro
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KPIs del área principal - Solo si estamos en vista de patio */}


      {/* Área del mapa - CONTENEDOR RELATIVO */}
      <div className="flex-1 relative overflow-hidden bg-gray-100">
        <MultiLevelMap
          viewState={viewState}
          filters={filters}
          zoomTransition={zoomTransition}
          onZoomToPatio={handleZoomToPatio}
          onZoomToBloque={handleZoomToBloque}
          onZoomOut={handleZoomOut}
          onZoomToTerminal={handleZoomToTerminal}
          getColorForOcupacion={getColorForOcupacion}
          blockCapacities={blockCapacities}
        />

        {/* KPIs Overlay - AQUÍ AL MISMO NIVEL QUE LA LEYENDA */}
        <MapKPIOverlay
          dataFilePath="/data/resultados_congestion_SAI_2022.csv"
          blockCapacities={blockCapacities}
        />

        {/* Legend en la esquina inferior izquierda */}
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg z-10">
          <PortMapLegend />
        </div>
      </div>

      {/* Sección de Bloques del Patio - Solo cuando estamos en vista de patio */}
      {viewState.level === 'patio' && viewState.selectedPatio === 'costanera' && (
        <div className="bg-white border-t border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Bloques del Patio</h3>

          <div className="grid grid-cols-4 gap-4">
            {/* Bloques existentes... */}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPanel;