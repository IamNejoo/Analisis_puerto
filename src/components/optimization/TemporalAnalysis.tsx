// src/components/optimization/TemporalAnalysis.tsx
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useOptimizationData, useOptimizationCharts } from '../../hooks/useOptimizationData';
import { useMagdalenaContext } from '../../contexts/MagdalenaContext';
import { Calendar, TrendingUp, Activity, Clock, AlertCircle } from 'lucide-react';

export const TemporalAnalysis: React.FC = () => {
    const { config } = useMagdalenaContext();
    const { metrics, isLoading: metricsLoading, error: metricsError } = useOptimizationData(config);
    const { data: chartData, isLoading: chartsLoading, error: chartsError } = useOptimizationCharts(config);

    const isLoading = metricsLoading || chartsLoading;
    const error = metricsError || chartsError;

    // Procesar datos para visualización
    const processedData = useMemo(() => {
        if (!metrics && !chartData) return null;

        // Usar datos de evolución temporal del chartData si está disponible
        const temporalData = chartData?.evolucion_temporal || metrics?.evolucionTemporal || [];

        return temporalData.map((item: any) => ({
            periodo: item.periodo,
            dia: item.dia,
            turno: item.turno,
            movimientosReal: item.movimientos_real || item.movimientosReal,
            movimientosModelo: item.movimientos_modelo || item.movimientosModelo,
            yardEliminados: item.yard_eliminados || item.movimientosYard,
            ocupacion: item.ocupacion || item.ocupacionPromedio || 0,
            eficiencia: item.movimientosReal > 0
                ? ((item.movimientosReal - item.movimientosYard) / item.movimientosReal * 100)
                : 100
        }));
    }, [metrics, chartData]);

    // Calcular estadísticas por día
    const dailyStats = useMemo(() => {
        if (!processedData) return [];

        const stats: any[] = [];
        for (let dia = 1; dia <= 7; dia++) {
            const dayData = processedData.filter((d: any) => d.dia === dia);
            if (dayData.length > 0) {
                const totalReal = dayData.reduce((sum: number, d: any) => sum + d.movimientosReal, 0);
                const totalModelo = dayData.reduce((sum: number, d: any) => sum + d.movimientosModelo, 0);
                const totalYard = dayData.reduce((sum: number, d: any) => sum + d.yardEliminados, 0);

                stats.push({
                    dia: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][dia - 1],
                    movimientosReal: totalReal,
                    movimientosModelo: totalModelo,
                    yardEliminados: totalYard,
                    reduccion: totalReal - totalModelo,
                    porcentajeReduccion: totalReal > 0 ? ((totalReal - totalModelo) / totalReal * 100) : 0
                });
            }
        }
        return stats;
    }, [processedData]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="animate-pulse">
                    <div className="h-6 bg-slate-700 rounded w-48 mb-4"></div>
                    <div className="h-64 bg-slate-700 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !processedData || processedData.length === 0) {
        return (
            <div className="bg-slate-800 rounded-lg border border-red-700 p-6">
                <div className="flex items-center text-red-400 mb-2">
                    <AlertCircle size={20} className="mr-2" />
                    <h3 className="font-semibold">Error en análisis temporal</h3>
                </div>
                <p className="text-sm text-red-400">
                    {error || 'No hay datos temporales disponibles'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header con estadísticas */}
            <div>
                <h2 className="text-lg font-semibold text-slate-50 mb-4">Análisis Temporal de Optimización</h2>

                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <Calendar size={20} className="text-cyan-400" />
                            <span className="text-xs text-slate-400">Total</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-50">21</div>
                        <div className="text-sm text-slate-400">Períodos</div>
                    </div>

                    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp size={20} className="text-green-400" />
                            <span className="text-xs text-slate-400">Promedio</span>
                        </div>
                        <div className="text-2xl font-bold text-green-400">
                            {metrics?.eficiencia.ganancia.toFixed(1)}%
                        </div>
                        <div className="text-sm text-slate-400">Eficiencia</div>
                    </div>

                    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <Activity size={20} className="text-purple-400" />
                            <span className="text-xs text-slate-400">Total</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-400">
                            {metrics?.movimientos.yardEliminados.toLocaleString()}
                        </div>
                        <div className="text-sm text-slate-400">YARD eliminados</div>
                    </div>

                    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <Clock size={20} className="text-amber-400" />
                            <span className="text-xs text-slate-400">Períodos</span>
                        </div>
                        <div className="text-2xl font-bold text-amber-400">
                            {processedData.filter((d: any) => d.movimientosModelo > 0).length}
                        </div>
                        <div className="text-sm text-slate-400">Activos</div>
                    </div>
                </div>
            </div>

            {/* Gráfico de evolución por período */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <h3 className="font-medium text-slate-50 mb-4">Evolución por Período (21 turnos)</h3>
                <div style={{ height: '350px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={processedData}>
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
                                labelFormatter={(label) => `Período ${label}`}
                            />
                            <Legend wrapperStyle={{ color: '#cbd5e1' }} />

                            <Area
                                type="monotone"
                                dataKey="movimientosReal"
                                stackId="1"
                                stroke="#ef4444"
                                fill="#ef4444"
                                fillOpacity={0.6}
                                name="Movimientos Reales"
                            />
                            <Area
                                type="monotone"
                                dataKey="yardEliminados"
                                stackId="2"
                                stroke="#f59e0b"
                                fill="#f59e0b"
                                fillOpacity={0.8}
                                name="YARD (Eliminados)"
                            />
                            <Area
                                type="monotone"
                                dataKey="movimientosModelo"
                                stackId="3"
                                stroke="#10b981"
                                fill="#10b981"
                                fillOpacity={0.6}
                                name="Movimientos Optimizados"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Gráfico de eficiencia por período */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <h3 className="font-medium text-slate-50 mb-4">Eficiencia por Período</h3>
                <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                                dataKey="periodo"
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                axisLine={{ stroke: '#475569' }}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                axisLine={{ stroke: '#475569' }}
                                domain={[0, 100]}
                                label={{ value: 'Eficiencia %', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }}
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
                            <Line
                                type="monotone"
                                dataKey="eficiencia"
                                stroke="#06b6d4"
                                strokeWidth={3}
                                dot={{ fill: '#06b6d4', r: 4 }}
                                name="Eficiencia"
                            />
                            <Line
                                type="monotone"
                                dataKey="ocupacion"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                                name="Ocupación"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Resumen por día */}
            {dailyStats.length > 0 && (
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                    <h3 className="font-medium text-slate-50 mb-4">Resumen por Día de la Semana</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left py-2 text-slate-400">Día</th>
                                    <th className="text-right py-2 text-slate-400">Mov. Reales</th>
                                    <th className="text-right py-2 text-slate-400">YARD</th>
                                    <th className="text-right py-2 text-slate-400">Optimizados</th>
                                    <th className="text-right py-2 text-slate-400">Reducción</th>
                                    <th className="text-right py-2 text-slate-400">%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dailyStats.map((day, index) => (
                                    <tr key={index} className="border-b border-slate-700/50">
                                        <td className="py-2 text-slate-300 font-medium">{day.dia}</td>
                                        <td className="text-right text-red-400">{day.movimientosReal.toLocaleString()}</td>
                                        <td className="text-right text-amber-400">{day.yardEliminados.toLocaleString()}</td>
                                        <td className="text-right text-green-400">{day.movimientosModelo.toLocaleString()}</td>
                                        <td className="text-right text-cyan-400">{day.reduccion.toLocaleString()}</td>
                                        <td className="text-right text-cyan-300">{day.porcentajeReduccion.toFixed(1)}%</td>
                                    </tr>
                                ))}
                                <tr className="font-bold">
                                    <td className="py-2 text-slate-100">TOTAL</td>
                                    <td className="text-right text-red-300">
                                        {dailyStats.reduce((sum, d) => sum + d.movimientosReal, 0).toLocaleString()}
                                    </td>
                                    <td className="text-right text-amber-300">
                                        {dailyStats.reduce((sum, d) => sum + d.yardEliminados, 0).toLocaleString()}
                                    </td>
                                    <td className="text-right text-green-300">
                                        {dailyStats.reduce((sum, d) => sum + d.movimientosModelo, 0).toLocaleString()}
                                    </td>
                                    <td className="text-right text-cyan-300">
                                        {dailyStats.reduce((sum, d) => sum + d.reduccion, 0).toLocaleString()}
                                    </td>
                                    <td className="text-right text-cyan-300">
                                        {metrics?.movimientos.reduccionPorcentaje.toFixed(1)}%
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Panel informativo */}
            <div className="bg-cyan-950/30 rounded-lg p-4 border border-cyan-700">
                <div className="flex items-start">
                    <Calendar size={20} className="text-cyan-400 mr-3 mt-0.5" />
                    <div className="text-sm text-cyan-300">
                        <p className="font-semibold mb-1">Análisis Temporal</p>
                        <ul className="space-y-1 ml-4 list-disc">
                            <li>La semana se divide en 21 períodos (7 días × 3 turnos)</li>
                            <li>Cada turno representa 8 horas de operación</li>
                            <li>Los movimientos YARD (reubicaciones) han sido completamente eliminados</li>
                            <li>La eficiencia se calcula como (Movimientos útiles / Total) × 100</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemporalAnalysis;