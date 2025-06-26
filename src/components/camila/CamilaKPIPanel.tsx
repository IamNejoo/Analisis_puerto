// components/camila/CamilaKPIPanel.tsx - Versión con validaciones correctas

import React, { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import {
    Activity,
    TrendingUp,
    BarChart3,
    Clock,
    Package,
    Truck,
    AlertCircle,
    CheckCircle,
    Filter,
    AlertTriangle
} from 'lucide-react';
import type { CamilaResults, CamilaRealComparison } from '../../types';
import type { CamilaFilters } from '../../types/camila';
interface CamilaKPIPanelProps {
    results: CamilaResults;
    comparison?: CamilaRealComparison | null;
    filteredData?: any;
    filters?: CamilaFilters;
}

export const CamilaKPIPanel: React.FC<CamilaKPIPanelProps> = ({
    results,
    comparison,
    filteredData,
    filters
}) => {
    console.log('🔍 CamilaKPIPanel - Renderizando con:', {
        hasResults: !!results,
        hasFilteredData: !!filteredData,
        activeFilters: filters
    });

    if (!results) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Cargando datos...</span>
            </div>
        );
    }

    // IMPORTANTE: Usar datos filtrados cuando estén disponibles
    const dataToDisplay = filteredData && filters && (
        filters.hourRange.start !== 8 ||
        filters.hourRange.end !== 16 ||
        (filters.selectedBlocks && filters.selectedBlocks.length > 0) ||
        (filters.selectedGruas && filters.selectedGruas.length > 0)
    ) ? filteredData : results;

    console.log('📊 Usando datos:', {
        source: dataToDisplay === filteredData ? 'FILTRADOS' : 'ORIGINALES',
        totalFlows: dataToDisplay.totalFlows?.length
    });

    // Ajustar bloques según filtros
    const allBlocks = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'];
    const blocksToShow = filters?.selectedBlocks && filters.selectedBlocks.length > 0
        ? filters.selectedBlocks
        : allBlocks;
    const blockIndices = blocksToShow.map(b => parseInt(b.replace('C', '')) - 1);

    // Preparar datos para gráficos con los datos correctos
    const blockDistributionData = useMemo(() => {
        if (!dataToDisplay.blockParticipation) return [];

        if (filters?.selectedBlocks && filters.selectedBlocks.length > 0) {
            // Si hay filtros de bloques, mostrar solo esos
            return blockIndices.map((idx, i) => ({
                block: blocksToShow[i],
                participacion: dataToDisplay.blockParticipation[i]?.toFixed(1) ||
                    results.blockParticipation[idx]?.toFixed(1) || 0,
                color: dataToDisplay.blockParticipation[i] > 15 ? '#ef4444' :
                    dataToDisplay.blockParticipation[i] > 10 ? '#f59e0b' : '#10b981'
            }));
        } else {
            // Mostrar todos los bloques
            return results.blockParticipation.map((participation, index) => ({
                block: `C${index + 1}`,
                participacion: participation.toFixed(1),
                color: participation > 15 ? '#ef4444' :
                    participation > 10 ? '#f59e0b' : '#10b981'
            }));
        }
    }, [dataToDisplay.blockParticipation, results.blockParticipation, filters?.selectedBlocks, blockIndices, blocksToShow]);

    const timeDistributionData = useMemo(() => {
        const startHour = filters?.hourRange?.start || 8;
        const endHour = filters?.hourRange?.end || 16;
        const data = [];

        for (let hour = startHour; hour < endHour; hour++) {
            const idx = hour - 8;
            if (idx >= 0 && idx < 8) {
                const participation = dataToDisplay.timeParticipation?.[idx - (startHour - 8)] ||
                    results.timeParticipation?.[idx] || 0;

                const quota = blockIndices.reduce((sum, b) => {
                    const quotaIdx = filters?.hourRange ? idx - (startHour - 8) : idx;
                    return sum + (dataToDisplay.recommendedQuotas?.[b]?.[quotaIdx] || 0);
                }, 0);

                data.push({
                    hora: `${hour}:00`,
                    participacion: participation.toFixed(1),
                    cuota: quota
                });
            }
        }

        return data;
    }, [dataToDisplay, results, filters?.hourRange, blockIndices]);

    const grueHeatmapData = useMemo(() => {
        // Transformar matriz de grúas para heatmap
        const data: any[] = [];
        const hours = timeDistributionData.map(td => td.hora);

        blocksToShow.forEach((block, bIdx) => {
            hours.forEach((hour, tIdx) => {
                let gruasAsignadas = 0;
                const b = blockIndices[bIdx];
                const hourNum = parseInt(hour.split(':')[0]);
                const t = hourNum - 8;

                // Contar grúas asignadas a este bloque en este período
                const gruasToCheck = filters?.selectedGruas && filters.selectedGruas.length > 0
                    ? filters.selectedGruas.map(g => g - 1)
                    : Array.from({ length: 12 }, (_, i) => i);

                for (const g of gruasToCheck) {
                    const assignment = dataToDisplay.grueAssignment?.[g] || results.grueAssignment?.[g];
                    if (assignment?.[b * 8 + t] === 1) {
                        gruasAsignadas++;
                    }
                }

                data.push({
                    bloque: block,
                    hora: hour,
                    gruas: gruasAsignadas,
                    color: gruasAsignadas === 0 ? '#f3f4f6' :
                        gruasAsignadas === 1 ? '#93c5fd' : '#2563eb'
                });
            });
        });

        return data;
    }, [dataToDisplay.grueAssignment, results.grueAssignment, timeDistributionData, blocksToShow, blockIndices, filters]);

    // Calcular totales con datos filtrados
    const totalMovimientos = useMemo(() => {
        const flows = dataToDisplay.totalFlows || results.totalFlows;
        if (!flows) return 0;

        return flows.reduce((sum: number, block: number[]) =>
            sum + block.reduce((s: number, v: number) => s + v, 0), 0
        );
    }, [dataToDisplay.totalFlows, results.totalFlows]);

    const totalCapacidad = useMemo(() => {
        const capacity = dataToDisplay.capacity || results.capacity;
        if (!capacity) return 0;

        return capacity.reduce((sum: number, block: number[]) =>
            sum + block.reduce((s: number, v: number) => s + v, 0), 0
        );
    }, [dataToDisplay.capacity, results.capacity]);

    const utilizacion = useMemo(() => {
        return totalCapacidad > 0 ? (totalMovimientos / totalCapacidad) * 100 : 0;
    }, [totalMovimientos, totalCapacidad]);

    // Mostrar advertencia si se están usando datos de fallback
    const showDataWarning = results.week !== 3 && totalMovimientos > 0;

    // Mostrar análisis adicionales si están en filteredData
    const showSegregationAnalysis = filters?.showTopSegregations && filteredData?.segregationFlows;
    const showPeakAnalysis = filters?.showPeakHours && filteredData?.peakPatterns;

    // Funciones auxiliares para verificar filtros activos
    const hasActiveFilters = () => {
        if (!filters) return false;
        return (filters.selectedBlocks && filters.selectedBlocks.length > 0) ||
            (filters.selectedGruas && filters.selectedGruas.length > 0) ||
            filters.hourRange.start !== 8 ||
            filters.hourRange.end !== 16;
    };

    return (
        <div className="space-y-6">
            {/* Header con información del modelo */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <Activity className="mr-2 text-purple-600" size={24} />
                            Modelo Camila - Optimización de Carga de Trabajo
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Semana {results.week} • {results.day} • Turno {results.shift} •
                            Modelo {results.modelType === 'minmax' ? 'MinMax (Conservador)' : 'MaxMin (Máxima Utilización)'}
                        </p>
                    </div>
                    {comparison && (
                        <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                                {comparison?.improvements?.workloadBalance?.toFixed(1) || '0'}%
                            </div>
                            <div className="text-sm text-gray-500">Mejora en balance</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Advertencia de datos limitados */}
            {showDataWarning && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start">
                    <AlertTriangle size={20} className="text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                        <strong>Nota:</strong> Los datos mostrados corresponden a la Semana 3.
                        No hay datos específicos disponibles para la configuración seleccionada.
                    </div>
                </div>
            )}

            {/* Mostrar indicador de filtros activos */}
            {hasActiveFilters() && (
                <div className="bg-purple-100 border border-purple-300 rounded-lg p-3">
                    <div className="flex items-center space-x-4 text-sm">
                        <Filter size={16} className="text-purple-600" />
                        <span className="text-purple-700 font-medium">Filtros activos:</span>
                        {filters?.selectedBlocks && filters.selectedBlocks.length > 0 && (
                            <span className="text-purple-600">
                                Bloques: {filters.selectedBlocks.join(', ')}
                            </span>
                        )}
                        {filters?.selectedGruas && filters.selectedGruas.length > 0 && (
                            <span className="text-purple-600">
                                Grúas: {filters.selectedGruas.map(g => `G${g}`).join(', ')}
                            </span>
                        )}
                        {filters && (filters.hourRange.start !== 8 || filters.hourRange.end !== 16) && (
                            <span className="text-purple-600">
                                Horas: {filters.hourRange.start}:00 - {filters.hourRange.end}:00
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* KPIs principales en cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Balance de Carga"
                    value={`${(dataToDisplay.workloadBalance || results.workloadBalance).toFixed(1)}%`}
                    subtitle="Uniformidad en distribución"
                    icon={<BarChart3 size={20} />}
                    color="blue"
                    status={dataToDisplay.workloadBalance > 80 ? 'good' :
                        dataToDisplay.workloadBalance > 60 ? 'warning' : 'critical'}
                />

                <KPICard
                    title="Índice Congestión"
                    value={(dataToDisplay.congestionIndex || results.congestionIndex).toFixed(2)}
                    subtitle="Concentración máxima"
                    icon={<AlertCircle size={20} />}
                    color="orange"
                    status={dataToDisplay.congestionIndex < 1.5 ? 'good' :
                        dataToDisplay.congestionIndex < 2 ? 'warning' : 'critical'}
                />

                <KPICard
                    title="Utilización"
                    value={`${utilizacion.toFixed(1)}%`}
                    subtitle="Capacidad usada"
                    icon={<TrendingUp size={20} />}
                    color="green"
                    status={utilizacion > 70 ? 'good' : utilizacion > 50 ? 'warning' : 'critical'}
                />

                <KPICard
                    title="Total Movimientos"
                    value={totalMovimientos.toLocaleString()}
                    subtitle={filters?.selectedBlocks && filters.selectedBlocks.length > 0 ? "En bloques filtrados" : "En el turno"}
                    icon={<Package size={20} />}
                    color="purple"
                    status="normal"
                />
            </div>

            {/* Análisis de segregaciones si está activo */}
            {showSegregationAnalysis && (
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                        <Package className="mr-2 text-purple-600" size={20} />
                        Análisis de Segregaciones Seleccionadas
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {filteredData.segregationFlows?.map((seg: any) => (
                            <div key={seg.id} className="bg-gray-50 rounded p-3">
                                <h4 className="font-medium text-gray-800">{seg.name}</h4>
                                <div className="mt-2 space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Volumen:</span>
                                        <span className="font-medium">{seg.volume}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Bloques:</span>
                                        <span className="font-medium">{seg.blocks.join(', ')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Análisis de horas pico si está activo */}
            {showPeakAnalysis && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 text-orange-800 flex items-center">
                        <Clock className="mr-2" size={20} />
                        Patrones de Horas Pico
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-orange-600">Horas Pico</p>
                            <p className="text-xl font-bold text-orange-800">
                                {filteredData.peakPatterns?.peakHours?.join(', ') || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-orange-600">Carga Máxima</p>
                            <p className="text-xl font-bold text-orange-800">
                                {filteredData.peakPatterns?.maxLoad || 0} mov/hora
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-orange-600">Variación</p>
                            <p className="text-xl font-bold text-orange-800">
                                ±{filteredData.peakPatterns?.variation?.toFixed(1) || 0}%
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Distribución por bloques */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Distribución de Carga por Bloque
                    {filters?.selectedBlocks && filters.selectedBlocks.length > 0 ? ' (Filtrado)' : ''}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={blockDistributionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="block" />
                        <YAxis label={{ value: 'Participación (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Bar dataKey="participacion" fill="#8884d8">
                            {blockDistributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <div className="mt-2 text-sm text-gray-600">
                    Desviación estándar: {(dataToDisplay.stdDevBlocks || results.stdDevBlocks).toFixed(2)} movimientos
                </div>
            </div>

            {/* Distribución temporal y cuotas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Gráfico temporal */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        Distribución Temporal y Cuotas
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={timeDistributionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hora" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="participacion"
                                stroke="#8884d8"
                                name="Participación (%)"
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="cuota"
                                stroke="#82ca9d"
                                name="Cuota Recomendada"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Tabla de cuotas recomendadas */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                        <Truck className="mr-2 text-blue-600" size={20} />
                        Cuotas de Camiones Recomendadas
                    </h3>
                    <div className="overflow-auto max-h-80">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                                    {blocksToShow.map(block => (
                                        <th key={block} className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                                            {block}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {timeDistributionData.map((timeData, tIdx) => {
                                    const hour = parseInt(timeData.hora.split(':')[0]);
                                    const hourIdx = hour - 8;

                                    return (
                                        <tr key={tIdx} className={tIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {timeData.hora}
                                            </td>
                                            {blockIndices.map((b, idx) => {
                                                const quotaIdx = filters?.hourRange ? hourIdx - (filters.hourRange.start - 8) : hourIdx;
                                                const quota = dataToDisplay.recommendedQuotas?.[b]?.[quotaIdx] ||
                                                    results.recommendedQuotas?.[b]?.[hourIdx] || 0;
                                                return (
                                                    <td key={idx} className="px-3 py-2 whitespace-nowrap text-sm text-center">
                                                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${quota > 20 ? 'bg-red-100 text-red-800' :
                                                            quota > 10 ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'
                                                            }`}>
                                                            {quota}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Heatmap de asignación de grúas */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Asignación de Grúas RTG
                    {filters?.selectedGruas && filters.selectedGruas.length > 0 ? ` (${filters.selectedGruas.length} grúas filtradas)` : ''}
                </h3>
                <div className="grid grid-cols-9 gap-1">
                    <div></div>
                    {timeDistributionData.map((timeData) => (
                        <div key={timeData.hora} className="text-xs text-center font-medium text-gray-600">
                            {timeData.hora.split(':')[0]}
                        </div>
                    ))}

                    {blocksToShow.map((block) => (
                        <React.Fragment key={block}>
                            <div className="text-xs font-medium text-gray-600 pr-2 text-right">
                                {block}
                            </div>
                            {timeDistributionData.map((timeData) => {
                                const cellData = grueHeatmapData.find(d =>
                                    d.bloque === block && d.hora === timeData.hora
                                );
                                return (
                                    <div
                                        key={`${block}-${timeData.hora}`}
                                        className="aspect-square rounded flex items-center justify-center text-xs font-medium"
                                        style={{ backgroundColor: cellData?.color || '#f3f4f6' }}
                                        title={`${block} - ${timeData.hora} - ${cellData?.gruas || 0} grúas`}
                                    >
                                        {cellData?.gruas || 0}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
                <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-600">
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
                        <span>Sin grúas</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-300 rounded mr-2"></div>
                        <span>1 grúa</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                        <span>2 grúas</span>
                    </div>
                </div>
            </div>

            {/* Comparación con datos reales si está disponible */}
            {comparison && comparison.improvements && (
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        Comparación Real vs Optimizado
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <ComparisonCard
                            title="Mejora en Balance"
                            value={`${comparison?.improvements?.workloadBalance?.toFixed(1) || '0'}%`}
                            icon={<CheckCircle size={20} />}
                            positive={comparison.improvements.workloadBalance > 0}
                        />
                        <ComparisonCard
                            title="Reducción Congestión"
                            value={`${comparison?.improvements?.congestionReduction?.toFixed(1) || '0'}%`}
                            icon={<AlertCircle size={20} />}
                            positive={(comparison?.improvements?.congestionReduction || 0) > 0}
                        />
                        <ComparisonCard
                            title="Utilización Recursos"
                            value={`${comparison?.improvements?.resourceUtilization?.toFixed(1) || '0'}%`}
                            icon={<TrendingUp size={20} />}
                            positive={(comparison?.improvements?.resourceUtilization || 0) > 70}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// Componente auxiliar para KPI cards
const KPICard: React.FC<{
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'orange' | 'purple';
    status: 'good' | 'warning' | 'critical' | 'normal';
}> = ({ title, value, subtitle, icon, color, status }) => {
    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200 text-blue-800',
        green: 'bg-green-50 border-green-200 text-green-800',
        orange: 'bg-orange-50 border-orange-200 text-orange-800',
        purple: 'bg-purple-50 border-purple-200 text-purple-800'
    };

    const statusClasses = {
        good: 'bg-green-100',
        warning: 'bg-yellow-100',
        critical: 'bg-red-100',
        normal: 'bg-gray-100'
    };

    return (
        <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">{title}</h4>
                <div className={`p-2 rounded-full ${statusClasses[status]}`}>
                    {icon}
                </div>
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs opacity-75 mt-1">{subtitle}</div>
        </div>
    );
};

// Componente auxiliar para cards de comparación
const ComparisonCard: React.FC<{
    title: string;
    value: string;
    icon: React.ReactNode;
    positive: boolean;
}> = ({ title, value, icon, positive }) => {
    return (
        <div className={`rounded-lg p-4 ${positive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">{title}</h4>
                <div className={positive ? 'text-green-600' : 'text-red-600'}>
                    {icon}
                </div>
            </div>
            <div className={`text-2xl font-bold ${positive ? 'text-green-700' : 'text-red-700'}`}>
                {value}
            </div>
        </div>
    );
};

export default CamilaKPIPanel;