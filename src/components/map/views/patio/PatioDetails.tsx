// src/components/map/views/patio/PatioDetails.tsx - CORREGIDO
import React from 'react';
import { Info, GitCompare, BarChart3 } from 'lucide-react';
import { getCamilaDataForBlock, getMagdalenaDataForBlock } from './patioDataHelpers';
import type { CamilaDashboardData } from '../../../../types/camila';
import type { OptimizationMetrics } from '../../../../types/optimization';

interface PatioDetailsProps {
    selectedBloque: string;
    isCamilaActive: boolean;
    isMagdalenaActive: boolean;
    currentPeriod: number;
    camilaData?: CamilaDashboardData | null;
    magdalenaMetrics?: OptimizationMetrics | null;
}

export const PatioDetails: React.FC<PatioDetailsProps> = ({
    selectedBloque,
    isCamilaActive,
    isMagdalenaActive,
    currentPeriod,
    camilaData,
    magdalenaMetrics
}) => {
    // Para evitar el error de currentTurno no definido
    const currentTurno = Math.ceil(currentPeriod / 8); // Aproximación: 8 períodos por turno

    return (
        <>
            {/* Detalles Camila */}
            {isCamilaActive && camilaData && (
                <div className="mt-4 bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-4">
                    <h3 className="text-lg font-semibold text-slate-100 mb-3 flex items-center">
                        <Info size={20} className="mr-2 text-teal-400" />
                        Detalles del Bloque {selectedBloque}
                    </h3>

                    {(() => {
                        const blockData = getCamilaDataForBlock(selectedBloque, camilaData, currentPeriod);
                        if (!blockData || blockData.asignaciones.length === 0) {
                            return (
                                <div className="text-center py-4 text-slate-400">
                                    <p>No hay asignaciones para este bloque en el período {currentPeriod}</p>
                                </div>
                            );
                        }

                        return (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-slate-700/50 rounded-lg p-3">
                                    <h4 className="text-sm font-medium text-teal-400 mb-2">Movimientos Asignados</h4>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-300">Total</span>
                                            <span className="font-medium text-teal-300">
                                                {blockData.asignaciones.reduce((sum, a) => sum + a.movimientos_asignados, 0)} mov.
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-300">Asignaciones</span>
                                            <span className="font-medium text-teal-300">{blockData.asignaciones.length}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-700/50 rounded-lg p-3">
                                    <h4 className="text-sm font-medium text-purple-400 mb-2">Grúas Asignadas</h4>
                                    {blockData.gruas.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {blockData.gruas.map(grua => (
                                                <div key={grua} className="px-2 py-1 bg-purple-950/50 rounded border border-purple-700">
                                                    <span className="text-sm font-medium text-purple-300">Grúa {grua}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400">Sin grúas asignadas</p>
                                    )}
                                </div>

                                {blockData.cuotas && (
                                    <div className="bg-slate-700/50 rounded-lg p-3">
                                        <h4 className="text-sm font-medium text-blue-400 mb-2">Cuota de Camiones</h4>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-300">Cuota:</span>
                                                <span className="font-medium text-blue-300">{blockData.cuotas.cuota_modelo}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-300">Capacidad:</span>
                                                <span className="font-medium text-slate-300">{blockData.cuotas.capacidad_maxima}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-300">Utilización:</span>
                                                <span className="font-medium text-blue-300">
                                                    {blockData.cuotas.capacidad_maxima > 0
                                                        ? ((blockData.cuotas.cuota_modelo / blockData.cuotas.capacidad_maxima) * 100).toFixed(1)
                                                        : '0.0'}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* Detalles Magdalena */}
            {isMagdalenaActive && magdalenaMetrics && (
                <div className="mt-4 bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-4">
                    <h3 className="text-lg font-semibold text-slate-100 mb-3 flex items-center">
                        <Info size={20} className="mr-2 text-cyan-400" />
                        Detalles del Bloque {selectedBloque}
                    </h3>

                    {(() => {
                        const blockData = getMagdalenaDataForBlock(selectedBloque, magdalenaMetrics);
                        if (!blockData) {
                            return (
                                <div className="text-center py-4 text-slate-400">
                                    <p>No hay datos de optimización para este bloque</p>
                                </div>
                            );
                        }

                        return (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-slate-700/50 rounded-lg p-3">
                                    <h4 className="text-sm font-medium text-cyan-400 mb-2">Ocupación</h4>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-300">Promedio:</span>
                                            <span className="font-medium text-cyan-300">{blockData.ocupacionPromedio.toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-300">Máxima:</span>
                                            <span className="font-medium text-red-300">{blockData.ocupacionMaxima.toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-300">Mínima:</span>
                                            <span className="font-medium text-green-300">{blockData.ocupacionMinima.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-700/50 rounded-lg p-3">
                                    <h4 className="text-sm font-medium text-blue-400 mb-2">Segregaciones</h4>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-300">{blockData.segregaciones}</div>
                                        <div className="text-xs text-slate-400">Segregaciones activas</div>
                                    </div>
                                </div>

                                <div className="bg-slate-700/50 rounded-lg p-3">
                                    <h4 className="text-sm font-medium text-purple-400 mb-2">Variación</h4>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-300">
                                            {(blockData.ocupacionMaxima - blockData.ocupacionMinima).toFixed(1)}%
                                        </div>
                                        <div className="text-xs text-slate-400">Rango de ocupación</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* Comparación entre modelos */}
            {magdalenaMetrics && camilaData && (
                <div className="mt-4 bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-4">
                    <h3 className="text-lg font-semibold text-slate-100 mb-3 flex items-center">
                        <GitCompare size={20} className="mr-2 text-amber-400" />
                        Comparación de Modelos - Bloque {selectedBloque}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-cyan-950/20 rounded-lg p-3 border border-cyan-800">
                            <h4 className="text-sm font-medium text-cyan-400 mb-2">Modelo Magdalena</h4>
                            {(() => {
                                const data = getMagdalenaDataForBlock(selectedBloque, magdalenaMetrics);
                                return data ? (
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-300">Ocupación promedio:</span>
                                            <span className="font-medium text-cyan-300">{data.ocupacionPromedio.toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-300">Segregaciones:</span>
                                            <span className="font-medium text-cyan-300">{data.segregaciones}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-300">Enfoque:</span>
                                            <span className="font-medium text-cyan-300">Espacios</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-slate-400 text-sm">Sin datos disponibles</p>
                                );
                            })()}
                        </div>

                        <div className="bg-teal-950/20 rounded-lg p-3 border border-teal-800">
                            <h4 className="text-sm font-medium text-teal-400 mb-2">Modelo Camila</h4>
                            {(() => {
                                const data = getCamilaDataForBlock(selectedBloque, camilaData, currentPeriod);
                                return data && data.asignaciones.length > 0 ? (
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-300">Movimientos:</span>
                                            <span className="font-medium text-teal-300">
                                                {data.asignaciones.reduce((sum, a) => sum + a.movimientos_asignados, 0)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-300">Grúas asignadas:</span>
                                            <span className="font-medium text-teal-300">{data.gruas.length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-300">Enfoque:</span>
                                            <span className="font-medium text-teal-300">Workload</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-slate-400 text-sm">Sin asignaciones en período actual</p>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Resumen del período/turno */}
            {(isCamilaActive || isMagdalenaActive) && (
                <div className="mt-4 bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-4">
                    <h3 className="text-lg font-semibold text-slate-100 mb-3 flex items-center">
                        <BarChart3 size={20} className="mr-2 text-blue-400" />
                        Resumen del {isCamilaActive ? `Período ${currentPeriod}` : `Turno ${currentTurno}`}
                    </h3>

                    {isCamilaActive && camilaData && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-teal-400">
                                    {camilaData.asignaciones.filter(a => a.periodo === currentPeriod && a.asignada).length}
                                </div>
                                <div className="text-sm text-slate-400">Asignaciones activas</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-400">
                                    {camilaData.asignaciones
                                        .filter(a => a.periodo === currentPeriod && a.asignada)
                                        .reduce((sum, a) => sum + a.movimientos_asignados, 0)}
                                </div>
                                <div className="text-sm text-slate-400">Total movimientos</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-400">
                                    {new Set(camilaData.asignaciones
                                        .filter(a => a.periodo === currentPeriod && a.asignada)
                                        .map(a => a.bloque_codigo)).size}
                                </div>
                                <div className="text-sm text-slate-400">Bloques activos</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-400">
                                    {new Set(camilaData.asignaciones
                                        .filter(a => a.periodo === currentPeriod && a.asignada)
                                        .map(a => a.grua_id)).size}
                                </div>
                                <div className="text-sm text-slate-400">Grúas operando</div>
                            </div>
                        </div>
                    )}

                    {isMagdalenaActive && magdalenaMetrics && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-cyan-400">
                                    {magdalenaMetrics.evolucionTemporal?.[currentTurno - 1]?.ocupacionPromedio.toFixed(1) || '0.0'}%
                                </div>
                                <div className="text-sm text-slate-400">Ocupación promedio</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">
                                    {magdalenaMetrics.evolucionTemporal?.[currentTurno - 1]?.movimientosModelo || 0}
                                </div>
                                <div className="text-sm text-slate-400">Movimientos optimizados</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-400">
                                    0
                                </div>
                                <div className="text-sm text-slate-400">Reubicaciones YARD</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-400">
                                    {magdalenaMetrics.segregaciones?.optimizadas || 0}
                                </div>
                                <div className="text-sm text-slate-400">Segregaciones activas</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="mt-6 p-4 bg-slate-700/50 rounded-lg text-center">
                <p className="text-sm text-slate-400">
                    {isCamilaActive && 'Optimización de asignación de grúas RTG con minimización de movimientos'}
                    {isMagdalenaActive && 'Optimización de espacios con eliminación de reubicaciones YARD'}
                    {!isCamilaActive && !isMagdalenaActive && 'Vista histórica del estado real del patio'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                    Última actualización: {new Date().toLocaleTimeString('es-CL')}
                </p>
            </div>
        </>
    );
};