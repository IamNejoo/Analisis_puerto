// components/camila/analytics/GrueUtilization.tsx - VERSIÓN CORREGIDA

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Truck, Activity, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import type { MetricaGrua } from '../../../types/camila';

interface GrueUtilizationProps {
    metricas: MetricaGrua[];
}

export const GrueUtilization: React.FC<GrueUtilizationProps> = ({ metricas }) => {
    // Validar y limpiar métricas
    const metricasLimpias = useMemo(() => {
        if (!metricas || !Array.isArray(metricas)) return [];

        return metricas.map(m => ({
            grua_id: m.grua_id ?? 0,
            movimientos_modelo: m.movimientos_modelo ?? 0,
            bloques_visitados: m.bloques_visitados ?? 0,
            periodos_activa: m.periodos_activa ?? 0,
            tiempo_productivo_hrs: m.tiempo_productivo_hrs ?? 0,
            tiempo_improductivo_hrs: m.tiempo_improductivo_hrs ?? 0,
            utilizacion_pct: m.utilizacion_pct ?? 0,
            movimientos_reales_estimados: m.movimientos_reales_estimados,
            cambios_bloque: m.cambios_bloque ?? 0
        }));
    }, [metricas]);

    // Calcular estadísticas
    const stats = useMemo(() => {
        if (metricasLimpias.length === 0) {
            return {
                promedioUtilizacion: 0,
                maxUtilizacion: 0,
                minUtilizacion: 0,
                gruasActivas: 0,
                totalMovimientos: 0,
                totalTiempoProductivo: 0,
                totalTiempoImproductivo: 0
            };
        }

        const utilizaciones = metricasLimpias.map(m => m.utilizacion_pct);
        const gruasActivas = metricasLimpias.filter(m => m.movimientos_modelo > 0).length;
        const totalMovimientos = metricasLimpias.reduce((sum, m) => sum + m.movimientos_modelo, 0);
        const totalTiempoProductivo = metricasLimpias.reduce((sum, m) => sum + m.tiempo_productivo_hrs, 0);
        const totalTiempoImproductivo = metricasLimpias.reduce((sum, m) => sum + m.tiempo_improductivo_hrs, 0);

        return {
            promedioUtilizacion: utilizaciones.reduce((a, b) => a + b, 0) / utilizaciones.length,
            maxUtilizacion: Math.max(...utilizaciones),
            minUtilizacion: Math.min(...utilizaciones.filter(u => u > 0)),
            gruasActivas,
            totalMovimientos,
            totalTiempoProductivo,
            totalTiempoImproductivo
        };
    }, [metricasLimpias]);

    // Preparar datos para el gráfico
    const chartData = useMemo(() => {
        return metricasLimpias
            .filter(m => m.movimientos_modelo > 0) // Solo grúas con actividad
            .sort((a, b) => b.utilizacion_pct - a.utilizacion_pct) // Ordenar por utilización
            .map(metrica => ({
                grua: `G${metrica.grua_id}`,
                utilizacion: metrica.utilizacion_pct,
                movimientos: metrica.movimientos_modelo,
                bloques: metrica.bloques_visitados,
                productivo: metrica.tiempo_productivo_hrs,
                improductivo: metrica.tiempo_improductivo_hrs,
                periodos: metrica.periodos_activa
            }));
    }, [metricasLimpias]);

    // Función para obtener color según utilización
    const getColor = (value: number) => {
        if (value >= 80) return '#ef4444'; // Rojo - Sobrecarga
        if (value >= 60) return '#f59e0b'; // Naranja - Alta
        if (value >= 40) return '#10b981'; // Verde - Normal
        return '#64748b'; // Gris - Baja
    };

    // Si no hay datos
    if (metricasLimpias.length === 0) {
        return (
            <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">
                    Utilización de Grúas RTG
                </h3>
                <div className="flex items-center justify-center h-64 text-slate-400">
                    <div className="text-center">
                        <AlertCircle size={48} className="mx-auto mb-2" />
                        <p>No hay datos de utilización disponibles</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
                <Truck className="mr-2 text-teal-400" size={20} />
                Utilización de Grúas RTG
            </h3>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center text-xs text-slate-400 mb-1">
                        <Activity size={14} className="mr-1" />
                        Promedio
                    </div>
                    <div className="text-xl font-bold text-slate-100">
                        {stats.promedioUtilizacion.toFixed(1)}%
                    </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center text-xs text-slate-400 mb-1">
                        <TrendingUp size={14} className="mr-1" />
                        Máxima
                    </div>
                    <div className="text-xl font-bold text-green-400">
                        {stats.maxUtilizacion.toFixed(1)}%
                    </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center text-xs text-slate-400 mb-1">
                        <TrendingUp size={14} className="mr-1 rotate-180" />
                        Mínima
                    </div>
                    <div className="text-xl font-bold text-red-400">
                        {stats.minUtilizacion > 0 ? stats.minUtilizacion.toFixed(1) : '0.0'}%
                    </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center text-xs text-slate-400 mb-1">
                        <Truck size={14} className="mr-1" />
                        Activas
                    </div>
                    <div className="text-xl font-bold text-teal-400">
                        {stats.gruasActivas}/12
                    </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center text-xs text-slate-400 mb-1">
                        <Activity size={14} className="mr-1" />
                        Movimientos
                    </div>
                    <div className="text-xl font-bold text-blue-400">
                        {stats.totalMovimientos}
                    </div>
                </div>
            </div>

            {/* Gráfico de barras */}
            {chartData.length > 0 && (
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                                dataKey="grua"
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                axisLine={{ stroke: '#475569' }}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                axisLine={{ stroke: '#475569' }}
                                domain={[0, 100]}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    color: '#cbd5e1'
                                }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload[0]) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="p-3">
                                                <p className="font-medium text-slate-100">{data.grua}</p>
                                                <p className="text-slate-300">Utilización: {data.utilizacion.toFixed(1)}%</p>
                                                <p className="text-slate-300">Movimientos: {data.movimientos}</p>
                                                <p className="text-slate-300">Bloques: {data.bloques}</p>
                                                <p className="text-slate-300">Períodos activa: {data.periodos}</p>
                                                <p className="text-slate-300">T. Productivo: {data.productivo.toFixed(1)}h</p>
                                                <p className="text-slate-300">T. Improductivo: {data.improductivo.toFixed(1)}h</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="utilizacion" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getColor(entry.utilizacion)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Detalle por grúa */}
            <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-700">
                            <th className="text-left py-2 text-slate-400 font-medium">Grúa</th>
                            <th className="text-right py-2 text-slate-400 font-medium">Movimientos</th>
                            <th className="text-right py-2 text-slate-400 font-medium">Bloques</th>
                            <th className="text-right py-2 text-slate-400 font-medium">Períodos</th>
                            <th className="text-right py-2 text-slate-400 font-medium">T. Productivo</th>
                            <th className="text-right py-2 text-slate-400 font-medium">T. Improductivo</th>
                            <th className="text-right py-2 text-slate-400 font-medium">Utilización</th>
                            <th className="text-center py-2 text-slate-400 font-medium">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {metricasLimpias
                            .sort((a, b) => a.grua_id - b.grua_id)
                            .map((metrica) => {
                                const isActive = metrica.movimientos_modelo > 0;
                                return (
                                    <tr key={metrica.grua_id} className="border-b border-slate-700/50">
                                        <td className="py-2 text-slate-300">Grúa {metrica.grua_id}</td>
                                        <td className="text-right py-2 text-slate-300">
                                            {metrica.movimientos_modelo}
                                            {metrica.movimientos_reales_estimados && (
                                                <span className="text-xs text-slate-500 ml-1">
                                                    ({metrica.movimientos_reales_estimados} real)
                                                </span>
                                            )}
                                        </td>
                                        <td className="text-right py-2 text-slate-300">{metrica.bloques_visitados}</td>
                                        <td className="text-right py-2 text-slate-300">{metrica.periodos_activa}/8</td>
                                        <td className="text-right py-2 text-slate-300">{metrica.tiempo_productivo_hrs.toFixed(1)}h</td>
                                        <td className="text-right py-2 text-slate-300">{metrica.tiempo_improductivo_hrs.toFixed(1)}h</td>
                                        <td className="text-right py-2">
                                            <span
                                                className="font-medium"
                                                style={{ color: getColor(metrica.utilizacion_pct) }}
                                            >
                                                {metrica.utilizacion_pct.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="text-center py-2">
                                            {isActive ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/50 text-green-400">
                                                    Activa
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-400">
                                                    Inactiva
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-slate-700 font-medium">
                            <td className="py-2 text-slate-100">Total</td>
                            <td className="text-right py-2 text-slate-100">{stats.totalMovimientos}</td>
                            <td className="text-right py-2 text-slate-100">-</td>
                            <td className="text-right py-2 text-slate-100">-</td>
                            <td className="text-right py-2 text-slate-100">{stats.totalTiempoProductivo.toFixed(1)}h</td>
                            <td className="text-right py-2 text-slate-100">{stats.totalTiempoImproductivo.toFixed(1)}h</td>
                            <td className="text-right py-2 text-slate-100">{stats.promedioUtilizacion.toFixed(1)}%</td>
                            <td className="text-center py-2 text-slate-100">{stats.gruasActivas} activas</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Leyenda */}
            <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-slate-400">
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded mr-1" style={{ backgroundColor: '#64748b' }}></div>
                    <span>&lt;40% (Baja)</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded mr-1" style={{ backgroundColor: '#10b981' }}></div>
                    <span>40-60% (Normal)</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded mr-1" style={{ backgroundColor: '#f59e0b' }}></div>
                    <span>60-80% (Alta)</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded mr-1" style={{ backgroundColor: '#ef4444' }}></div>
                    <span>&gt;80% (Crítica)</span>
                </div>
            </div>
        </div>
    );
};

export default GrueUtilization;