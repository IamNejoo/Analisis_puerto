import React from 'react';
import { ChevronRight, ArrowLeft, Home } from 'lucide-react';
import type { ViewState } from '../../types';

interface NavigationBreadcrumbProps {
  viewState: ViewState;
  onZoomOut: () => void;
  onZoomToTerminal: () => void;
}

export const NavigationBreadcrumb: React.FC<NavigationBreadcrumbProps> = ({
  viewState,
  onZoomOut,
  onZoomToTerminal
}) => {
  const canZoomOut = viewState.level !== 'terminal';

  const getBreadcrumbItems = () => {
    const items = [
      {
        label: 'Terminal',
        active: viewState.level === 'terminal',
        onClick: onZoomToTerminal
      }
    ];

    if (viewState.selectedPatio) {
      items.push({
        label: viewState.selectedPatio.charAt(0).toUpperCase() + viewState.selectedPatio.slice(1),
        active: viewState.level === 'patio',
        onClick: () => {
          if (viewState.level === 'bloque') {
            onZoomOut();
          }
        }
      });
    }

    if (viewState.selectedBloque) {
      items.push({
        label: viewState.selectedBloque,
        active: viewState.level === 'bloque',
        onClick: () => {}
      });
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg px-4 py-2 flex items-center space-x-2 border border-gray-200">
      {/* Botón de volver */}
      {canZoomOut && (
        <button
          onClick={onZoomOut}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 rounded hover:bg-blue-50"
          title="Volver al nivel anterior"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span className="text-sm font-medium">Volver</span>
        </button>
      )}

      {/* Separador */}
      {canZoomOut && (
        <div className="w-px h-6 bg-gray-300 mx-2"></div>
      )}

      {/* Botón home */}
      <button
        onClick={onZoomToTerminal}
        className={`p-1 rounded transition-colors ${
          viewState.level === 'terminal' 
            ? 'text-blue-600 bg-blue-50' 
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        }`}
        title="Ir a vista general del terminal"
      >
        <Home size={16} />
      </button>

      {/* Breadcrumb items */}
      <div className="flex items-center text-sm">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight size={14} className="mx-1 text-gray-400" />}
            <button
              onClick={item.onClick}
              className={`px-2 py-1 rounded transition-colors ${
                item.active
                  ? 'font-semibold text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              disabled={item.active && viewState.level === 'bloque'}
            >
              {item.label}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Indicador de nivel */}
      <div className="ml-4 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 font-medium">
        {viewState.level === 'terminal' && 'Vista General'}
        {viewState.level === 'patio' && 'Vista Macro'}
        {viewState.level === 'bloque' && 'Vista Micro'}
      </div>
    </div>
  );
};