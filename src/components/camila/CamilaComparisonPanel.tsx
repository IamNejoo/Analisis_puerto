import React from 'react';
import { useCamilaData } from '../../hooks/useCamilaData';
import { useTimeContext } from '../../contexts/TimeContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ArrowRight, TrendingUp, AlertCircle, GitCompare, BarChart3 } from 'lucide-react';

interface CamilaComparisonPanelProps {
    filteredData?: any;
    showModelComparison?: boolean;
}

export const CamilaComparisonPanel: React.FC<CamilaComparisonPanelProps> = ({
    filteredData,
    showModelComparison
}) => {
    const { timeState } = useTimeContext();
    const { camilaResults, realData, comparison, isLoading } = useCamilaData(
        timeState.camilaConfig ?? null
    );

    // Usar comparación de modelos si está disponible
    const modelComparison = showModelComparison && filteredData?.modelComparison;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                <span className="ml-3 text-slate-400">Cargando comparación...</span>
            </div>
        );
    }

    if (!camilaResults || !realData || !comparison) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400">
                <AlertCircle size={24} className="mr-2" />
                <span>No hay datos disponibles para comparar</span>
            </div>
        );
    }

    // Preparar datos para gráfico de comparación
    const comparisonData = camilaResults.blockParticipation.map((_, index) => {
        const block = `C${index + 1}`;
        const realTotal = realData[index].reduce((sum, val) => sum + val, 0);
        const optTotal = camilaResults.totalFlows[index].reduce((sum, val) => sum + val, 0);

        return {
            block,
            real: realTotal,
            optimizado: optTotal,
            diferencia: optTotal - realTotal
        };
    });

    return (
        <div className="space-y-6">
            {/* Header con resumen */}
            <div className="bg-gradient-to-r from-teal-950/30 to-blue-950/30 rounded-lg p-4 border border-teal-700">
                <h2 className="text-lg font-semibold text-slate-100 mb-2">
                    Comparación Modelo Camila vs Operación Real
                </h2>
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <MetricComparison
                        label="Balance de Carga"
                        improvement={comparison.improvements.workloadBalance}
                        unit="%"
                    />
                    <MetricComparison
                        label="Reducción Congestión"
                        improvement={comparison.improvements.congestionReduction}
                        unit="%"
                    />
                    <MetricComparison
                        label="Utilización Recursos"
                        value={comparison.improvements.resourceUtilization}
                        unit="%"
                        noComparison
                    />
                </div>
            </div>

            {/* Nueva sección: Comparación MinMax vs MaxMin */}
            {modelComparison && (
                <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-4">
                    <h3 className="text-lg font-semibold mb-4 text-slate-100 flex items-center">
                        <GitCompare className="mr-2 text-purple-400" size={20} />
                        Comparación de Modelos: MinMax vs MaxMin
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Cards de comparación */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900 rounded p-4">
                                <h4 className="text-sm font-medium text-teal-400 mb-3">Modelo MinMax</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-xs text-slate-400">Función Objetivo:</span>
                                        <span className="text-sm font-medium text-slate-200">
                                            {modelComparison.minmax?.objective?.toFixed(2) || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-slate-400">Balance:</span>
                                        <span className="text-sm font-medium text-slate-200">
                                            {modelComparison.minmax?.balance?.toFixed(1) || 'N/A'}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-slate-400">Congestión:</span>
                                        <span className="text-sm font-medium text-slate-200">
                                            {modelComparison.minmax?.congestion?.toFixed(2) || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded p-4">
                                <h4 className="text-sm font-medium text-purple-400 mb-3">Modelo MaxMin</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-xs text-slate-400">Función Objetivo:</span>
                                        <span className="text-sm font-medium text-slate-200">
                                            {modelComparison.maxmin?.objective?.toFixed(2) || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-slate-400">Balance:</span>
                                        <span className="text-sm font-medium text-slate-200">
                                            {modelComparison.maxmin?.balance?.toFixed(1) || 'N/A'}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-slate-400">Congestión:</span>
                                        <span className="text-sm font-medium text-slate-200">
                                            {modelComparison.maxmin?.congestion?.toFixed(2) || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Gráfico de comparación */}
                        {modelComparison.comparisonData && (
                            <div>
                                <h4 className="text-sm font-medium text-slate-300 mb-2">
                                    Distribución por Bloque
                                </h4>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={modelComparison.comparisonData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                        <XAxis dataKey="block" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                border: '1px solid #334155',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="minmax" fill="#14b8a6" name="MinMax" />
                                        <Bar dataKey="maxmin" fill="#a855f7" name="MaxMin" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* Resumen de diferencias */}
                    <div className="mt-4 bg-slate-900 rounded p-4">
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Análisis Comparativo</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-xs text-slate-400">Diferencia en Balance</p>
                                <p className="text-lg font-bold text-yellow-400">
                                    {Math.abs((modelComparison.minmax?.balance || 0) - (modelComparison.maxmin?.balance || 0)).toFixed(1)}%
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Modelo Recomendado</p>
                                <p className="text-lg font-bold text-teal-400">
                                    {(modelComparison.minmax?.balance || 0) > (modelComparison.maxmin?.balance || 0) ? 'MinMax' : 'MaxMin'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Mejora Potencial</p>
                                <p className="text-lg font-bold text-green-400">
                                    {modelComparison.improvementPotential?.toFixed(1) || 'N/A'}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Gráfico de comparación por bloque */}
            <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-4">
                <h3 className="text-lg font-semibold mb-4 text-slate-100">
                    Distribución de Movimientos: Real vs Optimizado
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="block" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px'
                            }}
                            labelStyle={{ color: '#cbd5e1' }}
                            itemStyle={{ color: '#cbd5e1' }}
                        />
                        <Legend
                            wrapperStyle={{ color: '#cbd5e1' }}
                        />
                        <Bar dataKey="real" fill="#ef4444" name="Real" />
                        <Bar dataKey="optimizado" fill="#14b8a6" name="Optimizado" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Análisis temporal */}
            <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-4">
                <h3 className="text-lg font-semibold mb-4 text-slate-100">
                    Evolución Temporal de la Carga
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis
                            dataKey="hour"
                            stroke="#94a3b8"
                            tickFormatter={(value) => `${value}:00`}
                        />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px'
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="real"
                            stroke="#ef4444"
                            name="Real"
                            strokeWidth={2}
                            data={Array.from({ length: 8 }, (_, i) => ({
                                hour: i + 8,
                                real: realData.reduce((sum, block) => sum + block[i], 0),
                                optimizado: camilaResults.totalFlows.reduce((sum, block) => sum + block[i], 0)
                            }))}
                        />
                        <Line
                            type="monotone"
                            dataKey="optimizado"
                            stroke="#14b8a6"
                            name="Optimizado"
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Matriz de movimientos por hora */}
            <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-4">
                <h3 className="text-lg font-semibold mb-4 text-slate-100">
                    Comparación Temporal (Movimientos por Hora)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <HourlyMatrix
                        title="Operación Real"
                        data={realData}
                        color="red"
                    />
                    <HourlyMatrix
                        title="Modelo Optimizado"
                        data={camilaResults.totalFlows}
                        color="teal"
                    />
                </div>
            </div>

            {/* Análisis de mejoras por bloque */}
            <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-4">
                <h3 className="text-lg font-semibold mb-4 text-slate-100 flex items-center">
                    <BarChart3 className="mr-2 text-blue-400" size={20} />
                    Análisis Detallado de Mejoras
                </h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-600">
                        <thead>
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                                    Bloque
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">
                                    Mov. Reales
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">
                                    Mov. Optimizados
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">
                                    Diferencia
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">
                                    % Cambio
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {comparisonData.map((row, idx) => {
                                const percentChange = row.real > 0
                                    ? ((row.optimizado - row.real) / row.real * 100)
                                    : 0;
                                const isImproved = row.diferencia < 0;

                                return (
                                    <tr key={row.block} className={idx % 2 === 0 ? 'bg-slate-800' : 'bg-slate-900'}>
                                        <td className="px-4 py-3 text-sm font-medium text-slate-200">
                                            {row.block}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-center text-slate-300">
                                            {row.real.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-center text-slate-300">
                                            {row.optimizado.toLocaleString()}
                                        </td>
                                        <td className={`px-4 py-3 text-sm text-center font-medium ${isImproved ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            {row.diferencia > 0 ? '+' : ''}{row.diferencia.toLocaleString()}
                                        </td>
                                        <td className={`px-4 py-3 text-sm text-center font-medium ${isImproved ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${Math.abs(percentChange) < 5
                                                ? 'bg-gray-700 text-gray-300'
                                                : isImproved
                                                    ? 'bg-green-900 text-green-300'
                                                    : 'bg-red-900 text-red-300'
                                                }`}>
                                                {Math.abs(percentChange) < 5
                                                    ? 'Estable'
                                                    : isImproved ? 'Mejorado' : 'Aumentado'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-slate-950">
                            <tr>
                                <td className="px-4 py-3 text-sm font-bold text-slate-200">
                                    TOTAL
                                </td>
                                <td className="px-4 py-3 text-sm text-center font-bold text-slate-200">
                                    {comparisonData.reduce((sum, row) => sum + row.real, 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-center font-bold text-slate-200">
                                    {comparisonData.reduce((sum, row) => sum + row.optimizado, 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-center font-bold text-teal-400">
                                    {comparisonData.reduce((sum, row) => sum + row.diferencia, 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-center font-bold text-teal-400">
                                    {(
                                        (comparisonData.reduce((sum, row) => sum + row.optimizado, 0) -
                                            comparisonData.reduce((sum, row) => sum + row.real, 0)) /
                                        comparisonData.reduce((sum, row) => sum + row.real, 0) * 100
                                    ).toFixed(1)}%
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-teal-900 text-teal-300">
                                        Optimizado
                                    </span>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Recomendaciones */}
            <div className="bg-blue-950/30 rounded-lg p-4 border border-blue-700">
                <h3 className="text-lg font-semibold text-blue-300 mb-2">
                    💡 Recomendaciones Operativas
                </h3>
                <ul className="space-y-2 text-sm text-blue-200">
                    <li>• Redistribuir {Math.round(comparison.improvements.workloadBalance)}% de la carga desde bloques congestionados</li>
                    <li>• Implementar cuotas dinámicas según las recomendaciones del modelo</li>
                    <li>• Priorizar asignación de grúas en períodos de alta demanda</li>
                    <li>• Monitorear cumplimiento de cuotas por transportista</li>
                    {modelComparison && (
                        <li>• Considerar implementación del modelo {
                            (modelComparison.minmax?.balance || 0) > (modelComparison.maxmin?.balance || 0)
                                ? 'MinMax para mayor estabilidad'
                                : 'MaxMin para máxima utilización'
                        }</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

// Componente auxiliar para métricas
const MetricComparison: React.FC<{
    label: string;
    improvement?: number;
    value?: number;
    unit: string;
    noComparison?: boolean;
}> = ({ label, improvement, value, unit, noComparison }) => {
    const displayValue = improvement !== undefined ? improvement : value;
    const isPositive = displayValue !== undefined && displayValue > 0;

    return (
        <div className="text-center">
            <div className="text-sm text-slate-400">{label}</div>
            <div className={`text-2xl font-bold mt-1 ${noComparison ? 'text-teal-400' :
                isPositive ? 'text-green-400' : 'text-red-400'
                }`}>
                {!noComparison && displayValue !== undefined && displayValue > 0 && '+'}
                {displayValue?.toFixed(1)}{unit}
            </div>
            {!noComparison && (
                <div className="flex items-center justify-center mt-1">
                    <TrendingUp size={16} className={isPositive ? 'text-green-400' : 'text-red-400'} />
                </div>
            )}
        </div>
    );
};

// Componente para matriz horaria
const HourlyMatrix: React.FC<{
    title: string;
    data: number[][];
    color: 'red' | 'teal';
}> = ({ title, data, color }) => {
    const maxValue = Math.max(...data.flat());
    const colorScale = color === 'red'
        ? ['#450a0a', '#7f1d1d', '#991b1b', '#dc2626', '#ef4444']
        : ['#042f2e', '#134e4a', '#0f766e', '#0d9488', '#14b8a6'];

    return (
        <div>
            <h4 className="font-medium text-slate-300 mb-2">{title}</h4>
            <div className="grid grid-cols-9 gap-1 text-xs">
                <div></div>
                {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="text-center font-medium text-slate-400">{i + 8}h</div>
                ))}

                {['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'].map((block, b) => (
                    <React.Fragment key={block}>
                        <div className="font-medium text-right pr-1 text-slate-400">{block}</div>
                        {Array.from({ length: 8 }, (_, t) => {
                            const value = data[b]?.[t] || 0;
                            const intensity = maxValue > 0 ? Math.floor((value / maxValue) * 4) : 0;
                            return (
                                <div
                                    key={`${b}-${t}`}
                                    className="aspect-square rounded flex items-center justify-center text-slate-100"
                                    style={{ backgroundColor: value > 0 ? colorScale[intensity] : '#334155' }}
                                    title={`${block} - ${t + 8}:00 - ${value} movimientos`}
                                >
                                    {value > 0 && value}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default CamilaComparisonPanel;