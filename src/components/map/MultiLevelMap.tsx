import React from 'react';
import type { ViewState, Filters } from '../../types';
import { TerminalView } from './views/TerminalView';
import { PatioView } from './views/PatioView';
import { BloqueView } from './views/BloqueView';
import { NavigationBreadcrumb } from './NavigationBreadcrumb';

interface MultiLevelMapProps {
  viewState: ViewState;
  filters: Filters;
  zoomTransition: boolean;
  onZoomToPatio: (patioId: string) => void;
  onZoomToBloque: (patioId: string, bloqueId: string) => void;
  onZoomOut: () => void;
  onZoomToTerminal: () => void;
  getColorForOcupacion: (value: number) => string;
}

export const MultiLevelMap: React.FC<MultiLevelMapProps> = ({
  viewState,
  filters,
  zoomTransition,
  onZoomToPatio,
  onZoomToBloque,
  onZoomOut,
  onZoomToTerminal,
  getColorForOcupacion
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
    <div className="w-full h-full relative bg-gray-50 rounded-lg overflow-hidden">
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
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm font-medium">Cargando vista...</span>
          </div>
        </div>
      )}
      
      {/* Contenedor del mapa con transición */}
      <div 
        className={`w-full h-full transition-all duration-300 ease-in-out ${
          zoomTransition ? 'scale-95 opacity-30' : 'scale-100 opacity-100'
        }`}
      >
        {renderCurrentView()}
      </div>

      {/* Controles flotantes */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col space-y-2">
        {/* Información del nivel actual */}
        <div className="bg-white rounded-lg shadow-lg px-3 py-2 text-xs border border-gray-200">
          <div className="font-medium text-gray-700">
            {viewState.level === 'terminal' && 'Vista General del Terminal'}
            {viewState.level === 'patio' && `Patio ${viewState.selectedPatio}`}
            {viewState.level === 'bloque' && `Bloque ${viewState.selectedBloque}`}
          </div>
          <div className="text-gray-500 text-xs">
            {viewState.level === 'terminal' && 'Haga clic en un patio para ver detalles'}
            {viewState.level === 'patio' && 'Haga clic en un bloque para ver bahías'}
            {viewState.level === 'bloque' && 'Vista detallada de bahías individuales'}
          </div>
        </div>

        {/* Botón de pantalla completa (opcional) */}
        <button
          className="bg-white rounded-lg shadow-lg p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors border border-gray-200"
          title="Alternar pantalla completa"
          onClick={() => {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              document.documentElement.requestFullscreen();
            }
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
        </button>
      </div>
    </div>
  );
};