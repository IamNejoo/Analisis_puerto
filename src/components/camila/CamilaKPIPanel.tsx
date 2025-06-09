import React, { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import {
    Activity,
    TrendingUp,
    BarChart3,
    Clock,
    Package,
    Truck,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import type { CamilaResults, CamilaRealComparison } from '../../types';

interface CamilaKPIPanelProps {
    results: CamilaResults;
    comparison?: CamilaRealComparison | null;
}

export const CamilaKPIPanel: React.FC<CamilaKPIPanelProps> = ({ results, comparison }) => {
    // Preparar datos para gráficos
    const blockDistributionData = useMemo(() => {
        return results.blockParticipation.map((participation, index) => ({
            block: `C${index + 1}`,
            participacion: participation.toFixed(1),
            color: participation > 15 ? '#ef4444' : participation > 10 ? '#f59e0b' : '#10b981'
        }));
    }, [results.blockParticipation]);

    const timeDistributionData = useMemo(() => {
        return results.timeParticipation.map((participation, index) => ({
            hora: `${index + 8}:00`,
            participacion: participation.toFixed(1),
            cuota: results.recommendedQuotas.reduce((sum, block) => sum + block[index], 0)
        }));
    }, [results.timeParticipation, results.recommendedQuotas]);

    const grueHeatmapData = useMemo(() => {
        // Transformar matriz de grúas para heatmap
        const data: any[] = [];
        const blocks = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'];
        const hours = Array.from({ length: 8 }, (_, i) => `${i + 8}:00`);

        blocks.forEach((block, b) => {
            hours.forEach((hour, t) => {
                let gruasAsignadas = 0;
                // Contar grúas asignadas a este bloque en este período
                for (let g = 0; g < 12; g++) {
                    if (results.grueAssignment[g]?.[b * 8 + t] === 1) {
                        gruasAsignadas++;
                    }
                }

                data.push({
                    bloque: block,
                    hora: hour,
                    gruas: gruasAsignadas,
                    color: gruasAsignadas === 0 ? '#f3f4f6' :
                        gruasAsignadas === 1 ? '#93c5fd' : '#2563eb'
                });
            });
        });

        return data;
    }, [results.grueAssignment]);

    // Calcular totales para cards
    const totalMovimientos = useMemo(() => {
        return results.totalFlows.reduce((sum, block) =>
            sum + block.reduce((s, v) => s + v, 0), 0
        );
    }, [results.totalFlows]);

    const totalCapacidad = useMemo(() => {
        return results.capacity.reduce((sum, block) =>
            sum + block.reduce((s, v) => s + v, 0), 0
        );
    }, [results.capacity]);

    const utilizacion = useMemo(() => {
        return totalCapacidad > 0 ? (totalMovimientos / totalCapacidad) * 100 : 0;
    }, [totalMovimientos, totalCapacidad]);

    return (
        <div className="space-y-6">
            {/* Header con información del modelo */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <Activity className="mr-2 text-purple-600" size={24} />
                            Modelo Camila - Optimización de Carga de Trabajo
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Semana {results.week} • {results.day} • Turno {results.shift} •
                            Modelo {results.modelType === 'minmax' ? 'MinMax (Conservador)' : 'MaxMin (Máxima Utilización)'}
                        </p>
                    </div>
                    {comparison && (
                        <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                                {comparison.improvements.workloadBalance.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-500">Mejora en balance</div>
                        </div>
                    )}
                </div>
            </div>

            {/* KPIs principales en cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Balance de Carga"
                    value={`${results.workloadBalance.toFixed(1)}%`}
                    subtitle="Uniformidad en distribución"
                    icon={<BarChart3 size={20} />}
                    color="blue"
                    status={results.workloadBalance > 80 ? 'good' : results.workloadBalance > 60 ? 'warning' : 'critical'}
                />

                <KPICard
                    title="Índice Congestión"
                    value={results.congestionIndex.toFixed(2)}
                    subtitle="Concentración máxima"
                    icon={<AlertCircle size={20} />}
                    color="orange"
                    status={results.congestionIndex < 1.5 ? 'good' : results.congestionIndex < 2 ? 'warning' : 'critical'}
                />

                <KPICard
                    title="Utilización"
                    value={`${utilizacion.toFixed(1)}%`}
                    subtitle="Capacidad usada"
                    icon={<TrendingUp size={20} />}
                    color="green"
                    status={utilizacion > 70 ? 'good' : utilizacion > 50 ? 'warning' : 'critical'}
                />

                <KPICard
                    title="Total Movimientos"
                    value={totalMovimientos.toLocaleString()}
                    subtitle="En el turno"
                    icon={<Package size={20} />}
                    color="purple"
                    status="normal"
                />
            </div>

            {/* Distribución por bloques */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Distribución de Carga por Bloque
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={blockDistributionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="block" />
                        <YAxis label={{ value: 'Participación (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Bar dataKey="participacion" fill="#8884d8">
                            {blockDistributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <div className="mt-2 text-sm text-gray-600">
                    Desviación estándar: {results.stdDevBlocks.toFixed(2)} movimientos
                </div>
            </div>

            {/* Distribución temporal y cuotas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Gráfico temporal */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        Distribución Temporal y Cuotas
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={timeDistributionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hora" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="participacion"
                                stroke="#8884d8"
                                name="Participación (%)"
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="cuota"
                                stroke="#82ca9d"
                                name="Cuota Recomendada"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Tabla de cuotas recomendadas */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                        <Truck className="mr-2 text-blue-600" size={20} />
                        Cuotas de Camiones Recomendadas
                    </h3>
                    <div className="overflow-auto max-h-80">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                                    {['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'].map(block => (
                                        <th key={block} className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                                            {block}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {Array.from({ length: 8 }, (_, t) => (
                                    <tr key={t} className={t % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {`${t + 8}:00`}
                                        </td>
                                        {results.recommendedQuotas.map((block, b) => (
                                            <td key={b} className="px-3 py-2 whitespace-nowrap text-sm text-center">
                                                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${block[t] > 20 ? 'bg-red-100 text-red-800' :
                                                    block[t] > 10 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                    {block[t]}
                                                </span>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Heatmap de asignación de grúas */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Asignación de Grúas RTG
                </h3>
                <div className="grid grid-cols-9 gap-1">
                    <div></div> {/* Celda vacía para esquina */}
                    {Array.from({ length: 8 }, (_, i) => (
                        <div key={i} className="text-xs text-center font-medium text-gray-600">
                            {`${i + 8}:00`}
                        </div>
                    ))}

                    {['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'].map((block, b) => (
                        <React.Fragment key={block}>
                            <div className="text-xs font-medium text-gray-600 pr-2 text-right">
                                {block}
                            </div>
                            {Array.from({ length: 8 }, (_, t) => {
                                const cellData = grueHeatmapData.find(d =>
                                    d.bloque === block && d.hora === `${t + 8}:00`
                                );
                                return (
                                    <div
                                        key={`${b}-${t}`}
                                        className="aspect-square rounded flex items-center justify-center text-xs font-medium"
                                        style={{ backgroundColor: cellData?.color || '#f3f4f6' }}
                                        title={`${block} - ${t + 8}:00 - ${cellData?.gruas || 0} grúas`}
                                    >
                                        {cellData?.gruas || 0}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
                <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-600">
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
                        <span>Sin grúas</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-300 rounded mr-2"></div>
                        <span>1 grúa</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                        <span>2 grúas</span>
                    </div>
                </div>
            </div>

            {/* Comparación con datos reales si está disponible */}
            {comparison && (
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        Comparación Real vs Optimizado
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <ComparisonCard
                            title="Mejora en Balance"
                            value={`${comparison.improvements.workloadBalance.toFixed(1)}%`}
                            icon={<CheckCircle size={20} />}
                            positive={comparison.improvements.workloadBalance > 0}
                        />
                        <ComparisonCard
                            title="Reducción Congestión"
                            value={`${comparison.improvements.congestionReduction.toFixed(1)}%`}
                            icon={<AlertCircle size={20} />}
                            positive={comparison.improvements.congestionReduction > 0}
                        />
                        <ComparisonCard
                            title="Utilización Recursos"
                            value={`${comparison.improvements.resourceUtilization.toFixed(1)}%`}
                            icon={<TrendingUp size={20} />}
                            positive={comparison.improvements.resourceUtilization > 70}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// Componente auxiliar para KPI cards
const KPICard: React.FC<{
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'orange' | 'purple';
    status: 'good' | 'warning' | 'critical' | 'normal';
}> = ({ title, value, subtitle, icon, color, status }) => {
    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200 text-blue-800',
        green: 'bg-green-50 border-green-200 text-green-800',
        orange: 'bg-orange-50 border-orange-200 text-orange-800',
        purple: 'bg-purple-50 border-purple-200 text-purple-800'
    };

    const statusClasses = {
        good: 'bg-green-100',
        warning: 'bg-yellow-100',
        critical: 'bg-red-100',
        normal: 'bg-gray-100'
    };

    return (
        <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">{title}</h4>
                <div className={`p-2 rounded-full ${statusClasses[status]}`}>
                    {icon}
                </div>
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs opacity-75 mt-1">{subtitle}</div>
        </div>
    );
};

// Componente auxiliar para cards de comparación
const ComparisonCard: React.FC<{
    title: string;
    value: string;
    icon: React.ReactNode;
    positive: boolean;
}> = ({ title, value, icon, positive }) => {
    return (
        <div className={`rounded-lg p-4 ${positive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">{title}</h4>
                <div className={positive ? 'text-green-600' : 'text-red-600'}>
                    {icon}
                </div>
            </div>
            <div className={`text-2xl font-bold ${positive ? 'text-green-700' : 'text-red-700'}`}>
                {value}
            </div>
        </div>
    );
};

export default CamilaKPIPanel;