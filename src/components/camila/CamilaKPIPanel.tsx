import React, { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import {
    Activity,
    TrendingUp,
    BarChart3,
    Clock,
    Package,
    Truck,
    AlertCircle,
    CheckCircle,
    Zap,
    Users
} from 'lucide-react';
import type { CamilaResults, CamilaRealComparison } from '../../types';

interface CamilaKPIPanelProps {
    results: CamilaResults;
    comparison?: CamilaRealComparison | null;
    hourRange?: { start: number; end: number };
}

export const CamilaKPIPanel: React.FC<CamilaKPIPanelProps> = ({
    results,
    comparison,
    hourRange = { start: 8, end: 16 }
}) => {
    if (!results) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Cargando datos...</span>
            </div>
        );
    }

    // Datos para visualizaciones
    const hours = Array.from({ length: hourRange.end - hourRange.start }, (_, i) => `${hourRange.start + i}:00`);

    // Datos de bloques con nombres reales
    const blockDistributionData = results.blockParticipation.map((participation, index) => ({
        block: `b${index + 1}`,
        participacion: participation.toFixed(1),
        color: participation > 15 ? '#ef4444' : participation > 10 ? '#f59e0b' : '#10b981'
    }));

    // Datos temporales
    const timeDistributionData = hours.map((hour, index) => ({
        hora: hour,
        participacion: results.timeParticipation[index]?.toFixed(1) || 0,
        cuota: results.recommendedQuotas.reduce((sum, block) => sum + (block[index] || 0), 0)
    }));

    // Calcular métricas agregadas
    const totalMovimientos = results.totalFlows.reduce((sum, block) =>
        sum + block.reduce((s, v) => s + v, 0), 0
    );

    const totalCapacidad = results.capacity.reduce((sum, block) =>
        sum + block.reduce((s, v) => s + v, 0), 0
    );

    const utilizacion = totalCapacidad > 0 ? (totalMovimientos / totalCapacidad) * 100 : 0;

    // Datos de grúas activas (contar asignaciones)
    const gruasActivas = useMemo(() => {
        let count = 0;
        results.grueAssignment.forEach(grua => {
            if (grua.some(slot => slot === 1)) count++;
        });
        return count;
    }, [results.grueAssignment]);

    // Bloques con actividad
    const bloquesActivos = useMemo(() => {
        let count = 0;
        results.totalFlows.forEach(block => {
            if (block.some(mov => mov > 0)) count++;
        });
        return count;
    }, [results.totalFlows]);

    return (
        <div className="space-y-6">
            {/* KPIs principales */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Función Objetivo"
                    value={results.objectiveValue.toFixed(0)}
                    subtitle="Valor óptimo"
                    icon={<Zap size={20} />}
                    color="purple"
                    status="normal"
                />

                <KPICard
                    title="Balance de Carga"
                    value={`${results.workloadBalance.toFixed(1)}%`}
                    subtitle="Uniformidad"
                    icon={<BarChart3 size={20} />}
                    color="blue"
                    status={results.workloadBalance > 80 ? 'good' : results.workloadBalance > 60 ? 'warning' : 'critical'}
                />

                <KPICard
                    title="Índice Congestión"
                    value={results.congestionIndex.toFixed(2)}
                    subtitle="Concentración máx"
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
            </div>

            {/* Métricas secundarias */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Movimientos"
                    value={totalMovimientos.toLocaleString()}
                    icon={<Package size={16} />}
                />
                <MetricCard
                    title="Grúas Activas"
                    value={`${gruasActivas}/12`}
                    icon={<Truck size={16} />}
                />
                <MetricCard
                    title="Bloques Activos"
                    value={`${bloquesActivos}/9`}
                    icon={<Activity size={16} />}
                />
                <MetricCard
                    title="Productividad"
                    value="30 mov/hora"
                    icon={<Clock size={16} />}
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
                    Desviación estándar: {results.stdDevBlocks.toFixed(2)}%
                </div>
            </div>

            {/* Distribución temporal */}
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

            {/* Matriz de asignación de grúas */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Asignación de Grúas por Bloque-Tiempo
                </h3>
                <div className="overflow-auto">
                    <table className="min-w-full text-xs">
                        <thead>
                            <tr>
                                <th className="px-2 py-1 text-left">Grúa</th>
                                {Array.from({ length: 8 }, (_, i) => (
                                    <th key={i} className="px-1 py-1 text-center" colSpan={9}>
                                        T{i + 1}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {results.grueAssignment.slice(0, 12).map((grua, gIdx) => (
                                <tr key={gIdx} className={gIdx % 2 === 0 ? 'bg-gray-50' : ''}>
                                    <td className="px-2 py-1 font-medium">g{gIdx + 1}</td>
                                    {Array.from({ length: 72 }, (_, idx) => {
                                        const bIdx = Math.floor(idx / 8);
                                        const tIdx = idx % 8;
                                        const isAssigned = grua[idx] === 1;

                                        return (
                                            <td
                                                key={idx}
                                                className={`px-1 py-1 text-center border-l ${tIdx === 0 ? 'border-l-2' : ''}`}
                                                title={`b${bIdx + 1} - T${tIdx + 1}`}
                                            >
                                                {isAssigned ? (
                                                    <div className="w-4 h-4 bg-purple-600 rounded-sm mx-auto" />
                                                ) : (
                                                    <div className="w-4 h-4 bg-gray-200 rounded-sm mx-auto" />
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                    <span className="inline-flex items-center mr-4">
                        <div className="w-3 h-3 bg-purple-600 rounded-sm mr-1" />
                        Asignada
                    </span>
                    <span className="inline-flex items-center">
                        <div className="w-3 h-3 bg-gray-200 rounded-sm mr-1" />
                        Disponible
                    </span>
                </div>
            </div>

            {/* Comparación con datos reales si está disponible */}
            {comparison && comparison.improvements && (
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        Mejoras vs Operación Real
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

// Componente para métricas simples
const MetricCard: React.FC<{
    title: string;
    value: string;
    icon: React.ReactNode;
}> = ({ title, value, icon }) => {
    return (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-medium text-gray-600">{title}</h4>
                <div className="text-gray-400">{icon}</div>
            </div>
            <div className="text-lg font-bold text-gray-900">{value}</div>
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