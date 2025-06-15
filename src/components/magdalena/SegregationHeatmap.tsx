import React, { useMemo, useState } from 'react';
import { useMagdalenaData } from '../../hooks/useMagdalenaData';
import { useTimeContext } from '../../contexts/TimeContext';
import {
    Activity,
    BarChart3,
    Clock,
    Layers,
    AlertCircle,
    TrendingUp,
    Package,
    Grid3X3,
    Info,
    ChevronRight,
    Maximize2,
    Minimize2
} from 'lucide-react';

interface HeatmapCellProps {
    segregacion: string;
    bloque: string;
    periodo: number;
    volumen: number;
    maxVolumen: number;
    color: string;
    onClick?: () => void;
}

const HeatmapCell: React.FC<HeatmapCellProps> = ({
    segregacion,
    bloque,
    periodo,
    volumen,
    maxVolumen,
    color,
    onClick
}) => {
    const intensity = maxVolumen > 0 ? volumen / maxVolumen : 0;

    // Escala de intensidad más visible
    const bgOpacity = Math.max(0.1, intensity);
    const textColor = intensity > 0.5 ? 'white' : color;

    return (
        <div
            className="relative group cursor-pointer transition-all duration-200 hover:scale-110 hover:z-10"
            style={{
                backgroundColor: volumen > 0 ? color : '#F9FAFB',
                opacity: volumen > 0 ? bgOpacity : 1,
                minHeight: '32px',
                minWidth: '32px'
            }}
            onClick={onClick}
        >
            {volumen > 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span
                        className="text-xs font-bold"
                        style={{ color: textColor }}
                    >
                        {volumen}
                    </span>
                </div>
            )}

            {/* Tooltip mejorado */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                <div className="font-bold">{segregacion} → {bloque}</div>
                <div>Período {periodo}: {volumen} mov.</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
        </div>
    );
};

interface SegregationSummaryCardProps {
    segregacion: string;
    color: string;
    volumen: number;
    porcentaje: string;
    bloques: number;
    selected?: boolean;
    onClick?: () => void;
}

const SegregationSummaryCard: React.FC<SegregationSummaryCardProps> = ({
    segregacion,
    color,
    volumen,
    porcentaje,
    bloques,
    selected = false,
    onClick
}) => {
    return (
        <div
            className={`bg-white rounded-lg p-4 border-2 cursor-pointer transition-all duration-200 ${selected
                ? 'border-purple-500 shadow-lg scale-105'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                    <div
                        className="w-6 h-6 rounded-full mr-2"
                        style={{ backgroundColor: color }}
                    ></div>
                    <span className="font-bold text-lg">{segregacion}</span>
                </div>
                <ChevronRight size={16} className={`text-gray-400 transition-transform ${selected ? 'rotate-90' : ''}`} />
            </div>

            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Movimientos</span>
                    <span className="font-bold text-lg">{volumen.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Porcentaje</span>
                    <span className="font-semibold text-purple-600">{porcentaje}%</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bloques</span>
                    <span className="font-medium">{bloques}</span>
                </div>
            </div>

            {/* Barra de progreso visual */}
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                        width: `${porcentaje}%`,
                        backgroundColor: color
                    }}
                ></div>
            </div>
        </div>
    );
};

export const SegregationHeatmap: React.FC = () => {
    const { timeState } = useTimeContext();
    const [selectedSegregation, setSelectedSegregation] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'compact' | 'expanded'>('compact');

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

        // Calcular estadísticas por segregación
        const segregationStats: {
            [key: string]: {
                volumen: number;
                bloques: Set<string>;
                periodos: Set<number>;
            }
        } = {};

        segregaciones.forEach(seg => {
            segregationStats[seg] = {
                volumen: 0,
                bloques: new Set(),
                periodos: new Set()
            };
        });

        data.forEach(item => {
            if (segregationStats[item.segregacion]) {
                segregationStats[item.segregacion].volumen += item.volumen;
                segregationStats[item.segregacion].bloques.add(item.bloque);
                segregationStats[item.segregacion].periodos.add(item.periodo);
            }
        });

        return {
            segregaciones,
            bloques,
            periodos,
            maxVolumen,
            matrix: heatmapMatrix,
            totalMovimientos: data.reduce((sum, item) => sum + item.volumen, 0),
            segregationStats
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

    // Filtrar datos según segregación seleccionada
    const filteredSegregaciones = selectedSegregation
        ? [selectedSegregation]
        : heatmapData.segregaciones;

    // Períodos a mostrar según el modo de vista
    const periodosToShow = viewMode === 'compact'
        ? heatmapData.periodos.slice(0, 12)
        : heatmapData.periodos;

    return (
        <div className="space-y-6">
            {/* Header mejorado */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                            <Grid3X3 size={28} className="mr-3 text-purple-600" />
                            Análisis de Segregaciones por Bloque
                        </h2>
                        <p className="text-gray-600 mt-1">
                            Visualización del flujo de contenedores por segregación y período temporal
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">
                            {heatmapData.totalMovimientos.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Movimientos totales</div>
                    </div>
                </div>

                {/* KPIs principales */}
                <div className="grid grid-cols-4 gap-4 mt-6">
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                        <div className="flex items-center justify-between">
                            <Layers size={20} className="text-purple-500" />
                            <span className="text-2xl font-bold">{heatmapData.segregaciones.length}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Segregaciones activas</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center justify-between">
                            <Package size={20} className="text-blue-500" />
                            <span className="text-2xl font-bold">{heatmapData.bloques.length}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Bloques utilizados</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                        <div className="flex items-center justify-between">
                            <Clock size={20} className="text-green-500" />
                            <span className="text-2xl font-bold">{heatmapData.periodos.length}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Períodos analizados</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-amber-200">
                        <div className="flex items-center justify-between">
                            <TrendingUp size={20} className="text-amber-500" />
                            <span className="text-2xl font-bold">
                                {Math.round(heatmapData.totalMovimientos / heatmapData.periodos.length)}
                            </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Promedio/período</div>
                    </div>
                </div>
            </div>

            {/* Resumen por Segregación - Tarjetas interactivas */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <BarChart3 size={20} className="mr-2 text-blue-500" />
                        Resumen por Segregación
                    </h3>
                    {selectedSegregation && (
                        <button
                            onClick={() => setSelectedSegregation(null)}
                            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                            Ver todas las segregaciones
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {heatmapData.segregaciones.map(segregacion => {
                        const stats = heatmapData.segregationStats[segregacion];
                        const porcentaje = heatmapData.totalMovimientos > 0
                            ? ((stats.volumen / heatmapData.totalMovimientos) * 100).toFixed(1)
                            : '0.0';

                        return (
                            <SegregationSummaryCard
                                key={segregacion}
                                segregacion={segregacion}
                                color={segregationColors[segregacion]}
                                volumen={stats.volumen}
                                porcentaje={porcentaje}
                                bloques={stats.bloques.size}
                                selected={selectedSegregation === segregacion}
                                onClick={() => setSelectedSegregation(
                                    selectedSegregation === segregacion ? null : segregacion
                                )}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Heatmap Principal Mejorado */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                            Matriz de Distribución Temporal
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {selectedSegregation
                                ? `Mostrando segregación ${selectedSegregation}`
                                : 'Mostrando todas las segregaciones'
                            }
                        </p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-600 flex items-center">
                            <Info size={16} className="mr-1" />
                            Intensidad: 0 - {heatmapData.maxVolumen} mov.
                        </div>
                        <button
                            onClick={() => setViewMode(viewMode === 'compact' ? 'expanded' : 'compact')}
                            className="flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                            {viewMode === 'compact' ? (
                                <>
                                    <Maximize2 size={16} className="mr-1" />
                                    Expandir
                                </>
                            ) : (
                                <>
                                    <Minimize2 size={16} className="mr-1" />
                                    Compactar
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Heatmap con scroll mejorado */}
                <div className="overflow-auto border border-gray-200 rounded-lg" style={{ maxHeight: '600px' }}>
                    <div className="min-w-max">
                        {/* Header de períodos */}
                        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 flex">
                            <div className="sticky left-0 bg-gray-100 w-32 p-3 text-sm font-semibold text-gray-700 border-r border-gray-200">
                                Segregación / Bloque
                            </div>
                            {periodosToShow.map(periodo => (
                                <div key={periodo} className="w-12 p-2 text-xs font-medium text-gray-700 text-center border-r border-gray-100">
                                    P{periodo}
                                </div>
                            ))}
                            {viewMode === 'compact' && heatmapData.periodos.length > 12 && (
                                <div className="w-16 p-2 text-xs font-medium text-gray-500 text-center">
                                    +{heatmapData.periodos.length - 12} más
                                </div>
                            )}
                        </div>

                        {/* Filas del heatmap */}
                        {filteredSegregaciones.map(segregacion => {
                            const color = segregationColors[segregacion];
                            const bloquesConDatos = heatmapData.bloques.filter(bloque => {
                                return periodosToShow.some(periodo => {
                                    const key = `${segregacion}-${bloque}-${periodo}`;
                                    return heatmapData.matrix[key] > 0;
                                });
                            });

                            if (bloquesConDatos.length === 0) return null;

                            return (
                                <div key={segregacion} className="border-b border-gray-200">
                                    {/* Header de segregación */}
                                    <div className="sticky left-0 bg-white flex items-center p-3 border-b border-gray-100">
                                        <div
                                            className="w-4 h-4 rounded-full mr-2"
                                            style={{ backgroundColor: color }}
                                        ></div>
                                        <span className="font-semibold text-gray-800">{segregacion}</span>
                                        <span className="ml-2 text-xs text-gray-500">
                                            ({bloquesConDatos.length} bloques)
                                        </span>
                                    </div>

                                    {/* Filas de bloques */}
                                    {bloquesConDatos.map(bloque => (
                                        <div key={`${segregacion}-${bloque}`} className="flex hover:bg-gray-50">
                                            <div className="sticky left-0 bg-white w-32 p-2 text-sm text-gray-700 border-r border-gray-200 pl-8">
                                                {bloque}
                                            </div>
                                            {periodosToShow.map(periodo => {
                                                const key = `${segregacion}-${bloque}-${periodo}`;
                                                const volumen = heatmapData.matrix[key] || 0;
                                                return (
                                                    <div key={key} className="w-12 p-1 border-r border-gray-100">
                                                        <HeatmapCell
                                                            segregacion={segregacion}
                                                            bloque={bloque}
                                                            periodo={periodo}
                                                            volumen={volumen}
                                                            maxVolumen={heatmapData.maxVolumen}
                                                            color={color}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Leyenda de intensidad */}
                <div className="mt-4 flex items-center justify-center">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">Intensidad:</span>
                        <div className="flex items-center space-x-1">
                            <div className="w-8 h-4 bg-gray-100 border border-gray-300"></div>
                            <span className="text-xs text-gray-500">0</span>
                        </div>
                        <div className="flex items-center">
                            {[0.2, 0.4, 0.6, 0.8, 1].map((opacity, i) => (
                                <div
                                    key={i}
                                    className="w-8 h-4"
                                    style={{
                                        backgroundColor: '#8B5CF6',
                                        opacity: opacity
                                    }}
                                ></div>
                            ))}
                            <span className="text-xs text-gray-500 ml-1">{heatmapData.maxVolumen}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Panel de información adicional */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start">
                    <Info size={20} className="text-blue-600 mr-3 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">¿Cómo interpretar este heatmap?</p>
                        <ul className="space-y-1 ml-4 list-disc">
                            <li>Cada celda representa el volumen de movimientos para una combinación específica de segregación, bloque y período</li>
                            <li>La intensidad del color indica el volumen relativo de movimientos</li>
                            <li>Haz clic en las tarjetas de segregación para filtrar y analizar una segregación específica</li>
                            <li>Usa el botón expandir/compactar para ver más o menos períodos</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SegregationHeatmap;