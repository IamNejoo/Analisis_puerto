// components/camila/operations/TimelineView.tsx - VERSIÓN CORREGIDA

import React, { useMemo } from 'react';
import { Clock, Activity, TrendingUp, Package, Truck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { CamilaDashboardData } from '../../../types/camila';

interface TimelineViewProps {
    data: CamilaDashboardData;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ data }) => {
    // Procesar datos por período
    const timelineData = useMemo(() => {
        const periodos = Array.from({ length: 8 }, (_, i) => i + 1);

        return periodos.map(periodo => {
            // Asignaciones por período
            const asignacionesPeriodo = data.asignaciones?.filter(a => a.periodo === periodo) || [];
            const totalMovimientos = asignacionesPeriodo.reduce((sum, a) => sum + (a.frecuencia || 0), 0);

            // Bloques únicos
            const bloquesUnicos = new Set(asignacionesPeriodo.map(a => a.bloque_codigo));

            // Cuotas por período
            const cuotasPeriodo = data.cuotas_camiones?.filter(c => c.periodo === periodo) || [];
            const totalCuotas = cuotasPeriodo.reduce((sum, c) => sum + (c.cuota_camiones || 0), 0);

            // Grúas activas (aproximación basada en movimientos)
            const gruasActivas = Math.min(12, Math.ceil(totalMovimientos / 30));

            return {
                periodo,
                movimientos: totalMovimientos,
                bloques: bloquesUnicos.size,
                cuotaCamiones: totalCuotas,
                gruasActivas,
                hora: getHourForPeriod(periodo, data.resultado?.turno_del_dia || 1)
            };
        });
    }, [data]);

    // Estadísticas generales
    const stats = useMemo(() => {
        if (!data.resultado) {
            return {
                totalMovimientos: 0,
                promedioMovimientos: 0,
                maxMovimientos: 0,
                periodoPico: 1,
                totalBloques: 0
            };
        }

        const movimientos = timelineData.map(d => d.movimientos);
        const maxMovimientos = Math.max(...movimientos, 0);
        const periodoPico = timelineData.findIndex(d => d.movimientos === maxMovimientos) + 1;

        return {
            totalMovimientos: data.resultado.total_movimientos || 0,
            promedioMovimientos: movimientos.length > 0
                ? movimientos.reduce((a, b) => a + b, 0) / movimientos.length
                : 0,
            maxMovimientos,
            periodoPico,
            totalBloques: data.resultado.total_bloques_visitados || 0
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
                        {isNaN(stats.promedioMovimientos) ? '0' : stats.promedioMovimientos.toFixed(0)}
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
                            name="Movimientos"
                            dot={{ fill: '#14b8a6' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="cuotaCamiones"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            name="Cuota Camiones"
                            dot={{ fill: '#3b82f6' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="gruasActivas"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            name="Grúas Activas"
                            dot={{ fill: '#f59e0b' }}
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
                            <th className="text-right py-2 text-slate-400 font-medium">Movimientos</th>
                            <th className="text-right py-2 text-slate-400 font-medium">Bloques</th>
                            <th className="text-right py-2 text-slate-400 font-medium">Cuota Camiones</th>
                            <th className="text-right py-2 text-slate-400 font-medium">Grúas Activas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {timelineData.map((row) => (
                            <tr key={row.periodo} className="border-b border-slate-700/50">
                                <td className="py-2 text-slate-300">Período {row.periodo}</td>
                                <td className="py-2 text-slate-300">{row.hora}</td>
                                <td className="text-right py-2 text-slate-300">{row.movimientos}</td>
                                <td className="text-right py-2 text-slate-300">{row.bloques}</td>
                                <td className="text-right py-2 text-slate-300">{row.cuotaCamiones}</td>
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
                            <td className="text-right py-2 text-slate-100">
                                {new Set(timelineData.flatMap(d => Array.from({ length: d.bloques }))).size}
                            </td>
                            <td className="text-right py-2 text-slate-100">
                                {timelineData.reduce((sum, d) => sum + d.cuotaCamiones, 0)}
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

    const hour = baseHour + period - 1;
    const displayHour = hour >= 24 ? hour - 24 : hour;
    return `${displayHour < 10 ? '0' : ''}${displayHour}:00`;
}

export default TimelineView;