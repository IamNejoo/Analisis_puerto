// components/camila/comparison/RealDataComparison.tsx

import React, { useMemo } from 'react';
import { GitCompare, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { CamilaDashboardData } from '../../../types/camila';

interface RealDataComparisonProps {
    comparaciones: CamilaDashboardData['comparaciones_real'];
}

export const RealDataComparison: React.FC<RealDataComparisonProps> = ({ comparaciones }) => {
    // Procesar comparaciones generales
    const comparacionGeneral = useMemo(() => {
        return comparaciones
            .filter(c => c.tipo_comparacion === 'general')
            .find(c => c.metrica === 'movimientos_totales');
    }, [comparaciones]);

    // Procesar comparaciones por periodo
    const comparacionesPorPeriodo = useMemo(() => {
        return comparaciones
            .filter(c => c.tipo_comparacion === 'por_periodo')
            .sort((a, b) => parseInt(a.dimension || '0') - parseInt(b.dimension || '0'))
            .map(c => ({
                periodo: `P${c.dimension}`,
                modelo: c.valor_modelo,
                real: c.valor_real,
                accuracy: c.accuracy
            }));
    }, [comparaciones]);

    // Procesar comparaciones por bloque
    const comparacionesPorBloque = useMemo(() => {
        return comparaciones
            .filter(c => c.tipo_comparacion === 'por_bloque')
            .sort((a, b) => (a.dimension || '').localeCompare(b.dimension || ''))
            .map(c => ({
                bloque: c.dimension || '',
                modelo: c.valor_modelo,
                real: c.valor_real,
                accuracy: c.accuracy
            }));
    }, [comparaciones]);

    // Continuación de RealDataComparison.tsx

    if (!comparacionGeneral && comparacionesPorPeriodo.length === 0) {
        return (
            <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
                    <GitCompare className="mr-2 text-blue-400" size={20} />
                    Comparación con Datos Reales
                </h3>
                <div className="text-center py-8 text-slate-400">
                    No hay datos reales disponibles para comparar
                </div>
            </div>
        );
    }

    const getAccuracyColor = (accuracy: number) => {
        if (accuracy >= 80) return '#10b981'; // Verde
        if (accuracy >= 60) return '#f59e0b'; // Naranja
        return '#ef4444'; // Rojo
    };

    return (
        <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
                <GitCompare className="mr-2 text-blue-400" size={20} />
                Comparación con Datos Reales
            </h3>

            {/* Métricas generales */}
            {comparacionGeneral && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="text-sm text-slate-400 mb-1">Movimientos Modelo</div>
                        <div className="text-2xl font-bold text-slate-100">
                            {comparacionGeneral.valor_modelo.toFixed(0)}
                        </div>
                    </div>

                    <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="text-sm text-slate-400 mb-1">Movimientos Reales</div>
                        <div className="text-2xl font-bold text-slate-100">
                            {comparacionGeneral.valor_real.toFixed(0)}
                        </div>
                    </div>

                    <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="text-sm text-slate-400 mb-1">Diferencia</div>
                        <div className="text-2xl font-bold flex items-center">
                            {comparacionGeneral.diferencia_absoluta >= 0 ? (
                                <TrendingUp className="mr-1 text-red-400" size={20} />
                            ) : (
                                <TrendingDown className="mr-1 text-green-400" size={20} />
                            )}
                            <span className={comparacionGeneral.diferencia_absoluta >= 0 ? 'text-red-400' : 'text-green-400'}>
                                {Math.abs(comparacionGeneral.diferencia_absoluta).toFixed(0)}
                            </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                            ({comparacionGeneral.diferencia_porcentual.toFixed(1)}%)
                        </div>
                    </div>

                    <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="text-sm text-slate-400 mb-1">Accuracy</div>
                        <div
                            className="text-2xl font-bold"
                            style={{ color: getAccuracyColor(comparacionGeneral.accuracy) }}
                        >
                            {comparacionGeneral.accuracy.toFixed(1)}%
                        </div>
                    </div>
                </div>
            )}

            {/* Comparación por periodo */}
            {comparacionesPorPeriodo.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-300 mb-3">Comparación por Periodo</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comparacionesPorPeriodo}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    dataKey="periodo"
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
                                />
                                <Legend />
                                <Bar dataKey="modelo" fill="#3b82f6" name="Modelo" />
                                <Bar dataKey="real" fill="#14b8a6" name="Real" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Comparación por bloque */}
            {comparacionesPorBloque.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-3">Accuracy por Bloque</h4>
                    <div className="grid grid-cols-3 gap-2">
                        {comparacionesPorBloque.map(bloque => (
                            <div key={bloque.bloque} className="bg-slate-700/50 rounded p-3">
                                <div className="text-xs text-slate-400 mb-1">{bloque.bloque}</div>
                                <div
                                    className="text-lg font-bold"
                                    style={{ color: getAccuracyColor(bloque.accuracy) }}
                                >
                                    {bloque.accuracy.toFixed(1)}%
                                </div>
                                <div className="text-xs text-slate-500">
                                    {bloque.modelo} vs {bloque.real}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Alertas */}
            {comparacionGeneral && comparacionGeneral.accuracy < 60 && (
                <div className="mt-4 bg-red-950/30 border border-red-700 rounded-lg p-3">
                    <div className="flex items-start">
                        <AlertCircle className="text-red-400 mt-0.5 mr-2" size={16} />
                        <div className="text-sm text-red-300">
                            La accuracy del modelo es baja ({comparacionGeneral.accuracy.toFixed(1)}%).
                            Considere revisar los parámetros del modelo o investigar las discrepancias.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RealDataComparison;