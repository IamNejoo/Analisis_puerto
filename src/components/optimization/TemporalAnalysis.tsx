// src/components/optimization/TemporalAnalysis.tsx
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { optimizationApi } from '../../services/optimizationApi';
import { Calendar, TrendingUp, Package, BarChart3 } from 'lucide-react';

export const TemporalAnalysis: React.FC = () => {
    const [yearlyStats, setYearlyStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const stats = await optimizationApi.getGlobalStats();
                setYearlyStats(stats);
            } catch (error) {
                console.error('Error loading stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadStats();
    }, []);

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-64 bg-slate-700 rounded"></div>
            </div>
        );
    }

    if (!yearlyStats) {
        return <div>No hay datos disponibles</div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-6 border border-purple-700">
                <h2 className="text-xl font-bold text-slate-50 flex items-center mb-4">
                    <Calendar size={24} className="mr-2 text-purple-400" />
                    Análisis Temporal 2017-2023
                </h2>

                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-slate-800 rounded-lg p-3 border border-purple-700">
                        <div className="text-sm text-purple-400">Total Instancias</div>
                        <div className="text-2xl font-bold text-slate-50">
                            {yearlyStats.resumen_global.total_instancias}
                        </div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3 border border-blue-700">
                        <div className="text-sm text-blue-400">Movimientos Procesados</div>
                        <div className="text-2xl font-bold text-slate-50">
                            {(yearlyStats.resumen_global.movimientos_procesados / 1000000).toFixed(1)}M
                        </div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3 border border-green-700">
                        <div className="text-sm text-green-400">YARD Eliminados Total</div>
                        <div className="text-2xl font-bold text-slate-50">
                            {(yearlyStats.resumen_global.yard_eliminados_total / 1000).toFixed(0)}K
                        </div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3 border border-cyan-700">
                        <div className="text-sm text-cyan-400">Eficiencia Promedio</div>
                        <div className="text-2xl font-bold text-slate-50">
                            {yearlyStats.resumen_global.eficiencia_promedio.toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráfico de tendencia anual */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <h3 className="font-medium text-slate-50 mb-4">Evolución Anual de Eficiencia</h3>
                <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={yearlyStats.estadisticas_por_anio}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                                dataKey="anio"
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
                            <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                            <Line
                                type="monotone"
                                dataKey="eficiencia_promedio"
                                stroke="#06b6d4"
                                strokeWidth={2}
                                name="Eficiencia Ganada %"
                                dot={{ fill: '#06b6d4' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="yard_eliminados"
                                stroke="#10b981"
                                strokeWidth={2}
                                name="YARD Eliminados"
                                yAxisId="right"
                                dot={{ fill: '#10b981' }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                axisLine={{ stroke: '#475569' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default TemporalAnalysis;