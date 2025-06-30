import React from 'react';
import { useMagdalenaData } from '../../hooks/useMagdalenaData';
import { useTimeContext } from '../../contexts/TimeContext';
import {
    ArrowRight,
    TrendingDown,
    CheckCircle,
    BarChart3,
    Target,
    AlertTriangle
} from 'lucide-react';

interface ComparisonItemProps {
    metric: string;
    realValue: string | number;
    optimizedValue: string | number;
    improvement: string;
    improvementType: 'positive' | 'negative' | 'neutral';
    icon: React.ReactNode;
}

const ComparisonItem: React.FC<ComparisonItemProps> = ({
    metric,
    realValue,
    optimizedValue,
    improvement,
    improvementType,
    icon
}) => {
    const improvementColors = {
        positive: 'text-green-400 bg-green-950/30',
        negative: 'text-red-400 bg-red-950/30',
        neutral: 'text-slate-400 bg-slate-800'
    };

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <div className="text-slate-400">{icon}</div>
                    <h4 className="font-medium text-slate-50">{metric}</h4>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${improvementColors[improvementType]}`}>
                    {improvement}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-center">
                    <div className="text-lg font-bold text-red-400">
                        {typeof realValue === 'number' ? realValue.toLocaleString() : realValue}
                    </div>
                    <div className="text-xs text-slate-500">Situación Real</div>
                </div>

                <div className="flex items-center space-x-2 text-slate-600">
                    <ArrowRight size={16} />
                </div>

                <div className="text-center">
                    <div className="text-lg font-bold text-green-400">
                        {typeof optimizedValue === 'number' ? optimizedValue.toLocaleString() : optimizedValue}
                    </div>
                    <div className="text-xs text-slate-500">Magdalena</div>
                </div>
            </div>
        </div>
    );
};

export const RealComparisonPanel: React.FC = () => {
    const { timeState } = useTimeContext();
    const { magdalenaMetrics, realMetrics, comparison, isLoading, error } = useMagdalenaData(
        timeState.magdalenaConfig?.semana || 3,
        timeState.magdalenaConfig?.participacion || 68,
        timeState.magdalenaConfig?.conDispersion ?? true
    );

    if (isLoading) {
        return (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-700 rounded w-48"></div>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="border border-slate-700 rounded-lg p-4">
                            <div className="h-4 bg-slate-700 rounded w-32 mb-3"></div>
                            <div className="flex justify-between">
                                <div className="h-6 bg-slate-700 rounded w-16"></div>
                                <div className="h-6 bg-slate-700 rounded w-16"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !magdalenaMetrics || !realMetrics) {
        return (
            <div className="bg-slate-800 rounded-lg border border-red-700 p-6">
                <div className="flex items-center text-red-400 mb-2">
                    <AlertTriangle size={20} className="mr-2" />
                    <h3 className="font-semibold">No se pueden mostrar comparaciones</h3>
                </div>
                <p className="text-sm text-red-400">
                    {error || 'Faltan datos para realizar la comparación'}
                </p>
            </div>
        );
    }

    const comparisons: ComparisonItemProps[] = [
        {
            metric: 'Reubicaciones (YARD)',
            realValue: realMetrics.reubicaciones,
            optimizedValue: 0,
            improvement: '100% eliminadas',
            improvementType: 'positive',
            icon: <TrendingDown size={16} />
        },
        {
            metric: 'Eficiencia Operacional',
            realValue: `${(100 - realMetrics.porcentajeReubicaciones).toFixed(1)}%`,
            optimizedValue: '100%',
            improvement: `+${realMetrics.porcentajeReubicaciones.toFixed(1)}%`,
            improvementType: 'positive',
            icon: <CheckCircle size={16} />
        },
    ];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-50">Comparación Real vs Optimizado</h2>
                    <p className="text-sm text-slate-300">
                        Impacto del modelo de Magdalena en la operación
                    </p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-gradient-to-r from-green-900/30 to-cyan-900/30 rounded-lg p-4 border border-green-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                            {magdalenaMetrics.reubicacionesEliminadas.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-300">Movimientos eliminados</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-400">
                            {magdalenaMetrics.eficienciaGanada.toFixed(2)}%
                        </div>
                        <div className="text-sm text-cyan-300">Eficiencia ganada</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-teal-400">
                            {magdalenaMetrics.segregacionesActivas}
                        </div>
                        <div className="text-sm text-teal-300">Segregaciones optimizadas</div>
                    </div>
                </div>
            </div>

            {/* Detailed Comparisons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {comparisons.map((comparison, index) => (
                    <ComparisonItem key={index} {...comparison} />
                ))}
            </div>

            {/* Movement Type Comparison */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <h3 className="font-medium text-slate-50 mb-4">Comparación de Movimientos por Tipo</h3>
                <div className="space-y-3">
                    {/* Real Movements */}
                    <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Datos Reales</h4>
                        <div className="grid grid-cols-5 gap-2 text-xs">
                            <div className="text-center">
                                <div className="font-bold text-red-400">
                                    {realMetrics.movimientosPorTipo.DLVR.toLocaleString()}
                                </div>
                                <div className="text-slate-400">DLVR</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-red-400">
                                    {realMetrics.movimientosPorTipo.DSCH.toLocaleString()}
                                </div>
                                <div className="text-slate-400">DSCH</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-red-400">
                                    {realMetrics.movimientosPorTipo.LOAD.toLocaleString()}
                                </div>
                                <div className="text-slate-400">LOAD</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-red-400">
                                    {realMetrics.movimientosPorTipo.RECV.toLocaleString()}
                                </div>
                                <div className="text-slate-400">RECV</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-red-400">
                                    {realMetrics.reubicaciones.toLocaleString()}
                                </div>
                                <div className="text-slate-400">YARD</div>
                            </div>
                        </div>
                    </div>

                    {/* Optimized Movements */}
                    <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Magdalena Optimizado</h4>
                        <div className="grid grid-cols-5 gap-2 text-xs">
                            <div className="text-center">
                                <div className="font-bold text-green-400">
                                    {magdalenaMetrics.movimientosOptimizadosDetalle.Entrega.toLocaleString()}
                                </div>
                                <div className="text-slate-400">Entrega</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-green-400">
                                    {magdalenaMetrics.movimientosOptimizadosDetalle.Descarga.toLocaleString()}
                                </div>
                                <div className="text-slate-400">Descarga</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-green-400">
                                    {magdalenaMetrics.movimientosOptimizadosDetalle.Carga.toLocaleString()}
                                </div>
                                <div className="text-slate-400">Carga</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-green-400">
                                    {magdalenaMetrics.movimientosOptimizadosDetalle.Recepcion.toLocaleString()}
                                </div>
                                <div className="text-slate-400">Recepción</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-green-400">0</div>
                                <div className="text-slate-400">YARD</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RealComparisonPanel; 