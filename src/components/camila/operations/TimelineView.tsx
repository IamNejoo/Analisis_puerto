// components/camila/operations/TimelineView.tsx
import React, { useMemo } from 'react';
import { Clock, Activity, Package, Truck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { CamilaDashboardData } from '../../../types/camila';

interface TimelineViewProps {
    data: CamilaDashboardData;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ data }) => {
    const timelineData = useMemo(() => {
        const periodos = Array.from({ length: 8 }, (_, i) => i + 1);

        return periodos.map(periodo => {
            const cuotasPeriodo = data.cuotas_camiones.filter(c => c.periodo === periodo);
            const totalMovimientos = cuotasPeriodo.reduce((sum, c) => sum + c.cuota_modelo, 0);
            const totalReal = cuotasPeriodo.reduce((sum, c) => sum + (c.movimientos_reales || 0), 0);
            const totalCapacidad = cuotasPeriodo.reduce((sum, c) => sum + c.capacidad_maxima, 0);
            const gruasActivas = cuotasPeriodo.reduce((sum, c) => sum + c.gruas_asignadas, 0);
            const bloquesActivos = new Set(cuotasPeriodo.filter(c => c.cuota_modelo > 0).map(c => c.bloque_codigo)).size;

            // Calcular hora
            const turnoDelDia = data.resultado.turno_del_dia;
            const horaBase = { 1: 8, 2: 16, 3: 0 }[turnoDelDia] || 0;
            const hora = (horaBase + periodo - 1) % 24;

            return {
                periodo,
                hora: `${hora.toString().padStart(2, '0')}:00`,
                movimientos: totalMovimientos,
                real: totalReal,
                capacidad: totalCapacidad,
                gruasActivas,
                bloquesActivos,
                utilizacion: totalCapacidad > 0 ? Math.round((totalMovimientos / totalCapacidad) * 100) : 0
            };
        });
    }, [data]);

    // Estadísticas
    const stats = {
        totalMovimientos: timelineData.reduce((sum, d) => sum + d.movimientos, 0),
        totalReal: timelineData.reduce((sum, d) => sum + d.real, 0),
        promedioMovimientos: Math.round(timelineData.reduce((sum, d) => sum + d.movimientos, 0) / 8),
        periodoPico: timelineData.reduce((max, d) => d.movimientos > max.movimientos ? d : max, timelineData[0]).periodo
    };

    return (
        <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
                <Clock className="mr-2 text-purple-400" size={20} />
                Timeline de Operaciones y Cuotas
            </h3>

            {/* Mini KPIs */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="bg-slate-700/50 rounded p-3">
                    <div className="text-xs text-slate-400">Total</div>
                    <div className="text-lg font-bold text-slate-100">{stats.totalMovimientos}</div>
                </div>
                <div className="bg-slate-700/50 rounded p-3">
                    <div className="text-xs text-slate-400">Promedio/Periodo</div>
                    <div className="text-lg font-bold text-green-400">{stats.promedioMovimientos}</div>
                </div>
                <div className="bg-slate-700/50 rounded p-3">
                    <div className="text-xs text-slate-400">Pico en P{stats.periodoPico}</div>
                    <div className="text-lg font-bold text-purple-400">
                        {timelineData[stats.periodoPico - 1].movimientos}
                    </div>
                </div>
                <div className="bg-slate-700/50 rounded p-3">
                    <div className="text-xs text-slate-400">Real Total</div>
                    <div className="text-lg font-bold text-blue-400">{stats.totalReal || '-'}</div>
                </div>
            </div>

            {/* Gráfico */}
            <div className="h-64 w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
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
                                borderRadius: '8px'
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="movimientos"
                            stroke="#14b8a6"
                            strokeWidth={2}
                            name="Modelo"
                            dot={{ fill: '#14b8a6' }}
                        />
                        {stats.totalReal > 0 && (
                            <Line
                                type="monotone"
                                dataKey="real"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                name="Real"
                                dot={{ fill: '#f59e0b' }}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Tabla integrada con cuotas */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-700">
                            <th className="text-left py-2 text-slate-400">Periodo</th>
                            <th className="text-left py-2 text-slate-400">Hora</th>
                            <th className="text-right py-2 text-slate-400">Cuota</th>
                            <th className="text-right py-2 text-slate-400">Real</th>
                            <th className="text-right py-2 text-slate-400">Capacidad</th>
                            <th className="text-right py-2 text-slate-400">Utilización</th>
                            <th className="text-right py-2 text-slate-400">Grúas</th>
                            <th className="text-right py-2 text-slate-400">Bloques</th>
                        </tr>
                    </thead>
                    <tbody>
                        {timelineData.map((row) => (
                            <tr key={row.periodo} className="border-b border-slate-700/50">
                                <td className="py-2 text-slate-300">P{row.periodo}</td>
                                <td className="py-2 text-slate-300">{row.hora}</td>
                                <td className="text-right py-2 text-slate-300">{row.movimientos}</td>
                                <td className="text-right py-2 text-slate-300">
                                    {row.real > 0 ? row.real : '-'}
                                </td>
                                <td className="text-right py-2 text-slate-300">{row.capacidad}</td>
                                <td className="text-right py-2">
                                    <span className={`font-medium ${row.utilizacion > 80 ? 'text-red-400' :
                                            row.utilizacion > 60 ? 'text-amber-400' :
                                                'text-green-400'
                                        }`}>
                                        {row.utilizacion}%
                                    </span>
                                </td>
                                <td className="text-right py-2 text-slate-300">{row.gruasActivas}</td>
                                <td className="text-right py-2 text-slate-300">{row.bloquesActivos}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-slate-700 font-medium">
                            <td colSpan={2} className="py-2 text-slate-100">Total</td>
                            <td className="text-right py-2 text-slate-100">{stats.totalMovimientos}</td>
                            <td className="text-right py-2 text-slate-100">
                                {stats.totalReal > 0 ? stats.totalReal : '-'}
                            </td>
                            <td className="text-right py-2 text-slate-100">
                                {timelineData.reduce((sum, d) => sum + d.capacidad, 0)}
                            </td>
                            <td className="text-right py-2 text-slate-100">-</td>
                            <td className="text-right py-2 text-slate-100">-</td>
                            <td className="text-right py-2 text-slate-100">-</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default TimelineView;