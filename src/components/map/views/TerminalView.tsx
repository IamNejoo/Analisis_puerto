// src/components/map/views/TerminalView.tsx
import React, { useState } from 'react';
import { PortMap } from '../PortMap';
import type { Filters } from '../../../types';
import { useViewNavigation } from '../../../contexts/ViewNavigationContext';

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
  const { zoomToBloque } = useViewNavigation();
  const [hoveredPatio, setHoveredPatio] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Manejador para clics en bloques específicos con transición
  const handleBlockClick = (e: React.MouseEvent, patioId: string, bloqueId: string) => {
    e.stopPropagation();
    setIsTransitioning(true);

    setTimeout(() => {
      zoomToBloque(patioId, bloqueId);
    }, 300);
  };

  // Manejador para clics en áreas de patios con transición
  const handlePatioAreaClick = (e: React.MouseEvent, patioId: string) => {
    e.stopPropagation();
    setIsTransitioning(true);

    setTimeout(() => {
      onPatioClick(patioId);
    }, 300);
  };

  return (
    <div className={`w-full h-full overflow-hidden bg-gray-100 rounded-lg relative transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1165.9 595.22"
        className="cursor-pointer"
      >
        <defs>
          {/* Filtro para efecto de brillo */}
          <filter id="brightness-filter">
            <feComponentTransfer>
              <feFuncR type="linear" slope="1.3" />
              <feFuncG type="linear" slope="1.3" />
              <feFuncB type="linear" slope="1.3" />
            </feComponentTransfer>
          </filter>
        </defs>

        <g transform="translate(-19.249 -158.67)">
          {/* Mapa base con entidades */}
          <PortMap
            filters={filters}
            getColorForOcupacion={getColorForOcupacion}
          />

          {/* Overlay de áreas clickeables para los rectángulos de patios */}
          <PatioAreaClickableOverlay
            onPatioAreaClick={handlePatioAreaClick}
            hoveredPatio={hoveredPatio}
            setHoveredPatio={setHoveredPatio}
          />

          {/* Overlay de interactividad para bloques específicos */}
          <BlockInteractiveOverlay
            onBlockClick={handleBlockClick}
          />
        </g>
      </svg>

      {/* Tooltips informativos con animación */}
      <div className={`absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 text-xs border border-gray-200 max-w-xs transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
        }`}>
        <h4 className="font-semibold text-gray-800 mb-2">💡 Navegación Interactiva</h4>
        <ul className="space-y-1 text-gray-600">
          <li>• Pase el mouse sobre un área para resaltarla</li>
          <li>• Clic en área coloreada: Vista del patio</li>
          <li>• Clic en círculos (H2, C3, etc.): Vista del bloque</li>
        </ul>
      </div>
    </div>
  );
};

// Componente para hacer clickeables los rectángulos de patios con efecto brillante
const PatioAreaClickableOverlay: React.FC<{
  onPatioAreaClick: (e: React.MouseEvent, patioId: string) => void,
  hoveredPatio: string | null,
  setHoveredPatio: (patioId: string | null) => void
}> = ({ onPatioAreaClick, hoveredPatio, setHoveredPatio }) => {

  return (
    <g id="patio-area-clickable-overlay">
      {/* Patio O'Higgins - Rectángulos azules H1-H5 */}
      <g id="ohiggins-clickable"
        onMouseEnter={() => setHoveredPatio('ohiggins')}
        onMouseLeave={() => setHoveredPatio(null)}
      >
        {['m367.50118 437.76417 41.75314-0.91967 3.49475 1.28754 1.83935 1.47147 1.10361 1.10361 0.18393 14.8987-0.73574 2.02328-1.65541 1.65541-1.83934 1.47147-80.56333-0.18393c0 0-4.23049-1.47148 2.02328-4.41443 6.25378-2.94295 34.39576-18.39345 34.39576-18.39345z',
          'm302.02049 490.18551 114.77514 0.91967 0.18394-17.65771-0.36787-1.83935-1.10361-1.47147-1.28754-1.47148-2.02328-1.28754h-89.76005l-4.23049 0.73574-3.49476 1.47147-2.75902 2.57509-2.75901 2.39114-2.57509 4.04656-2.39115 4.96624-1.83934 4.23049z',
          'm302.75623 499.1983h114.0394l0.36787 24.46329-109.62497-0.73574-1.47148-2.75901-2.20721-8.46099z',
          'm308.09033 525.317 5.70197 20.60067 1.83934 1.65541 2.75902 1.83935 4.2305 0.73573 88.10463 0.18394 3.12689-1.47148 2.57508-2.57508 1.47148-3.31082v-17.84165z',
          'm323.54083 557.87341 91.59939-0.36786 2.57509 1.83934 1.1036 2.94295-0.5518 21.15247-3.12689 3.49476-2.57508 0.73574-78.17217 0.36787-4.2305-1.10361-1.83934-2.75902-8.64493-20.41673v-2.39115l1.28755-2.39115z'
        ].map((d, index) => (
          <path
            key={`ohiggins-${index}`}
            d={d}
            fill="transparent"
            stroke={hoveredPatio === 'ohiggins' ? 'rgba(96, 165, 250, 0.8)' : 'transparent'}
            strokeWidth={hoveredPatio === 'ohiggins' ? '2' : '0'}
            filter={hoveredPatio === 'ohiggins' ? 'url(#brightness-filter)' : ''}
            className={`cursor-pointer transition-all duration-200 ${hoveredPatio === 'ohiggins' ? 'fill-blue-400 fill-opacity-30' : 'hover:fill-blue-200 hover:fill-opacity-20'
              }`}
            onClick={(e) => onPatioAreaClick(e, 'ohiggins')}
          />
        ))}
      </g>

      {/* Patio Costanera - Rectángulos amarillos */}
      <g id="costanera-clickable"
        onMouseEnter={() => setHoveredPatio('costanera')}
        onMouseLeave={() => setHoveredPatio(null)}
      >
        {['m447.51 521.45-0.73574 24.279 1.8394 2.3911 2.943 1.4715 131.88-0.5518 3.4948-2.3912 1.4715-1.6554-0.36787-22.256-1.2876-2.943-1.8393-1.1036-134.27-0.91967-2.2072 1.2875z',
          'm451.19 556.59 131.33-0.18393 3.1269 0.91967 1.4715 2.0233 0.18394 25.199-1.4715 2.3912-2.943 1.6554-132.8-0.5518-2.759-1.4715-0.91967-2.2072 0.36787-23.911 2.0233-2.759z',
          'm609.56 518.88 103.74-0.18393 4.2305 2.3912 0.91967 3.8626-0.18393 19.865-1.1036 2.759-2.759 1.6554h-100.98l-4.2305-0.91967-2.0233-2.0233-0.55181-1.1036 0.18394-24.095z',
          'm607.26 560.3v25.232l0.52025 1.3006 0.91043 0.78037 2.211 0.26012 107.82 0.13006-0.26012-27.443-1.6908-2.081-2.8614-1.1706-102.49-0.52024-1.9509 0.65031-1.1706 0.6503z',
          'm623.12 590.35 52.025 17.558 37.328 0.39018 3.9018-3.1215 1.9509-3.3816v-11.706z',
          'm747.51 549.41 112.02-0.18394 3.3108-1.6554 1.6554-3.1269v-21.152l-2.2072-3.4948-3.6787-1.6554-108.71 0.18393-3.8626 0.91967-1.8393 1.4715-1.6554 3.1269 0.18393 22.256 1.2875 1.8394z',
          'm748.61 556.77 108.89-0.18394 3.1269 1.2875 2.2072 1.6554 1.1036 3.1269 0.18394 18.026-0.91967 2.2072-1.1036 1.4715-2.943 0.91967-112.94-0.18394-2.3912-1.1036-0.91967-2.0233 0.5518-20.785 0.91967-2.3912 1.8394-0.91968z',
          'm745.12 591.9 115.33-0.18393 3.1269 1.8393 0.36787 3.3108-0.18393 16.37-1.4715 2.3911-1.8393 0.91968-2.0233 0.18393-109.81 1.1036-3.3108-0.91967-1.8393-2.5751-0.18393-18.945 0.73573-1.8394z',
          'm856.22 618.76-107.42 0.91967-3.6787 1.6554-1.4715 2.5751-0.18393 3.3108 0.5518 3.4948 1.4715 2.3911 2.0233 2.5751 3.4948 1.4715 36.971 13.795 72.286 0.55181 3.3108-1.2875 1.2876-3.4948-0.18394-22.44-1.4715-2.759-2.5751-1.8394z'
        ].map((d, index) => (
          <path
            key={`costanera-${index}`}
            d={d}
            fill="transparent"
            stroke={hoveredPatio === 'costanera' ? 'rgba(251, 191, 36, 0.8)' : 'transparent'}
            strokeWidth={hoveredPatio === 'costanera' ? '2' : '0'}
            filter={hoveredPatio === 'costanera' ? 'url(#brightness-filter)' : ''}
            className={`cursor-pointer transition-all duration-200 ${hoveredPatio === 'costanera' ? 'fill-yellow-400 fill-opacity-30' : 'hover:fill-yellow-200 hover:fill-opacity-20'
              }`}
            onClick={(e) => onPatioAreaClick(e, 'costanera')}
          />
        ))}
      </g>

      {/* Patio Tebas - Área verde */}
      <g id="tebas-clickable"
        onMouseEnter={() => setHoveredPatio('tebas')}
        onMouseLeave={() => setHoveredPatio(null)}
      >
        <path
          d="m278.47687 336.41625 9.5646-11.22001 47.08723 38.25838-9.56459 10.85214z"
          fill="transparent"
          stroke={hoveredPatio === 'tebas' ? 'rgba(52, 211, 153, 0.8)' : 'transparent'}
          strokeWidth={hoveredPatio === 'tebas' ? '2' : '0'}
          filter={hoveredPatio === 'tebas' ? 'url(#brightness-filter)' : ''}
          className={`cursor-pointer transition-all duration-200 ${hoveredPatio === 'tebas' ? 'fill-green-400 fill-opacity-30' : 'hover:fill-green-200 hover:fill-opacity-20'
            }`}
          onClick={(e) => onPatioAreaClick(e, 'tebas')}
        />
      </g>
    </g>
  );
};

// Componente para hacer los bloques individuales clickeables
const BlockInteractiveOverlay: React.FC<{
  onBlockClick: (e: React.MouseEvent, patioId: string, bloqueId: string) => void
}> = ({ onBlockClick }) => {

  const blockAreas = [
    // Patio O'Higgins - Bloques H1-H5
    { patioId: 'ohiggins', bloqueId: 'H1', cx: 381.27, cy: 448.75, r: 15 },
    { patioId: 'ohiggins', bloqueId: 'H2', cx: 364.67, cy: 478.96, r: 15 },
    { patioId: 'ohiggins', bloqueId: 'H3', cx: 363.52, cy: 511.07, r: 15 },
    { patioId: 'ohiggins', bloqueId: 'H4', cx: 364.13, cy: 537.69, r: 15 },
    { patioId: 'ohiggins', bloqueId: 'H5', cx: 369.67, cy: 572.59, r: 15 },

    // Patio Costanera - Bloques C1-C9 y SE
    { patioId: 'costanera', bloqueId: 'C1', cx: 518.14, cy: 533.78, r: 18 },
    { patioId: 'costanera', bloqueId: 'C2', cx: 517.14, cy: 572.37, r: 18 },
    { patioId: 'costanera', bloqueId: 'C3', cx: 660.00, cy: 533.37, r: 18 },
    { patioId: 'costanera', bloqueId: 'C4', cx: 661.64, cy: 572.05, r: 18 },
    { patioId: 'costanera', bloqueId: 'C5', cx: 690.03, cy: 598.81, r: 15 },
    { patioId: 'costanera', bloqueId: 'C6', cx: 801.50, cy: 534.11, r: 18 },
    { patioId: 'costanera', bloqueId: 'C7', cx: 801.03, cy: 570.94, r: 18 },
    { patioId: 'costanera', bloqueId: 'C8', cx: 797.82, cy: 604.56, r: 18 },
    { patioId: 'costanera', bloqueId: 'C9', cx: 835.59, cy: 635.09, r: 18 },
    { patioId: 'costanera', bloqueId: 'SE', cx: 780.40, cy: 633.00, r: 18 },

    // Patio Tebas - Bloques T1-T4
    { patioId: 'tebas', bloqueId: 'T1', cx: 258.33, cy: 339.38, r: 15 },
    { patioId: 'tebas', bloqueId: 'T2', cx: 258.48, cy: 361.53, r: 15 },
    { patioId: 'tebas', bloqueId: 'T3', cx: 258.25, cy: 384.51, r: 15 },
    { patioId: 'tebas', bloqueId: 'T4', cx: 258.89, cy: 407.48, r: 15 },
  ];

  return (
    <g id="block-interactive-areas">
      {blockAreas.map(({ patioId, bloqueId, cx, cy, r }) => (
        <g key={`${patioId}-${bloqueId}`}>
          {/* Área clickeable del bloque */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="transparent"
            stroke="transparent"
            strokeWidth="0"
            className="cursor-pointer hover:fill-white hover:fill-opacity-40 transition-all duration-200"
            onClick={(e) => onBlockClick(e, patioId, bloqueId)}
            style={{ pointerEvents: 'all' }}
          >
            <title>{`Ir directamente a ${bloqueId}`}</title>
          </circle>
        </g>
      ))}
    </g>
  );
};