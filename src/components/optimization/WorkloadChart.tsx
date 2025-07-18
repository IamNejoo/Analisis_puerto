// src/components/optimization/WorkloadChart.tsx
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ComposedChart, Area } from 'recharts';
import { useOptimizationData } from '../../hooks/useOptimizationData';
import { useMagdalenaContext } from '../../contexts/MagdalenaContext';
import {
    Activity,
    BarChart3,
    TrendingUp,
    Target,
    AlertCircle,
    Clock,
    TrendingDown
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
    const { metrics, isLoading, error } = useOptimizationData(config);

    // Procesar datos para gráficos
    const chartData = useMemo(() => {
        if (!metrics) return null;

        // Datos temporales
        const timelineData = metrics.evolucionTemporal.map(item => ({
            periodo: item.periodo,
            cargaTrabajo: item.movimientosModelo,
            movimientosReal: item.movimientosReal,
            ocupacion: item.ocupacionPromedio,
            dia: item.dia,
            turno: item.turno
        }));

        // Datos por bloque
        const bloqueData = metrics.ocupacion.porBloque.map(bloque => ({
            bloque: bloque.bloque,
            ocupacionPromedio: bloque.ocupacionPromedio,
            ocupacionMaxima: bloque.ocupacionMaxima,
            ocupacionMinima: bloque.ocupacionMinima,
            rango: bloque.ocupacionMaxima - bloque.ocupacionMinima
        }));

        // Estadísticas
        const cargas = timelineData.map(d => d.cargaTrabajo);
        const totalWorkload = metrics.cargaTrabajo.total;
        const avgWorkload = cargas.length > 0 ? totalWorkload / cargas.length : 0;
        const maxWorkload = Math.max(...cargas);
        const minWorkload = Math.min(...cargas);
        const balance = metrics.cargaTrabajo.balance;
        const variation = metrics.cargaTrabajo.variacion;

        // Datos agregados por día
        const dailyData = Array.from({ length: 7 }, (_, i) => {
            const dayData = timelineData.filter(d => d.dia === i + 1);
            const totalDay = dayData.reduce((sum, d) => sum + d.cargaTrabajo, 0);
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
    }, [metrics]);

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

            {/* Stats */}
            <WorkloadStats {...chartData.stats} />

            {/* Gráfico temporal por período */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <h3 className="font-medium text-slate-50 mb-4">Evolución Temporal de Carga</h3>
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
                                name="Carga Optimizada"
                            />
                            <Line
                                type="monotone"
                                dataKey="movimientosReal"
                                stroke="#ef4444"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                                name="Movimientos Reales"
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
        </div>
    );
};

export default WorkloadChart;