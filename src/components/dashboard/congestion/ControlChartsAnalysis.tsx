// src/components/dashboard/congestion/ControlChartsAnalysis.tsx
import React from 'react';
import { AlertCircle } from 'lucide-react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ReferenceLine, Cell
} from 'recharts';

interface PercentileData {
    label: string;
    p50: number;
    p70: number;
    p90: number;
    p95: number;
    max: number;
    current: number;
}

interface ControlChartsAnalysisProps {
    currentLevel: 'terminal' | 'patio' | 'bloque';
    currentBloque?: string;
    percentileAnalysis: PercentileData[];
}

export const ControlChartsAnalysis: React.FC<ControlChartsAnalysisProps> = ({
    currentLevel,
    currentBloque,
    percentileAnalysis
}) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {percentileAnalysis.map((metric, index) => (
                    <div key={index} className="bg-slate-700 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-slate-200 mb-3">
                            {metric.label}
                            {currentLevel === 'bloque' && metric.label.includes('cont/h') && (
                                <span className="text-xs font-normal text-slate-400 ml-2">
                                    (valor único por hora en bloque {currentBloque})
                                </span>
                            )}
                        </h3>

                        {/* Gráfico de barras de percentiles */}
                        <div className="h-48 mb-3">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={[
                                        { name: 'P50', value: metric.p50 },
                                        { name: 'P70', value: metric.p70 },
                                        { name: 'P90', value: metric.p90 },
                                        { name: 'P95', value: metric.p95 },
                                        { name: 'Max', value: metric.max }
                                    ]}
                                    margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                    <XAxis dataKey="name" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: '1px solid #475569',
                                            borderRadius: '4px'
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {[
                                            { name: 'P50', value: metric.p50 },
                                            { name: 'P70', value: metric.p70 },
                                            { name: 'P90', value: metric.p90 },
                                            { name: 'P95', value: metric.p95 },
                                            { name: 'Max', value: metric.max }
                                        ].map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    entry.name === 'P50' ? '#10b981' :
                                                        entry.name === 'P70' ? '#3b82f6' :
                                                            entry.name === 'P90' ? '#f59e0b' :
                                                                entry.name === 'P95' ? '#ef4444' :
                                                                    '#dc2626'
                                                }
                                            />
                                        ))}
                                    </Bar>
                                    {/* Línea de referencia para valor actual */}
                                    <ReferenceLine
                                        y={metric.current}
                                        stroke="#06b6d4"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        label={{
                                            value: `Actual: ${metric.current.toFixed(1)}`,
                                            position: 'right',
                                            fill: '#06b6d4'
                                        }}
                                    />
                                    {/* Líneas de control UCL/LCL */}
                                    <ReferenceLine
                                        y={metric.p50 + 3 * ((metric.p90 - metric.p50) / 1.645)}
                                        stroke="#ef4444"
                                        strokeWidth={1}
                                        strokeDasharray="10 5"
                                        label={{
                                            value: 'UCL',
                                            position: 'left',
                                            fill: '#ef4444',
                                            fontSize: 10
                                        }}
                                    />
                                    <ReferenceLine
                                        y={Math.max(0, metric.p50 - 3 * ((metric.p90 - metric.p50) / 1.645))}
                                        stroke="#ef4444"
                                        strokeWidth={1}
                                        strokeDasharray="10 5"
                                        label={{
                                            value: 'LCL',
                                            position: 'left',
                                            fill: '#ef4444',
                                            fontSize: 10
                                        }}
                                    />
                                    {/* Línea especial para 70% en utilización */}
                                    {metric.label === 'Utilización (%)' && (
                                        <ReferenceLine
                                            y={70}
                                            stroke="#f59e0b"
                                            strokeWidth={2}
                                            strokeDasharray="3 3"
                                            label={{
                                                value: 'Umbral San Antonio (70%)',
                                                position: 'top',
                                                fill: '#f59e0b',
                                                fontSize: 10
                                            }}
                                        />
                                    )}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Indicador de estado */}
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Estado actual:</span>
                            <span className={`font-medium ${metric.current <= metric.p50 ? 'text-green-400' :
                                metric.current <= metric.p70 ? 'text-blue-400' :
                                    metric.current <= metric.p90 ? 'text-yellow-400' :
                                        'text-red-400'
                                }`}>
                                {metric.current <= metric.p50 ? 'Óptimo' :
                                    metric.current <= metric.p70 ? 'Normal' :
                                        metric.current <= metric.p90 ? 'Elevado' :
                                            'Crítico'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Alertas basadas en percentiles */}
            <div className="mt-6 space-y-2">
                {percentileAnalysis.some(m => m.current > m.p90) && (
                    <div className="p-3 bg-red-950/30 border border-red-700 rounded-lg">
                        <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-semibold text-red-300">Valores críticos detectados</p>
                                <p className="text-red-200">
                                    {percentileAnalysis
                                        .filter(m => m.current > m.p90)
                                        .map(m => m.label)
                                        .join(', ')} superan el P90. Requiere atención inmediata.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};