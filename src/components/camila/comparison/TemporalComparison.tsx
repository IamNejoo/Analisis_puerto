// components/camila/comparison/TemporalComparison.tsx

import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useCamilaComparacionTemporal } from '../../../hooks/useCamilaData';
import type { CamilaConfig } from '../../../types/camila';
import LoadingState from '../shared/LoadingState';
import ErrorState from '../shared/ErrorState';

interface TemporalComparisonProps {
    config: Omit<CamilaConfig, 'turno'>;
}

export const TemporalComparison: React.FC<TemporalComparisonProps> = ({ config }) => {
    const { data, loading, error } = useCamilaComparacionTemporal(config);

    if (loading) return <LoadingState message="Cargando comparación temporal..." />;
    if (error) return <ErrorState error={error} />;
    if (!data) return null;

    // Preparar datos para gráficos
    const chartData = data.turnos.map(turno => ({
        turno: `T${turno.turno}`,
        movimientos: turno.movimientos_totales,
        utilizacion: turno.utilizacion_promedio,
        gruas: turno.gruas_activas,
        factible: turno.tiene_solucion ? 1 : 0
    }));

    // Estadísticas
    const stats = {
        turnosConSolucion: data.turnos.filter(t => t.tiene_solucion).length,
        turnosSinSolucion: data.turnos.filter(t => !t.tiene_solucion).length,
        movimientosPromedio: data.turnos.reduce((sum, t) => sum + t.movimientos_totales, 0) / data.turnos.length,
        utilizacionPromedio: data.turnos.reduce((sum, t) => sum + t.utilizacion_promedio, 0) / data.turnos.length
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <Calendar className="mr-2" size={20} />
                        Evolución Temporal - Semana {data.semana}
                    </h3>
                    <div className="text-sm text-gray-600">
                        Participación {data.participacion}% • Dispersión {data.con_dispersion ? 'K' : 'N'}
                    </div>
                </div>

                {/* Resumen estadístico */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center text-sm text-green-600 mb-1">
                            <CheckCircle size={16} className="mr-1" />
                            Con Solución
                        </div>
                        <div className="text-2xl font-bold text-green-900">
                            {stats.turnosConSolucion}
                        </div>
                    </div>

                    <div className="bg-red-50 rounded-lg p-3">
                        <div className="flex items-center text-sm text-red-600 mb-1">
                            <XCircle size={16} className="mr-1" />
                            Sin Solución
                        </div>
                        <div className="text-2xl font-bold text-red-900">
                            {stats.turnosSinSolucion}
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-sm text-blue-600 mb-1">Promedio Movimientos</div>
                        <div className="text-2xl font-bold text-blue-900">
                            {Math.round(stats.movimientosPromedio)}
                        </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-3">
                        <div className="text-sm text-purple-600 mb-1">Utilización Media</div>
                        <div className="text-2xl font-bold text-purple-900">
                            {stats.utilizacionPromedio.toFixed(1)}%
                        </div>
                    </div>
                </div>

                {/* Gráfico de movimientos y utilización */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-gray-700 mb-3">Movimientos por Turno</h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="turno" />
                                <YAxis />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="movimientos"
                                    stroke="#3b82f6"
                                    fill="#93c5fd"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div>
                        <h4 className="font-medium text-gray-700 mb-3">Utilización de Grúas</h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="turno" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="utilizacion"
                                    stroke="#14b8a6"
                                    strokeWidth={2}
                                    name="Utilización %"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="gruas"
                                    stroke="#a855f7"
                                    strokeWidth={2}
                                    name="Grúas Activas"
                                    yAxisId="right"
                                />
                                <YAxis yAxisId="right" orientation="right" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Lista de turnos */}
                <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-3">Detalle por Turno</h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Turno</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Movimientos</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Grúas</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Bloques</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Utilización</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.turnos.map((turno) => (
                                    <tr key={turno.turno} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                            Turno {turno.turno}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {turno.tiene_solucion ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircle size={12} className="mr-1" />
                                                    Factible
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    <XCircle size={12} className="mr-1" />
                                                    Sin solución
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                                            {turno.movimientos_totales}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                                            {turno.gruas_activas}/12
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                                            {turno.bloques_atendidos}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right">
                                            <div className="flex items-center justify-end">
                                                <span className={`font-medium ${turno.utilizacion_promedio > 70 ? 'text-green-600' :
                                                    turno.utilizacion_promedio > 50 ? 'text-amber-600' : 'text-red-600'
                                                    }`}>
                                                    {turno.utilizacion_promedio.toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemporalComparison;