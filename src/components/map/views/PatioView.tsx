// src/components/map/views/PatioView.tsx - ACTUALIZADO PARA NUEVO BACKEND
import React, { useState, useMemo, useEffect } from 'react';
import { useTimeContext } from '../../../contexts/TimeContext';
import { useMagdalenaData } from '../../../hooks/useMagdalenaData';
import { useRealPatioData } from '../../../hooks/useRealPatioData';
import { useCamilaData } from '../../../hooks/useCamilaData';
import type { BloqueData, PatioData, CamilaConfig } from '../../../types';
import {
  Activity, Package, CheckCircle, TrendingUp, AlertTriangle, Settings,
  ChevronLeft, ChevronRight, Play, Pause, SkipBack, SkipForward, Clock,
  RefreshCw, Database, Zap, Truck, ArrowUp, ArrowDown, BarChart3
} from 'lucide-react';
import { getISOWeekNumber, getISOYear } from '../../../utils/isoWeekUtils';
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
  isCamilaActive?: boolean;
  ocupacionTurno?: number;
  camilaData?: {
    gruas: number[];
    flujos: {
      recepcion: number;
      entrega: number;
      carga: number;
      descarga: number;
      total: number;
    };
    capacidad: number;
    utilizacion: number;
    congestion: number;
  };
  currentHour?: number;
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

// Componente Timeline para Camila (por horas)
interface CamilaTimelineControlsProps {
  currentHour: number;
  totalHours: number;
  onHourChange: (hour: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  turno: number;
}

const CamilaTimelineControls: React.FC<CamilaTimelineControlsProps> = ({
  currentHour,
  totalHours,
  onHourChange,
  isPlaying,
  onPlayPause,
  turno
}) => {
  const getHourInfo = (hour: number) => {
    // Ajustar según el turno
    let baseHour = 0;
    switch (turno) {
      case 1: baseHour = 8; break;  // 08:00-16:00
      case 2: baseHour = 16; break; // 16:00-24:00
      case 3: baseHour = 0; break;  // 00:00-08:00
    }
    const realHour = baseHour + hour;
    return `${realHour < 10 ? '0' : ''}${realHour}:00`;
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center">
          <Clock className="mr-2 text-teal-400" size={20} />
          Timeline por Horas - Turno {turno}
        </h3>
        <div className="text-sm text-slate-400">
          {totalHours} horas de operación
        </div>
      </div>

      <div className="bg-teal-950/20 rounded-lg p-3 mb-4 text-center border border-teal-800">
        <div className="text-sm text-teal-400">Hora Actual</div>
        <div className="text-2xl font-bold text-teal-300">
          {getHourInfo(currentHour)}
        </div>
        <div className="text-sm text-teal-300 mt-1">
          Período {currentHour + 1} de {totalHours}
        </div>
      </div>

      <div className="flex items-center justify-center space-x-4 mb-4">
        <button
          onClick={() => onHourChange(0)}
          className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300"
          title="Ir al inicio"
        >
          <SkipBack size={20} />
        </button>

        <button
          onClick={() => onHourChange(Math.max(0, currentHour - 1))}
          className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 disabled:opacity-50"
          disabled={currentHour === 0}
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={onPlayPause}
          className="p-3 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>

        <button
          onClick={() => onHourChange(Math.min(totalHours - 1, currentHour + 1))}
          className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 disabled:opacity-50"
          disabled={currentHour === totalHours - 1}
        >
          <ChevronRight size={20} />
        </button>

        <button
          onClick={() => onHourChange(totalHours - 1)}
          className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300"
          title="Ir al final"
        >
          <SkipForward size={20} />
        </button>
      </div>

      <div className="relative">
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 transition-all duration-300"
            style={{ width: `${((currentHour + 1) / totalHours) * 100}%` }}
          />
        </div>

        <div className="flex justify-between mt-2">
          {Array.from({ length: totalHours }, (_, i) => (
            <div
              key={i}
              className={`text-xs font-medium ${currentHour === i
                ? 'text-teal-400'
                : 'text-slate-500'
                }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-8 gap-1">
        {Array.from({ length: totalHours }, (_, i) => (
          <button
            key={i}
            onClick={() => onHourChange(i)}
            className={`
              p-2 text-xs rounded transition-all
              ${i === currentHour
                ? 'bg-teal-500 text-white shadow-md scale-105'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }
            `}
            title={getHourInfo(i)}
          >
            {getHourInfo(i).substring(0, 5)}
          </button>
        ))}
      </div>
    </div>
  );
};

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

// TimelineControls para Magdalena (sin cambios)
const TimelineControls: React.FC<{
  currentTurno: number;
  totalTurnos: number;
  onTurnoChange: (turno: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}> = ({
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
  const [currentHour, setCurrentHour] = useState(0); // Nueva: para Camila
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

  // NUEVO: Hook para datos de Camila
  const {
    camilaResults,
    isLoading: camilaLoading,
    error: camilaError,
    hasDataForConfig: hasCamilaData
  } = useCamilaData(timeState?.camilaConfig || null);

  // 4. Valores calculados DESPUÉS de los hooks
  const isMagdalenaActive = timeState?.dataSource === 'modelMagdalena' && patioId === 'costanera';
  const isCamilaActive = timeState?.dataSource === 'modelCamila' && patioId === 'costanera';

  // 5. Effect hooks
  useEffect(() => {
    if (!isPlaying) return;

    if (isMagdalenaActive && magdalenaMetrics) {
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
    }

    if (isCamilaActive && camilaResults) {
      const interval = setInterval(() => {
        setCurrentHour(prev => {
          if (prev >= 7) { // 8 horas (0-7)
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, isMagdalenaActive, isCamilaActive, magdalenaMetrics, camilaResults]);

  // 6. useMemo para determinar qué datos usar
  const patio = useMemo(() => {
    // ... código existente para Camila ...

    // Si es Magdalena/Optimización y tiene datos
    if (isMagdalenaActive && metrics) {
      console.log('🏗️ Procesando datos de optimización para el patio');

      // Crear bloques basados en los datos de ocupación
      const bloquesOptimizados: BloqueDataExtended[] = metrics.ocupacion.porBloque.map((bloqueData) => {
        // Obtener ocupación para el período actual
        const ocupacionActual = metrics.evolucionTemporal.find(
          t => t.periodo === currentTurno
        )?.ocupacionPromedio || bloqueData.ocupacionPromedio;

        return {
          id: bloqueData.bloque,
          patioId: patioId,
          name: `Bloque ${bloqueData.bloque}`,
          ocupacion: Math.round(ocupacionActual),
          ocupacionPromedio: Math.round(bloqueData.ocupacionPromedio),
          capacidadTotal: Math.round(metrics.ocupacion.capacidadTotal / 9), // Dividir entre 9 bloques
          bahias: [],
          tipo: 'contenedores' as const,
          bounds: { x: 0, y: 0, width: 100, height: 100 },
          operationalStatus: 'active' as const,
          equipmentType: 'rtg' as const,
          stats: {
            entradas: 0,
            salidas: 0,
            remanejos: 0,
            teusActuales: 0,
            bahiasTotales: 35,
            bahiasReefer: 0,
            gate: { entradas: 0, salidas: 0 },
            muelle: { entradas: 0, salidas: 0 },
            despejes: 0,
            reubicacionesEntreBloques: 0,
            reubicacionesEntrePatios: 0
          }
        };
      });

      const patioOptimizado: PatioData = {
        id: 'costanera',
        name: 'Patio Costanera - Modelo Optimización',
        type: 'contenedores',
        bloques: bloquesOptimizados,
        ocupacionTotal: Math.round(metrics.ocupacion.promedio),
        bounds: { x: 0, y: 0, width: 1000, height: 600 },
        description: `${metrics.anio} - Semana ${metrics.semana} - P${metrics.participacion}% - Turno ${currentTurno}`,
        operatingHours: { start: '00:00', end: '23:59' },
        restrictions: []
      };

      return patioOptimizado;
    }

    // ... resto del código existente ...
  }, [isMagdalenaActive, isCamilaActive, metrics, camilaResults, patioId, realPatioData, timeState?.dataSource, currentTurno]);

  // Función para obtener datos de Camila para un bloque específico
  const getCamilaDataForBlock = (bloqueIndex: number) => {
    if (!camilaResults) return null;

    const totalFlow = camilaResults.totalFlows[bloqueIndex]?.[currentHour] || 0;
    const capacity = camilaResults.capacity[bloqueIndex]?.[currentHour] || 1;
    const recepcion = camilaResults.receptionFlow[bloqueIndex]?.[currentHour] || 0;
    const entrega = camilaResults.deliveryFlow[bloqueIndex]?.[currentHour] || 0;
    const carga = camilaResults.loadingFlow[bloqueIndex]?.[currentHour] || 0;
    const descarga = camilaResults.unloadingFlow[bloqueIndex]?.[currentHour] || 0;

    // Contar grúas asignadas
    const gruasList: number[] = [];
    for (let g = 0; g < 12; g++) {
      if (camilaResults.grueAssignment[g]?.[bloqueIndex * 8 + currentHour] === 1) {
        gruasList.push(g + 1);
      }
    }

    return {
      gruas: gruasList,
      flujos: {
        recepcion,
        entrega,
        carga,
        descarga,
        total: totalFlow
      },
      capacidad: capacity,
      utilizacion: capacity > 0 ? (totalFlow / capacity) * 100 : 0,
      congestion: capacity > 0 ? totalFlow / capacity : 0
    };
  };

  // ========== RENDERIZADO CONDICIONAL (después de todos los hooks) ==========

  // Si Camila está activo pero no hay datos
  if (isCamilaActive && !hasCamilaData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <div className="text-center max-w-md p-6 bg-slate-800 rounded-lg shadow-md border border-slate-700">
          <AlertTriangle size={48} className="mx-auto mb-4 text-amber-500" />
          <h3 className="text-lg font-semibold text-slate-100 mb-2">Datos no disponibles</h3>
          <p className="text-slate-400 mb-4">
            No se encontraron datos para la configuración de Camila seleccionada:
          </p>
          <div className="bg-slate-700 rounded p-3 mb-4 text-sm">
            <p className="text-slate-300"><strong>Semana:</strong> {timeState?.camilaConfig?.week}</p>
            <p className="text-slate-300"><strong>Día:</strong> {timeState?.camilaConfig?.day}</p>
            <p className="text-slate-300"><strong>Turno:</strong> {timeState?.camilaConfig?.shift}</p>
            <p className="text-slate-300"><strong>Modelo:</strong> {timeState?.camilaConfig?.modelType}</p>
          </div>
          <p className="text-sm text-slate-500">
            Por favor, verifica que existan datos cargados para esta configuración.
          </p>
        </div>
      </div>
    );
  }

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
    (isMagdalenaActive && magdalenaLoading) ||
    (isCamilaActive && camilaLoading)) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-slate-400">
            {isCamilaActive ? 'Cargando datos del modelo Camila...' :
              isMagdalenaActive ? 'Cargando datos del modelo Magdalena...' :
                'Cargando datos históricos...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if ((realDataError && timeState?.dataSource === 'historical') || (camilaError && isCamilaActive)) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <div className="text-center max-w-md p-6 bg-slate-800 rounded-lg shadow-md border border-slate-700">
          <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-slate-100 mb-2">Error al cargar datos</h3>
          <p className="text-slate-400 mb-4">{realDataError || camilaError}</p>
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
        {/* Timeline Controls - Para Camila (horas) o Magdalena (turnos) */}
        {isCamilaActive && camilaResults && (
          <CamilaTimelineControls
            currentHour={currentHour}
            totalHours={8}
            onHourChange={setCurrentHour}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            turno={camilaResults.shift}
          />
        )}

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
                {isCamilaActive && (
                  <span className="ml-3 px-3 py-1 bg-teal-950/30 text-teal-300 rounded-full text-sm font-medium border border-teal-800">
                    ⚡ Camila - Período {currentHour + 1}
                  </span>
                )}
                {isMagdalenaActive && (
                  <span className="ml-3 px-3 py-1 bg-cyan-950/30 text-cyan-300 rounded-full text-sm font-medium border border-cyan-800">
                    🔮 Magdalena - Turno {currentTurno}
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
              <div className="text-3xl font-bold text-blue-400">
                {isCamilaActive && camilaResults ?
                  `${camilaResults.workloadBalance.toFixed(1)}%` :
                  `${patio.ocupacionTotal}%`}
              </div>
              <div className="text-sm text-slate-500">
                {isCamilaActive ? 'Balance de Carga' :
                  isMagdalenaActive ? `Ocupación Turno ${currentTurno}` :
                    'Ocupación Total'}
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

          {/* KPIs adicionales de Camila */}
          {isCamilaActive && camilaResults && (
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="bg-teal-950/20 rounded-lg p-3 border border-teal-800">
                <div className="text-sm text-teal-400">Función Objetivo</div>
                <div className="text-xl font-bold text-teal-300">
                  {camilaResults.objectiveValue.toFixed(0)}
                </div>
              </div>
              <div className="bg-purple-950/20 rounded-lg p-3 border border-purple-800">
                <div className="text-sm text-purple-400">Grúas Activas</div>
                <div className="text-xl font-bold text-purple-300">
                  {(() => {
                    const activeGruas = new Set();
                    for (let g = 0; g < 12; g++) {
                      for (let b = 0; b < 9; b++) {
                        if (camilaResults.grueAssignment[g]?.[b * 8 + currentHour] === 1) {
                          activeGruas.add(g);
                          break;
                        }
                      }
                    }
                    return activeGruas.size;
                  })()}/12
                </div>
              </div>
              <div className="bg-blue-950/20 rounded-lg p-3 border border-blue-800">
                <div className="text-sm text-blue-400">Índice Congestión</div>
                <div className="text-xl font-bold text-blue-300">{camilaResults.congestionIndex.toFixed(2)}</div>
              </div>
              <div className="bg-green-950/20 rounded-lg p-3 border border-green-800">
                <div className="text-sm text-green-400">Movimientos/Hora</div>
                <div className="text-xl font-bold text-green-300">
                  {camilaResults.totalFlows.reduce((sum, block) => sum + (block[currentHour] || 0), 0)}
                </div>
              </div>
            </div>
          )}

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
            {isCamilaActive && (
              <span className="ml-2 text-sm font-normal text-teal-400">
                (Optimización operacional Camila - Período {currentHour + 1})
              </span>
            )}
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
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {patio.bloques.map((bloque: BloqueData, idx: number) => {
              const bloqueExtended = bloque as BloqueDataExtended;
              const camilaData = isCamilaActive ? getCamilaDataForBlock(idx) : undefined;

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
                  isCamilaActive={isCamilaActive}
                  ocupacionTurno={bloque.ocupacion}
                  camilaData={camilaData || undefined}
                  currentHour={currentHour}
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

// Componente de bloque actualizado para soportar Camila
const BloqueComponent: React.FC<BloqueComponentProps> = ({
  bloque,
  isSelected,
  onClick,
  getColorForOcupacion,
  isMagdalenaActive,
  isCamilaActive,
  ocupacionTurno,
  camilaData,
  currentHour
}) => {
  const { timeState } = useTimeContext();
  const { magdalenaMetrics } = useMagdalenaData(
    timeState?.magdalenaConfig?.semana || 3,
    timeState?.magdalenaConfig?.participacion || 69,
    timeState?.magdalenaConfig?.conDispersion ?? true
  );

  const bloqueExtended = bloque as BloqueDataExtended;
  const ocupacionActual = isCamilaActive && camilaData ?
    Math.round(camilaData.utilizacion) :
    (ocupacionTurno !== undefined ? ocupacionTurno : bloque.ocupacion);

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

      {/* Indicador de grúas para Camila */}
      {isCamilaActive && camilaData && camilaData.gruas.length > 0 && (
        <div className="absolute top-1 right-1 bg-teal-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
          <Truck size={16} />
          <span className="text-xs font-bold ml-0.5">{camilaData.gruas.length}</span>
        </div>
      )}

      {/* Contenido del bloque */}
      <div className="p-3">
        <div className="space-y-2">
          {/* Visualización para Camila */}
          {isCamilaActive && camilaData ? (
            <>
              {/* Utilización */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-300">Utilización</span>
                  <span className="text-sm font-bold" style={{ color }}>{ocupacionActual}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ width: `${ocupacionActual}%`, backgroundColor: color }}
                  ></div>
                </div>
              </div>

              {/* Flujos */}
              <div className="text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Capacidad:</span>
                  <span className="font-medium text-slate-300">{camilaData.capacidad} mov/hora</span>
                </div>

                {/* Grúas asignadas */}
                {camilaData.gruas.length > 0 && (
                  <div className="flex justify-between">
                    <span>Grúas:</span>
                    <span className="font-medium text-teal-400">
                      g{camilaData.gruas.join(', g')}
                    </span>
                  </div>
                )}

                {/* Flujos detallados */}
                {camilaData.flujos.total > 0 && (
                  <div className="pt-1 border-t border-slate-600">
                    <div className="font-medium text-slate-300 mb-1">Flujos (P{(currentHour ?? 0) + 1}):</div>
                    <div className="grid grid-cols-2 gap-x-2">
                      {camilaData.flujos.recepcion > 0 && (
                        <div className="flex justify-between">
                          <span className="flex items-center">
                            <ArrowDown size={10} className="mr-1 text-green-400" />
                            Rec:
                          </span>
                          <span className="font-medium text-green-400">{camilaData.flujos.recepcion}</span>
                        </div>
                      )}
                      {camilaData.flujos.entrega > 0 && (
                        <div className="flex justify-between">
                          <span className="flex items-center">
                            <ArrowUp size={10} className="mr-1 text-blue-400" />
                            Ent:
                          </span>
                          <span className="font-medium text-blue-400">{camilaData.flujos.entrega}</span>
                        </div>
                      )}
                      {camilaData.flujos.carga > 0 && (
                        <div className="flex justify-between">
                          <span>Car:</span>
                          <span className="font-medium text-purple-400">{camilaData.flujos.carga}</span>
                        </div>
                      )}
                      {camilaData.flujos.descarga > 0 && (
                        <div className="flex justify-between">
                          <span>Des:</span>
                          <span className="font-medium text-orange-400">{camilaData.flujos.descarga}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between mt-1 pt-1 border-t border-slate-700">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold text-slate-200">{camilaData.flujos.total}</span>
                    </div>
                  </div>
                )}

                {/* Indicador de congestión */}
                {camilaData.congestion > 1 && (
                  <div className="mt-1 flex items-center text-orange-400">
                    <AlertTriangle size={12} className="mr-1" />
                    <span className="text-xs">Congestión: {camilaData.congestion.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Visualización estándar (histórico o Magdalena) */}
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
            </>
          )}
        </div>

        {/* Indicador de fuente de datos */}
        {isCamilaActive && (
          <div className="mt-2 text-center">
            <div className="text-xs text-teal-400 bg-teal-950/30 rounded px-2 py-1 border border-teal-800">
              Optimización Camila
            </div>
          </div>
        )}
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

      {/* Mini gráfico de flujos por hora para Camila */}
      {isCamilaActive && camilaData && (
        <div className="px-3 pb-2">
          <div className="h-8 flex items-center justify-center space-x-1">
            <BarChart3 size={12} className="text-slate-500" />
            <div className="flex items-end space-x-0.5 flex-1">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((h) => {
                const isCurrentHour = h === currentHour;
                return (
                  <div
                    key={h}
                    className={`flex-1 rounded-t transition-all duration-200 ${isCurrentHour ? 'bg-teal-500' : 'bg-slate-600'}`}
                    style={{
                      height: `${isCurrentHour ? 28 : 14}px`,
                      opacity: isCurrentHour ? 1 : 0.6
                    }}
                    title={`P${h + 1}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
