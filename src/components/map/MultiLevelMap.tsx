// src/components/map/MultiLevelMap.tsx
import React from 'react';
import type { ViewState, Filters } from '../../types';
import { TerminalView } from './views/TerminalView';
import { PatioView } from './views/PatioView';
import { BloqueView } from './views/BloqueView';
import { NavigationBreadcrumb } from './NavigationBreadcrumb';
import { TimeControl } from '../shared/TimeControl';

interface MultiLevelMapProps {
  viewState: ViewState;
  filters: Filters;
  zoomTransition: boolean;
  onZoomToPatio: (patioId: string) => void;
  onZoomToBloque: (patioId: string, bloqueId: string) => void;
  onZoomOut: () => void;
  onZoomToTerminal: () => void;
  getColorForOcupacion: (value: number) => string;
  blockCapacities?: Record<string, number>;
}

export const MultiLevelMap: React.FC<MultiLevelMapProps> = ({
  viewState,
  filters,
  zoomTransition,
  onZoomToPatio,
  onZoomToBloque,
  onZoomOut,
  onZoomToTerminal,
  getColorForOcupacion,
  blockCapacities
}) => {
  const renderCurrentView = () => {
    switch (viewState.level) {
      case 'terminal':
        return (
          <TerminalView
            filters={filters}
            onPatioClick={onZoomToPatio}
            getColorForOcupacion={getColorForOcupacion}
          />
        );

      case 'patio':
        return (
          <PatioView
            patioId={viewState.selectedPatio!}
            onBloqueClick={onZoomToBloque}
            getColorForOcupacion={getColorForOcupacion}
          />
        );

      case 'bloque':
        return (
          <BloqueView
            patioId={viewState.selectedPatio!}
            bloqueId={viewState.selectedBloque!}
            getColorForOcupacion={getColorForOcupacion}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full relative bg-gray-50 overflow-hidden flex flex-col">
      {/* BARRA DE CONTROL TEMPORAL - SIEMPRE ARRIBA */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0 z-30">
        <TimeControl />
      </div>

      {/* Breadcrumb de navegación */}
      <NavigationBreadcrumb
        viewState={viewState}
        onZoomOut={onZoomOut}
        onZoomToTerminal={onZoomToTerminal}
      />

      {/* Indicador de carga durante transiciones */}
      {zoomTransition && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
          <div className="flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg font-medium">Cargando vista...</span>
          </div>
        </div>
      )}

      {/* Contenedor del mapa */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${zoomTransition ? 'scale-95 opacity-30' : 'scale-100 opacity-100'
          }`}
      >
        {renderCurrentView()}
      </div>
    </div>
  );
};