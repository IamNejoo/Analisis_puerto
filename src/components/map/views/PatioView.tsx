// src/components/map/views/PatioView.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useTimeContext } from '../../../contexts/TimeContext';
import { useMagdalenaData } from '../../../hooks/useMagdalenaData';
import { useRealPatioData } from '../../../hooks/useRealPatioData';
import type { BloqueData, PatioData } from '../../../types';
import {
  Activity, Package, CheckCircle, TrendingUp, AlertTriangle, Settings,
  ChevronLeft, ChevronRight, Play, Pause, SkipBack, SkipForward, Clock,
  RefreshCw, Database, Zap
} from 'lucide-react';

interface PatioViewProps {
  patioId: string;
  onBloqueClick: (patioId: string, bloqueId: string) => void;
  getColorForOcupacion: (value: number) => string;
}

interface BloqueComponentProps {
  bloque: BloqueData;
  isSelected: boolean;
  onClick: () => void;
  getColorForOcupacion: (value: number) => string;
  isMagdalenaActive?: boolean;
  ocupacionTurno?: number;
}

// Extender el tipo BloqueData localmente
interface BloqueDataExtended extends BloqueData {
  ocupacionPromedio?: number;
  ocupacionPorTurno?: number[];
  stats?: {
    entradas: number;
    salidas: number;
    remanejos: number;
    teusActuales: number;
    bahiasTotales: number;
    bahiasReefer: number;
    gate: {
      entradas: number;
      salidas: number;
    };
    muelle: {
      entradas: number;
      salidas: number;
    };
    despejes: number;
    reubicacionesEntreBloques: number;
    reubicacionesEntrePatios: number;
  };
}

// Componente Timeline (sin cambios)
interface TimelineControlsProps {
  currentTurno: number;
  totalTurnos: number;
  onTurnoChange: (turno: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}

// MiniDonut component (sin cambios)
const MiniDonut: React.FC<{
  productivos: number;
  noProductivos: number;
  size: number;
}> = ({ productivos, noProductivos, size }) => {
  const total = productivos + noProductivos;
  if (total === 0) return null;

  const productivoAngle = (productivos / total) * 360;
  const radius = size / 2;
  const innerRadius = radius * 0.6;

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const createPath = (startAngle: number, endAngle: number): string => {
    const start = polarToCartesian(radius, radius, radius, endAngle);
    const end = polarToCartesian(radius, radius, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    const outerArc = [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    const innerStart = polarToCartesian(radius, radius, innerRadius, endAngle);
    const innerEnd = polarToCartesian(radius, radius, innerRadius, startAngle);

    const innerArc = [
      "L", innerEnd.x, innerEnd.y,
      "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y
    ].join(" ");

    return outerArc + innerArc + "Z";
  };

  return (
    <svg width={size} height={size} className="absolute top-1 right-1">
      <path
        d={createPath(0, productivoAngle)}
        fill="#10b981"
        fillOpacity={0.8}
      />
      <path
        d={createPath(productivoAngle, 360)}
        fill="#f59e0b"
        fillOpacity={0.8}
      />
      <text
        x={radius}
        y={radius}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-xs font-bold fill-white"
        style={{ fontSize: '8px' }}
      >
        {((productivos / total) * 100).toFixed(0)}%
      </text>
    </svg>
  );
};

// TimelineControls (sin cambios significativos)
const TimelineControls: React.FC<TimelineControlsProps> = ({
  currentTurno,
  totalTurnos,
  onTurnoChange,
  isPlaying,
  onPlayPause
}) => {
  const getTurnoInfo = (turno: number) => {
    const dia = Math.floor((turno - 1) / 3) + 1;
    const turnoDelDia = ((turno - 1) % 3) + 1;
    const nombresTurnos = ['Mañana', 'Tarde', 'Noche'];
    const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    return {
      dia: diasSemana[dia - 1] || `Día ${dia}`,
      turno: nombresTurnos[turnoDelDia - 1] || `Turno ${turnoDelDia}`,
      descripcion: `${diasSemana[dia - 1] || `Día ${dia}`} - ${nombresTurnos[turnoDelDia - 1] || `Turno ${turnoDelDia}`}`
    };
  };

  const turnoInfo = getTurnoInfo(currentTurno);

  return (
    <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center">
          <Clock className="mr-2 text-cyan-400" size={20} />
          Timeline de Turnos
        </h3>
        <div className="text-sm text-slate-400">
          Semana completa: {totalTurnos} turnos
        </div>
      </div>

      <div className="bg-cyan-950/20 rounded-lg p-3 mb-4 text-center border border-cyan-800">
        <div className="text-sm text-cyan-400">Turno Actual</div>
        <div className="text-2xl font-bold text-cyan-300">
          {currentTurno} / {totalTurnos}
        </div>
        <div className="text-sm text-cyan-300 mt-1">
          {turnoInfo.descripcion}
        </div>
      </div>

      <div className="flex items-center justify-center space-x-4 mb-4">
        <button
          onClick={() => onTurnoChange(1)}
          className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300"
          title="Ir al inicio"
        >
          <SkipBack size={20} />
        </button>

        <button
          onClick={() => onTurnoChange(Math.max(1, currentTurno - 1))}
          className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 disabled:opacity-50"
          disabled={currentTurno === 1}
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={onPlayPause}
          className="p-3 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-colors"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>

        <button
          onClick={() => onTurnoChange(Math.min(totalTurnos, currentTurno + 1))}
          className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 disabled:opacity-50"
          disabled={currentTurno === totalTurnos}
        >
          <ChevronRight size={20} />
        </button>

        <button
          onClick={() => onTurnoChange(totalTurnos)}
          className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300"
          title="Ir al final"
        >
          <SkipForward size={20} />
        </button>
      </div>

      <div className="relative">
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 transition-all duration-300"
            style={{ width: `${(currentTurno / totalTurnos) * 100}%` }}
          />
        </div>

        <div className="flex justify-between mt-2">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((dia, index) => (
            <div
              key={index}
              className={`text-xs font-medium ${Math.floor((currentTurno - 1) / 3) === index
                ? 'text-cyan-400'
                : 'text-slate-500'
                }`}
            >
              {dia}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {Array.from({ length: totalTurnos }, (_, i) => i + 1).map(turno => {
          const info = getTurnoInfo(turno);
          const isCurrentTurno = turno === currentTurno;

          return (
            <button
              key={turno}
              onClick={() => onTurnoChange(turno)}
              className={`
                p-2 text-xs rounded transition-all
                ${isCurrentTurno
                  ? 'bg-cyan-500 text-white shadow-md scale-105'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }
              `}
              title={info.descripcion}
            >
              {turno}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const PatioView: React.FC<PatioViewProps> = ({
  patioId,
  onBloqueClick,
  getColorForOcupacion
}) => {
  // ========== TODOS LOS HOOKS AL PRINCIPIO ==========
  // 1. Hooks de estado
  const [selectedBloque, setSelectedBloque] = useState<string | null>(null);
  const [currentTurno, setCurrentTurno] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  // 2. Context hooks
  const { timeState } = useTimeContext();

  // 3. Custom hooks - SIEMPRE deben ejecutarse
  const {
    patioData: realPatioData,
    isLoading: isLoadingReal,
    error: realDataError,
    refreshData
  } = useRealPatioData();

  const {
    magdalenaMetrics,
    realMetrics,
    isLoading: magdalenaLoading,
    dataNotAvailable
  } = useMagdalenaData(
    timeState?.magdalenaConfig?.semana || 3,
    timeState?.magdalenaConfig?.participacion || 69,
    timeState?.magdalenaConfig?.conDispersion ?? true
  );

  // 4. Valores calculados DESPUÉS de los hooks
  const isMagdalenaActive = timeState?.dataSource === 'modelMagdalena' && patioId === 'costanera';

  // 5. Effect hooks
  useEffect(() => {
    if (!isPlaying || !isMagdalenaActive || !magdalenaMetrics) return;

    const interval = setInterval(() => {
      setCurrentTurno(prev => {
        if (prev >= (magdalenaMetrics.periodos || 21)) {
          setIsPlaying(false);
          return 1;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isMagdalenaActive, magdalenaMetrics]);

  // 6. useMemo para determinar qué datos usar
  const patio = useMemo(() => {
    // Si es Magdalena y tiene datos, procesar esos datos
    if (isMagdalenaActive && magdalenaMetrics?.bloquesMagdalena && magdalenaMetrics.bloquesMagdalena.length > 0) {
      const bloquesMagdalena: BloqueDataExtended[] = magdalenaMetrics.bloquesMagdalena.map((blockData) => {
        // Obtener ocupación para el turno actual
        const ocupacionTurno = blockData.ocupacionPorTurno && blockData.ocupacionPorTurno[currentTurno - 1] !== undefined
          ? blockData.ocupacionPorTurno[currentTurno - 1]
          : blockData.ocupacionPromedio;

        // Asegurar que la ocupación sea al menos visible (mínimo 5%)
        const ocupacionVisible = Math.max(5, Math.round(ocupacionTurno));

        return {
          id: blockData.bloqueId,
          patioId: patioId,
          name: `Bloque ${blockData.bloqueId}`,
          ocupacion: ocupacionVisible,
          ocupacionPromedio: Math.max(5, Math.round(blockData.ocupacionPromedio)),
          capacidadTotal: blockData.capacidad,
          bahias: [],
          tipo: 'contenedores' as const,
          bounds: { x: 0, y: 0, width: 100, height: 100 },
          operationalStatus: blockData.estado,
          equipmentType: 'rtg' as const,
          // Datos adicionales para el timeline
          ocupacionPorTurno: blockData.ocupacionPorTurno ?
            blockData.ocupacionPorTurno.map(o => Math.max(5, Math.round(o))) :
            undefined
        };
      });

      // Calcular ocupación total del patio
      const totalOcupacion = bloquesMagdalena.reduce((sum, b) => sum + (b.ocupacion * b.capacidadTotal), 0);
      const totalCapacidad = bloquesMagdalena.reduce((sum, b) => sum + b.capacidadTotal, 0);
      const ocupacionPromedio = totalCapacidad > 0 ? Math.round(totalOcupacion / totalCapacidad) : 0;

      const patioConDatosMagdalena: PatioData = {
        id: 'costanera',
        name: 'Patio Costanera - Modelo Magdalena',
        type: 'contenedores',
        bloques: bloquesMagdalena,
        ocupacionTotal: Math.max(10, ocupacionPromedio),
        bounds: { x: 0, y: 0, width: 1000, height: 600 },
        description: `Optimización Magdalena - Semana ${timeState?.magdalenaConfig?.semana || 3} - Turno ${currentTurno}`,
        operatingHours: { start: '00:00', end: '23:59' },
        restrictions: []
      };

      return patioConDatosMagdalena;
    }

    // Si hay datos reales y el dataSource es historical
    if (timeState?.dataSource === 'historical' && realPatioData) {
      return realPatioData.find(p => p.id === patioId);
    }

    return null;
  }, [isMagdalenaActive, magdalenaMetrics, patioId, realPatioData, timeState?.dataSource, timeState?.magdalenaConfig?.semana, currentTurno]);

  // ========== RENDERIZADO CONDICIONAL (después de todos los hooks) ==========

  // Si Magdalena está activo pero no hay datos
  if (isMagdalenaActive && dataNotAvailable) {
    const dispersionText = timeState?.magdalenaConfig?.conDispersion ? 'Con Dispersión' : 'Centralizada';
    const fileName = `resultado_${timeState?.magdalenaConfig?.semana}_${timeState?.magdalenaConfig?.participacion}_${timeState?.magdalenaConfig?.conDispersion ? 'K' : 'C'}.xlsx`;

    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <div className="text-center max-w-md p-6 bg-slate-800 rounded-lg shadow-md border border-slate-700">
          <AlertTriangle size={48} className="mx-auto mb-4 text-amber-500" />
          <h3 className="text-lg font-semibold text-slate-100 mb-2">Datos no disponibles</h3>
          <p className="text-slate-400 mb-4">
            No se encontraron datos para la configuración seleccionada:
          </p>
          <div className="bg-slate-700 rounded p-3 mb-4 text-sm">
            <p className="text-slate-300"><strong>Semana:</strong> {timeState?.magdalenaConfig?.semana}</p>
            <p className="text-slate-300"><strong>Participación:</strong> {timeState?.magdalenaConfig?.participacion}%</p>
            <p className="text-slate-300"><strong>Tipo:</strong> {dispersionText}</p>
          </div>
          <p className="text-sm text-slate-500">
            Para ver estos datos, asegúrate de tener el archivo:
          </p>
          <code className="text-xs bg-slate-700 px-2 py-1 rounded block mt-2 text-cyan-400">
            public/data/magdalena/{fileName}
          </code>
        </div>
      </div>
    );
  }

  // Loading state
  if ((timeState?.dataSource === 'historical' && isLoadingReal) ||
    (isMagdalenaActive && magdalenaLoading)) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-slate-400">
            {isMagdalenaActive ? 'Cargando datos del modelo Magdalena...' : 'Cargando datos históricos...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (realDataError && timeState?.dataSource === 'historical') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <div className="text-center max-w-md p-6 bg-slate-800 rounded-lg shadow-md border border-slate-700">
          <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-slate-100 mb-2">Error al cargar datos</h3>
          <p className="text-slate-400 mb-4">{realDataError}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center mx-auto"
          >
            <RefreshCw size={16} className="mr-2" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!patio) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <div className="text-center text-slate-400">
          <AlertTriangle size={48} className="mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-200">Patio no encontrado</h3>
          <p>El patio solicitado no existe o no está disponible</p>
        </div>
      </div>
    );
  }

  // ========== RENDERIZADO PRINCIPAL ==========
  return (
    <div className="w-full h-full bg-slate-900 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
        {/* Timeline Controls - Solo visible cuando Magdalena está activo */}
        {isMagdalenaActive && magdalenaMetrics && (
          <TimelineControls
            currentTurno={currentTurno}
            totalTurnos={magdalenaMetrics.periodos || 21}
            onTurnoChange={setCurrentTurno}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
          />
        )}

        {/* Header con indicador de fuente de datos */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-100 flex items-center">
                {patio.name}
                {isMagdalenaActive && (
                  <span className="ml-3 px-3 py-1 bg-cyan-950/30 text-cyan-300 rounded-full text-sm font-medium border border-cyan-800">
                    🔮 Modelo Activo - Turno {currentTurno}
                  </span>
                )}
                {timeState?.dataSource === 'historical' && (
                  <span className="ml-3 px-3 py-1 bg-blue-950/30 text-blue-300 rounded-full text-sm font-medium border border-blue-800 flex items-center">
                    <Database size={14} className="mr-1" />
                    Datos Históricos
                  </span>
                )}
              </h2>
              <p className="text-slate-400">{patio.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-400">{patio.ocupacionTotal}%</div>
              <div className="text-sm text-slate-500">
                Ocupación {isMagdalenaActive ? `Turno ${currentTurno}` : timeState?.unit === 'hour' ? 'Hora' : 'Total'}
              </div>
            </div>
          </div>

          {/* Botón de actualizar para datos históricos */}
          {timeState?.dataSource === 'historical' && (
            <div className="flex justify-end mb-2">
              <button
                onClick={refreshData}
                className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors flex items-center text-sm"
              >
                <RefreshCw size={14} className="mr-1" />
                Actualizar
              </button>
            </div>
          )}

          {/* Stats - Actualizadas con datos reales o de Magdalena */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-700 text-center">
              <div className="flex items-center justify-center mb-1">
                <Activity className="text-blue-400 mr-2" size={16} />
                <div className="text-lg font-bold text-slate-100">
                  {patio.bloques.filter(b => b.operationalStatus === 'active').length}
                </div>
              </div>
              <div className="text-xs text-slate-400">Bloques Activos</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-700 text-center">
              <div className="flex items-center justify-center mb-1">
                <Package className="text-green-400 mr-2" size={16} />
                <div className="text-lg font-bold text-slate-100">
                  {(() => {
                    if (isMagdalenaActive && magdalenaMetrics) {
                      return magdalenaMetrics.totalMovimientosOptimizados.toLocaleString();
                    }
                    // Sumar todos los TEUs actuales de los bloques
                    const totalTeus = patio.bloques.reduce((sum, b) => {
                      const extended = b as BloqueDataExtended;
                      return sum + (extended.stats?.teusActuales || 0);
                    }, 0);
                    return totalTeus.toLocaleString();
                  })()}
                </div>
              </div>
              <div className="text-xs text-slate-400">
                {isMagdalenaActive ? 'Movimientos' : 'TEUs Actuales'}
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-700 text-center">
              <div className="flex items-center justify-center mb-1">
                <Zap className="text-yellow-400 mr-2" size={16} />
                <div className="text-lg font-bold text-slate-100">
                  {(() => {
                    if (isMagdalenaActive && realMetrics) {
                      return `${realMetrics.reubicaciones}`;
                    }
                    // Calcular total de remanejos
                    const totalRemanejos = patio.bloques.reduce((sum, b) => {
                      const extended = b as BloqueDataExtended;
                      return sum + (extended.stats?.remanejos || 0);
                    }, 0);
                    return totalRemanejos.toLocaleString();
                  })()}
                </div>
              </div>
              <div className="text-xs text-slate-400">
                {isMagdalenaActive ? 'Reubicaciones Eliminadas' : 'Remanejos'}
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-700 text-center">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="text-cyan-400 mr-2" size={16} />
                <div className="text-lg font-bold text-slate-100">
                  {(() => {
                    if (isMagdalenaActive && magdalenaMetrics) {
                      return `+${magdalenaMetrics.eficienciaGanada.toFixed(1)}%`;
                    }
                    // Calcular flujo total (entradas + salidas)
                    const totalFlujo = patio.bloques.reduce((sum, b) => {
                      const extended = b as BloqueDataExtended;
                      return sum + (extended.stats?.entradas || 0) + (extended.stats?.salidas || 0);
                    }, 0);
                    return totalFlujo.toLocaleString();
                  })()}
                </div>
              </div>
              <div className="text-xs text-slate-400">
                {isMagdalenaActive ? 'Eficiencia Ganada' : 'Flujo Total TEUs'}
              </div>
            </div>
          </div>

          {/* KPIs adicionales de Magdalena */}
          {isMagdalenaActive && magdalenaMetrics && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-cyan-950/20 rounded-lg p-3 border border-cyan-800">
                <div className="text-sm text-cyan-400">Segregaciones Gestionadas</div>
                <div className="text-xl font-bold text-cyan-300">{magdalenaMetrics.segregacionesActivas}</div>
              </div>
              <div className="bg-blue-950/20 rounded-lg p-3 border border-blue-800">
                <div className="text-sm text-blue-400">Balance de Carga</div>
                <div className="text-xl font-bold text-blue-300">{magdalenaMetrics.balanceWorkload.toFixed(1)}</div>
              </div>
              <div className="bg-green-950/20 rounded-lg p-3 border border-green-800">
                <div className="text-sm text-green-400">Variación de Carga</div>
                <div className="text-xl font-bold text-green-300">{magdalenaMetrics.variacionCarga.toFixed(1)}%</div>
              </div>
            </div>
          )}
        </div>

        {/* Grid de bloques */}
        <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-4">
          <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
            Bloques del Patio
            {isMagdalenaActive && (
              <span className="ml-2 text-sm font-normal text-cyan-400">
                (Datos optimizados por Magdalena - Turno {currentTurno})
              </span>
            )}
            {timeState?.dataSource === 'historical' && (
              <span className="ml-2 text-sm font-normal text-blue-400">
                (Datos del {timeState.currentDate.toLocaleDateString('es-CL')})
              </span>
            )}
          </h3>

          {/* Mensaje cuando no hay bloques */}
          {patio.bloques.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <AlertTriangle size={32} className="mx-auto mb-2" />
              <p>No hay bloques con datos para este período</p>
            </div>
          )}

          {/* Grid responsivo */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-4xl">
            {patio.bloques.map((bloque) => {
              const bloqueExtended = bloque as BloqueDataExtended;

              return (
                <BloqueComponent
                  key={bloque.id}
                  bloque={bloqueExtended}
                  isSelected={selectedBloque === bloque.id}
                  onClick={() => {
                    setSelectedBloque(bloque.id);
                    setTimeout(() => {
                      onBloqueClick(patioId, bloque.id);
                    }, 200);
                  }}
                  getColorForOcupacion={getColorForOcupacion}
                  isMagdalenaActive={isMagdalenaActive}
                  ocupacionTurno={bloque.ocupacion}
                />
              );
            })}
          </div>

          {/* Leyenda compacta */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-700">
            <div className="flex items-center space-x-4 text-sm text-slate-300">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span>Bajo (&lt;70%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                <span>Medio (70-85%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                <span>Alto (&gt;85%)</span>
              </div>
            </div>
            <div className="text-sm text-slate-400">
              Clic en bloque para vista micro
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de bloque actualizado
const BloqueComponent: React.FC<BloqueComponentProps> = ({
  bloque,
  isSelected,
  onClick,
  getColorForOcupacion,
  isMagdalenaActive,
  ocupacionTurno
}) => {
  const { timeState } = useTimeContext();
  const { magdalenaMetrics } = useMagdalenaData(
    timeState?.magdalenaConfig?.semana || 3,
    timeState?.magdalenaConfig?.participacion || 69,
    timeState?.magdalenaConfig?.conDispersion ?? true
  );

  const bloqueExtended = bloque as BloqueDataExtended;
  const ocupacionActual = ocupacionTurno !== undefined ? ocupacionTurno : bloque.ocupacion;

  const color = bloque.operationalStatus === 'maintenance'
    ? '#6B7280'
    : bloque.operationalStatus === 'restricted'
      ? '#EF4444'
      : getColorForOcupacion(ocupacionActual);

  const ocupiedSlots = Math.round(bloque.capacidadTotal * ocupacionActual / 100);

  return (
    <div
      className={`relative bg-slate-800 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${isSelected ? 'border-blue-500 shadow-lg scale-105' : 'border-slate-600 hover:border-slate-500'
        } ${bloque.operationalStatus === 'maintenance' ? 'opacity-75' : ''}`}
      onClick={onClick}
    >
      {/* Header del bloque */}
      <div className="p-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-lg text-slate-100">{bloque.id}</h4>
          <div
            className="w-5 h-5 rounded-full border-2 border-slate-700 shadow-sm"
            style={{ backgroundColor: color }}
          ></div>
        </div>
        <p className="text-sm text-slate-400 truncate">{bloque.name}</p>
      </div>

      {/* Mini Donut Chart para Magdalena */}
      {isMagdalenaActive && magdalenaMetrics && (() => {
        const bloqueData = magdalenaMetrics.bloquesMagdalena?.find(b => b.bloqueId === bloque.id);
        if (!bloqueData) return null;

        const productivos = (bloqueData.movimientos?.entrega || 0)
          + (bloqueData.movimientos?.recepcion || 0)
          + (bloqueData.movimientos?.carga || 0)
          + (bloqueData.movimientos?.descarga || 0);

        const noProductivos =
          ('remanejos' in bloqueData ? (bloqueData as any).remanejos : 0) +
          ('movimientosInterBloques' in bloqueData ? (bloqueData as any).movimientosInterBloques : 0);

        if (productivos + noProductivos === 0) return null;

        return (
          <MiniDonut
            productivos={productivos}
            noProductivos={noProductivos}
            size={40}
          />
        );
      })()}

      {/* Contenido del bloque */}
      <div className="p-3">
        <div className="space-y-2">
          {/* Ocupación actual */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-slate-300">
                {isMagdalenaActive ? 'Ocupación Turno' : 'Ocupación'}
              </span>
              <span className="text-sm font-bold" style={{ color }}>{ocupacionActual}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{ width: `${ocupacionActual}%`, backgroundColor: color }}
              ></div>
            </div>
          </div>

          {/* Mostrar ocupación promedio si es diferente */}
          {isMagdalenaActive && bloqueExtended.ocupacionPromedio !== undefined &&
            bloqueExtended.ocupacionPromedio !== ocupacionActual && (
              <div className="text-xs text-slate-400">
                Promedio semana: {bloqueExtended.ocupacionPromedio}%
              </div>
            )}

          {/* Información adicional */}
          <div className="text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Capacidad:</span>
              <span className="font-medium text-slate-300">
                {bloqueExtended.stats?.teusActuales || ocupiedSlots}/{bloque.capacidadTotal} TEUs
              </span>
            </div>

            {/* Mostrar estadísticas detalladas para datos históricos */}
            {timeState?.dataSource === 'historical' && bloqueExtended.stats && (
              <>
                {/* Gate */}
                <div className="pt-1 border-t border-slate-600">
                  <div className="font-medium text-slate-300 mb-1">Gate:</div>
                  <div className="flex justify-between pl-2">
                    <span>Entradas:</span>
                    <span className="font-medium text-green-400">↓ {bloqueExtended.stats.gate.entradas}</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>Salidas:</span>
                    <span className="font-medium text-blue-400">↑ {bloqueExtended.stats.gate.salidas}</span>
                  </div>
                </div>

                {/* Muelle */}
                <div className="pt-1 border-t border-slate-600">
                  <div className="font-medium text-slate-300 mb-1">Muelle:</div>
                  <div className="flex justify-between pl-2">
                    <span>Entradas:</span>
                    <span className="font-medium text-green-400">↓ {bloqueExtended.stats.muelle.entradas}</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>Salidas:</span>
                    <span className="font-medium text-blue-400">↑ {bloqueExtended.stats.muelle.salidas}</span>
                  </div>
                </div>

                {/* Movimientos internos */}
                <div className="pt-1 border-t border-slate-600">
                  <div className="flex justify-between">
                    <span>Despejes:</span>
                    <span className="font-medium text-orange-400">{bloqueExtended.stats.despejes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entre bloques:</span>
                    <span className="font-medium text-purple-400">{bloqueExtended.stats.reubicacionesEntreBloques}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entre patios:</span>
                    <span className="font-medium text-pink-400">{bloqueExtended.stats.reubicacionesEntrePatios}</span>
                  </div>
                </div>

                {/* Bahías */}
                <div className="pt-1 border-t border-slate-600">
                  <div className="flex justify-between">
                    <span>Bahías:</span>
                    <span className="font-medium text-slate-300">
                      {bloqueExtended.stats.bahiasTotales}
                      {bloqueExtended.stats.bahiasReefer > 0 &&
                        ` (${bloqueExtended.stats.bahiasReefer} reefer)`}
                    </span>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-between">
              <span>Estado:</span>
              <span className={`font-medium capitalize ${bloque.operationalStatus === 'active' ? 'text-green-400' :
                bloque.operationalStatus === 'maintenance' ? 'text-orange-400' :
                  'text-red-400'
                }`}>
                {bloque.operationalStatus === 'active' ? 'Activo' :
                  bloque.operationalStatus === 'maintenance' ? 'Mantenimiento' :
                    'Restringido'}
              </span>
            </div>
          </div>
        </div>

        {/* Indicador de fuente de datos */}
        {isMagdalenaActive && (
          <div className="mt-2 text-center">
            <div className="text-xs text-cyan-400 bg-cyan-950/30 rounded px-2 py-1 border border-cyan-800">
              Datos optimizados
            </div>
          </div>
        )}
        {timeState?.dataSource === 'historical' && (
          <div className="mt-2 text-center">
            <div className="text-xs text-blue-400 bg-blue-950/30 rounded px-2 py-1 border border-blue-800">
              Datos históricos
            </div>
          </div>
        )}
      </div>

      {/* Mini gráfico de tendencia para Magdalena */}
      {isMagdalenaActive && bloqueExtended.ocupacionPorTurno && bloqueExtended.ocupacionPorTurno.length > 0 && (
        <div className="px-3 pb-2">
          <div className="h-8 flex items-end space-x-0.5">
            {bloqueExtended.ocupacionPorTurno.slice(-7).map((ocu, idx) => (
              <div
                key={idx}
                className="flex-1 bg-cyan-500 rounded-t"
                style={{
                  height: `${Math.max(10, (ocu / 100) * 100)}%`,
                  opacity: 0.6
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Overlay de selección */}
      {isSelected && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center">
          <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Seleccionado
          </div>
        </div>
      )}
    </div>
  );
};