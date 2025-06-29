// src/components/dashboard/MapPanel.tsx
import React from 'react';
import { useViewNavigation } from '../../contexts/ViewNavigationContext';
import { ChevronLeft, Home } from 'lucide-react';
import type { Filters } from '../../types';
import { MultiLevelMap } from '../map/MultiLevelMap';
import { PortMapLegend } from '../map/_PortMapLegend';
import { MapKPIOverlay } from '../map/MapKPIOverlay';
import { MovementAnalysisPanel } from '../map/MovementAnalysisPanel';
import { TimeControl } from '../shared/TimeControl';

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
    <div className="relative h-full flex flex-col bg-slate-800 rounded-lg overflow-hidden">
      {/* Header con título y navegación integrada */}
      <div className="bg-slate-700 border-b border-slate-600 px-4 py-3 z-50 relative">

        <TimeControl />

        <div className="flex items-center justify-between mb-2">
          {/* Título del mapa */}
          <h2 className="text-lg font-semibold text-slate-100">
            Mapa de Terminal - {viewState.selectedPatio || 'Vista General'}
          </h2>

          {/* Controles del header (búsqueda, etc) - espacio para futuras opciones */}
          <div className="flex items-center space-x-4">
            {/* Aquí pueden ir controles adicionales */}
          </div>
        </div>

        {/* Segunda línea con descripción y navegación */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            {viewState.level === 'terminal'
              ? 'Vista general del terminal portuario'
              : viewState.level === 'patio'
                ? `Vista macro del patio ${viewState.selectedPatio} - Distribución de bloques`
                : `Vista micro del bloque ${viewState.selectedBloque}`
            }
          </p>

          {/* Controles de navegación */}
          <div className="flex items-center space-x-2">
            {viewState.level !== 'terminal' && (
              <button
                onClick={handleZoomOut}
                className="flex items-center px-3 py-1 bg-slate-800 border border-slate-600 rounded-md hover:bg-slate-700 transition-colors text-sm font-medium text-slate-300"
              >
                <ChevronLeft size={14} className="mr-1" />
                Volver
              </button>
            )}

            <button
              onClick={handleZoomToTerminal}
              className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewState.level === 'terminal'
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700'
                }`}
              disabled={viewState.level === 'terminal'}
            >
              <Home size={14} className="mr-1" />
              Terminal
            </button>

            {/* Breadcrumbs compactos */}
            {viewState.selectedPatio && (
              <>
                <span className="text-slate-500 text-sm">›</span>
                <span className="px-3 py-1 bg-blue-950/30 border border-blue-700 rounded-md text-sm font-medium text-blue-300">
                  {viewState.selectedPatio}
                </span>
              </>
            )}

            {viewState.selectedBloque && (
              <>
                <span className="text-slate-500 text-sm">›</span>
                <span className="px-3 py-1 bg-cyan-950/30 border border-cyan-700 rounded-md text-sm font-medium text-cyan-300">
                  {viewState.selectedBloque}
                </span>
              </>
            )}

            {/* Badge de vista */}
            {viewState.level === 'patio' && (
              <span className="px-3 py-1 bg-green-950/30 border border-green-700 rounded-md text-sm font-medium text-green-300 ml-2">
                Vista Macro
              </span>
            )}
            {viewState.level === 'bloque' && (
              <span className="px-3 py-1 bg-teal-950/30 border border-teal-700 rounded-md text-sm font-medium text-teal-300 ml-2">
                Vista Micro
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Área del mapa - CONTENEDOR RELATIVO */}
      <div className="flex-1 relative overflow-hidden bg-slate-900">
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

        {/* Panel de Análisis de Movimientos - esquina superior izquierda */}
        <div className="absolute top-8 left-8 z-40">
          <MovementAnalysisPanel />
        </div>

        {/* KPIs Overlay: posicionamiento absoluto y z-40 */}
        <div className="absolute top-8 right-8 z-40">
          <MapKPIOverlay
            key={`kpi-overlay-${viewState.level}`}
            dataFilePath="/data/resultados_congestion_SAI_2022.csv"
            blockCapacities={blockCapacities}
          />
        </div>

        {/* Leyenda en la esquina inferior izquierda */}
      </div>
    </div>
  );
};

export default MapPanel;