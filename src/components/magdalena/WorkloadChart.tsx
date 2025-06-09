import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ComposedChart, Area, AreaChart } from 'recharts';
import { useMagdalenaData } from '../../hooks/useMagdalenaData';
import { useTimeContext } from '../../contexts/TimeContext';
import {
    Activity,
    BarChart3,
    TrendingUp,
    Target,
    AlertCircle,
    Clock
} from 'lucide-react';

interface WorkloadStatsProps {
    totalWorkload: number;
    avgWorkload: number;
    maxWorkload: number;
    minWorkload: number;
    balance: number;
    isLoading?: boolean;
}

const WorkloadStats: React.FC<WorkloadStatsProps> = ({
    totalWorkload,
    avgWorkload,
    maxWorkload,
    minWorkload,
    balance,
    isLoading = false
}) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="bg-white rounded-lg border border-gray-200 p-3 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-12 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
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
            color: 'blue'
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
            icon: <Target size={16} />,
            color: 'purple'
        },
        {
            title: 'Balance',
            value: balance.toFixed(1),
            subtitle: 'Desv. estándar',
            icon: <Clock size={16} />,
            color: balance < 50 ? 'green' : 'orange'
        }
    ];

    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200 text-blue-800',
        green: 'bg-green-50 border-green-200 text-green-800',
        red: 'bg-red-50 border-red-200 text-red-800',
        purple: 'bg-purple-50 border-purple-200 text-purple-800',
        orange: 'bg-orange-50 border-orange-200 text-orange-800'
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
    const { timeState } = useTimeContext();
    const { magdalenaMetrics, isLoading, error } = useMagdalenaData(
        timeState.magdalenaConfig?.semana || 3,
        timeState.magdalenaConfig?.participacion || 69,
        timeState.magdalenaConfig?.conDispersion ?? true
    );

    // Procesar datos para gráficos
    const chartData = useMemo(() => {
        if (!magdalenaMetrics?.workloadPorBloque) return null;

        const data = magdalenaMetrics.workloadPorBloque;

        // Datos para gráfico temporal por período
        const workloadPorPeriodo = data.reduce((acc: { [key: number]: number }, item) => {
            acc[item.periodo] = (acc[item.periodo] || 0) + item.cargaTrabajo;
            return acc;
        }, {});

        const timelineData = Object.entries(workloadPorPeriodo)
            .map(([periodo, carga]) => ({
                periodo: parseInt(periodo),
                carga,
                promedio: magdalenaMetrics.cargaTrabajoTotal / magdalenaMetrics.periodos
            }))
            .sort((a, b) => a.periodo - b.periodo);

        // Datos para gráfico por bloque (promedio)
        const workloadPorBloquePromedio = data.reduce((acc: { [key: string]: { total: number; count: number } }, item) => {
            if (!acc[item.bloque]) {
                acc[item.bloque] = { total: 0, count: 0 };
            }
            acc[item.bloque].total += item.cargaTrabajo;
            acc[item.bloque].count += 1;
            return acc;
        }, {});

        const bloqueData = Object.entries(workloadPorBloquePromedio)
            .map(([bloque, data]) => ({
                bloque,
                cargaPromedio: data.total / data.count,
                cargaTotal: data.total
            }))
            .sort((a, b) => a.bloque.localeCompare(b.bloque));

        // Estadísticas
        const cargas = data.map(d => d.cargaTrabajo);
        const totalWorkload = magdalenaMetrics.cargaTrabajoTotal;
        const avgWorkload = totalWorkload / data.length;
        const maxWorkload = Math.max(...cargas);
        const minWorkload = Math.min(...cargas);
        const balance = magdalenaMetrics.balanceWorkload;

        // Datos para heatmap por período y bloque
        const heatmapData = data.map(item => ({
            periodo: item.periodo,
            bloque: item.bloque,
            carga: item.cargaTrabajo
        }));

        return {
            timelineData,
            bloqueData,
            heatmapData,
            stats: { totalWorkload, avgWorkload, maxWorkload, minWorkload, balance }
        };
    }, [magdalenaMetrics]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                    <WorkloadStats
                        totalWorkload={0}
                        avgWorkload={0}
                        maxWorkload={0}
                        minWorkload={0}
                        balance={0}
                        isLoading={true}
                    />
                    <div className="h-64 bg-gray-200 rounded mt-4"></div>
                </div>
            </div>
        );
    }

    if (error || !chartData) {
        return (
            <div className="bg-white rounded-lg border border-red-200 p-6">
                <div className="flex items-center text-red-600 mb-2">
                    <AlertCircle size={20} className="mr-2" />
                    <h3 className="font-semibold">Error en datos de workload</h3>
                </div>
                <p className="text-sm text-red-600">
                    {error || 'No hay datos de carga de trabajo disponibles'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold text-gray-800">Análisis de Carga de Trabajo</h2>
                <p className="text-sm text-gray-600">
                    Distribución y balance de workload optimizado por Magdalena
                </p>
            </div>

            {/* Stats */}
            <WorkloadStats {...chartData.stats} />

            {/* Gráfico temporal */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Carga de Trabajo por Período</h3>
                <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData.timelineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="periodo"
                                tick={{ fontSize: 12 }}
                                axisLine={{ stroke: '#e0e0e0' }}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                axisLine={{ stroke: '#e0e0e0' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                                formatter={(value: any, name: string) => [
                                    typeof value === 'number' ? value.toLocaleString() : value,
                                    name === 'carga' ? 'Carga Total' : 'Promedio'
                                ]}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="carga"
                                fill="#8884d8"
                                fillOpacity={0.3}
                                stroke="#8884d8"
                                strokeWidth={2}
                                name="Carga Total"
                            />
                            <Line
                                type="monotone"
                                dataKey="promedio"
                                stroke="#82ca9d"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                                name="Promedio"
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Gráfico por bloque */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Carga Promedio por Bloque</h3>
                <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.bloqueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="bloque"
                                tick={{ fontSize: 12 }}
                                axisLine={{ stroke: '#e0e0e0' }}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                axisLine={{ stroke: '#e0e0e0' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                                formatter={(value: any, name: string) => [
                                    typeof value === 'number' ? value.toFixed(1) : value,
                                    name === 'cargaPromedio' ? 'Carga Promedio' : 'Carga Total'
                                ]}
                            />
                            <Legend />
                            <Bar
                                dataKey="cargaPromedio"
                                fill="#3B82F6"
                                name="Carga Promedio"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Balance Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Balance Score */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-medium text-gray-800 mb-4">Score de Balance</h3>
                    <div className="text-center">
                        <div className={`text-4xl font-bold mb-2 ${chartData.stats.balance < 30 ? 'text-green-600' :
                                chartData.stats.balance < 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                            {chartData.stats.balance.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600 mb-4">Desviación Estándar</div>

                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${chartData.stats.balance < 30 ? 'bg-green-100 text-green-800' :
                                chartData.stats.balance < 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {chartData.stats.balance < 30 ? '✅ Excelente Balance' :
                                chartData.stats.balance < 50 ? '⚠️ Balance Aceptable' : '❌ Desbalanceado'}
                        </div>
                    </div>
                </div>

                {/* Distribution Analysis */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-medium text-gray-800 mb-4">Análisis de Distribución</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Rango de Carga:</span>
                            <span className="font-medium">
                                {chartData.stats.minWorkload} - {chartData.stats.maxWorkload}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Diferencia Max-Min:</span>
                            <span className="font-medium">
                                {(chartData.stats.maxWorkload - chartData.stats.minWorkload).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Eficiencia:</span>
                            <span className={`font-medium ${chartData.stats.balance < 50 ? 'text-green-600' : 'text-orange-600'
                                }`}>
                                {chartData.stats.balance < 50 ? 'Optimizada' : 'Mejorable'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkloadChart;