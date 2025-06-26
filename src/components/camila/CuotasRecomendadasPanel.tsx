import React from 'react';
import { useCamilaData } from '../../hooks/useCamilaData';
import { useTimeContext } from '../../contexts/TimeContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Truck, AlertCircle, Download, Info, Activity, BarChart2, Filter, TrendingUp } from 'lucide-react';
import type { CamilaFilters } from '../../types/camila';

interface CuotasRecomendadasPanelProps {
    filters?: CamilaFilters;
    selectedBlocks?: string[];
    hourRange?: { start: number; end: number };
}

export const CuotasRecomendadasPanel: React.FC<CuotasRecomendadasPanelProps> = ({
    filters,
    selectedBlocks = [],
    hourRange = { start: 8, end: 16 }
}) => {
    const { timeState } = useTimeContext();
    const { camilaResults, isLoading } = useCamilaData(timeState.camilaConfig ?? null);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Calculando cuotas recomendadas...</span>
            </div>
        );
    }

    if (!camilaResults) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                <AlertCircle size={24} className="mr-2" />
                <span>No hay datos de cuotas disponibles</span>
            </div>
        );
    }

    // Preparar datos para visualización
    const blocks = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'];
    const allHours = Array.from({ length: 8 }, (_, i) => `${i + 8}:00`);

    // Filtrar bloques si hay selección
    const blocksToShow = selectedBlocks.length > 0 ? selectedBlocks : blocks;
    const blockIndices = blocksToShow.map(b => parseInt(b.replace('C', '')) - 1);

    // Filtrar horas según rango
    const hoursToShow = allHours.filter((_, idx) => {
        const hour = idx + 8;
        return hour >= hourRange.start && hour < hourRange.end;
    });
    const hourIndices = hoursToShow.map(h => parseInt(h.split(':')[0]) - 8);

    // Datos para gráfico por hora
    const hourlyData = hoursToShow.map((hour, idx) => {
        const t = hourIndices[idx];
        const total = blockIndices.reduce((sum, b) => sum + camilaResults.recommendedQuotas[b][t], 0);
        const capacity = blockIndices.reduce((sum, b) => sum + camilaResults.capacity[b][t], 0);

        return {
            hora: hour,
            cuota: total,
            capacidad: capacity
        };
    });

    // Datos para gráfico por bloque
    const blockData = blocksToShow.map((block, idx) => {
        const b = blockIndices[idx];
        const total = hourIndices.reduce((sum, t) => sum + camilaResults.recommendedQuotas[b][t], 0);
        return {
            bloque: block,
            cuota: total,
            promedio: Math.round(total / hoursToShow.length)
        };
    });

    // Calcular estadísticas generales
    const totalCuotas = hourlyData.reduce((sum, h) => sum + h.cuota, 0);
    const totalCapacidad = hourlyData.reduce((sum, h) => sum + h.capacidad, 0);
    const utilizacion = totalCapacidad > 0 ? (totalCuotas / totalCapacidad) * 100 : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Cuotas de Camiones Recomendadas
                </h2>
                <p className="text-sm text-gray-600">
                    Distribución óptima para minimizar congestión • Factor de seguridad: 80%
                </p>
            </div>

            {/* Mostrar indicador de filtros */}
            {(selectedBlocks.length > 0 || hourRange.start !== 8 || hourRange.end !== 16) && (
                <div className="bg-purple-100 border border-purple-300 rounded-lg p-3">
                    <div className="flex items-center space-x-4 text-sm">
                        <Filter size={16} className="text-purple-600" />
                        <span className="text-purple-700">
                            Mostrando cuotas para:
                        </span>
                        {selectedBlocks.length > 0 && (
                            <span className="font-medium">Bloques: {blocksToShow.join(', ')}</span>
                        )}
                        {(hourRange.start !== 8 || hourRange.end !== 16) && (
                            <span className="font-medium">Horas: {hourRange.start}:00 - {hourRange.end}:00</span>
                        )}
                    </div>
                </div>
            )}

            {/* Resumen de cuotas */}
            <div className="grid grid-cols-4 gap-4">
                <SummaryCard
                    title="Total Cuotas"
                    value={totalCuotas}
                    subtitle={`Camiones en ${hoursToShow.length}h`}
                    icon={<Truck size={20} />}
                />
                <SummaryCard
                    title="Pico Máximo"
                    value={Math.max(...hourlyData.map(h => h.cuota))}
                    subtitle="Camiones/hora"
                    icon={<TrendingUp size={20} />}
                />
                <SummaryCard
                    title="Promedio"
                    value={Math.round(totalCuotas / hoursToShow.length)}
                    subtitle="Por hora"
                    icon={<Activity size={20} />}
                />
                <SummaryCard
                    title="Utilización"
                    value={`${utilizacion.toFixed(0)}%`}
                    subtitle="De capacidad"
                    icon={<BarChart2 size={20} />}
                />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-2 gap-4">
                {/* Cuotas por hora */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h3 className="font-medium text-gray-800 mb-4">
                        Distribución Temporal
                        {hourRange.start !== 8 || hourRange.end !== 16 ? ' (Filtrado)' : ''}
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={hourlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hora" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="cuota" fill="#8b5cf6" name="Cuota Recomendada" />
                            <Bar dataKey="capacidad" fill="#e9d5ff" name="Capacidad Máxima" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Cuotas por bloque */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h3 className="font-medium text-gray-800 mb-4">
                        Distribución por Bloque
                        {selectedBlocks.length > 0 ? ' (Filtrado)' : ''}
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={blockData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="bloque" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="cuota" fill="#3b82f6" name="Total Turno" />
                            <Bar dataKey="promedio" fill="#93c5fd" name="Promedio/Hora" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tabla detallada */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-800">
                        Detalle de Cuotas por Bloque y Hora
                    </h3>
                    <button
                        onClick={() => {
                            // Implementar exportación
                            console.log('Exportar cuotas');
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                        <Download size={16} />
                        <span>Exportar</span>
                    </button>
                </div>

                <div className="overflow-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Bloque
                                </th>
                                {hoursToShow.map(hour => (
                                    <th key={hour} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        {hour}
                                    </th>
                                ))}
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase bg-gray-100">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {blocksToShow.map((block, bIdx) => {
                                const b = blockIndices[bIdx];
                                const rowTotal = hourIndices.reduce((sum, t) =>
                                    sum + camilaResults.recommendedQuotas[b][t], 0
                                );

                                return (
                                    <tr key={block} className={bIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {block}
                                        </td>
                                        {hourIndices.map((t, tIdx) => {
                                            const quota = camilaResults.recommendedQuotas[b][t];
                                            return (
                                                <td key={tIdx} className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${quota > 20 ? 'bg-red-100 text-red-800' :
                                                        quota > 10 ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-green-100 text-green-800'
                                                        }`}>
                                                        {quota}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-center bg-gray-100">
                                            {rowTotal}
                                        </td>
                                    </tr>
                                );
                            })}
                            <tr className="bg-gray-100 font-bold">
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                    Total/Hora
                                </td>
                                {hourIndices.map((t, tIdx) => {
                                    const colTotal = blockIndices.reduce((sum, b) =>
                                        sum + camilaResults.recommendedQuotas[b][t], 0
                                    );
                                    return (
                                        <td key={tIdx} className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                            {colTotal}
                                        </td>
                                    );
                                })}
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                    {totalCuotas}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Análisis de patrones si está activo */}
            {filters?.showPatterns && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-medium text-purple-800 mb-3 flex items-center">
                        <BarChart2 size={20} className="mr-2" />
                        Patrones Identificados
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-purple-600">Patrón Principal</p>
                            <p className="text-lg font-bold text-purple-800">
                                Picos en horas {hourlyData
                                    .filter(h => h.cuota > totalCuotas / hoursToShow.length * 1.2)
                                    .map(h => h.hora.split(':')[0])
                                    .join(', ')}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-purple-600">Distribución</p>
                            <p className="text-lg font-bold text-purple-800">
                                {Math.max(...blockData.map(b => b.cuota)) / Math.min(...blockData.map(b => b.cuota)) > 1.5
                                    ? 'Desbalanceada'
                                    : 'Uniforme'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Recomendaciones */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                    <Info size={20} className="mr-2" />
                    Recomendaciones de Implementación
                </h3>
                <ul className="space-y-2 text-sm text-blue-700">
                    <li>• Comunicar cuotas a transportistas con 24 horas de anticipación</li>
                    <li>• Implementar sistema de citas para respetar las cuotas asignadas</li>
                    <li>• Mantener flexibilidad del ±10% para imprevistos operacionales</li>
                    {selectedBlocks.length > 0 && (
                        <li>• Foco especial en bloques seleccionados: {selectedBlocks.join(', ')}</li>
                    )}
                    {hourRange.start !== 8 || hourRange.end !== 16 ? (
                        <li>• Atención prioritaria en horario {hourRange.start}:00 - {hourRange.end}:00</li>
                    ) : (
                        <li>• Priorizar bloques con menor congestión en horas pico</li>
                    )}
                    <li>• Monitorear cumplimiento y ajustar según demanda real</li>
                </ul>
            </div>
        </div>
    );
};

// Componente para tarjetas de resumen
const SummaryCard: React.FC<{
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
}> = ({ title, value, subtitle, icon }) => {
    return (
        <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">{title}</h4>
                <div className="text-purple-600">{icon}</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
    );
};

export default CuotasRecomendadasPanel;