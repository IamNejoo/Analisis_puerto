import React from 'react';
import { useCamilaData } from '../../hooks/useCamilaData';
import { useTimeContext } from '../../contexts/TimeContext';
import { Activity, Clock, AlertCircle } from 'lucide-react';

export const HeatmapGruasPanel: React.FC = () => {
    const { timeState } = useTimeContext();
    const { camilaResults, isLoading } = useCamilaData(timeState.camilaConfig ?? null);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Cargando asignación de grúas...</span>
            </div>
        );
    }

    if (!camilaResults) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                <AlertCircle size={24} className="mr-2" />
                <span>No hay datos de asignación disponibles</span>
            </div>
        );
    }

    // Preparar datos para el heatmap
    const blocks = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'];
    const hours = Array.from({ length: 8 }, (_, i) => `${i + 8}:00`);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Asignación Óptima de Grúas RTG
                </h2>
                <p className="text-sm text-gray-600">
                    Distribución de 12 grúas en el turno • Máximo 2 grúas por bloque
                </p>
            </div>

            {/* Heatmap principal */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                    <Activity className="mr-2 text-purple-600" size={20} />
                    Matriz de Asignación
                </h3>

                <div className="overflow-auto">
                    <div className="grid grid-cols-9 gap-1 min-w-[600px]">
                        <div></div> {/* Celda vacía para esquina */}
                        {hours.map((hour) => (
                            <div key={hour} className="text-xs text-center font-medium text-gray-600 py-2">
                                {hour}
                            </div>
                        ))}

                        {blocks.map((block, b) => (
                            <React.Fragment key={block}>
                                <div className="text-xs font-medium text-gray-600 pr-2 text-right flex items-center justify-end">
                                    {block}
                                </div>
                                {hours.map((_, t) => {
                                    // Contar grúas asignadas
                                    let gruasAsignadas = 0;
                                    for (let g = 0; g < 12; g++) {
                                        if (camilaResults.grueAssignment[g]?.[b * 8 + t] === 1) {
                                            gruasAsignadas++;
                                        }
                                    }

                                    const bgColor = gruasAsignadas === 0 ? '#f3f4f6' :
                                        gruasAsignadas === 1 ? '#ddd6fe' : '#8b5cf6';
                                    const textColor = gruasAsignadas > 1 ? '#ffffff' : '#374151';

                                    return (
                                        <div
                                            key={`${b}-${t}`}
                                            className="aspect-square rounded flex items-center justify-center text-sm font-medium transition-all hover:scale-105"
                                            style={{
                                                backgroundColor: bgColor,
                                                color: textColor
                                            }}
                                            title={`${block} - ${t + 8}:00 - ${gruasAsignadas} grúa${gruasAsignadas !== 1 ? 's' : ''}`}
                                        >
                                            {gruasAsignadas > 0 && gruasAsignadas}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Leyenda */}
                <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
                        <span>Sin grúas</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-purple-200 rounded mr-2"></div>
                        <span>1 grúa</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-purple-600 rounded mr-2"></div>
                        <span>2 grúas</span>
                    </div>
                </div>
            </div>

            {/* Estadísticas de utilización */}
            <div className="grid grid-cols-3 gap-4">
                <StatCard
                    title="Utilización Promedio"
                    value={`${((camilaResults.grueAssignment.flat().filter(v => v === 1).length / (12 * 8)) * 100).toFixed(1)}%`}
                    subtitle="De capacidad total de grúas"
                    color="blue"
                />
                <StatCard
                    title="Horas Pico"
                    value={getPeakHours(camilaResults.grueAssignment)}
                    subtitle="Mayor asignación"
                    color="purple"
                />
                <StatCard
                    title="Bloques Críticos"
                    value={getCriticalBlocks(camilaResults.grueAssignment, blocks)}
                    subtitle="Con mayor demanda"
                    color="orange"
                />
            </div>
        </div>
    );
};

// Funciones auxiliares
const getPeakHours = (grueAssignment: number[][]): string => {
    const hourCounts = Array(8).fill(0);
    for (let g = 0; g < 12; g++) {
        for (let t = 0; t < 8; t++) {
            for (let b = 0; b < 9; b++) {
                if (grueAssignment[g]?.[b * 8 + t] === 1) {
                    hourCounts[t]++;
                }
            }
        }
    }
    const maxCount = Math.max(...hourCounts);
    const peakHours = hourCounts
        .map((count, index) => ({ hour: index + 8, count }))
        .filter(item => item.count === maxCount)
        .map(item => `${item.hour}:00`)
        .join(', ');
    return peakHours;
};

const getCriticalBlocks = (grueAssignment: number[][], blocks: string[]): string => {
    const blockCounts = Array(9).fill(0);
    for (let b = 0; b < 9; b++) {
        for (let t = 0; t < 8; t++) {
            for (let g = 0; g < 12; g++) {
                if (grueAssignment[g]?.[b * 8 + t] === 1) {
                    blockCounts[b]++;
                }
            }
        }
    }
    const maxCount = Math.max(...blockCounts);
    return blockCounts
        .map((count, index) => ({ block: blocks[index], count }))
        .filter(item => item.count === maxCount)
        .map(item => item.block)
        .join(', ');
};

// Componente para tarjetas de estadísticas
const StatCard: React.FC<{
    title: string;
    value: string;
    subtitle: string;
    color: 'blue' | 'purple' | 'orange';
}> = ({ title, value, subtitle, color }) => {
    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200 text-blue-800',
        purple: 'bg-purple-50 border-purple-200 text-purple-800',
        orange: 'bg-orange-50 border-orange-200 text-orange-800'
    };

    return (
        <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
            <h4 className="text-sm font-medium">{title}</h4>
            <div className="text-2xl font-bold mt-1">{value}</div>
            <p className="text-xs opacity-75 mt-1">{subtitle}</p>
        </div>
    );
};

export default HeatmapGruasPanel;