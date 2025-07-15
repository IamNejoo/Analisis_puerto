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
    const { data, loading, error } = useCamilaComparacionTemporal(config, true);

    if (loading) return <LoadingState message="Cargando comparación temporal..." />;
    if (error) return <ErrorState error={error} />;
    if (!data) return null;

    // Preparar datos para gráficos
    const chartData = data.serie_temporal.map(turno => ({
        turno: `T${turno.turno}`,
        movimientos: turno.movimientos_modelo,
        movimientosReal: turno.movimientos_real,
        utilizacion: turno.utilizacion_modelo,
        utilizacionReal: turno.utilizacion_real,
        accuracy: turno.accuracy,
        dia: turno.dia
    }));

    // Estadísticas
    const stats = {
        turnosConDatos: data.estadisticas_semanales.cobertura.turnos_con_datos,
        turnosFaltantes: data.estadisticas_semanales.cobertura.turnos_faltantes,
        movimientosPromedio: data.estadisticas_semanales.totales.movimientos_modelo / data.serie_temporal.length,
        movimientosRealPromedio: data.estadisticas_semanales.totales.movimientos_real / data.serie_temporal.length,
        accuracyPromedio: data.estadisticas_semanales.promedios.accuracy,
        utilizacionPromedio: data.estadisticas_semanales.promedios.utilizacion_modelo
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <Calendar className="mr-2" size={20} />
                        Evolución Temporal - Semana {data.metadata.semana}
                    </h3>
                    <div className="text-sm text-gray-600">
                        Participación {data.metadata.participacion}% • Dispersión {data.metadata.dispersion}
                    </div>
                </div>

                {/* Resumen estadístico */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center text-sm text-green-600 mb-1">
                            <CheckCircle size={16} className="mr-1" />
                            Turnos con Datos
                        </div>
                        <div className="text-2xl font-bold text-green-900">
                            {stats.turnosConDatos}
                        </div>
                        <div className="text-xs text-green-600">
                            {data.estadisticas_semanales.cobertura.porcentaje_cobertura.toFixed(0)}% cobertura
                        </div>
                    </div>

                    <div className="bg-red-50 rounded-lg p-3">
                        <div className="flex items-center text-sm text-red-600 mb-1">
                            <XCircle size={16} className="mr-1" />
                            Turnos Faltantes
                        </div>
                        <div className="text-2xl font-bold text-red-900">
                            {stats.turnosFaltantes}
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-sm text-blue-600 mb-1">Accuracy Promedio</div>
                        <div className="text-2xl font-bold text-blue-900">
                            {stats.accuracyPromedio.toFixed(1)}%
                        </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-3">
                        <div className="text-sm text-purple-600 mb-1">Utilización Media</div>
                        <div className="text-2xl font-bold text-purple-900">
                            {stats.utilizacionPromedio.toFixed(1)}%
                        </div>
                    </div>
                </div>

                {/* Gráfico de movimientos y accuracy */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-gray-700 mb-3">Movimientos por Turno</h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="turno" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="movimientos"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    name="Modelo"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="movimientosReal"
                                    stroke="#14b8a6"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    name="Real"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div>
                        <h4 className="font-medium text-gray-700 mb-3">Accuracy y Utilización</h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="turno" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="accuracy"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    name="Accuracy %"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="utilizacion"
                                    stroke="#a855f7"
                                    strokeWidth={2}
                                    name="Utilización Modelo %"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="utilizacionReal"
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                    strokeDasharray="3 3"
                                    name="Utilización Real %"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Análisis de tendencia */}
                {data.analisis_patrones.tendencia.tipo !== 'insuficientes_datos' && (
                    <div className="mt-6 bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-700 mb-2">Análisis de Tendencia</h4>
                        <div className="flex items-center space-x-4">
                            <div className={`flex items-center ${data.analisis_patrones.tendencia.tipo === 'mejorando' ? 'text-green-600' :
                                    data.analisis_patrones.tendencia.tipo === 'empeorando' ? 'text-red-600' :
                                        'text-gray-600'
                                }`}>
                                <TrendingUp className={`mr-1 ${data.analisis_patrones.tendencia.tipo === 'empeorando' ? 'rotate-180' : ''
                                    }`} size={20} />
                                <span className="font-medium capitalize">
                                    {data.analisis_patrones.tendencia.tipo}
                                </span>
                            </div>
                            {data.analisis_patrones.tendencia.cambio_porcentual !== undefined && (
                                <span className="text-sm text-gray-600">
                                    Cambio: {data.analisis_patrones.tendencia.cambio_porcentual > 0 ? '+' : ''}
                                    {data.analisis_patrones.tendencia.cambio_porcentual.toFixed(1)}%
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Lista de turnos */}
                <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-3">Detalle por Turno</h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Turno</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Día</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Modelo</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Real</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Accuracy</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Utilización</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CV%</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.serie_temporal.map((turno) => (
                                    <tr key={turno.turno} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                            Turno {turno.turno}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            Día {turno.dia} - T{turno.turno_del_dia}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                                            {turno.movimientos_modelo}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                                            {turno.movimientos_real}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right">
                                            <span className={`font-medium ${turno.accuracy >= 80 ? 'text-green-600' :
                                                    turno.accuracy >= 60 ? 'text-amber-600' :
                                                        'text-red-600'
                                                }`}>
                                                {turno.accuracy.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                                            {turno.utilizacion_modelo.toFixed(1)}%
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                                            {turno.coeficiente_variacion.toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan={2} className="px-4 py-3 text-sm font-medium text-gray-900">
                                        Totales / Promedios
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                        {data.estadisticas_semanales.totales.movimientos_modelo}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                        {data.estadisticas_semanales.totales.movimientos_real}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                        {data.estadisticas_semanales.promedios.accuracy.toFixed(1)}%
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                        {data.estadisticas_semanales.promedios.utilizacion_modelo.toFixed(1)}%
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                        {data.estadisticas_semanales.promedios.coeficiente_variacion.toFixed(1)}%
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Información del mejor y peor turno */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                    {data.analisis_patrones.mejor_turno.turno && (
                        <div className="bg-green-50 rounded-lg p-4">
                            <h5 className="font-medium text-green-900 mb-2">Mejor Turno</h5>
                            <p className="text-sm text-green-700">
                                Turno {data.analisis_patrones.mejor_turno.turno} -
                                Accuracy: {data.analisis_patrones.mejor_turno.accuracy.toFixed(1)}%
                            </p>
                        </div>
                    )}
                    {data.analisis_patrones.peor_turno.turno && (
                        <div className="bg-red-50 rounded-lg p-4">
                            <h5 className="font-medium text-red-900 mb-2">Turno con Mayor Desafío</h5>
                            <p className="text-sm text-red-700">
                                Turno {data.analisis_patrones.peor_turno.turno} -
                                Accuracy: {data.analisis_patrones.peor_turno.accuracy.toFixed(1)}%
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TemporalComparison;