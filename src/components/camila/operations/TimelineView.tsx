// components/camila/operations/TimelineView.tsx - VERSIÓN CORREGIDA

import React, { useMemo } from 'react';
import { Clock, Activity, TrendingUp, Package, Truck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { CamilaDashboardData } from '../../../types/camila';

interface TimelineViewProps {
    data: CamilaDashboardData;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ data }) => {
    // Usar timeline si viene del backend, sino procesar datos por período
    const timelineData = useMemo(() => {
        // Si el backend envía timeline, usarlo directamente
        if (data.timeline && data.timeline.length > 0) {
            return data.timeline.map(t => ({
                periodo: t.periodo,
                hora: t.hora,
                movimientos: t.movimientos_modelo,
                movimientosReales: t.movimientos_real,
                capacidad: t.capacidad,
                bloques: t.bloques_activos,
                cuotaCamiones: 0, // No viene del backend
                gruasActivas: Math.min(12, Math.ceil(t.movimientos_modelo / 30))
            }));
        }

        // Si no, calcular desde otros datos
        const periodos = Array.from({ length: 8 }, (_, i) => i + 1);

        return periodos.map(periodo => {
            // Filtrar cuotas por periodo
            const cuotasPeriodo = data.cuotas_camiones.filter(c => c.periodo === periodo);
            const totalMovimientos = cuotasPeriodo.reduce((sum, c) => sum + c.cuota_modelo, 0);
            const totalCapacidad = cuotasPeriodo.reduce((sum, c) => sum + c.capacidad_maxima, 0);
            const gruasActivas = cuotasPeriodo.reduce((sum, c) => sum + c.gruas_asignadas, 0);
            const bloquesActivos = new Set(cuotasPeriodo.filter(c => c.cuota_modelo > 0).map(c => c.bloque_codigo)).size;

            return {
                periodo,
                movimientos: totalMovimientos,
                movimientosReales: cuotasPeriodo.reduce((sum, c) => sum + (c.movimientos_reales || 0), 0),
                bloques: bloquesActivos,
                cuotaCamiones: totalMovimientos,
                gruasActivas: gruasActivas,
                capacidad: totalCapacidad,
                hora: getHourForPeriod(periodo, data.resultado.turno_del_dia)
            };
        });
    }, [data]);

    // Estadísticas generales
    const stats = useMemo(() => {
        const movimientos = timelineData.map(d => d.movimientos);
        const maxMovimientos = Math.max(...movimientos, 0);
        const periodoPico = timelineData.findIndex(d => d.movimientos === maxMovimientos) + 1;

        return {
            totalMovimientos: data.resultado.total_movimientos_modelo,
            promedioMovimientos: movimientos.length > 0
                ? movimientos.reduce((a, b) => a + b, 0) / movimientos.length
                : 0,
            maxMovimientos,
            periodoPico,
            totalBloques: data.resultado.total_bloques_visitados
        };
    }, [data, timelineData]);

    return (
        <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
                <Clock className="mr-2 text-purple-400" size={20} />
                Timeline de Operaciones
            </h3>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center text-xs text-slate-400 mb-1">
                        <Activity size={14} className="mr-1" />
                        Total Movimientos
                    </div>
                    <div className="text-xl font-bold text-slate-100">
                        {stats.totalMovimientos}
                    </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center text-xs text-slate-400 mb-1">
                        <TrendingUp size={14} className="mr-1" />
                        Promedio/Período
                    </div>
                    <div className="text-xl font-bold text-green-400">
                        {stats.promedioMovimientos.toFixed(0)}
                    </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center text-xs text-slate-400 mb-1">
                        <Clock size={14} className="mr-1" />
                        Pico en Período
                    </div>
                    <div className="text-xl font-bold text-purple-400">
                        P{stats.periodoPico}
                    </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center text-xs text-slate-400 mb-1">
                        <Package size={14} className="mr-1" />
                        Bloques Visitados
                    </div>
                    <div className="text-xl font-bold text-blue-400">
                        {stats.totalBloques}
                    </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center text-xs text-slate-400 mb-1">
                        <Truck size={14} className="mr-1" />
                        Máx. Movimientos
                    </div>
                    <div className="text-xl font-bold text-red-400">
                        {stats.maxMovimientos}
                    </div>
                </div>
            </div>

            {/* Gráfico temporal */}
            <div className="h-64 w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="hora"
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
                        <Line
                            type="monotone"
                            dataKey="movimientos"
                            stroke="#14b8a6"
                            strokeWidth={2}
                            name="Movimientos Modelo"
                            dot={{ fill: '#14b8a6' }}
                        />
                        {data.comparaciones_real.length > 0 && (
                            <Line
                                type="monotone"
                                dataKey="movimientosReales"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                name="Movimientos Reales"
                                dot={{ fill: '#f59e0b' }}
                            />
                        )}
                        <Line
                            type="monotone"
                            dataKey="gruasActivas"
                            stroke="#a855f7"
                            strokeWidth={2}
                            name="Grúas Activas"
                            dot={{ fill: '#a855f7' }}
                            yAxisId="right"
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

            {/* Tabla detallada */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-700">
                            <th className="text-left py-2 text-slate-400 font-medium">Período</th>
                            <th className="text-left py-2 text-slate-400 font-medium">Hora</th>
                            <th className="text-right py-2 text-slate-400 font-medium">Modelo</th>
                            {data.comparaciones_real.length > 0 && (
                                <th className="text-right py-2 text-slate-400 font-medium">Real</th>
                            )}
                            <th className="text-right py-2 text-slate-400 font-medium">Bloques</th>
                            <th className="text-right py-2 text-slate-400 font-medium">Capacidad</th>
                            <th className="text-right py-2 text-slate-400 font-medium">Grúas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {timelineData.map((row) => (
                            <tr key={row.periodo} className="border-b border-slate-700/50">
                                <td className="py-2 text-slate-300">Período {row.periodo}</td>
                                <td className="py-2 text-slate-300">{row.hora}</td>
                                <td className="text-right py-2 text-slate-300">{row.movimientos}</td>
                                {data.comparaciones_real.length > 0 && (
                                    <td className="text-right py-2 text-slate-300">{row.movimientosReales}</td>
                                )}
                                <td className="text-right py-2 text-slate-300">{row.bloques}</td>
                                <td className="text-right py-2 text-slate-300">{row.capacidad}</td>
                                <td className="text-right py-2 text-slate-300">{row.gruasActivas}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-slate-700 font-medium">
                            <td colSpan={2} className="py-2 text-slate-100">Total</td>
                            <td className="text-right py-2 text-slate-100">
                                {timelineData.reduce((sum, d) => sum + d.movimientos, 0)}
                            </td>
                            {data.comparaciones_real.length > 0 && (
                                <td className="text-right py-2 text-slate-100">
                                    {timelineData.reduce((sum, d) => sum + d.movimientosReales, 0)}
                                </td>
                            )}
                            <td className="text-right py-2 text-slate-100">
                                {data.resultado.total_bloques_visitados}
                            </td>
                            <td className="text-right py-2 text-slate-100">
                                {timelineData.reduce((sum, d) => sum + d.capacidad, 0)}
                            </td>
                            <td className="text-right py-2 text-slate-100">
                                {Math.max(...timelineData.map(d => d.gruasActivas), 0)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

// Función auxiliar para obtener la hora según el período y turno
function getHourForPeriod(period: number, turnoDelDia: number): string {
    let baseHour = 0;
    switch (turnoDelDia) {
        case 1: baseHour = 8; break;   // 08:00-16:00
        case 2: baseHour = 16; break;  // 16:00-24:00
        case 3: baseHour = 0; break;   // 00:00-08:00
    }

    const hour = (baseHour + period - 1) % 24;
    return `${hour < 10 ? '0' : ''}${hour}:00`;
}

export default TimelineView;