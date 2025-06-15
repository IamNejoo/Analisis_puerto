// src/components/map/views/BloqueView.tsx - COMPLETO CON PANEL LATERAL CORREGIDO
import React, { useState } from 'react';
import { useMicroData, useCurrentMicroFrame, useFilteredMicroBahias } from '../../../hooks/useMicroData';
import { useTimeContext } from '../../../contexts/TimeContext';
import type { MicroBahiaData } from '../../../hooks/useMicroData';
import {
  Package,
  Clock,
  AlertCircle,
  Filter,
  Search,
  Layers,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Info,
  BarChart3
} from 'lucide-react';
import { CorePortKPIPanel } from '../../dashboard/CorePortKPIPanel';

interface BloqueViewProps {
  patioId: string;
  bloqueId: string;
  getColorForOcupacion: (value: number) => string;
}

interface MicroBahiaProps {
  bahia: MicroBahiaData;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rowIndex: number;
  isSelected: boolean;
  onClick: () => void;
}

// Función helper para determinar brillo del color
const consideraColorClaro = (hexColor: string): number => {
  if (!hexColor || typeof hexColor !== 'string' || hexColor.charAt(0) !== '#') {
    return 200;
  }
  const hex = hexColor.replace('#', '');
  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return 200;
  }
  return (r * 299 + g * 587 + b * 114) / 1000;
};

// Componente para cada celda de la grilla
const MicroBahiaComponent: React.FC<MicroBahiaProps> = ({
  bahia,
  position,
  size,
  rowIndex,
  isSelected,
  onClick
}) => {
  const brightness = consideraColorClaro(bahia.color);
  const textColor = brightness > 180 ? 'black' : 'white';

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      className="cursor-pointer transition-all duration-200 hover:opacity-80"
      onClick={onClick}
    >
      <rect
        width={size.width}
        height={size.height}
        fill={bahia.color || '#FFFFFF'}
        stroke={isSelected ? '#7C3AED' : '#666'}
        strokeWidth={isSelected ? 2 : 1}
        className="hover:stroke-2 transition-all"
      />

      {bahia.text && bahia.text !== '-' && bahia.text !== '' && (
        <text
          x={size.width / 2}
          y={size.height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="pointer-events-none font-medium"
          fontSize="11"
          fill={textColor}
        >
          {bahia.text}
        </text>
      )}

      {isSelected && (
        <rect
          width={size.width}
          height={size.height}
          fill="rgba(124, 58, 237, 0.2)"
          stroke="rgba(124, 58, 237, 0.8)"
          strokeWidth="2"
          strokeDasharray="3,2"
          className="pointer-events-none animate-pulse"
        />
      )}
    </g>
  );
};

export const BloqueView: React.FC<BloqueViewProps> = ({
  patioId,
  bloqueId,
  getColorForOcupacion
}) => {
  // Estado local
  const [selectedCell, setSelectedCell] = useState<{ row: number, col: number } | null>(null);
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Contexto de tiempo
  const { timeState } = useTimeContext();

  // Hook para datos micro
  const microData = useMicroData(patioId, bloqueId, timeState.dataSource, timeState.unit);
  const currentFrame = useCurrentMicroFrame(microData);

  // Si hay error, mostrar mensaje
  if (microData.error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold">Error al cargar datos</h3>
          <p className="text-sm">{microData.error}</p>
        </div>
      </div>
    );
  }

  // Configuración del layout
  const containerWidth = 45;
  const containerHeight = 35;
  const containerMargin = 2;
  const blockStartX = 50;
  const blockStartY = 50;
  const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  // Calcular dimensiones totales
  const totalWidth = blockStartX * 2 + 30 * containerWidth + 29 * containerMargin;
  const totalHeight = blockStartY * 2 + 7 * containerHeight + 6 * containerMargin + 60;

  // Filtrar bahías según el grupo seleccionado
  const shouldShowBahia = (bahia: MicroBahiaData) => {
    if (groupFilter === 'all') return true;
    return bahia.group === groupFilter;
  };

  // Obtener grupos únicos del frame actual
  const uniqueGroups = Array.from(new Set(
    microData.processedBahias
      .filter(b => b.group)
      .map(b => b.group)
  )).sort();

  return (
    <div className="w-full h-full bg-gray-50 flex overflow-hidden">
      {/* Panel principal */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header con controles - ALTURA FIJA */}
        <div className="flex-shrink-0 p-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {patioId} - Bloque {bloqueId}
              </h2>
              {currentFrame && (
                <p className="text-gray-600 text-sm mt-1">
                  Turno: {currentFrame.timeLabel} • Vista detallada de bahías
                </p>
              )}
            </div>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium flex items-center">
              <Layers size={12} className="mr-1" />
              Vista Micro - 7x30 posiciones
            </span>
          </div>

          {/* Controles de navegación temporal */}
          {microData.timeFrames.length > 1 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-4">
                {/* Navegación */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => microData.setCurrentFrame(0)}
                    disabled={microData.currentFrame === 0}
                    className="p-2 bg-white rounded border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Ir al inicio"
                  >
                    <SkipBack size={16} />
                  </button>
                  <button
                    onClick={() => microData.setCurrentFrame(microData.currentFrame - 1)}
                    disabled={microData.currentFrame === 0}
                    className="p-2 bg-white rounded border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Turno anterior"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="px-4 py-2 bg-white rounded border border-gray-300 min-w-[120px] text-center">
                    <span className="text-sm text-gray-600">Turno</span>
                    <div className="font-mono font-bold text-lg">{currentFrame?.timeLabel || '0'}</div>
                  </div>

                  <button
                    onClick={() => microData.setCurrentFrame(microData.currentFrame + 1)}
                    disabled={microData.currentFrame === microData.timeFrames.length - 1}
                    className="p-2 bg-white rounded border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Siguiente turno"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => microData.setCurrentFrame(microData.timeFrames.length - 1)}
                    disabled={microData.currentFrame === microData.timeFrames.length - 1}
                    className="p-2 bg-white rounded border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Ir al final"
                  >
                    <SkipForward size={16} />
                  </button>
                </div>

                {/* Timeline slider */}
                <div className="flex-1 flex items-center space-x-3">
                  <Clock size={16} className="text-gray-500" />
                  <input
                    type="range"
                    min="0"
                    max={microData.timeFrames.length - 1}
                    value={microData.currentFrame}
                    onChange={(e) => microData.setCurrentFrame(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600">
                    {microData.currentFrame + 1} / {microData.timeFrames.length}
                  </span>
                </div>

                {/* Filtro por grupo */}
                <div className="flex items-center space-x-2">
                  <Filter size={14} className="text-gray-500" />
                  <select
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">Todos los servicios</option>
                    {uniqueGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Área de visualización - FLEX-1 PARA OCUPAR EL RESTO */}
        <div className="flex-1 overflow-auto bg-white p-4">
          {microData.isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Cargando vista micro...</span>
            </div>
          ) : !currentFrame ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <AlertCircle size={24} className="mr-2" />
              <span>No hay datos disponibles para este período</span>
            </div>
          ) : (
            <div className="overflow-auto">
              <svg
                width={totalWidth}
                height={totalHeight}
                viewBox={`0 0 ${totalWidth} ${totalHeight}`}
                className="bg-gray-50"
              >
                {/* Marco del bloque */}
                <rect
                  x={blockStartX}
                  y={blockStartY}
                  width={30 * containerWidth + 29 * containerMargin}
                  height={7 * containerHeight + 6 * containerMargin}
                  fill="none"
                  stroke="#28a745"
                  strokeWidth="1.5"
                  rx="5"
                />

                {/* Grid de bahías - 7 filas x 30 columnas */}
                {rowLabels.map((row, rowIndex) => (
                  <g key={row}>
                    {/* Label de fila (A-G) */}
                    <text
                      x={blockStartX - 10}
                      y={blockStartY + rowIndex * (containerHeight + containerMargin) + containerHeight / 2}
                      textAnchor="end"
                      dominantBaseline="middle"
                      className="fill-gray-700 font-bold"
                      fontSize="14"
                    >
                      {row}
                    </text>

                    {/* Celdas de la fila */}
                    {microData.processedBahias.map((bahia, colIndex) => {
                      const x = blockStartX + colIndex * (containerWidth + containerMargin);
                      const y = blockStartY + rowIndex * (containerHeight + containerMargin);
                      const isVisible = shouldShowBahia(bahia);

                      return (
                        <g key={`${row}-${colIndex}`} style={{ opacity: isVisible ? 1 : 0.2 }}>
                          <MicroBahiaComponent
                            bahia={bahia}
                            position={{ x, y }}
                            size={{ width: containerWidth, height: containerHeight }}
                            rowIndex={rowIndex}
                            isSelected={selectedCell?.row === rowIndex && selectedCell?.col === colIndex}
                            onClick={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                          />
                        </g>
                      );
                    })}
                  </g>
                ))}

                {/* Labels del eje X (columnas 1-30) */}
                {Array.from({ length: 30 }, (_, i) => i).map((colIndex) => {
                  const x = blockStartX + colIndex * (containerWidth + containerMargin) + containerWidth / 2;
                  const y = blockStartY - 10;

                  // Mostrar solo algunos números para no saturar
                  if (colIndex === 0 || colIndex === 9 || colIndex === 19 || colIndex === 29) {
                    return (
                      <text
                        key={`col-label-${colIndex}`}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        className="fill-gray-700 font-bold"
                        fontSize="12"
                      >
                        {colIndex + 1}
                      </text>
                    );
                  }
                  return null;
                })}

                {/* Línea de base del eje X */}
                <line
                  x1={blockStartX}
                  y1={blockStartY + 7 * containerHeight + 6 * containerMargin + 10}
                  x2={blockStartX + 30 * containerWidth + 29 * containerMargin}
                  y2={blockStartY + 7 * containerHeight + 6 * containerMargin + 10}
                  stroke="#333"
                  strokeWidth="1"
                />

                {/* Ticks del eje X */}
                {Array.from({ length: 31 }, (_, i) => i).map((tickIndex) => {
                  const x = tickIndex === 0
                    ? blockStartX
                    : blockStartX + tickIndex * (containerWidth + containerMargin) - containerMargin / 2;
                  const y1 = blockStartY + 7 * containerHeight + 6 * containerMargin + 10;
                  const y2 = y1 + 8;

                  return (
                    <line
                      key={`tick-${tickIndex}`}
                      x1={x}
                      y1={y1}
                      x2={x}
                      y2={y2}
                      stroke="#333"
                      strokeWidth="1"
                    />
                  );
                })}
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Panel lateral - CORREGIDO CON MEJOR MANEJO DE OVERFLOW */}
      <div className="w-80 bg-white shadow-lg border-l border-gray-200 flex flex-col overflow-hidden">
        {/* Header del panel - altura fija */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center">
            <Info size={18} className="mr-2" />
            Información del Bloque
          </h3>
        </div>

        {/* Contenido scrolleable - flex-1 y overflow-y-auto */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Estadísticas generales */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 mb-2 text-sm">Estadísticas del Turno {currentFrame?.timeLabel}</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Total posiciones:</span>
                <span className="font-medium">210 (7×30)</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Grupos activos:</span>
                <span className="font-medium">{uniqueGroups.length}</span>
              </div>
            </div>
          </div>

          {/* Leyenda de grupos/servicios - tamaños reducidos */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 mb-2 text-sm">Servicios / Segregaciones</h4>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {microData.colorStats.map((stat) => (
                <div
                  key={stat.color}
                  className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors text-xs ${groupFilter === stat.label
                    ? 'bg-purple-100 border border-purple-300'
                    : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  onClick={() => setGroupFilter(groupFilter === stat.label ? 'all' : stat.label || '')}
                >
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded mr-2 border border-gray-400"
                      style={{ backgroundColor: stat.color }}
                    />
                    <span className="font-medium">{stat.label || 'Sin grupo'}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{stat.count}</div>
                    <div className="text-gray-500" style={{ fontSize: '10px' }}>{stat.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Información de celda seleccionada - tamaño reducido */}
          {selectedCell && (
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 mb-4">
              <h4 className="font-medium text-purple-800 mb-2 text-sm">
                Posición Seleccionada
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-purple-600">Fila:</span>
                  <span className="font-medium">{rowLabels[selectedCell.row]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-600">Columna:</span>
                  <span className="font-medium">{selectedCell.col + 1}</span>
                </div>
                {(() => {
                  const bahiaData = microData.processedBahias[selectedCell.col];
                  return (
                    <>
                      {bahiaData?.group && (
                        <div className="flex justify-between">
                          <span className="text-purple-600">Servicio:</span>
                          <span className="font-medium">{bahiaData.group}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-purple-600">Color:</span>
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded mr-1 border border-gray-300"
                            style={{ backgroundColor: bahiaData?.color || '#FFFFFF' }}
                          />
                          <span className="font-mono" style={{ fontSize: '10px' }}>
                            {bahiaData?.color || '#FFFFFF'}
                          </span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* KPIs de Congestión del Terminal */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-3 border-b bg-gradient-to-r from-blue-50 to-blue-100">
              <h3 className="font-bold text-blue-900 text-sm flex items-center">
                <BarChart3 size={16} className="mr-2" />
                KPIs de Congestión del Terminal
              </h3>
              <p className="text-blue-700 text-xs mt-1">
                KPIs del bloque {bloqueId}
              </p>
            </div>
            <div className="p-3">
              <CorePortKPIPanel
                dataFilePath="/data/resultados_congestion_SAI_2022.csv"
              />
            </div>
          </div>

          {/* Nota informativa - tamaño reducido */}
          <div className="mt-4 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>Nota:</strong> Vista de distribución de servicios en el bloque {bloqueId}.
              Cada color = servicio diferente.
            </p>
          </div>
        </div>

        {/* Footer - altura fija */}
        <div className="flex-shrink-0 p-2 border-t border-gray-200 text-xs text-gray-500 bg-gray-50">
          <div className="flex items-center justify-between">
            <span>Patio {patioId}</span>
            <span>{new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};