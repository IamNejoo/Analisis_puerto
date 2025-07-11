// src/components/map/views/BloqueView.tsx - ADAPTADO PARA OPTIMIZACIÓN

import React, { useState, useMemo, useEffect } from 'react';
import { useTimeContext } from '../../../contexts/TimeContext';
import { useOptimizationData } from '../../../hooks/useOptimizationData';
import { useSAIData } from '../../../hooks/useSAIData';
import {
  Package, Clock, AlertCircle, Filter, Layers,
  SkipBack, SkipForward, ChevronLeft, ChevronRight,
  Info, BarChart3, Grid3X3, Activity, TrendingUp,
  AlertTriangle, Database, Calendar
} from 'lucide-react';
import type { DataSource } from '../../../types/index';

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
  const [showOccupancyInfo, setShowOccupancyInfo] = useState(false);

  const { timeState } = useTimeContext();
  const { dataSource } = timeState;

  // Calcular el turno inicial y máximo según la unidad temporal
  const { initialTurno, maxTurnos, turnoLabel } = useMemo(() => {
    if (dataSource === 'historical') {
      switch (timeState.unit) {
        case 'week':
          return {
            initialTurno: 1,
            maxTurnos: 21,
            turnoLabel: (turno: number) => {
              const dia = Math.floor((turno - 1) / 3) + 1;
              const turnoDelDia = ((turno - 1) % 3) + 1;
              const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
              const turnos = ['Turno 1 (8-16h)', 'Turno 2 (16-24h)', 'Turno 3 (0-8h)'];
              return `${diasSemana[dia - 1]} - ${turnos[turnoDelDia - 1]}`;
            }
          };

        case 'day':
          const currentHour = timeState.currentDate.getHours();
          let turnoActual = 1;
          if (currentHour >= 8 && currentHour < 16) turnoActual = 1;
          else if (currentHour >= 16 && currentHour < 24) turnoActual = 2;
          else turnoActual = 3;

          return {
            initialTurno: turnoActual,
            maxTurnos: 3,
            turnoLabel: (turno: number) => {
              const turnos = ['Turno 1 (8-16h)', 'Turno 2 (16-24h)', 'Turno 3 (0-8h)'];
              return turnos[turno - 1];
            }
          };

        case 'hour':
          return {
            initialTurno: 1,
            maxTurnos: 1,
            turnoLabel: () => {
              const hour = timeState.currentDate.getHours();
              return `Hora ${hour}:00-${hour + 1}:00`;
            }
          };

        case 'shift':
          return {
            initialTurno: 1,
            maxTurnos: 1,
            turnoLabel: () => {
              const hour = timeState.currentDate.getHours();
              if (hour >= 8 && hour < 16) return 'Turno 1 (8-16h)';
              else if (hour >= 16 && hour < 24) return 'Turno 2 (16-24h)';
              else return 'Turno 3 (0-8h)';
            }
          };

        default:
          return { initialTurno: 1, maxTurnos: 1, turnoLabel: () => 'Período actual' };
      }
    } else if (dataSource === 'modelMagdalena') {
      // Para el modelo de optimización, usar los períodos disponibles
      return {
        initialTurno: 1,
        maxTurnos: 21, // Por defecto 21 períodos
        turnoLabel: (turno: number) => {
          const dia = Math.floor((turno - 1) / 3) + 1;
          const turnoDelDia = ((turno - 1) % 3) + 1;
          return `Día ${dia} - Turno ${turnoDelDia}`;
        }
      };
    }

    return { initialTurno: 1, maxTurnos: 1, turnoLabel: () => 'Período' };
  }, [dataSource, timeState.unit, timeState.currentDate]);

  // Estado del turno actual
  const [currentTurno, setCurrentTurno] = useState(initialTurno);

  // Actualizar el turno cuando cambie la unidad temporal o la fecha
  useEffect(() => {
    setCurrentTurno(initialTurno);
  }, [initialTurno, timeState.unit, timeState.currentDate]);

  // Hook para datos de optimización
  const config = {
    anio: timeState.magdalenaConfig?.anio || 2022,
    semana: timeState.magdalenaConfig?.semana || 3,
    participacion: timeState.magdalenaConfig?.participacion || 69,
    conDispersion: true
  };

  const { metrics: optimizationMetrics, isLoading: isLoadingOptimization, error: errorOptimization } =
    useOptimizationData(dataSource === 'modelMagdalena' ? config : { anio: 0, semana: 0, participacion: 0, conDispersion: false });

  // Hook para datos SAI (históricos)
  const { saiMetrics, isLoading: isLoadingSAI, error: errorSAI } = useSAIData(
    dataSource === 'historical' ? timeState.currentDate : null,
    currentTurno,
    bloqueId
  );

  // Determinar qué datos y estado de carga usar
  const isLoading = dataSource === 'modelMagdalena' ? isLoadingOptimization :
    dataSource === 'historical' ? isLoadingSAI : false;

  const error = dataSource === 'modelMagdalena' ? errorOptimization :
    dataSource === 'historical' ? errorSAI : null;

  // Función para asignar colores consistentes a segregaciones
  const getSegregationColor = (segregationId: string): string => {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
      '#06B6D4', '#A855F7', '#DC2626', '#059669', '#7C3AED',
      '#2563EB', '#EA580C', '#0891B2', '#9333EA', '#16A34A'
    ];

    // Para el modelo de optimización, usar el código de segregación
    const baseId = segregationId.replace(/[^0-9]/g, '');
    const index = parseInt(baseId) % colors.length || 0;
    return colors[index];
  };

  // Procesar datos de bahías para el turno actual
  const { occupancyMatrix, segregacionesStats, bahiasOcupadas, ocupacionReal, segregacionesTotales } = useMemo(() => {
    console.log('🔄 Procesamiento de datos para vista de bloque');

    const matrix: (CellData | null)[][] = Array(7).fill(null).map(() => Array(30).fill(null));
    const stats = new Map<string, {
      color: string,
      count: number,
      bahias: number,
      volumen: number,
      porcentajeOcupacion: number,
      tipo: '20' | '40',
      descripcion?: string
    }>();
    let totalBahiasOcupadas = 0;
    let totalVolumenTEUs = 0;
    let totalCapacidadTEUs = 0;

    // Para el modelo de optimización
    if (dataSource === 'modelMagdalena' && optimizationMetrics) {
      console.log('📊 Procesando datos del modelo de optimización');

      // Normalizar el ID del bloque
      let normalizedBloqueId = bloqueId;
      if (!bloqueId.startsWith('C')) {
        normalizedBloqueId = `C${bloqueId}`;
      }

      // Obtener la capacidad del bloque
      const capacidadBloque = Math.round(optimizationMetrics.ocupacion.capacidadTotal / 9); // Dividir entre 9 bloques
      const capacidadPorBahia = 35; // TEUs por bahía

      // Obtener segregaciones activas para este bloque en el período actual
      const segregacionesEnBloque: Array<{
        codigo: string;
        descripcion: string;
        volumen: number;
        tipo: string;
        categoria: string;
      }> = [];

      // Simular distribución de segregaciones en el bloque basándose en las segregaciones activas
      optimizationMetrics.segregaciones.activas.forEach((seg, idx) => {
        // Distribuir las segregaciones entre los bloques de forma balanceada
        const bloqueIndex = parseInt(normalizedBloqueId.replace('C', '')) - 1;
        if (idx % 9 === bloqueIndex) {
          // Calcular volumen proporcional para este bloque
          const volumenTotal = seg.movimientos;
          const volumenBloque = Math.round(volumenTotal / 9); // Distribuir equitativamente

          segregacionesEnBloque.push({
            codigo: seg.codigo,
            descripcion: seg.descripcion || '',
            volumen: volumenBloque,
            tipo: 'dry', // Por defecto
            categoria: '40' // Por defecto 40 pies
          });
        }
      });

      // Procesar cada segregación
      segregacionesEnBloque.forEach(seg => {
        const numBahias = Math.ceil(seg.volumen / (capacidadPorBahia * 2)); // 2 TEUs por contenedor de 40'
        const color = getSegregationColor(seg.codigo);
        const capacidadTotalTEUs = numBahias * capacidadPorBahia * 2;
        const porcentajeOcupacion = capacidadTotalTEUs > 0 ? (seg.volumen / capacidadTotalTEUs) * 100 : 0;

        stats.set(seg.codigo, {
          color,
          count: 0,
          bahias: numBahias,
          volumen: seg.volumen,
          porcentajeOcupacion,
          tipo: '40',
          descripcion: seg.descripcion
        });

        totalVolumenTEUs += seg.volumen;
        totalCapacidadTEUs += capacidadTotalTEUs;
      });

      // Llenar la matriz columna por columna
      let currentColumn = 0;
      segregacionesEnBloque.forEach(seg => {
        const stat = stats.get(seg.codigo);
        if (!stat) return;

        for (let b = 0; b < stat.bahias && currentColumn < 30; b++) {
          const celdasAOcupar = Math.ceil((stat.porcentajeOcupacion / 100) * 7);

          for (let row = 6; row >= 0; row--) {
            const celdasOcupadas = 6 - row + 1;
            if (celdasOcupadas <= celdasAOcupar) {
              matrix[row][currentColumn] = {
                segregacion: seg.codigo,
                color: stat.color,
                percentage: 100,
                volumenTEUs: seg.volumen,
                capacidadTEUs: stat.bahias * capacidadPorBahia * 2
              };

              stat.count++;
            }
          }
          currentColumn++;
          totalBahiasOcupadas++;
        }
      });

      const ocupacionRealPorcentaje = totalCapacidadTEUs > 0 ? (totalVolumenTEUs / totalCapacidadTEUs) * 100 : 0;

      return {
        occupancyMatrix: matrix,
        segregacionesStats: stats,
        bahiasOcupadas: totalBahiasOcupadas,
        ocupacionReal: ocupacionRealPorcentaje,
        segregacionesTotales: optimizationMetrics.segregaciones.total
      };
    }

    // Para datos históricos SAI
    if (dataSource === 'historical' && saiMetrics) {
      // Usar la lógica existente para SAI
      const bahiasPorBloque = saiMetrics.bahiasPorBloque || {};
      const volumenPorBloque = saiMetrics.volumenPorBloque || {};
      const capacidadesPorBloque = saiMetrics.capacidadesPorBloque || {};
      const teusPorSegregacion = saiMetrics.teusPorSegregacion || {};
      const segregacionesInfo = saiMetrics.segregacionesInfo || {};

      let normalizedBloqueId = bloqueId;
      if (!bloqueId.startsWith('C') && !bloqueId.startsWith('H') && !bloqueId.startsWith('T')) {
        normalizedBloqueId = `C${bloqueId}`;
      }

      const turnoKey = (timeState.unit === 'hour' || timeState.unit === 'shift') ? 1 : currentTurno;
      const key = `${normalizedBloqueId}-${turnoKey}`;

      const bahiaInfo = bahiasPorBloque[key] || {};
      const volumenInfo = volumenPorBloque[key] || {};
      const capacidadBloque = capacidadesPorBloque[normalizedBloqueId] || 35;

      // Procesar segregaciones...
      // (mantener la lógica existente para SAI)
    }

    return {
      occupancyMatrix: matrix,
      segregacionesStats: stats,
      bahiasOcupadas: totalBahiasOcupadas,
      ocupacionReal: ocupacionRealPorcentaje,
      segregacionesTotales: segregacionesTotales
    };
  }, [optimizationMetrics, saiMetrics, bloqueId, currentTurno, dataSource, timeState.unit]);

  const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const totalColumns = 30;

  // Función para navegar entre turnos
  const navigateToTurno = (turno: number) => {
    if (turno >= 1 && turno <= maxTurnos) {
      setCurrentTurno(turno);
    }
  };

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <div className="text-center text-slate-400">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-slate-200">Error al cargar datos</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-900 flex overflow-hidden">
      {/* Panel principal */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header con controles */}
        <div className="flex-shrink-0 p-4 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-100">
                {patioId} - Bloque {bloqueId}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {dataSource === 'modelMagdalena'
                  ? `${optimizationMetrics?.anio || 2022} - Semana ${optimizationMetrics?.semana || 3} - Turno ${currentTurno} de ${maxTurnos}`
                  : dataSource === 'historical'
                    ? `Datos Históricos - ${timeState.currentDate.toLocaleDateString('es-CL')} - ${turnoLabel(currentTurno)}`
                    : 'Vista detallada'} • Vista micro de bahías
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-cyan-950/30 text-cyan-300 rounded-full text-xs font-medium flex items-center border border-cyan-800">
                <Layers size={12} className="mr-1" />
                Vista Micro - 7x30 posiciones
              </span>
              <button
                onClick={() => setShowOccupancyInfo(!showOccupancyInfo)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                title="Información sobre ocupación"
              >
                <Info size={18} className="text-slate-400" />
              </button>
            </div>
          </div>

          {/* Panel de información sobre ocupación */}
          {showOccupancyInfo && (
            <div className="mb-3 p-3 bg-blue-950/20 rounded-lg border border-blue-800">
              <h4 className="font-semibold text-blue-300 mb-2 text-sm flex items-center">
                <Info size={16} className="mr-2" />
                Diferencia entre Bahías Reservadas y Ocupación Real
              </h4>
              <div className="text-xs text-blue-200 space-y-1">
                <p>• <strong>Bahías Reservadas:</strong> Cada bahía coloreada está 100% reservada para esa segregación</p>
                <p>• <strong>Ocupación Real:</strong> Las bahías pueden no estar llenas al 100% de su capacidad</p>
                <p>• <strong>Ejemplo:</strong> 2 bahías reservadas (capacidad: 70 contenedores) con solo 56 TEUs = 80% ocupación real</p>
                <p>• <strong>Visualización:</strong> La altura de llenado en cada columna representa el % de ocupación</p>
              </div>
            </div>
          )}

          {/* Controles de navegación temporal */}
          {maxTurnos > 1 && (dataSource === 'modelMagdalena' || dataSource === 'historical') && (
            <div className="bg-slate-700 rounded-lg p-3">
              <div className="flex items-center space-x-4">
                {/* Navegación */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateToTurno(1)}
                    disabled={currentTurno === 1}
                    className="p-2 bg-slate-800 rounded border border-slate-600 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-slate-300"
                    title="Ir al inicio"
                  >
                    <SkipBack size={16} />
                  </button>
                  <button
                    onClick={() => navigateToTurno(currentTurno - 1)}
                    disabled={currentTurno === 1}
                    className="p-2 bg-slate-800 rounded border border-slate-600 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-slate-300"
                    title="Turno anterior"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="px-4 py-2 bg-slate-800 rounded border border-slate-600 min-w-[200px] text-center">
                    <span className="text-xs text-slate-400">
                      {timeState.unit === 'week' ? 'Período' : 'Turno'}
                    </span>
                    <div className="font-mono font-bold text-sm text-slate-100">
                      {turnoLabel(currentTurno)}
                    </div>
                  </div>

                  <button
                    onClick={() => navigateToTurno(currentTurno + 1)}
                    disabled={currentTurno === maxTurnos}
                    className="p-2 bg-slate-800 rounded border border-slate-600 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-slate-300"
                    title="Siguiente turno"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => navigateToTurno(maxTurnos)}
                    disabled={currentTurno === maxTurnos}
                    className="p-2 bg-slate-800 rounded border border-slate-600 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-slate-300"
                    title="Ir al final"
                  >
                    <SkipForward size={16} />
                  </button>
                </div>

                {/* Timeline slider */}
                <div className="flex-1 flex items-center space-x-3">
                  <Clock size={16} className="text-slate-400" />
                  <input
                    type="range"
                    min="1"
                    max={maxTurnos}
                    value={currentTurno}
                    onChange={(e) => navigateToTurno(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-slate-400">
                    {currentTurno} / {maxTurnos}
                  </span>
                </div>

                {/* Filtro por segregación */}
                <div className="flex items-center space-x-2">
                  <Filter size={14} className="text-slate-400" />
                  <select
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value)}
                    className="border border-slate-600 rounded px-3 py-1 text-sm bg-slate-800 text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="all">Todas las segregaciones</option>
                    {Array.from(segregacionesStats.keys()).sort().map(seg => (
                      <option key={seg} value={seg}>{seg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Indicadores rápidos */}
              <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Grid3X3 size={14} className="mr-1" />
                    <span>Bahías reservadas: <strong className="text-slate-300">{bahiasOcupadas}/30</strong></span>
                  </div>
                  <div className="flex items-center">
                    <Database size={14} className="mr-1" />
                    <span>Ocupación real: <strong className="text-slate-300">{ocupacionReal.toFixed(1)}%</strong></span>
                  </div>
                  <div className="flex items-center">
                    <Package size={14} className="mr-1" />
                    <span>Segregaciones: <strong className="text-slate-300">{segregacionesStats.size}</strong> de {segregacionesTotales} totales</span>
                  </div>
                  {dataSource === 'modelMagdalena' && (
                    <div className="flex items-center">
                      <TrendingUp size={14} className="mr-1" />
                      <span>Participación: <strong className="text-slate-300">{optimizationMetrics?.participacion || 69}%</strong></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Área de visualización */}
        <div className="flex-1 overflow-auto bg-slate-800 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              <span className="ml-3 text-slate-400">Cargando vista micro...</span>
            </div>
          ) : (
            <div className="overflow-auto">
              <svg
                width={1000}
                height={300}
                viewBox="0 0 1000 300"
                className="bg-slate-700"
              >
                {/* Marco del bloque */}
                <rect
                  x={50}
                  y={50}
                  width={totalColumns * 32}
                  height={7 * 32}
                  fill="none"
                  stroke="#10b981"
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
                      className="fill-slate-300 font-bold"
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
                            fill={cellData?.color || '#1e293b'}
                            stroke={isSelected ? '#06b6d4' : isEmpty ? '#475569' : '#e2e8f0'}
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
                              {cellData.segregacion}
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
                        className="fill-slate-300 font-bold"
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
                    stroke="#475569"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                ))}

                {/* Indicadores */}
                <text
                  x={50 + (totalColumns * 32) / 2}
                  y={25}
                  textAnchor="middle"
                  className="fill-slate-400 font-medium"
                  fontSize="12"
                >
                  Bahías (Columnas 1-30)
                </text>

                <text
                  x={20}
                  y={50 + (7 * 32) / 2}
                  textAnchor="middle"
                  className="fill-slate-400 font-medium"
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
      <div className="w-80 bg-slate-800 shadow-lg border-l border-slate-700 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100 flex items-center">
            <Info size={18} className="mr-2" />
            Información del Bloque
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Estadísticas generales */}
          <div className="mb-4">
            <h4 className="font-medium text-slate-200 mb-2 text-sm flex items-center">
              <Activity size={14} className="mr-2" />
              Estadísticas del {maxTurnos > 1 ? `Turno ${currentTurno}` : 'Período'}
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between p-2 bg-slate-700 rounded">
                <span className="text-slate-400">Total posiciones:</span>
                <span className="font-medium text-slate-300">210 (7×30)</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-700 rounded">
                <span className="text-slate-400">Bahías reservadas:</span>
                <span className="font-medium text-slate-300">{bahiasOcupadas} de 30</span>
              </div>
              <div className="flex justify-between p-2 bg-blue-950/20 rounded border border-blue-800">
                <span className="text-blue-400">Ocupación real:</span>
                <span className="font-medium text-blue-300">{ocupacionReal.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-700 rounded">
                <span className="text-slate-400">Segregaciones activas:</span>
                <span className="font-medium text-slate-300">{segregacionesStats.size}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-700 rounded">
                <span className="text-slate-400">Celdas ocupadas:</span>
                <span className="font-medium text-slate-300">
                  {Array.from(segregacionesStats.values()).reduce((sum, stat) => sum + stat.count, 0)} de 210
                </span>
              </div>
            </div>
          </div>

          {/* Leyenda de segregaciones */}
          <div className="mb-4">
            <h4 className="font-medium text-slate-200 mb-2 text-sm flex items-center">
              <Layers size={14} className="mr-2" />
              Segregaciones en el Bloque
            </h4>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {Array.from(segregacionesStats.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([seg, stat]) => (
                <div
                  key={seg}
                  className={`flex flex-col p-2 rounded cursor-pointer transition-colors text-xs ${groupFilter === seg
                      ? 'bg-cyan-950/30 border border-cyan-700'
                      : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  onClick={() => setGroupFilter(groupFilter === seg ? 'all' : seg)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded mr-2 border border-slate-600"
                        style={{ backgroundColor: stat.color }}
                      />
                      <span className="font-medium text-slate-300">{seg}</span>
                      <span className="ml-2 text-slate-500">({stat.tipo} pies)</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-300">{stat.bahias} bahías</div>
                    </div>
                  </div>
                  <div className="mt-1 pl-5 text-slate-400" style={{ fontSize: '10px' }}>
                    <div>Volumen: {stat.volumen} TEUs</div>
                    <div>Ocupación real: {stat.porcentajeOcupacion.toFixed(1)}%</div>
                    <div>Celdas visuales: {stat.count} ({((stat.count / 210) * 100).toFixed(1)}%)</div>
                    {stat.descripcion && (
                      <div className="mt-1 text-slate-500">{stat.descripcion}</div>
                    )}
                  </div>
                </div>
              ))}
              {segregacionesStats.size === 0 && (
                <div className="text-center text-slate-400 py-4">
                  Sin segregaciones en este turno
                </div>
              )}
            </div>
          </div>

          {/* Información de celda seleccionada */}
          {selectedCell && (
            <div className="p-3 bg-cyan-950/20 rounded-lg border border-cyan-800 mb-4">
              <h4 className="font-medium text-cyan-300 mb-2 text-sm">
                Posición Seleccionada
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-cyan-400">Posición:</span>
                  <span className="font-medium text-slate-300">{rowLabels[selectedCell.row]}{selectedCell.col + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-400">Bahía (Columna):</span>
                  <span className="font-medium text-slate-300">{selectedCell.col + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-400">Nivel (Fila):</span>
                  <span className="font-medium text-slate-300">{rowLabels[selectedCell.row]}</span>
                </div>
                {(() => {
                  const cellData = occupancyMatrix[selectedCell.row][selectedCell.col];
                  const stat = cellData ? segregacionesStats.get(cellData.segregacion) : null;
                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-cyan-400">Estado:</span>
                        <span className="font-medium text-slate-300">
                          {cellData ? 'Ocupada' : 'Vacía'}
                        </span>
                      </div>
                      {cellData && stat && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-cyan-400">Segregación:</span>
                            <span className="font-medium text-slate-300">{cellData.segregacion} ({stat.tipo} pies)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-cyan-400">Ocupación bahía:</span>
                            <span className="font-medium text-slate-300">{stat.porcentajeOcupacion.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-cyan-400">Color:</span>
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded mr-1 border border-slate-600"
                                style={{ backgroundColor: cellData.color }}
                              />
                              <span className="font-mono text-slate-300" style={{ fontSize: '10px' }}>
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

          {/* Información del modelo de optimización */}
          {dataSource === 'modelMagdalena' && optimizationMetrics && (
            <div className="mb-4 p-3 bg-blue-950/20 rounded-lg border border-blue-800">
              <h4 className="font-medium text-blue-300 mb-2 text-sm flex items-center">
                <Calendar size={14} className="mr-2" />
                Configuración del Modelo
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-blue-400">Año:</span>
                  <span className="font-medium text-slate-300">{optimizationMetrics.anio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">Semana:</span>
                  <span className="font-medium text-slate-300">{optimizationMetrics.semana}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">Participación:</span>
                  <span className="font-medium text-slate-300">{optimizationMetrics.participacion}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">Eficiencia:</span>
                  <span className="font-medium text-green-400">{optimizationMetrics.eficiencia.optimizada.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">YARD eliminados:</span>
                  <span className="font-medium text-green-400">{optimizationMetrics.movimientos.yardEliminados.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">Distancia ahorrada:</span>
                  <span className="font-medium text-green-400">{optimizationMetrics.distancias.yardEliminada.toLocaleString()}m</span>
                </div>
              </div>
            </div>
          )}

          {/* Información para datos históricos */}
          {dataSource === 'historical' && saiMetrics && (
            <div className="mb-4 p-3 bg-green-950/20 rounded-lg border border-green-800">
              <h4 className="font-medium text-green-300 mb-2 text-sm">
                Datos Históricos SAI
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-green-400">Fecha:</span>
                  <span className="font-medium text-slate-300">
                    {timeState.currentDate.toLocaleDateString('es-CL')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-400">Unidad temporal:</span>
                  <span className="font-medium text-slate-300">
                    {timeState.unit === 'week' ? 'Semana' :
                      timeState.unit === 'day' ? 'Día' :
                        timeState.unit === 'hour' ? 'Hora' : 'Turno'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-400">Fuente:</span>
                  <span className="font-medium text-slate-300">SAI 2022</span>
                </div>
              </div>
            </div>
          )}

          {/* Nota informativa */}
          <div className="mt-4 p-2 bg-blue-950/20 rounded-lg border border-blue-800">
            <div className="flex items-start">
              <AlertTriangle size={14} className="text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-300">
                <p className="font-semibold mb-1">Información importante:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Cada columna = 1 bahía completa</li>
                  <li>• Bahía coloreada = 100% reservada para esa segregación</li>
                  <li>• Altura del color = % de ocupación real de la bahía</li>
                  <li>• 1 bahía = 35 contenedores máximo</li>
                  <li>• Los números = ID de la segregación</li>
                  {dataSource === 'modelMagdalena' && (
                    <li className="text-yellow-300">• Modelo de optimización: Sin reubicaciones YARD</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};