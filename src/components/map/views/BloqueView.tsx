// src/components/map/views/BloqueView.tsx
import React, { useState, useMemo } from 'react';
import { useTimeContext } from '../../../contexts/TimeContext';
import { useMagdalenaData } from '../../../hooks/useMagdalenaData';
import {
  Package, Clock, AlertCircle, Filter, Layers,
  SkipBack, SkipForward, ChevronLeft, ChevronRight,
  Info, BarChart3, Grid3X3, Activity, TrendingUp,
  AlertTriangle, Database
} from 'lucide-react';
import { CorePortKPIPanel } from '../../dashboard/CorePortKPIPanel';

interface BloqueViewProps {
  patioId: string;
  bloqueId: string;
  getColorForOcupacion: (value: number) => string;
}

interface CellData {
  segregacion: string;
  color: string;
  percentage: number;
  volumenTEUs?: number;
  capacidadTEUs?: number;
}

export const BloqueView: React.FC<BloqueViewProps> = ({
  patioId,
  bloqueId,
  getColorForOcupacion
}) => {
  const [selectedCell, setSelectedCell] = useState<{ row: number, col: number } | null>(null);
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [currentTurno, setCurrentTurno] = useState(1);
  const [showOccupancyInfo, setShowOccupancyInfo] = useState(false);
  
  const { timeState } = useTimeContext();
  
  // Hook para datos de Magdalena
  const { magdalenaMetrics, isLoading, error } = useMagdalenaData(
    timeState.magdalenaConfig?.semana || 3,
    timeState.magdalenaConfig?.participacion || 69,
    timeState.magdalenaConfig?.conDispersion !== false
  );

  // Función para asignar colores consistentes a segregaciones
  const getSegregationColor = (segregationId: string): string => {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
      '#06B6D4', '#A855F7', '#DC2626', '#059669', '#7C3AED',
      '#2563EB', '#EA580C', '#0891B2', '#9333EA', '#16A34A'
    ];
    const index = parseInt(segregationId.replace('S', '')) % colors.length;
    return colors[index];
  };

  // Procesar datos de bahías para el turno actual
  const { occupancyMatrix, segregacionesStats, bahiasOcupadas, ocupacionReal, segregacionesTotales } = useMemo(() => {
    const matrix: (CellData | null)[][] = Array(7).fill(null).map(() => Array(30).fill(null));
    const stats = new Map<string, { 
      color: string, 
      count: number, 
      bahias: number, 
      volumen: number, 
      porcentajeOcupacion: number,
      tipo: '20' | '40'
    }>();
    let totalBahiasOcupadas = 0;
    let totalVolumenTEUs = 0;
    let totalCapacidadTEUs = 0;

    if (!magdalenaMetrics || timeState.dataSource !== 'modelMagdalena') {
      return { 
        occupancyMatrix: matrix, 
        segregacionesStats: stats, 
        bahiasOcupadas: 0, 
        ocupacionReal: 0,
        segregacionesTotales: 0
      };
    }

    // Buscar datos para este bloque y turno
    const bahiasPorBloque = magdalenaMetrics.bahiasPorBloque || {};
    const volumenPorBloque = magdalenaMetrics.volumenPorBloque || {};
    const capacidadesPorBloque = magdalenaMetrics.capacidadesPorBloque || {};
    const teusPorSegregacion = magdalenaMetrics.teusPorSegregacion || {};
    const segregacionesInfo = magdalenaMetrics.segregacionesInfo || {};
    
    // Normalizar el ID del bloque - asegurar formato C1, C2, etc.
    let normalizedBloqueId = bloqueId;
    if (!bloqueId.startsWith('C')) {
      normalizedBloqueId = `C${bloqueId}`;
    }
    
    const key = `${normalizedBloqueId}-${currentTurno}`;
    
    const bahiaInfo = bahiasPorBloque[key] || {};
    const volumenInfo = volumenPorBloque[key] || {};
    const capacidadBloque = capacidadesPorBloque[normalizedBloqueId] || 35; // VS[B]
    
    console.log('🔍 Debug BloqueView:');
    console.log('  - bloqueId original:', bloqueId);
    console.log('  - bloqueId normalizado:', normalizedBloqueId);
    console.log('  - turno actual:', currentTurno);
    console.log('  - key generada:', key);
    console.log('  - bahías encontradas:', Object.keys(bahiaInfo).length > 0 ? 'Sí' : 'No');
    console.log('  - capacidad del bloque (VS[B]):', capacidadBloque);
    
    // Procesar cada segregación
    const segregacionesList: Array<{
      seg: string, 
      bahias: number, 
      volumen: number, 
      teu: number,
      tipo: '20' | '40'
    }> = [];
    
    Object.keys(bahiaInfo).forEach(segregacion => {
      if (segregacion.startsWith('S')) {
        const numBahias = bahiaInfo[segregacion] || 0;
        const volumen = volumenInfo[segregacion] || 0;
        const teuFactor = teusPorSegregacion[segregacion] || 1;
        const tipo = teuFactor === 1 ? '20' : '40';
        
        if (numBahias > 0) {
          segregacionesList.push({ 
            seg: segregacion, 
            bahias: numBahias, 
            volumen, 
            teu: teuFactor,
            tipo
          });
          const color = getSegregationColor(segregacion);
          
          // Calcular ocupación real
          const capacidadPorBahia = capacidadBloque; // Contenedores por bahía
          const capacidadTotalTEUs = numBahias * capacidadPorBahia * teuFactor;
          const porcentajeOcupacion = capacidadTotalTEUs > 0 ? (volumen / capacidadTotalTEUs) * 100 : 0;
          
          stats.set(segregacion, { 
            color, 
            count: 0, // Se actualizará al llenar la matriz
            bahias: numBahias,
            volumen: volumen,
            porcentajeOcupacion: porcentajeOcupacion,
            tipo: tipo
          });
          
          totalVolumenTEUs += volumen;
          totalCapacidadTEUs += capacidadTotalTEUs;
        }
      }
    });

    console.log('  - segregaciones con bahías:', segregacionesList.length);

    // Ordenar por número de bahías (mayor a menor) para mejor distribución visual
    segregacionesList.sort((a, b) => b.bahias - a.bahias);

    // Llenar la matriz columna por columna
    let currentColumn = 0;
    segregacionesList.forEach(({ seg, bahias, volumen, teu, tipo }) => {
      const capacidadPorBahia = capacidadBloque;
      const capacidadTotalTeus = bahias * capacidadPorBahia * teu;
      const porcentajeOcupacion = capacidadTotalTeus > 0 ? (volumen / capacidadTotalTeus) * 100 : 100;

      for (let b = 0; b < bahias && currentColumn < 30; b++) {
        // Determinar cuántas celdas llenar en esta columna basado en el porcentaje
        const celdasAOcupar = Math.ceil((porcentajeOcupacion / 100) * 7);
        
        // Llenar desde abajo hacia arriba (más realista para contenedores)
        for (let row = 6; row >= 0; row--) {
          const celdasOcupadas = 6 - row + 1;
          if (celdasOcupadas <= celdasAOcupar) {
            matrix[row][currentColumn] = {
              segregacion: seg,
              color: getSegregationColor(seg),
              percentage: 100,
              volumenTEUs: volumen,
              capacidadTEUs: capacidadTotalTeus
            };
            // Actualizar contador de celdas
            const stat = stats.get(seg);
            if (stat) {
              stat.count++;
              stats.set(seg, stat);
            }
          }
        }
        currentColumn++;
        totalBahiasOcupadas++;
      }
    });

    // Calcular ocupación real del bloque
    const ocupacionRealPorcentaje = totalCapacidadTEUs > 0 ? (totalVolumenTEUs / totalCapacidadTEUs) * 100 : 0;

    // Obtener total de segregaciones del modelo
const totalSegregaciones = Object.keys(segregacionesInfo).length || stats.size;
    return { 
      occupancyMatrix: matrix, 
      segregacionesStats: stats,
      bahiasOcupadas: totalBahiasOcupadas,
      ocupacionReal: ocupacionRealPorcentaje,
      segregacionesTotales: totalSegregaciones
    };
  }, [magdalenaMetrics, bloqueId, currentTurno, timeState.dataSource]);

  const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const totalColumns = 30;
  const maxTurnos = 21;

  // Función para navegar entre turnos
  const navigateToTurno = (turno: number) => {
    if (turno >= 1 && turno <= maxTurnos) {
      setCurrentTurno(turno);
    }
  };

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold">Error al cargar datos</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 flex overflow-hidden">
      {/* Panel principal */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header con controles */}
        <div className="flex-shrink-0 p-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {patioId} - Bloque {bloqueId}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {timeState.dataSource === 'modelMagdalena' 
                  ? `Semana ${timeState.magdalenaConfig?.semana || 3} - Turno ${currentTurno} de ${maxTurnos}` 
                  : 'Vista detallada'} • Vista micro de bahías
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium flex items-center">
                <Layers size={12} className="mr-1" />
                Vista Micro - 7x30 posiciones
              </span>
              <button
                onClick={() => setShowOccupancyInfo(!showOccupancyInfo)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Información sobre ocupación"
              >
                <Info size={18} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Panel de información sobre ocupación */}
          {showOccupancyInfo && (
            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm flex items-center">
                <Info size={16} className="mr-2" />
                Diferencia entre Bahías Reservadas y Ocupación Real
              </h4>
              <div className="text-xs text-blue-800 space-y-1">
                <p>• <strong>Bahías Reservadas:</strong> Cada bahía coloreada está 100% reservada para esa segregación</p>
                <p>• <strong>Ocupación Real:</strong> Las bahías pueden no estar llenas al 100% de su capacidad</p>
                <p>• <strong>Ejemplo:</strong> 2 bahías reservadas (capacidad: 70 contenedores) con solo 56 TEUs = 80% ocupación real</p>
                <p>• <strong>Visualización:</strong> La altura de llenado en cada columna representa el % de ocupación</p>
              </div>
            </div>
          )}

          {/* Controles de navegación temporal para Magdalena */}
          {timeState.dataSource === 'modelMagdalena' && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-4">
                {/* Navegación */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateToTurno(1)}
                    disabled={currentTurno === 1}
                    className="p-2 bg-white rounded border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Ir al inicio"
                  >
                    <SkipBack size={16} />
                  </button>
                  <button
                    onClick={() => navigateToTurno(currentTurno - 1)}
                    disabled={currentTurno === 1}
                    className="p-2 bg-white rounded border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Turno anterior"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="px-4 py-2 bg-white rounded border border-gray-300 min-w-[120px] text-center">
                    <span className="text-sm text-gray-600">Turno</span>
                    <div className="font-mono font-bold text-lg">{currentTurno}</div>
                  </div>

                  <button
                    onClick={() => navigateToTurno(currentTurno + 1)}
                    disabled={currentTurno === maxTurnos}
                    className="p-2 bg-white rounded border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Siguiente turno"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => navigateToTurno(maxTurnos)}
                    disabled={currentTurno === maxTurnos}
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
                    min="1"
                    max={maxTurnos}
                    value={currentTurno}
                    onChange={(e) => navigateToTurno(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600">
                    {currentTurno} / {maxTurnos}
                  </span>
                </div>

                {/* Filtro por segregación */}
                <div className="flex items-center space-x-2">
                  <Filter size={14} className="text-gray-500" />
                  <select
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">Todas las segregaciones</option>
                    {Array.from(segregacionesStats.keys()).sort().map(seg => (
                      <option key={seg} value={seg}>{seg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Indicadores rápidos mejorados */}
              <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Grid3X3 size={14} className="mr-1" />
                    <span>Bahías reservadas: <strong>{bahiasOcupadas}/30</strong></span>
                  </div>
                  <div className="flex items-center">
                    <Database size={14} className="mr-1" />
                    <span>Ocupación real: <strong>{ocupacionReal.toFixed(1)}%</strong></span>
                  </div>
                  <div className="flex items-center">
                    <Package size={14} className="mr-1" />
                    <span>Segregaciones: <strong>{segregacionesStats.size}</strong> de {segregacionesTotales} totales</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp size={14} className="mr-1" />
                    <span>Participación: <strong>{timeState.magdalenaConfig?.participacion || 69}%</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Área de visualización */}
        <div className="flex-1 overflow-auto bg-white p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Cargando vista micro...</span>
            </div>
          ) : (
            <div className="overflow-auto">
              <svg
                width={1000}
                height={300}
                viewBox="0 0 1000 300"
                className="bg-gray-50"
              >
                {/* Marco del bloque */}
                <rect
                  x={50}
                  y={50}
                  width={totalColumns * 32}
                  height={7 * 32}
                  fill="none"
                  stroke="#28a745"
                  strokeWidth="2"
                  rx="5"
                />

                {/* Grid de bahías - 7 filas x 30 columnas */}
                {rowLabels.map((row, rowIndex) => (
                  <g key={row}>
                    {/* Label de fila (A-G) */}
                    <text
                      x={35}
                      y={50 + rowIndex * 32 + 16}
                      textAnchor="end"
                      dominantBaseline="middle"
                      className="fill-gray-700 font-bold"
                      fontSize="14"
                    >
                      {row}
                    </text>

                    {/* Celdas de la fila */}
                    {Array.from({ length: totalColumns }, (_, colIndex) => {
                      const cellData = occupancyMatrix[rowIndex][colIndex];
                      const x = 50 + colIndex * 32;
                      const y = 50 + rowIndex * 32;
                      const isVisible = groupFilter === 'all' || 
                                       (cellData && cellData.segregacion === groupFilter);
                      const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                      const isEmpty = !cellData;

                      return (
                        <g key={`${row}-${colIndex}`} style={{ opacity: isVisible ? 1 : 0.2 }}>
                          <rect
                            x={x}
                            y={y}
                            width={30}
                            height={30}
                            fill={cellData?.color || '#FFFFFF'}
                            stroke={isSelected ? '#7C3AED' : isEmpty ? '#E5E5E5' : '#333'}
                            strokeWidth={isSelected ? 2.5 : 1}
                            strokeDasharray={isEmpty ? "2,2" : "none"}
                            className="cursor-pointer hover:stroke-2 transition-all"
                            onClick={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                            rx="2"
                          />
                          {cellData && (
                            <text
                              x={x + 15}
                              y={y + 15}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="pointer-events-none font-semibold"
                              fontSize="10"
                              fill="#FFF"
                            >
                              {cellData.segregacion.substring(1)}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </g>
                ))}

                {/* Labels del eje X */}
                {Array.from({ length: totalColumns }, (_, i) => i).map((colIndex) => {
                  const x = 50 + colIndex * 32 + 15;
                  const y = 40;

                  if (colIndex % 5 === 0 || colIndex === 29) {
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

                {/* Líneas divisorias verticales cada 5 columnas */}
                {[5, 10, 15, 20, 25].map(col => (
                  <line
                    key={`divider-${col}`}
                    x1={50 + col * 32}
                    y1={50}
                    x2={50 + col * 32}
                    y2={50 + 7 * 32}
                    stroke="#E5E5E5"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                ))}

                {/* Indicador de columnas (bahías) */}
                <text
                  x={50 + (totalColumns * 32) / 2}
                  y={25}
                  textAnchor="middle"
                  className="fill-gray-600 font-medium"
                  fontSize="12"
                >
                  Bahías (Columnas 1-30)
                </text>

                {/* Indicador de filas */}
                <text
                  x={20}
                  y={50 + (7 * 32) / 2}
                  textAnchor="middle"
                  className="fill-gray-600 font-medium"
                  fontSize="12"
                  transform={`rotate(-90, 20, ${50 + (7 * 32) / 2})`}
                >
                  Niveles (A-G)
                </text>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Panel lateral */}
      <div className="w-80 bg-white shadow-lg border-l border-gray-200 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center">
            <Info size={18} className="mr-2" />
            Información del Bloque
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Estadísticas generales mejoradas */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 mb-2 text-sm flex items-center">
              <Activity size={14} className="mr-2" />
              Estadísticas del Turno {currentTurno}
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Total posiciones:</span>
                <span className="font-medium">210 (7×30)</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Bahías reservadas:</span>
                <span className="font-medium">{bahiasOcupadas} de 30</span>
              </div>
              <div className="flex justify-between p-2 bg-blue-50 rounded border border-blue-200">
                <span className="text-blue-600">Ocupación real:</span>
                <span className="font-medium text-blue-800">{ocupacionReal.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Segregaciones activas:</span>
                <span className="font-medium">{segregacionesStats.size}</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Celdas ocupadas:</span>
                <span className="font-medium">
                  {Array.from(segregacionesStats.values()).reduce((sum, stat) => sum + stat.count, 0)} de 210
                </span>
              </div>
              {timeState.magdalenaConfig?.conDispersion !== false && (
                <div className="flex justify-between p-2 bg-purple-50 rounded border border-purple-200">
                  <span className="text-purple-600">Dispersión:</span>
                  <span className="font-medium text-purple-800">Activa (máx. 5 bloques)</span>
                </div>
              )}
            </div>
          </div>

          {/* Leyenda de segregaciones mejorada */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 mb-2 text-sm flex items-center">
              <Layers size={14} className="mr-2" />
              Segregaciones en el Bloque
            </h4>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {Array.from(segregacionesStats.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([seg, stat]) => (
                <div
                  key={seg}
                  className={`flex flex-col p-2 rounded cursor-pointer transition-colors text-xs ${
                    groupFilter === seg
                      ? 'bg-purple-100 border border-purple-300'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setGroupFilter(groupFilter === seg ? 'all' : seg)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded mr-2 border border-gray-400"
                        style={{ backgroundColor: stat.color }}
                      />
                      <span className="font-medium">{seg}</span>
                      <span className="ml-2 text-gray-500">({stat.tipo} pies)</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{stat.bahias} bahías</div>
                    </div>
                  </div>
                  <div className="mt-1 pl-5 text-gray-600" style={{ fontSize: '10px' }}>
                    <div>Volumen: {stat.volumen} TEUs</div>
                    <div>Ocupación real: {stat.porcentajeOcupacion.toFixed(1)}%</div>
                    <div>Celdas visuales: {stat.count} ({((stat.count / 210) * 100).toFixed(1)}%)</div>
                  </div>
                </div>
              ))}
              {segregacionesStats.size === 0 && (
                <div className="text-center text-gray-500 py-4">
                  Sin segregaciones en este turno
                </div>
              )}
            </div>
          </div>

          {/* Información de celda seleccionada mejorada */}
          {selectedCell && (
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 mb-4">
              <h4 className="font-medium text-purple-800 mb-2 text-sm">
                Posición Seleccionada
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-purple-600">Posición:</span>
                  <span className="font-medium">{rowLabels[selectedCell.row]}{selectedCell.col + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-600">Bahía (Columna):</span>
                  <span className="font-medium">{selectedCell.col + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-600">Nivel (Fila):</span>
                  <span className="font-medium">{rowLabels[selectedCell.row]}</span>
                </div>
                {(() => {
                  const cellData = occupancyMatrix[selectedCell.row][selectedCell.col];
                  const stat = cellData ? segregacionesStats.get(cellData.segregacion) : null;
                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-purple-600">Estado:</span>
                        <span className="font-medium">
                          {cellData ? 'Ocupada' : 'Vacía'}
                        </span>
                      </div>
                      {cellData && stat && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-purple-600">Segregación:</span>
                            <span className="font-medium">{cellData.segregacion} ({stat.tipo} pies)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-600">Ocupación bahía:</span>
                            <span className="font-medium">{stat.porcentajeOcupacion.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-600">Color:</span>
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded mr-1 border border-gray-300"
                                style={{ backgroundColor: cellData.color }}
                              />
                              <span className="font-mono" style={{ fontSize: '10px' }}>
                                {cellData.color}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Información del modelo */}
          {timeState.dataSource === 'modelMagdalena' && magdalenaMetrics && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2 text-sm">
                Configuración del Modelo
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-blue-600">Semana:</span>
                  <span className="font-medium">{timeState.magdalenaConfig?.semana || 3}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Participación:</span>
                  <span className="font-medium">{timeState.magdalenaConfig?.participacion || 69}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Dispersión:</span>
                  <span className="font-medium">
                    {timeState.magdalenaConfig?.conDispersion !== false ? 'Con dispersión' : 'Centralizada'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Reubicaciones:</span>
                  <span className="font-medium text-green-600">0% (Eliminadas)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Criterio segregación:</span>
                  <span className="font-medium">Criterio 2</span>
                </div>
              </div>
            </div>
          )}

          {/* KPIs del Terminal */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-3 border-b bg-gradient-to-r from-blue-50 to-blue-100">
              <h3 className="font-bold text-blue-900 text-sm flex items-center">
                <BarChart3 size={16} className="mr-2" />
                KPIs del Bloque
              </h3>
            </div>
            <div className="p-3">
              <CorePortKPIPanel
                dataFilePath="/data/resultados_congestion_SAI_2022.csv"
              />
            </div>
          </div>

          {/* Nota informativa mejorada */}
          <div className="mt-4 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <AlertTriangle size={14} className="text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700">
                <p className="font-semibold mb-1">Información importante:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Cada columna = 1 bahía completa</li>
                  <li>• Bahía coloreada = 100% reservada para esa segregación</li>
                  <li>• Altura del color = % de ocupación real de la bahía</li>
                  <li>• 1 bahía = 35 contenedores máximo</li>
                  <li>• Los números = ID de la segregación</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};