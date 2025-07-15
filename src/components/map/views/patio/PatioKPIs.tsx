// src/components/map/views/patio/PatioKPIs.tsx - MODIFICADO PARA CAMILA
import React from 'react';
import { Zap, Truck, Target, Gauge, CheckCircle, AlertTriangle } from 'lucide-react';
import type { CamilaDashboardData } from '../../../../types/camila';
import type { OptimizationMetrics } from '../../../../types/optimization';

interface PatioKPIsProps {
    isCamilaActive: boolean;
    isMagdalenaActive: boolean;
    camilaData?: CamilaDashboardData | null;
    magdalenaMetrics?: OptimizationMetrics | null;
}

export const PatioKPIs: React.FC<PatioKPIsProps> = ({
    isCamilaActive,
    isMagdalenaActive,
    camilaData,
    magdalenaMetrics
}) => {
    if (isCamilaActive && camilaData?.resultado) {
        const gruasActivas = camilaData.metricas_gruas?.filter(g => g.movimientos_modelo > 0).length || 0;

        return (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
                <div className="bg-teal-950/20 rounded-lg p-3 border border-teal-800">
                    <div className="flex items-center text-sm text-teal-400">
                        <Zap size={16} className="mr-1" />
                        Movimientos
                    </div>
                    <div className="text-xl font-bold text-teal-300">
                        {camilaData.resultado.total_movimientos_modelo || 0}
                    </div>
                    <div className="text-xs text-teal-400">
                        Total turno
                    </div>
                </div>

                <div className="bg-purple-950/20 rounded-lg p-3 border border-purple-800">
                    <div className="flex items-center text-sm text-purple-400">
                        <Truck size={16} className="mr-1" />
                        Grúas Activas
                    </div>
                    <div className="text-xl font-bold text-purple-300">
                        {gruasActivas}/12
                    </div>
                    <div className="text-xs text-purple-400">
                        En operación
                    </div>
                </div>

                <div className="bg-blue-950/20 rounded-lg p-3 border border-blue-800">
                    <div className="flex items-center text-sm text-blue-400">
                        <Target size={16} className="mr-1" />
                        Bloques
                    </div>
                    <div className="text-xl font-bold text-blue-300">
                        {camilaData.resultado.total_bloques_visitados || 0}
                    </div>
                    <div className="text-xs text-blue-400">
                        Visitados
                    </div>
                </div>

                <div className="bg-orange-950/20 rounded-lg p-3 border border-orange-800">
                    <div className="flex items-center text-sm text-orange-400">
                        <Gauge size={16} className="mr-1" />
                        CV%
                    </div>
                    <div className="text-xl font-bold text-orange-300">
                        {camilaData.resultado.coeficiente_variacion?.toFixed(1) || '0.0'}%
                    </div>
                    <div className="text-xs text-orange-400">
                        Variación
                    </div>
                </div>

                <div className={`rounded-lg p-3 border ${camilaData.resultado.total_movimientos_modelo > 0
                        ? 'bg-green-950/20 border-green-800'
                        : 'bg-red-950/20 border-red-800'
                    }`}>
                    <div className="flex items-center text-sm">
                        {camilaData.resultado.total_movimientos_modelo > 0 ? (
                            <>
                                <CheckCircle size={16} className="mr-1 text-green-400" />
                                <span className="text-green-400">Estado</span>
                            </>
                        ) : (
                            <>
                                <AlertTriangle size={16} className="mr-1 text-red-400" />
                                <span className="text-red-400">Estado</span>
                            </>
                        )}
                    </div>
                    <div className={`text-sm font-bold ${camilaData.resultado.total_movimientos_modelo > 0 ? 'text-green-300' : 'text-red-300'
                        }`}>
                        {camilaData.resultado.total_movimientos_modelo > 0 ? 'Factible' : 'Sin Solución'}
                    </div>
                    <div className="text-xs opacity-75">
                        {camilaData.resultado.estado || 'Sin estado'}
                    </div>
                </div>
            </div>
        );
    }

    if (isMagdalenaActive && magdalenaMetrics) {
        return (
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-cyan-950/20 rounded-lg p-3 border border-cyan-800">
                    <div className="text-sm text-cyan-400">Segregaciones Activas</div>
                    <div className="text-xl font-bold text-cyan-300">{magdalenaMetrics.segregaciones?.optimizadas || 0}</div>
                </div>
                <div className="bg-blue-950/20 rounded-lg p-3 border border-blue-800">
                    <div className="text-sm text-blue-400">Balance de Carga</div>
                    <div className="text-xl font-bold text-blue-300">{magdalenaMetrics.cargaTrabajo?.balance?.toFixed(1) || '0.0'}</div>
                </div>
                <div className="bg-green-950/20 rounded-lg p-3 border border-green-800">
                    <div className="text-sm text-green-400">Eficiencia Ganada</div>
                    <div className="text-xl font-bold text-green-300">{magdalenaMetrics.eficiencia?.ganancia?.toFixed(1) || '0.0'}%</div>
                </div>
            </div>
        );
    }

    return null;
};