import React from 'react';
import { PortMap } from '../PortMap';
import type { Filters } from '../../../types';
import { patioData } from '../../../data/patioData';

interface TerminalViewProps {
  filters: Filters;
  onPatioClick: (patioId: string) => void;
  getColorForOcupacion: (value: number) => string;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  filters,
  onPatioClick,
  getColorForOcupacion
}) => {
  return (
    <div className="w-full h-full overflow-hidden bg-gray-100 rounded-lg relative">
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 1165.9 595.22"
        className="cursor-pointer"
      >
        <g transform="translate(-19.249 -158.67)">
          {/* Mapa actual */}
          <PortMap 
            filters={filters} 
            getColorForOcupacion={getColorForOcupacion}
          />
          
          {/* Overlay clickeable para patios */}
          <ClickablePatioOverlays onPatioClick={onPatioClick} />
        </g>
      </svg>

      {/* Tooltips informativos */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 text-xs border border-gray-200 max-w-xs">
        <h4 className="font-semibold text-gray-800 mb-2">💡 Navegación Interactiva</h4>
        <ul className="space-y-1 text-gray-600">
          <li>• Haga clic en un patio para vista macro</li>
          <li>• Use los filtros laterales para mostrar/ocultar elementos</li>
          <li>• Los colores indican niveles de ocupación</li>
        </ul>
      </div>
    </div>
  );
};

// Componente para áreas clickeables invisibles sobre los patios
const ClickablePatioOverlays: React.FC<{ onPatioClick: (id: string) => void }> = ({ onPatioClick }) => {
  return (
    <g id="clickable-patio-areas">
      {patioData.map(patio => (
        <g key={patio.id}>
          {/* Área clickeable */}
          <rect
            x={patio.bounds.x}
            y={patio.bounds.y}
            width={patio.bounds.width}
            height={patio.bounds.height}
            fill="rgba(59, 130, 246, 0.1)"
            stroke="rgba(59, 130, 246, 0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="cursor-pointer hover:fill-blue-200 hover:stroke-blue-500 transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onPatioClick(patio.id);
            }}
          />
          
          {/* Etiqueta del patio */}
          <g 
            className="cursor-pointer pointer-events-none"
            opacity="0.9"
          >
            <rect
              x={patio.bounds.x + 5}
              y={patio.bounds.y + 5}
              width={patio.name.length * 8 + 16}
              height="24"
              fill="rgba(59, 130, 246, 0.9)"
              rx="4"
            />
            <text
              x={patio.bounds.x + 13}
              y={patio.bounds.y + 21}
              fill="white"
              fontSize="12"
              fontWeight="bold"
              className="select-none"
            >
              📋 {patio.name}
            </text>
          </g>

          {/* Indicador de ocupación */}
          <g className="pointer-events-none">
            <circle
              cx={patio.bounds.x + patio.bounds.width - 20}
              cy={patio.bounds.y + 20}
              r="12"
              fill={
                patio.ocupacionTotal < 70 ? '#10B981' :
                patio.ocupacionTotal < 85 ? '#F59E0B' : '#EF4444'
              }
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={patio.bounds.x + patio.bounds.width - 20}
              y={patio.bounds.y + 25}
              fill="white"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
              className="select-none"
            >
              {patio.ocupacionTotal}%
            </text>
          </g>
        </g>
      ))}
      
      {/* Leyenda de interactividad */}
      <g transform="translate(50, 50)">
        <rect
          width="200"
          height="60"
          fill="rgba(255, 255, 255, 0.95)"
          stroke="rgba(0, 0, 0, 0.1)"
          strokeWidth="1"
          rx="8"
        />
        <text x="10" y="20" fontSize="12" fontWeight="bold" fill="#374151">
          🖱️ Áreas Interactivas
        </text>
        <text x="10" y="35" fontSize="10" fill="#6B7280">
          Haga clic en las áreas resaltadas
        </text>
        <text x="10" y="48" fontSize="10" fill="#6B7280">
          para explorar en detalle
        </text>
      </g>
    </g>
  );
};