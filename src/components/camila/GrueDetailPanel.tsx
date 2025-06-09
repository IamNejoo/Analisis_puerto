import React, { useState, useMemo, useEffect } from 'react';
import { Activity, TrendingUp, Clock, AlertCircle, Filter } from 'lucide-react';
import type { CamilaResults } from '../../types';

interface GrueDetailPanelProps {
    results: CamilaResults;
    hourRange?: { start: number; end: number };
}

export const GrueDetailPanel: React.FC<GrueDetailPanelProps> = ({
    results,
    hourRange = { start: 8, end: 16 }
}) => {
    const [selectedGrua, setSelectedGrua] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'matrix' | 'timeline' | 'summary'>('matrix');

    // DEBUG: Log initial data
    React.useEffect(() => {
        console.log('🚜 [GrueDetailPanel] Results recibidos:', results);
        console.log('🚜 [GrueDetailPanel] grueAssignment:', results.grueAssignment);
        console.log('🚜 [GrueDetailPanel] grueAssignment length:', results.grueAssignment?.length);
        if (results.grueAssignment?.length > 0) {
            console.log('🚜 [GrueDetailPanel] Primera grúa asignaciones:', results.grueAssignment[0]);
            // Contar total de asignaciones
            const totalAsignaciones = results.grueAssignment.flat().filter(v => v === 1).length;
            console.log('🚜 [GrueDetailPanel] Total asignaciones (1s):', totalAsignaciones);
        }
    }, [results]);

    const blocks = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'];
    const gruas = Array.from({ length: 12 }, (_, i) => `G${i + 1}`);

    // Ajustar horas según el rango
    const hourOffset = hourRange.start - 8; // Offset desde las 8:00
    const hoursInRange = hourRange.end - hourRange.start;
    const hours = Array.from({ length: hoursInRange }, (_, i) => `${hourRange.start + i}:00`);

    // Calcular estadísticas por grúa
    const gruaStats = useMemo(() => {
        return gruas.map((_, g) => {
            let totalAssignments = 0;
            let blocksWorked = new Set<number>();
            let hoursWorked = 0;

            for (let t = 0; t < hoursInRange; t++) {
                let assignedInHour = false;
                for (let b = 0; b < blocks.length; b++) {
                    const index = b * 8 + (t + hourOffset);
                    if (results.grueAssignment[g]?.[index] === 1) {
                        totalAssignments++;
                        blocksWorked.add(b);
                        assignedInHour = true;
                    }
                }
                if (assignedInHour) hoursWorked++;
            }

            return {
                grua: g,
                totalAssignments,
                blocksWorked: blocksWorked.size,
                hoursWorked,
                utilization: (hoursWorked / hoursInRange) * 100
            };
        });
    }, [results.grueAssignment, hourOffset, hoursInRange]);

    // Calcular asignaciones por bloque y hora
    const blockHourAssignments = useMemo(() => {
        const assignments: number[][] = Array(blocks.length).fill(null).map(() =>
            Array(hoursInRange).fill(0)
        );

        for (let b = 0; b < blocks.length; b++) {
            for (let t = 0; t < hoursInRange; t++) {
                for (let g = 0; g < 12; g++) {
                    const index = b * 8 + (t + hourOffset);
                    if (results.grueAssignment[g]?.[index] === 1) {
                        assignments[b][t]++;
                    }
                }
            }
        }

        return assignments;
    }, [results.grueAssignment, hourOffset, hoursInRange]);

    // Renderizar vista de matriz
    const renderMatrixView = () => (
        <div className="overflow-auto">
            <table className="min-w-full">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="sticky left-0 bg-gray-50 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Grúa
                        </th>
                        {hours.map(hour => (
                            <th key={hour} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase min-w-[80px]">
                                {hour}
                            </th>
                        ))}
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase bg-gray-100">
                            Total
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {gruas.map((grua, g) => {
                        const stat = gruaStats[g];
                        const isSelected = selectedGrua === g;

                        return (
                            <tr
                                key={grua}
                                className={`hover:bg-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-purple-50' : ''
                                    }`}
                                onClick={() => setSelectedGrua(isSelected ? null : g)}
                            >
                                <td className="sticky left-0 bg-white px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <div className="flex items-center">
                                        <div className={`w-2 h-2 rounded-full mr-2 ${stat.utilization > 80 ? 'bg-red-500' :
                                                stat.utilization > 60 ? 'bg-yellow-500' :
                                                    'bg-green-500'
                                            }`}></div>
                                        {grua}
                                    </div>
                                </td>
                                {hours.map((_, t) => {
                                    const assignedBlocks: string[] = [];
                                    for (let b = 0; b < blocks.length; b++) {
                                        const index = b * 8 + (t + hourOffset);
                                        if (results.grueAssignment[g]?.[index] === 1) {
                                            assignedBlocks.push(blocks[b]);
                                        }
                                    }

                                    return (
                                        <td key={t} className="px-2 py-2 text-center">
                                            {assignedBlocks.length > 0 ? (
                                                <div className="text-xs">
                                                    <div className="font-semibold text-purple-600">
                                                        {assignedBlocks.join(', ')}
                                                    </div>
                                                    <div className="text-gray-500">
                                                        {assignedBlocks.length} {assignedBlocks.length === 1 ? 'bloque' : 'bloques'}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </td>
                                    );
                                })}
                                <td className="px-4 py-2 text-center bg-gray-50">
                                    <div className="text-sm">
                                        <div className="font-semibold">{stat.hoursWorked}h</div>
                                        <div className="text-xs text-gray-500">{stat.utilization.toFixed(0)}%</div>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    // Renderizar vista timeline
    const renderTimelineView = () => (
        <div className="space-y-4">
            {gruas.map((grua, g) => {
                const stat = gruaStats[g];

                return (
                    <div key={grua} className="bg-white border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-800 flex items-center">
                                {grua}
                                <span className="ml-2 text-xs text-gray-500">
                                    ({stat.utilization.toFixed(0)}% utilización)
                                </span>
                            </h4>
                            <div className="text-sm text-gray-600">
                                {stat.blocksWorked} bloques, {stat.hoursWorked} horas
                            </div>
                        </div>

                        <div className="relative h-12">
                            <div className="absolute inset-0 bg-gray-100 rounded"></div>
                            {hours.map((_, t) => {
                                const assignedBlocks: string[] = [];
                                for (let b = 0; b < blocks.length; b++) {
                                    const index = b * 8 + (t + hourOffset);
                                    if (results.grueAssignment[g]?.[index] === 1) {
                                        assignedBlocks.push(blocks[b]);
                                    }
                                }

                                if (assignedBlocks.length > 0) {
                                    const left = (t / hoursInRange) * 100;
                                    const width = (1 / hoursInRange) * 100;

                                    return (
                                        <div
                                            key={t}
                                            className="absolute h-full bg-purple-600 rounded transition-all hover:bg-purple-700"
                                            style={{
                                                left: `${left}%`,
                                                width: `${width}%`
                                            }}
                                            title={`${hours[t]}: ${assignedBlocks.join(', ')}`}
                                        >
                                            <div className="text-xs text-white font-medium h-full flex items-center justify-center">
                                                {assignedBlocks.join(',')}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>

                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                            {hours.map((hour, i) => (
                                <span key={i}>{hour.split(':')[0]}</span>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    // Renderizar vista resumen
    const renderSummaryView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Estadísticas por grúa */}
            <div className="bg-white border rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">Utilización por Grúa</h4>
                <div className="space-y-2">
                    {gruaStats
                        .sort((a, b) => b.utilization - a.utilization)
                        .map(stat => (
                            <div key={stat.grua} className="flex items-center justify-between">
                                <span className="text-sm font-medium">G{stat.grua + 1}</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${stat.utilization > 80 ? 'bg-red-500' :
                                                    stat.utilization > 60 ? 'bg-yellow-500' :
                                                        'bg-green-500'
                                                }`}
                                            style={{ width: `${stat.utilization}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs text-gray-600 min-w-[40px] text-right">
                                        {stat.utilization.toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Heatmap de asignaciones */}
            <div className="bg-white border rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">Distribución de Grúas</h4>
                <div className="grid grid-cols-9 gap-1 text-xs">
                    <div></div>
                    {hours.map((hour, i) => (
                        <div key={i} className="text-center font-medium text-gray-600">
                            {hour.split(':')[0]}
                        </div>
                    ))}

                    {blocks.map((block, b) => (
                        <React.Fragment key={block}>
                            <div className="font-medium text-gray-600 text-right pr-1">
                                {block}
                            </div>
                            {hours.map((_, t) => {
                                const gruas = blockHourAssignments[b][t];
                                const intensity = gruas === 0 ? 'bg-gray-100' :
                                    gruas === 1 ? 'bg-purple-200' :
                                        gruas === 2 ? 'bg-purple-400' :
                                            'bg-purple-600';
                                const textColor = gruas > 1 ? 'text-white' : 'text-gray-700';

                                return (
                                    <div
                                        key={`${b}-${t}`}
                                        className={`aspect-square rounded flex items-center justify-center ${intensity} ${textColor}`}
                                        title={`${block} - ${hours[t]}: ${gruas} grúa${gruas !== 1 ? 's' : ''}`}
                                    >
                                        {gruas > 0 && gruas}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            {/* Header con controles */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                        <Activity className="mr-2 text-purple-600" size={20} />
                        Detalle de Asignación de Grúas RTG
                    </h2>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setViewMode('matrix')}
                            className={`px-3 py-1 text-sm rounded transition-colors ${viewMode === 'matrix'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Matriz
                        </button>
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={`px-3 py-1 text-sm rounded transition-colors ${viewMode === 'timeline'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Timeline
                        </button>
                        <button
                            onClick={() => setViewMode('summary')}
                            className={`px-3 py-1 text-sm rounded transition-colors ${viewMode === 'summary'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Resumen
                        </button>
                    </div>
                </div>
            </div>

            {/* Información del rango de horas */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center text-sm text-blue-800">
                    <Clock size={16} className="mr-2" />
                    Mostrando asignaciones para: {hourRange.start}:00 - {hourRange.end}:00
                </div>
            </div>

            {/* Vista seleccionada */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
                {viewMode === 'matrix' && renderMatrixView()}
                {viewMode === 'timeline' && renderTimelineView()}
                {viewMode === 'summary' && renderSummaryView()}
            </div>

            {/* Estadísticas generales */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    title="Grúas Activas"
                    value={gruaStats.filter(s => s.hoursWorked > 0).length}
                    subtitle="De 12 disponibles"
                    color="purple"
                />
                <StatCard
                    title="Utilización Promedio"
                    value={`${(gruaStats.reduce((sum, s) => sum + s.utilization, 0) / 12).toFixed(1)}%`}
                    subtitle="Del tiempo disponible"
                    color="blue"
                />
                <StatCard
                    title="Máx. Grúas/Hora"
                    value={Math.max(...blockHourAssignments.flat())}
                    subtitle="En un mismo bloque"
                    color="orange"
                />
                <StatCard
                    title="Total Asignaciones"
                    value={gruaStats.reduce((sum, s) => sum + s.totalAssignments, 0)}
                    subtitle="Bloque-hora"
                    color="green"
                />
            </div>
        </div>
    );
};

// Componente auxiliar para tarjetas de estadísticas
const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle: string;
    color: 'purple' | 'blue' | 'orange' | 'green';
}> = ({ title, value, subtitle, color }) => {
    const colorClasses = {
        purple: 'bg-purple-50 border-purple-200 text-purple-800',
        blue: 'bg-blue-50 border-blue-200 text-blue-800',
        orange: 'bg-orange-50 border-orange-200 text-orange-800',
        green: 'bg-green-50 border-green-200 text-green-800'
    };

    return (
        <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
            <h4 className="text-sm font-medium">{title}</h4>
            <div className="text-2xl font-bold mt-1">{value}</div>
            <p className="text-xs opacity-75 mt-1">{subtitle}</p>
        </div>
    );
};

export default GrueDetailPanel;