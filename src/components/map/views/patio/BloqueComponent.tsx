// src/components/map/views/patio/BloqueComponent.tsx
import React from 'react';
import { Truck, Layers, BarChart3 } from 'lucide-react';
import type { BloqueComponentProps } from '../../../../types/patioView.types';

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
        totalMovimientosPeriodo = camilaData.asignaciones.reduce((sum, a) => sum + a.frecuencia, 0);
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

            {/* Indicadores especiales */}
            {isCamilaActive && gruasAsignadas.length > 0 && (
                <div className="absolute top-1 right-1 bg-teal-500 text-white rounded-full px-2 py-1 flex items-center">
                    <Truck size={14} />
                    <span className="text-xs font-bold ml-1">{gruasAsignadas.length}</span>
                </div>
            )}

            {isMagdalenaActive && magdalenaData && (
                <div className="absolute top-1 right-1 bg-cyan-500 text-white rounded-full px-2 py-1 flex items-center">
                    <Layers size={14} />
                    <span className="text-xs font-bold ml-1">{magdalenaData.segregaciones || 0}</span>
                </div>
            )}

            {/* Contenido del bloque */}
            <div className="p-3">
                <div className="space-y-2">
                    {/* Visualización para Camila */}
                    {isCamilaActive && camilaData ? (
                        <>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-slate-300">Movimientos P{currentPeriod}</span>
                                    <span className="text-sm font-bold text-teal-300">{totalMovimientosPeriodo}</span>
                                </div>
                                {totalMovimientosPeriodo > 0 && (
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full transition-all duration-300 bg-teal-500"
                                            style={{ width: `${Math.min(100, (totalMovimientosPeriodo / 30) * 100)}%` }}
                                        ></div>
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

                            <div className="text-xs text-slate-400 space-y-1">
                                <div className="flex justify-between">
                                    <span>Capacidad:</span>
                                    <span className="font-medium text-slate-300">
                                        {bloque.stats?.teusActuales || ocupiedSlots}/{bloque.capacidadTotal} TEUs
                                    </span>
                                </div>

                                {/* Mostrar estadísticas detalladas solo para datos históricos */}
                                {!isMagdalenaActive && !isCamilaActive && bloque.stats && (
                                    <>
                                        <div className="pt-1 border-t border-slate-600">
                                            <div className="grid grid-cols-2 gap-1">
                                                <div className="flex items-center">
                                                    <span className="text-green-400 mr-1">↓</span>
                                                    <span>{bloque.stats.entradas}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="text-blue-400 mr-1">↑</span>
                                                    <span>{bloque.stats.salidas}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {bloque.stats.remanejos > 0 && (
                                            <div className="flex justify-between">
                                                <span>Remanejos:</span>
                                                <span className="font-medium text-orange-400">{bloque.stats.remanejos}</span>
                                            </div>
                                        )}
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
                <div className="mt-2 text-center">
                    {isCamilaActive && (
                        <div className="text-xs text-teal-400 bg-teal-950/30 rounded px-2 py-1 border border-teal-800">
                            Optimización Camila
                        </div>
                    )}
                    {isMagdalenaActive && (
                        <div className="text-xs text-cyan-400 bg-cyan-950/30 rounded px-2 py-1 border border-cyan-800">
                            Optimización Magdalena
                        </div>
                    )}
                    {!isCamilaActive && !isMagdalenaActive && (
                        <div className="text-xs text-blue-400 bg-blue-950/30 rounded px-2 py-1 border border-blue-800">
                            Datos históricos
                        </div>
                    )}
                </div>
            </div>

            {/* Mini gráfico para datos históricos */}
            {!isCamilaActive && !isMagdalenaActive && bloque.stats && (
                <div className="px-3 pb-2">
                    <div className="h-8 flex items-end justify-around space-x-1">
                        <div className="flex flex-col items-center">
                            <div
                                className="w-6 bg-green-500 rounded-t"
                                style={{ height: `${Math.min(28, (bloque.stats.entradas / 50) * 28)}px` }}
                            />
                            <span className="text-xs text-slate-500 mt-1">E</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div
                                className="w-6 bg-blue-500 rounded-t"
                                style={{ height: `${Math.min(28, (bloque.stats.salidas / 50) * 28)}px` }}
                            />
                            <span className="text-xs text-slate-500 mt-1">S</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div
                                className="w-6 bg-orange-500 rounded-t"
                                style={{ height: `${Math.min(28, (bloque.stats.remanejos / 20) * 28)}px` }}
                            />
                            <span className="text-xs text-slate-500 mt-1">R</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};