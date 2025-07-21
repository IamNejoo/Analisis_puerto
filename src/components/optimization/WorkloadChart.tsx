// src/components/optimization/WorkloadChart.tsx
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ComposedChart, Area } from 'recharts';
import { useOptimizationData, useOptimizationComparison } from '../../hooks/useOptimizationData';
import { useMagdalenaContext } from '../../contexts/MagdalenaContext';
import {
    Activity,
    BarChart3,
    TrendingUp,
    Target,
    AlertCircle,
    Clock,
    TrendingDown,
    Info
} from 'lucide-react';

interface WorkloadStatsProps {
    totalWorkload: number;
    avgWorkload: number;
    maxWorkload: number;
    minWorkload: number;
    balance: number;
    variation: number;
    isLoading?: boolean;
}

const WorkloadStats: React.FC<WorkloadStatsProps> = ({
    totalWorkload,
    avgWorkload,
    maxWorkload,
    minWorkload,
    balance,
    variation,
    isLoading = false
}) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-slate-800 rounded-lg border border-slate-700 p-3 animate-pulse">
                        <div className="h-4 bg-slate-700 rounded w-16 mb-2"></div>
                        <div className="h-6 bg-slate-700 rounded w-12 mb-1"></div>
                        <div className="h-3 bg-slate-700 rounded w-20"></div>
                    </div>
                ))}
            </div>
        );
    }

    const stats = [
        {
            title: 'Total',
            value: totalWorkload.toLocaleString(),
            subtitle: 'Carga total',
            icon: <Activity size={16} />,
            color: 'cyan'
        },
        {
            title: 'Promedio',
            value: avgWorkload.toFixed(1),
            subtitle: 'Por período',
            icon: <BarChart3 size={16} />,
            color: 'green'
        },
        {
            title: 'Máximo',
            value: maxWorkload.toLocaleString(),
            subtitle: 'Pico de carga',
            icon: <TrendingUp size={16} />,
            color: 'red'
        },
        {
            title: 'Mínimo',
            value: minWorkload.toLocaleString(),
            subtitle: 'Carga mínima',
            icon: <TrendingDown size={16} />,
            color: 'teal'
        },
        {
            title: 'Balance',
            value: balance.toFixed(1),
            subtitle: 'Desv. estándar',
            icon: <Target size={16} />,
            color: balance < 50 ? 'green' : 'amber'
        },
        {
            title: 'Variación',
            value: `${variation.toFixed(1)}%`,
            subtitle: 'Coef. variación',
            icon: <Clock size={16} />,
            color: 'purple'
        }
    ];

    const colorClasses = {
        cyan: 'bg-cyan-950/30 border-cyan-700 text-cyan-400',
        green: 'bg-green-950/30 border-green-700 text-green-400',
        red: 'bg-red-950/30 border-red-700 text-red-400',
        teal: 'bg-teal-950/30 border-teal-700 text-teal-400',
        amber: 'bg-amber-950/30 border-amber-700 text-amber-400',
        purple: 'bg-purple-950/30 border-purple-700 text-purple-400'
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {stats.map((stat, index) => (
                <div key={index} className={`rounded-lg border p-3 ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium">{stat.title}</h4>
                        {stat.icon}
                    </div>
                    <div className="text-lg font-bold">{stat.value}</div>
                    <div className="text-xs opacity-75">{stat.subtitle}</div>
                </div>
            ))}
        </div>
    );
};

export const WorkloadChart: React.FC = () => {
    const { config } = useMagdalenaContext();
    const { metrics, isLoading: metricsLoading, error: metricsError } = useOptimizationData(config);
    const { data: comparisonData, isLoading: comparisonLoading } = useOptimizationComparison(config);

    const isLoading = metricsLoading || comparisonLoading;
    const error = metricsError;

    // Procesar datos para gráficos con datos filtrados
    const chartData = useMemo(() => {
        if (!metrics) return null;

        // Usar evolución temporal con datos filtrados si está disponible
        const temporalEvolution = comparisonData?.evolucion_temporal || metrics.evolucionTemporal;

        // Datos temporales corregidos - mapear correctamente los campos
        const timelineData = temporalEvolution.map((item: any, index: number) => {
            let cargaTrabajo = 0;
            let movimientosReal = 0;

            // Para datos de comparación (endpoint filtrado)
            if (comparisonData && item.real) {
                movimientosReal = item.real.total || 0;
                cargaTrabajo = item.modelo || 0;
            }
            // Si no hay datos del modelo en comparación, usar los del dashboard
            else if (metrics.evolucionTemporal[index]) {
                movimientosReal = item.movimientosReal || item.movimientos_real || 0;
                cargaTrabajo = metrics.evolucionTemporal[index].movimientosModelo || 0;
            }

            return {
                periodo: item.periodo,
                cargaTrabajo: cargaTrabajo,
                movimientosReal: movimientosReal,
                ocupacion: item.ocupacion || item.ocupacionPromedio || item.ocupacion_promedio || 0,
                dia: item.dia,
                turno: item.turno
            };
        });

        // Datos por bloque
        const bloqueData = metrics.ocupacion.porBloque.map(bloque => ({
            bloque: bloque.bloque,
            ocupacionPromedio: bloque.ocupacionPromedio,
            ocupacionMaxima: bloque.ocupacionMaxima,
            ocupacionMinima: bloque.ocupacionMinima,
            rango: bloque.ocupacionMaxima - bloque.ocupacionMinima
        }));

        // Estadísticas corregidas - verificar que no haya valores 0
        const cargas = timelineData.map((d: any) => d.cargaTrabajo).filter((v: number) => v > 0);
        const totalWorkload = cargas.reduce((sum: number, val: number) => sum + val, 0);
        const avgWorkload = cargas.length > 0 ? totalWorkload / cargas.length : 0;
        const maxWorkload = cargas.length > 0 ? Math.max(...cargas) : 0;
        const minWorkload = cargas.length > 0 ? Math.min(...cargas) : 0;
        const balance = metrics.cargaTrabajo.balance || 0;
        const variation = avgWorkload > 0 ? (balance / avgWorkload * 100) : 0;

        console.log('📊 Workload stats:', {
            totalWorkload,
            avgWorkload,
            maxWorkload,
            minWorkload,
            cargas: cargas.slice(0, 5), // Primeros 5 valores para debug
            timelineDataSample: timelineData.slice(0, 3) // Primeros 3 registros
        });

        // Datos agregados por día
        const dailyData = Array.from({ length: 7 }, (_, i) => {
            const dayData = timelineData.filter((d: any) => d.dia === i + 1);
            const totalDay = dayData.reduce((sum: number, d: any) => sum + d.cargaTrabajo, 0);
            return {
                dia: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i],
                cargaTotal: totalDay,
                promedio: dayData.length > 0 ? totalDay / dayData.length : 0
            };
        });

        return {
            timelineData,
            bloqueData,
            dailyData,
            stats: { totalWorkload, avgWorkload, maxWorkload, minWorkload, balance, variation }
        };
    }, [metrics, comparisonData]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="animate-pulse">
                    <div className="h-6 bg-slate-700 rounded w-48 mb-4"></div>
                    <WorkloadStats
                        totalWorkload={0}
                        avgWorkload={0}
                        maxWorkload={0}
                        minWorkload={0}
                        balance={0}
                        variation={0}
                        isLoading={true}
                    />
                    <div className="h-64 bg-slate-700 rounded mt-4"></div>
                </div>
            </div>
        );
    }

    if (error || !chartData || !metrics) {
        return (
            <div className="bg-slate-800 rounded-lg border border-red-700 p-6">
                <div className="flex items-center text-red-400 mb-2">
                    <AlertCircle size={20} className="mr-2" />
                    <h3 className="font-semibold">Error en datos de workload</h3>
                </div>
                <p className="text-sm text-red-400">
                    {error || 'No hay datos de carga de trabajo disponibles'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold text-slate-50">Análisis de Carga de Trabajo</h2>
                <p className="text-sm text-slate-300">
                    Distribución y balance optimizado de workload
                </p>
            </div>

            {/* Alerta de cobertura si está disponible */}
            {comparisonData?.cobertura_optimizacion && (
                <div className="bg-amber-950/30 rounded-lg p-3 border border-amber-700">
                    <div className="flex items-center text-amber-300 text-sm">
                        <Info size={16} className="mr-2 flex-shrink-0" />
                        <span>
                            Análisis basado en {comparisonData.cobertura_optimizacion.segregaciones_optimizadas} segregaciones
                            ({comparisonData.cobertura_optimizacion.porcentaje_cobertura.toFixed(1)}% del sistema)
                        </span>
                    </div>
                </div>
            )}

            {/* Stats */}
            <WorkloadStats {...chartData.stats} />

            {/* Gráfico temporal por período - CORREGIDO */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <h3 className="font-medium text-slate-50 mb-4">
                    Evolución Temporal de Carga
                    {comparisonData && <span className="text-xs text-amber-400 ml-2">(Solo segregaciones optimizadas)</span>}
                </h3>
                <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData.timelineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                                dataKey="periodo"
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                axisLine={{ stroke: '#475569' }}
                                label={{ value: 'Período', position: 'insideBottom', offset: -5, style: { fill: '#94a3b8' } }}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                axisLine={{ stroke: '#475569' }}
                                label={{ value: 'Movimientos', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    color: '#cbd5e1'
                                }}
                                formatter={(value: any) => value.toLocaleString()}
                            />
                            <Legend
                                wrapperStyle={{ color: '#cbd5e1' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="cargaTrabajo"
                                fill="#06b6d4"
                                fillOpacity={0.3}
                                stroke="#06b6d4"
                                strokeWidth={2}
                                name="Movimientos Optimizados"
                            />
                            <Line
                                type="monotone"
                                dataKey="movimientosReal"
                                stroke="#ef4444"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                                name={comparisonData ? "Movimientos Reales (Filtrados)" : "Movimientos Reales"}
                            />
                            <Line
                                type="monotone"
                                dataKey="ocupacion"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={false}
                                name="Ocupación %"
                                yAxisId="right"
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                axisLine={{ stroke: '#475569' }}
                                label={{ value: 'Ocupación %', angle: 90, position: 'insideRight', style: { fill: '#94a3b8' } }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Nota aclaratoria */}
                <div className="mt-3 text-xs text-slate-400">
                    <p>• Carga Optimizada: Movimientos del modelo por período</p>
                    <p>• Movimientos Reales: {comparisonData ? "Solo segregaciones optimizadas" : "Total del sistema"}</p>
                </div>
            </div>

            {/* Gráfico por bloque */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <h3 className="font-medium text-slate-50 mb-4">Ocupación por Bloque</h3>
                <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.bloqueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                                dataKey="bloque"
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                axisLine={{ stroke: '#475569' }}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                axisLine={{ stroke: '#475569' }}
                                label={{ value: 'Ocupación %', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    color: '#cbd5e1'
                                }}
                                formatter={(value: any) => `${value.toFixed(1)}%`}
                            />
                            <Legend
                                wrapperStyle={{ color: '#cbd5e1' }}
                            />
                            <Bar
                                dataKey="ocupacionPromedio"
                                fill="#06b6d4"
                                name="Promedio"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="ocupacionMaxima"
                                fill="#ef4444"
                                name="Máxima"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="ocupacionMinima"
                                fill="#10b981"
                                name="Mínima"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Gráfico agregado por día */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <h3 className="font-medium text-slate-50 mb-4">Carga Total por Día</h3>
                <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.dailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                                dataKey="dia"
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                axisLine={{ stroke: '#475569' }}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                axisLine={{ stroke: '#475569' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    color: '#cbd5e1'
                                }}
                                formatter={(value: any) => value.toLocaleString()}
                            />
                            <Bar
                                dataKey="cargaTotal"
                                fill="#8b5cf6"
                                name="Carga Total"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Panel informativo actualizado */}
            <div className="bg-cyan-950/30 rounded-lg p-4 border border-cyan-700">
                <div className="flex items-start">
                    <Info size={20} className="text-cyan-400 mr-3 mt-0.5" />
                    <div className="text-sm text-cyan-300">
                        <p className="font-semibold mb-1">Interpretación del Análisis</p>
                        <ul className="space-y-1 ml-4 list-disc">
                            <li>La carga optimizada muestra los movimientos del modelo por período</li>
                            <li>Los movimientos reales {comparisonData ? "corresponden solo a las segregaciones optimizadas" : "incluyen todo el sistema"}</li>
                            <li>El balance mide la distribución uniforme de la carga entre períodos</li>
                            <li>Una menor variación indica mejor distribución del trabajo</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkloadChart;