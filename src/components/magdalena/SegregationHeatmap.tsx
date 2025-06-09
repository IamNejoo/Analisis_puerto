import React, { useMemo } from 'react';
import { useMagdalenaData } from '../../hooks/useMagdalenaData';
import { useTimeContext } from '../../contexts/TimeContext';
import {
    Activity,
    BarChart3,
    Clock,
    Layers,
    AlertCircle
} from 'lucide-react';

interface HeatmapCellProps {
    segregacion: string;
    bloque: string;
    periodo: number;
    volumen: number;
    maxVolumen: number;
    onClick?: () => void;
}

const HeatmapCell: React.FC<HeatmapCellProps> = ({
    segregacion,
    bloque,
    periodo,
    volumen,
    maxVolumen,
    onClick
}) => {
    // Calcular intensidad del color basado en volumen
    const intensity = maxVolumen > 0 ? volumen / maxVolumen : 0;

    // Mapeo de colores por segregación
    const segregationColors: { [key: string]: string } = {
        'S1': '#3B82F6', // Blue
        'S2': '#EF4444', // Red  
        'S3': '#10B981', // Green
        'S4': '#F59E0B', // Amber
        'S5': '#8B5CF6', // Purple
        'S6': '#06B6D4', // Cyan
        'S7': '#84CC16', // Lime
        'S8': '#F97316', // Orange
        'S9': '#EC4899', // Pink
        'S10': '#6366F1', // Indigo
        'S11': '#14B8A6', // Teal
        'S12': '#F472B6', // Rose
        'S13': '#A855F7', // Violet
        'S14': '#22C55E', // Green-500
        'S15': '#EAB308', // Yellow
        'S16': '#DC2626'  // Red-600
    };

    const baseColor = segregationColors[segregacion] || '#6B7280';

    // Aplicar intensidad al color
    const backgroundColor = intensity > 0
        ? `${baseColor}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`
        : '#F9FAFB';

    const textColor = intensity > 0.5 ? '#FFFFFF' : '#374151';

    return (
        <div
            className="relative border border-gray-200 cursor-pointer transition-all duration-200 hover:scale-105 hover:border-gray-400"
            style={{
                backgroundColor,
                minHeight: '40px',
                minWidth: '50px'
            }}
            onClick={onClick}
            title={`${segregacion} - ${bloque} - Período ${periodo}: ${volumen} movimientos`}
        >
            <div className="absolute inset-0 flex items-center justify-center">
                {volumen > 0 && (
                    <span
                        className="text-xs font-medium"
                        style={{ color: textColor }}
                    >
                        {volumen}
                    </span>
                )}
            </div>
        </div>
    );
};

interface SegregationLegendProps {
    segregaciones: string[];
    segregationColors: { [key: string]: string };
}

const SegregationLegend: React.FC<SegregationLegendProps> = ({
    segregaciones,
    segregationColors
}) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                <Layers size={16} className="mr-2 text-purple-500" />
                Leyenda de Segregaciones
            </h4>
            <div className="grid grid-cols-4 gap-2">
                {segregaciones.map(seg => (
                    <div key={seg} className="flex items-center space-x-2">
                        <div
                            className="w-4 h-4 rounded border border-gray-300"
                            style={{ backgroundColor: segregationColors[seg] || '#6B7280' }}
                        ></div>
                        <span className="text-sm text-gray-700">{seg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const SegregationHeatmap: React.FC = () => {
    const { timeState } = useTimeContext();
    const { magdalenaMetrics, isLoading, error } = useMagdalenaData(
        timeState.magdalenaConfig?.semana || 3,
        timeState.magdalenaConfig?.participacion || 69,
        timeState.magdalenaConfig?.conDispersion ?? true
    );

    // Procesar datos para el heatmap
    const heatmapData = useMemo(() => {
        if (!magdalenaMetrics?.segregacionesPorBloque) return null;

        const data = magdalenaMetrics.segregacionesPorBloque;

        // Obtener listas únicas
        const segregaciones = Array.from(new Set(data.map(d => d.segregacion))).sort();
        const bloques = Array.from(new Set(data.map(d => d.bloque))).sort();
        const periodos = Array.from(new Set(data.map(d => d.periodo))).sort((a, b) => a - b);

        // Calcular volumen máximo para normalización
        const maxVolumen = Math.max(...data.map(d => d.volumen));

        // Crear estructura de datos para el heatmap
        const heatmapMatrix: { [key: string]: number } = {};
        data.forEach(item => {
            const key = `${item.segregacion}-${item.bloque}-${item.periodo}`;
            heatmapMatrix[key] = item.volumen;
        });

        return {
            segregaciones,
            bloques,
            periodos,
            maxVolumen,
            matrix: heatmapMatrix,
            totalMovimientos: data.reduce((sum, item) => sum + item.volumen, 0)
        };
    }, [magdalenaMetrics]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-48"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !heatmapData) {
        return (
            <div className="bg-white rounded-lg border border-red-200 p-6">
                <div className="flex items-center text-red-600 mb-2">
                    <AlertCircle size={20} className="mr-2" />
                    <h3 className="font-semibold">Error en datos de segregación</h3>
                </div>
                <p className="text-sm text-red-600">
                    {error || 'No hay datos de segregaciones disponibles'}
                </p>
            </div>
        );
    }

    const segregationColors: { [key: string]: string } = {
        'S1': '#3B82F6', 'S2': '#EF4444', 'S3': '#10B981', 'S4': '#F59E0B',
        'S5': '#8B5CF6', 'S6': '#06B6D4', 'S7': '#84CC16', 'S8': '#F97316',
        'S9': '#EC4899', 'S10': '#6366F1', 'S11': '#14B8A6', 'S12': '#F472B6',
        'S13': '#A855F7', 'S14': '#22C55E', 'S15': '#EAB308', 'S16': '#DC2626'
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">Heatmap de Segregaciones</h2>
                    <p className="text-sm text-gray-600">
                        Distribución de movimientos por segregación, bloque y período
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">
                        {heatmapData.totalMovimientos.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Total movimientos</div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="text-lg font-bold text-blue-600">
                        {heatmapData.segregaciones.length}
                    </div>
                    <div className="text-sm text-blue-700">Segregaciones</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="text-lg font-bold text-green-600">
                        {heatmapData.bloques.length}
                    </div>
                    <div className="text-sm text-green-700">Bloques</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <div className="text-lg font-bold text-purple-600">
                        {heatmapData.periodos.length}
                    </div>
                    <div className="text-sm text-purple-700">Períodos</div>
                </div>
            </div>

            {/* Heatmap Principal */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">Matriz de Asignaciones</h3>
                    <div className="text-sm text-gray-600">
                        Intensidad: 0 - {heatmapData.maxVolumen} movimientos
                    </div>
                </div>

                {/* Vista por Segregaciones (más compacta) */}
                <div className="overflow-auto" style={{ maxHeight: '600px' }}>
                    <div className="min-w-full">
                        {/* Headers de períodos */}
                        <div className="flex mb-2">
                            <div className="w-24 text-xs font-medium text-gray-700 p-2">Seg/Bloque</div>
                            {heatmapData.periodos.slice(0, 10).map(periodo => (
                                <div key={periodo} className="w-12 text-xs font-medium text-gray-700 text-center p-1">
                                    P{periodo}
                                </div>
                            ))}
                            {heatmapData.periodos.length > 10 && (
                                <div className="w-12 text-xs font-medium text-gray-700 text-center p-1">
                                    ...
                                </div>
                            )}
                        </div>

                        {/* Filas por segregación y bloque */}
                        {heatmapData.segregaciones.map(segregacion => (
                            <div key={segregacion} className="mb-3">
                                <div className="text-sm font-medium text-gray-800 mb-1 flex items-center">
                                    <div
                                        className="w-3 h-3 rounded mr-2"
                                        style={{ backgroundColor: segregationColors[segregacion] }}
                                    ></div>
                                    {segregacion}
                                </div>
                                {heatmapData.bloques.map(bloque => {
                                    // Verificar si hay datos para esta combinación
                                    const hasData = heatmapData.periodos.some(periodo => {
                                        const key = `${segregacion}-${bloque}-${periodo}`;
                                        return heatmapData.matrix[key] > 0;
                                    });

                                    if (!hasData) return null;

                                    return (
                                        <div key={`${segregacion}-${bloque}`} className="flex mb-1">
                                            <div className="w-24 text-xs text-gray-600 p-2 bg-gray-50 border border-gray-200">
                                                {bloque}
                                            </div>
                                            {heatmapData.periodos.slice(0, 10).map(periodo => {
                                                const key = `${segregacion}-${bloque}-${periodo}`;
                                                const volumen = heatmapData.matrix[key] || 0;
                                                return (
                                                    <HeatmapCell
                                                        key={key}
                                                        segregacion={segregacion}
                                                        bloque={bloque}
                                                        periodo={periodo}
                                                        volumen={volumen}
                                                        maxVolumen={heatmapData.maxVolumen}
                                                    />
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Leyenda */}
            <SegregationLegend
                segregaciones={heatmapData.segregaciones}
                segregationColors={segregationColors}
            />

            {/* Resumen por Segregación */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                    <BarChart3 size={16} className="mr-2 text-blue-500" />
                    Volumen por Segregación
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {heatmapData.segregaciones.map(segregacion => {
                        const volumenTotal = heatmapData.periodos.reduce((sum, periodo) => {
                            return sum + heatmapData.bloques.reduce((blockSum, bloque) => {
                                const key = `${segregacion}-${bloque}-${periodo}`;
                                return blockSum + (heatmapData.matrix[key] || 0);
                            }, 0);
                        }, 0);

                        const porcentaje = heatmapData.totalMovimientos > 0
                            ? ((volumenTotal / heatmapData.totalMovimientos) * 100).toFixed(1)
                            : '0.0';

                        return (
                            <div key={segregacion} className="text-center">
                                <div className="flex items-center justify-center mb-1">
                                    <div
                                        className="w-4 h-4 rounded mr-2"
                                        style={{ backgroundColor: segregationColors[segregacion] }}
                                    ></div>
                                    <span className="text-sm font-medium">{segregacion}</span>
                                </div>
                                <div className="text-lg font-bold text-gray-800">
                                    {volumenTotal.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">{porcentaje}%</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SegregationHeatmap;