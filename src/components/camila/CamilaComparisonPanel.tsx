import React from 'react';
import { useCamilaData } from '../../hooks/useCamilaData';
import { useTimeContext } from '../../contexts/TimeContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';

export const CamilaComparisonPanel: React.FC = () => {
    const { timeState } = useTimeContext();
    const { camilaResults, realData, comparison, isLoading } = useCamilaData(
        timeState.camilaConfig ?? null
    );

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