// src/components/optimization/RealComparisonPanel.tsx
import React from 'react';
import { useOptimizationData } from '../../hooks/useOptimizationData';
import { useTimeContext } from '../../contexts/TimeContext';
import {
    ArrowRight,
    TrendingDown,
    CheckCircle,
    BarChart3,
    Target,
    AlertTriangle,
    Navigation,
    Package,
    Activity
} from 'lucide-react';

interface ComparisonItemProps {
    metric: string;
    realValue: string | number;
    optimizedValue: string | number;
    improvement: string;
    improvementType: 'positive' | 'negative' | 'neutral';
    icon: React.ReactNode;
    unit?: string;
}

const ComparisonItem: React.FC<ComparisonItemProps> = ({
    metric,
    realValue,
    optimizedValue,
    improvement,
    improvementType,
    icon,
    unit = ''
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
                <div className="text-center flex-1">
                    <div className="text-lg font-bold text-red-400">
                        {typeof realValue === 'number' ? realValue.toLocaleString() : realValue}{unit}
                    </div>
                    <div className="text-xs text-slate-500">Situación Real</div>
                </div>

                <div className="flex items-center space-x-2 text-slate-600 px-4">
                    <ArrowRight size={16} />
                </div>

                <div className="text-center flex-1">
                    <div className="text-lg font-bold text-green-400">
                        {typeof optimizedValue === 'number' ? optimizedValue.toLocaleString() : optimizedValue}{unit}
                    </div>
                    <div className="text-xs text-slate-500">Optimizado</div>
                </div>
            </div>
        </div>
    );
};

export const RealComparisonPanel: React.FC = () => {
    const { timeState } = useTimeContext();
    const config = {
        anio: timeState.magdalenaConfig?.anio || 2022,
        semana: timeState.magdalenaConfig?.semana || 3,
        participacion: timeState.magdalenaConfig?.participacion || 69,
        conDispersion: true
    };

    const { metrics, isLoading, error } = useOptimizationData(config);

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

    if (error || !metrics) {
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
            metric: 'Eficiencia Operacional',
            realValue: `${metrics.eficiencia.real.toFixed(1)}%`,
            optimizedValue: `${metrics.eficiencia.optimizada.toFixed(1)}%`,
            improvement: `+${metrics.eficiencia.ganancia.toFixed(1)}%`,
            improvementType: 'positive',
            icon: <CheckCircle size={16} />
        },
        {
            metric: 'Reubicaciones (YARD)',
            realValue: metrics.movimientos.yardEliminados,
            optimizedValue: 0,
            improvement: '100% eliminadas',
            improvementType: 'positive',
            icon: <TrendingDown size={16} />
        },
        {
            metric: 'Total Movimientos',
            realValue: metrics.movimientos.totalReal,
            optimizedValue: metrics.movimientos.optimizados,
            improvement: `-${metrics.movimientos.reduccionPorcentaje.toFixed(1)}%`,
            improvementType: 'positive',
            icon: <Target size={16} />
        },
        {
            metric: 'Distancia Total',
            realValue: metrics.distancias.totalReal,
            optimizedValue: metrics.distancias.totalModelo,
            improvement: `-${metrics.distancias.reduccionPorcentaje.toFixed(1)}%`,
            improvementType: 'positive',
            icon: <Navigation size={16} />,
            unit: 'm'
        },
        {
            metric: 'Segregaciones Gestionadas',
            realValue: metrics.segregaciones.total,
            optimizedValue: metrics.segregaciones.optimizadas,
            improvement: `${metrics.segregaciones.porcentaje.toFixed(1)}% activas`,
            improvementType: 'neutral',
            icon: <Package size={16} />
        },
        {
            metric: 'Balance de Carga',
            realValue: 'Desbalanceado',
            optimizedValue: metrics.cargaTrabajo.balance.toFixed(1),
            improvement: metrics.cargaTrabajo.balance < 50 ? 'Balanceado' : 'En proceso',
            improvementType: metrics.cargaTrabajo.balance < 50 ? 'positive' : 'neutral',
            icon: <BarChart3 size={16} />
        }
    ];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-50">Comparación Real vs Optimizado</h2>
                    <p className="text-sm text-slate-300">
                        Impacto del modelo de optimización en la operación
                    </p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-gradient-to-r from-green-900/30 to-cyan-900/30 rounded-lg p-4 border border-green-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                            {metrics.movimientos.yardEliminados.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-300">YARD eliminados</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-400">
                            {metrics.eficiencia.ganancia.toFixed(2)}%
                        </div>
                        <div className="text-sm text-cyan-300">Eficiencia ganada</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">
                            {metrics.distancias.yardEliminada.toLocaleString()}m
                        </div>
                        <div className="text-sm text-purple-300">Distancia ahorrada</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-amber-400">
                            {metrics.segregaciones.optimizadas}
                        </div>
                        <div className="text-sm text-amber-300">Segregaciones activas</div>
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
                <h3 className="font-medium text-slate-50 mb-4 flex items-center">
                    <Activity size={16} className="mr-2 text-blue-400" />
                    Comparación Detallada de Movimientos
                </h3>
                <div className="space-y-4">
                    {/* Tabla comparativa */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left py-2 text-slate-400">Tipo</th>
                                    <th className="text-right py-2 text-slate-400">Real</th>
                                    <th className="text-right py-2 text-slate-400">Optimizado</th>
                                    <th className="text-right py-2 text-slate-400">Diferencia</th>
                                    <th className="text-right py-2 text-slate-400">%</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-700/50">
                                    <td className="py-2 text-slate-300">Entrega (DLVR)</td>
                                    <td className="text-right text-red-400">{metrics.movimientos.porTipo.DLVR.toLocaleString()}</td>
                                    <td className="text-right text-green-400">{metrics.movimientos.optimizadosPorTipo.entrega.toLocaleString()}</td>
                                    <td className="text-right text-slate-300">
                                        {(metrics.movimientos.porTipo.DLVR - metrics.movimientos.optimizadosPorTipo.entrega).toLocaleString()}
                                    </td>
                                    <td className="text-right text-slate-400">
                                        {((metrics.movimientos.porTipo.DLVR - metrics.movimientos.optimizadosPorTipo.entrega) / metrics.movimientos.porTipo.DLVR * 100).toFixed(1)}%
                                    </td>
                                </tr>
                                <tr className="border-b border-slate-700/50">
                                    <td className="py-2 text-slate-300">Recepción (RECV)</td>
                                    <td className="text-right text-red-400">{metrics.movimientos.porTipo.RECV.toLocaleString()}</td>
                                    <td className="text-right text-green-400">{metrics.movimientos.optimizadosPorTipo.recepcion.toLocaleString()}</td>
                                    <td className="text-right text-slate-300">
                                        {(metrics.movimientos.porTipo.RECV - metrics.movimientos.optimizadosPorTipo.recepcion).toLocaleString()}
                                    </td>
                                    <td className="text-right text-slate-400">
                                        {((metrics.movimientos.porTipo.RECV - metrics.movimientos.optimizadosPorTipo.recepcion) / metrics.movimientos.porTipo.RECV * 100).toFixed(1)}%
                                    </td>
                                </tr>
                                <tr className="border-b border-slate-700/50">
                                    <td className="py-2 text-slate-300">Carga (LOAD)</td>
                                    <td className="text-right text-red-400">{metrics.movimientos.porTipo.LOAD.toLocaleString()}</td>
                                    <td className="text-right text-green-400">{metrics.movimientos.optimizadosPorTipo.carga.toLocaleString()}</td>
                                    <td className="text-right text-slate-300">
                                        {(metrics.movimientos.porTipo.LOAD - metrics.movimientos.optimizadosPorTipo.carga).toLocaleString()}
                                    </td>
                                    <td className="text-right text-slate-400">
                                        {((metrics.movimientos.porTipo.LOAD - metrics.movimientos.optimizadosPorTipo.carga) / metrics.movimientos.porTipo.LOAD * 100).toFixed(1)}%
                                    </td>
                                </tr>
                                <tr className="border-b border-slate-700/50">
                                    <td className="py-2 text-slate-300">Descarga (DSCH)</td>
                                    <td className="text-right text-red-400">{metrics.movimientos.porTipo.DSCH.toLocaleString()}</td>
                                    <td className="text-right text-green-400">{metrics.movimientos.optimizadosPorTipo.descarga.toLocaleString()}</td>
                                    <td className="text-right text-slate-300">
                                        {(metrics.movimientos.porTipo.DSCH - metrics.movimientos.optimizadosPorTipo.descarga).toLocaleString()}
                                    </td>
                                    <td className="text-right text-slate-400">
                                        {((metrics.movimientos.porTipo.DSCH - metrics.movimientos.optimizadosPorTipo.descarga) / metrics.movimientos.porTipo.DSCH * 100).toFixed(1)}%
                                    </td>
                                </tr>
                                <tr className="border-b border-slate-700 font-semibold">
                                    <td className="py-2 text-slate-300">Reubicaciones (YARD)</td>
                                    <td className="text-right text-red-400">{metrics.movimientos.porTipo.YARD.toLocaleString()}</td>
                                    <td className="text-right text-green-400">0</td>
                                    <td className="text-right text-green-400">
                                        -{metrics.movimientos.porTipo.YARD.toLocaleString()}
                                    </td>
                                    <td className="text-right text-green-400">-100%</td>
                                </tr>
                                <tr className="font-bold">
                                    <td className="py-2 text-slate-100">TOTAL</td>
                                    <td className="text-right text-red-300">{metrics.movimientos.totalReal.toLocaleString()}</td>
                                    <td className="text-right text-green-300">{metrics.movimientos.optimizados.toLocaleString()}</td>
                                    <td className="text-right text-cyan-300">
                                        -{(metrics.movimientos.totalReal - metrics.movimientos.optimizados).toLocaleString()}
                                    </td>
                                    <td className="text-right text-cyan-300">
                                        -{metrics.movimientos.reduccionPorcentaje.toFixed(1)}%
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RealComparisonPanel;