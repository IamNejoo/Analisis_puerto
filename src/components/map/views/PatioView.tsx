// src/components/map/views/PatioView.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { patioData } from '../../../data/patioData';
import { useTimeContext } from '../../../contexts/TimeContext';
import { useMagdalenaData } from '../../../hooks/useMagdalenaData';
import type { BloqueData, PatioData } from '../../../types';
import {
  Activity, Package, CheckCircle, TrendingUp, AlertTriangle, Settings,
  ChevronLeft, ChevronRight, Play, Pause, SkipBack, SkipForward, Clock
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

// Extender el tipo BloqueData localmente si no puedes modificar el archivo de tipos
interface BloqueDataExtended extends BloqueData {
  ocupacionPromedio?: number;
  ocupacionPorTurno?: number[];
}

// Componente Timeline para navegar por turnos
interface TimelineControlsProps {
  currentTurno: number;
  totalTurnos: number;
  onTurnoChange: (turno: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}

const TimelineControls: React.FC<TimelineControlsProps> = ({
  currentTurno,
  totalTurnos,
  onTurnoChange,
  isPlaying,
  onPlayPause
}) => {
  const getTurnoInfo = (turno: number) => {
    // Asumiendo 3 turnos por día, 7 días
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

      {/* Información del turno actual */}
      <div className="bg-cyan-950/20 rounded-lg p-3 mb-4 text-center border border-cyan-800">
        <div className="text-sm text-cyan-400">Turno Actual</div>
        <div className="text-2xl font-bold text-cyan-300">
          {currentTurno} / {totalTurnos}
        </div>
        <div className="text-sm text-cyan-300 mt-1">
          {turnoInfo.descripcion}
        </div>
      </div>

      {/* Controles de reproducción */}
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

      {/* Barra de progreso interactiva */}
      <div className="relative">
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 transition-all duration-300"
            style={{ width: `${(currentTurno / totalTurnos) * 100}%` }}
          />
        </div>

        {/* Marcadores de días */}
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

      {/* Selector rápido de turnos */}
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
  const [selectedBloque, setSelectedBloque] = useState<string | null>(null);
  const [currentTurno, setCurrentTurno] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const { timeState } = useTimeContext();

  // Verificar si Magdalena está activo
  const isMagdalenaActive = timeState?.dataSource === 'modelMagdalena' && patioId === 'costanera';

  // Hook para datos de Magdalena
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

  // Auto-play effect
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
    }, 1000); // Cambiar turno cada segundo

    return () => clearInterval(interval);
  }, [isPlaying, isMagdalenaActive, magdalenaMetrics]);

  // Si Magdalena está activo pero no hay datos, mostrar mensaje
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

  // Usar datos de Magdalena si está activo, sino usar datos estáticos
  const patio = useMemo(() => {
    const patioBase = patioData.find(p => p.id === patioId);

    if (!patioBase) return null;

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
        ocupacionTotal: Math.max(10, ocupacionPromedio), // Mínimo 10% para visualización
        bounds: { x: 0, y: 0, width: 1000, height: 600 },
        description: `Optimización Magdalena - Semana ${timeState?.magdalenaConfig?.semana || 3} - Turno ${currentTurno}`,
        operatingHours: { start: '00:00', end: '23:59' },
        restrictions: []
      };

      return patioConDatosMagdalena;

    } else {
      return patioBase;
    }
  }, [isMagdalenaActive, magdalenaMetrics, patioId, timeState?.magdalenaConfig?.semana, currentTurno]);

  // Mostrar error si patio no existe
  if (!patio) return (
    <div className="w-full h-full flex items-center justify-center bg-slate-900">
      <div className="text-center text-slate-400">
        <AlertTriangle size={48} className="mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-200">Patio no encontrado</h3>
        <p>El patio solicitado no existe o no está disponible</p>
      </div>
    </div>
  );

  // Mostrar loading si carga modelo Magdalena
  if (magdalenaLoading && isMagdalenaActive) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-slate-400">Cargando datos del modelo Magdalena...</p>
        </div>
      </div>
    );
  }

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

        {/* Header con indicador de Magdalena */}
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
              </h2>
              <p className="text-slate-400">{patio.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-400">{patio.ocupacionTotal}%</div>
              <div className="text-sm text-slate-500">Ocupación {isMagdalenaActive ? `Turno ${currentTurno}` : 'Total'}</div>
            </div>
          </div>

          {/* Stats - Actualizadas con datos de Magdalena */}
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
                  {isMagdalenaActive && magdalenaMetrics ? magdalenaMetrics.totalMovimientosOptimizados.toLocaleString() : '344'}
                </div>
              </div>
              <div className="text-xs text-slate-400">
                {isMagdalenaActive ? 'Movimientos' : 'Contenedores'}
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-700 text-center">
              <div className="flex items-center justify-center mb-1">
                <CheckCircle className="text-green-400 mr-2" size={16} />
                <div className="text-lg font-bold text-slate-100">
                  {isMagdalenaActive && realMetrics ? `${realMetrics.reubicaciones}` : '63h'}
                </div>
              </div>
              <div className="text-xs text-slate-400">
                {isMagdalenaActive ? 'Reubicaciones Eliminadas' : 'Tiempo Rotación'}
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-700 text-center">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="text-cyan-400 mr-2" size={16} />
                <div className="text-lg font-bold text-slate-100">
                  {isMagdalenaActive && magdalenaMetrics ? `+${magdalenaMetrics.eficienciaGanada.toFixed(1)}%` : '116'}
                </div>
              </div>
              <div className="text-xs text-slate-400">
                {isMagdalenaActive ? 'Eficiencia Ganada' : 'Movimientos/día'}
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
          </h3>

          {/* Mensaje de debug */}
          {patio.bloques.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <AlertTriangle size={32} className="mx-auto mb-2" />
              <p>No hay bloques disponibles para mostrar</p>
            </div>
          )}

          {/* Grid responsivo y controlado */}
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
  // Extender el tipo localmente
  const bloqueExtended = bloque as BloqueDataExtended;

  // Usar ocupación del turno si está disponible, sino usar la ocupación general
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

          {/* Información adicional compacta */}
          <div className="text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Capacidad:</span>
              <span className="font-medium text-slate-300">
                {(() => {
                  const capacidadReal = isMagdalenaActive && magdalenaMetrics?.capacidadesPorBloque
                    ? magdalenaMetrics.capacidadesPorBloque[bloque.id] || 35
                    : bloque.capacidadTotal;
                  const slots = Math.round(capacidadReal * ocupacionActual / 100);
                  return `${slots}/${capacidadReal}`;
                })()}
              </span>
            </div>
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

        {/* Indicador de modelo activo */}
        {isMagdalenaActive && (
          <div className="mt-2 text-center">
            <div className="text-xs text-cyan-400 bg-cyan-950/30 rounded px-2 py-1 border border-cyan-800">
              Datos optimizados
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