// src/components/Terminal/PatioView/components/BloqueComponent.tsx
import React from 'react';
import { Truck, Layers, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import type { BloqueComponentProps, BloqueStats } from '../../../../types/patioView.types';

export const BloqueComponent: React.FC<BloqueComponentProps> = ({
    bloque,
    isSelected,
    onClick,
    getColorForOcupacion,
    isMagdalenaActive,
    isCamilaActive,
    ocupacionTurno,
    camilaData,
    currentPeriod = 1,
    dashboardData,
    magdalenaData
}) => {
    // Para datos históricos, usar la ocupación directa del bloque
    let ocupacionActual = bloque.ocupacion;
    let totalMovimientosPeriodo = 0;
    let gruasAsignadas: number[] = [];

    if (isCamilaActive && camilaData) {
        totalMovimientosPeriodo = camilaData.asignaciones.reduce((sum, a) => sum + a.movimientos_asignados, 0);
        gruasAsignadas = camilaData.gruas;

        if (totalMovimientosPeriodo > 0 && dashboardData) {
            const utilizacionPromedio = camilaData.metricas?.reduce((sum, m) => sum + m.utilizacion_pct, 0) || 0;
            const numGruas = camilaData.metricas?.length || 1;
            ocupacionActual = Math.round(utilizacionPromedio / numGruas);
        } else {
            ocupacionActual = 0;
        }
    } else if (isMagdalenaActive && ocupacionTurno !== undefined) {
        ocupacionActual = ocupacionTurno;
    }

    const color = bloque.operationalStatus === 'maintenance'
        ? '#6B7280'
        : bloque.operationalStatus === 'restricted'
            ? '#EF4444'
            : isCamilaActive
                ? (ocupacionActual > 80 ? '#EF4444' : ocupacionActual > 50 ? '#F59E0B' : '#10B981')
                : getColorForOcupacion(ocupacionActual);

    const ocupiedSlots = Math.round(bloque.capacidadTotal * ocupacionActual / 100);

    // Crear un objeto stats con valores por defecto si no existe
    const stats: BloqueStats = bloque.stats || {
        teusActuales: 0,
        bahiasTotales: 33,
        bahiasReefer: 0,
        gate: { entradas: 0, salidas: 0 },
        gateEntradas: 0,
        gateSalidas: 0,
        muelle: { entradas: 0, salidas: 0 },
        muelleEntradas: 0,
        muelleSalidas: 0,
        despejes: 0,
        despejosBloques: 0,
        despejosPatios: 0,
        reubicacionesEntreBloques: 0,
        reubicacionesEntrePatios: 0,
        entradas: 0,
        salidas: 0,
        remanejos: 0,
        bahias: 33
    };

    const despejosData = {
        entreBloques: stats.despejosBloques,
        entrePatios: stats.despejosPatios
    };

    return (
        <div
            className={`relative bg-slate-900 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${isSelected ? 'border-cyan-500 shadow-xl scale-105' : 'border-slate-700 hover:border-slate-600'
                } ${bloque.operationalStatus === 'maintenance' ? 'opacity-75' : ''}`}
            onClick={onClick}
            style={{ minHeight: '280px' }}
        >
            {/* Indicador de estado (círculo verde/amarillo/rojo) */}
            <div className="absolute top-2 right-2">
                <div
                    className="w-2 h-2 rounded-full"
                    style={{
                        backgroundColor: ocupacionActual > 80 ? '#ef4444' :
                            ocupacionActual > 60 ? '#f59e0b' : '#10b981'
                    }}
                />
            </div>

            {/* Header del bloque */}
            <div className="p-3 pb-2 border-b border-slate-700">
                <h4 className="font-bold text-base text-white">{bloque.id}</h4>
                <p className="text-xs text-slate-400">Bloque {bloque.id}</p>
            </div>

            {/* Contenido principal */}
            <div className="p-3 space-y-2">
                {/* Visualización para Camila */}
                {isCamilaActive && camilaData ? (
                    <>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-slate-300">Mov. P{currentPeriod}</span>
                                <span className="text-sm font-bold text-teal-300">{totalMovimientosPeriodo}</span>
                            </div>
                            {totalMovimientosPeriodo > 0 && (
                                <div className="w-full bg-slate-700 rounded-full h-1.5">
                                    <div
                                        className="h-1.5 rounded-full transition-all duration-300 bg-teal-500"
                                        style={{ width: `${Math.min(100, (totalMovimientosPeriodo / 30) * 100)}%` }}
                                    ></div>
                                </div>
                            )}
                        </div>
                        {/* Indicadores especiales para Camila */}
                        {gruasAsignadas.length > 0 && (
                            <div className="pt-2 border-t border-slate-700">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center text-xs">
                                        <Truck size={10} className="text-teal-400 mr-1" />
                                        <span className="text-slate-400">Grúas:</span>
                                        <span className="font-medium text-white ml-1">{gruasAsignadas.length}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Visualización estándar (histórico o Magdalena) */}
                        {/* Ocupación */}
                        <div className="pb-2">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="text-xs text-slate-400">Ocupación</span>
                                <span className="text-xl font-bold" style={{ color }}>
                                    {Math.floor(ocupacionActual)}%
                                </span>
                            </div>
                        </div>

                        {/* Capacidad */}
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-700">
                            <span className="text-xs text-slate-400">Capacidad:</span>
                            <span className="text-xs font-medium text-white">
                                {ocupiedSlots}/{bloque.capacidadTotal}
                            </span>
                        </div>

                        {/* Mostrar estadísticas detalladas solo para datos históricos */}
                        {!isMagdalenaActive && !isCamilaActive && bloque.stats && (
                            <>
                                {/* Gate */}
                                <div className="py-1.5 border-b border-slate-700">
                                    <div className="text-xs text-slate-400 mb-1">Gate:</div>
                                    <div className="pl-2 space-y-0.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-500">Entradas:</span>
                                            <span className="text-xs font-medium text-green-400">
                                                ↓ {stats.gateEntradas}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-500">Salidas:</span>
                                            <span className="text-xs font-medium text-blue-400">
                                                ↑ {stats.gateSalidas}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Muelle */}
                                <div className="py-1.5 border-b border-slate-700">
                                    <div className="text-xs text-slate-400 mb-1">Muelle:</div>
                                    <div className="pl-2 space-y-0.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-500">Entradas:</span>
                                            <span className="text-xs font-medium text-green-400">
                                                ↓ {stats.muelleEntradas}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-500">Salidas:</span>
                                            <span className="text-xs font-medium text-blue-400">
                                                ↑ {stats.muelleSalidas}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Despejos */}
                                <div className="py-1.5 border-b border-slate-700">
                                    <div className="text-xs text-slate-400 mb-1">Despejos:</div>
                                    <div className="pl-2 space-y-0.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-500">Entre bloques:</span>
                                            <span className="text-xs font-medium text-orange-400">
                                                {despejosData.entreBloques}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-500">Entre patios:</span>
                                            <span className="text-xs font-medium text-purple-400">
                                                {despejosData.entrePatios}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bahías */}
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-700">
                                    <span className="text-xs text-slate-400">Bahías:</span>
                                    <span className="text-xs font-medium text-white">
                                        {stats.bahiasTotales} ({stats.bahiasReefer} reefer)
                                    </span>
                                </div>
                            </>
                        )}

                        {/* Indicadores especiales para Magdalena */}
                        {isMagdalenaActive && magdalenaData && (
                            <div className="pt-2 border-t border-slate-700">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center text-xs">
                                        <Layers size={10} className="text-cyan-400 mr-1" />
                                        <span className="text-slate-400">Segregaciones:</span>
                                        <span className="font-medium text-white ml-1">{magdalenaData.segregaciones || 0}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Estado */}
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-xs text-slate-400">Estado:</span>
                            <span className={`text-xs font-medium ${bloque.operationalStatus === 'active' ? 'text-green-400' :
                                bloque.operationalStatus === 'maintenance' ? 'text-orange-400' :
                                    'text-red-400'
                                }`}>
                                {bloque.operationalStatus === 'active' ? 'Activo' :
                                    bloque.operationalStatus === 'maintenance' ? 'Mantención' :
                                        'Restringido'}
                            </span>
                        </div>
                    </>
                )}

                {/* Indicador de fuente de datos */}
                <div className="pt-2 mt-2 border-t border-slate-700">
                    <div className={`text-center text-xs py-1 px-2 rounded ${isCamilaActive ? 'bg-teal-950/30 text-teal-400 border border-teal-800' :
                        isMagdalenaActive ? 'bg-cyan-950/30 text-cyan-400 border border-cyan-800' :
                            'bg-blue-950/30 text-blue-400 border border-blue-800'
                        }`}>
                        {isCamilaActive ? 'Optimización Camila' :
                            isMagdalenaActive ? 'Optimización Magdalena' :
                                'Datos históricos'}
                    </div>
                </div>
            </div>
        </div>
    );
};