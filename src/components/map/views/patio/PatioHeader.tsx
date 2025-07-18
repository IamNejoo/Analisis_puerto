// src/components/map/views/patio/PatioHeader.tsx - CORREGIDO
import React from 'react';
import { Database, RefreshCw, Activity, TrendingUp } from 'lucide-react';
import type { PatioData } from '../../../../types';
import type { CamilaDashboardData } from '../../../../types/camila';
import type { OptimizationMetrics } from '../../../../types/optimization';

interface PatioHeaderProps {
    patio: PatioData;
    isCamilaActive: boolean;
    isMagdalenaActive: boolean;
    timeState: any;
    currentPeriod: number;
    currentTurno: number;
    camilaData?: CamilaDashboardData | null;
    magdalenaMetrics?: OptimizationMetrics | null;
    onRefresh: () => void;
}

export const PatioHeader: React.FC<PatioHeaderProps> = ({
    patio,
    isCamilaActive,
    isMagdalenaActive,
    timeState,
    currentPeriod,
    currentTurno,
    camilaData,
    magdalenaMetrics,
    onRefresh
}) => {
    // Calcular ocupación/utilización actual
    let ocupacionActual = patio.ocupacionTotal;
    let metricaLabel = 'Ocupación Total';

    if (isCamilaActive && camilaData?.resultado) {
        ocupacionActual = camilaData.resultado.utilizacion_modelo;
        metricaLabel = 'Utilización Modelo';
    } else if (isMagdalenaActive && magdalenaMetrics) {
        // Para Magdalena, mostrar la ocupación del turno actual
        const turnoData = magdalenaMetrics.evolucionTemporal?.find(
            t => t.periodo === currentTurno
        );
        ocupacionActual = turnoData?.ocupacionPromedio || magdalenaMetrics.ocupacion?.promedio || 0;
        metricaLabel = `Ocupación Turno ${currentTurno}`;
    }

    return (
        <div className="mb-4 bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-100 flex items-center flex-wrap gap-2">
                        {patio.name}
                        {isCamilaActive && (
                            <span className="px-3 py-1 bg-teal-950/30 text-teal-300 rounded-full text-sm font-medium border border-teal-800 flex items-center">
                                <Activity size={14} className="mr-1" />
                                Camila - Período {currentPeriod}
                            </span>
                        )}
                        {isMagdalenaActive && (
                            <span className="px-3 py-1 bg-cyan-950/30 text-cyan-300 rounded-full text-sm font-medium border border-cyan-800 flex items-center">
                                <TrendingUp size={14} className="mr-1" />
                                Magdalena - Turno {currentTurno}/21
                            </span>
                        )}
                        {timeState?.dataSource === 'historical' && (
                            <span className="px-3 py-1 bg-blue-950/30 text-blue-300 rounded-full text-sm font-medium border border-blue-800 flex items-center">
                                <Database size={14} className="mr-1" />
                                Datos Históricos
                            </span>
                        )}
                    </h2>
                    <p className="text-slate-400 mt-1">
                        {isMagdalenaActive && magdalenaMetrics ?
                            `${magdalenaMetrics.anio} - Semana ${magdalenaMetrics.semana} - Participación ${magdalenaMetrics.participacion}% ${magdalenaMetrics.conDispersion ? 'con' : 'sin'} dispersión` :
                            patio.description
                        }
                    </p>
                </div>
                <div className="text-right ml-4">
                    <div className="text-3xl font-bold text-blue-400">
                        {ocupacionActual.toFixed(1)}%
                    </div>
                    <div className="text-sm text-slate-500">
                        {metricaLabel}
                    </div>
                    {isMagdalenaActive && magdalenaMetrics && (
                        <div className="text-xs text-slate-600 mt-1">
                            Promedio: {magdalenaMetrics.ocupacion?.promedio.toFixed(1)}%
                        </div>
                    )}
                </div>
            </div>

            {/* Información adicional según el modelo activo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-700">
                {isMagdalenaActive && magdalenaMetrics && (
                    <>
                        <div className="text-center">
                            <div className="text-lg font-semibold text-cyan-400">
                                {magdalenaMetrics.movimientos?.optimizados || 0}
                            </div>
                            <div className="text-xs text-slate-500">Movimientos Optimizados</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-semibold text-green-400">
                                {magdalenaMetrics.movimientos?.yardEliminados || 0}
                            </div>
                            <div className="text-xs text-slate-500">YARD Eliminados</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-semibold text-blue-400">
                                {magdalenaMetrics.segregaciones?.optimizadas || 0}
                            </div>
                            <div className="text-xs text-slate-500">Segregaciones</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-semibold text-amber-400">
                                {magdalenaMetrics.eficiencia?.ganancia.toFixed(1) || 0}%
                            </div>
                            <div className="text-xs text-slate-500">Eficiencia Ganada</div>
                        </div>
                    </>
                )}

                {isCamilaActive && camilaData?.resultado && (
                    <>
                        <div className="text-center">
                            <div className="text-lg font-semibold text-teal-400">
                                {camilaData.resultado.total_movimientos_modelo || 0}
                            </div>
                            <div className="text-xs text-slate-500">Movimientos</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-semibold text-purple-400">
                                {camilaData.resultado.total_gruas_utilizadas || 0}
                            </div>
                            <div className="text-xs text-slate-500">Grúas Activas</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-semibold text-blue-400">
                                {camilaData.resultado.total_bloques_visitados || 0}
                            </div>
                            <div className="text-xs text-slate-500">Bloques Visitados</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-semibold text-orange-400">
                                {camilaData.resultado.accuracy_global?.toFixed(1) || 0}%
                            </div>
                            <div className="text-xs text-slate-500">Accuracy</div>
                        </div>
                    </>
                )}
            </div>

            {timeState?.dataSource === 'historical' && (
                <div className="flex justify-end mt-3 pt-3 border-t border-slate-700">
                    <button
                        onClick={onRefresh}
                        className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors flex items-center text-sm"
                    >
                        <RefreshCw size={14} className="mr-1" />
                        Actualizar
                    </button>
                </div>
            )}
        </div>
    );
};