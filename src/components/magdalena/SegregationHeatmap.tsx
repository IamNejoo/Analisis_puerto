// src/components/magdalena/SegregationHeatmap.tsx - VERSIÓN COMPLETA FINAL
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
    teuFactor?: number;
}

const HeatmapCell: React.FC<HeatmapCellProps> = ({
    segregacion,
    bloque,
    periodo,
    volumen,
    maxVolumen,
    color,
    onClick,
    teuFactor = 1
}) => {
    const intensity = maxVolumen > 0 ? Math.min(1, volumen / maxVolumen) : 0;
    const bgOpacity = Math.max(0.2, Math.min(1, intensity));

    // Calcular contenedores reales usando el factor TEU
    const contenedoresReales = teuFactor === 2 ? Math.round(volumen / 2) : volumen;

    return (
        <div
            className="relative group cursor-pointer transition-all duration-200 hover:scale-110 hover:z-10"
            style={{
                backgroundColor: volumen > 0 ? color : '#334155',
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
                        style={{ color: intensity > 0.5 ? 'white' : color }}
                    >
                        {contenedoresReales}
                    </span>
                </div>
            )}

            {/* Tooltip mejorado */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                <div className="font-bold">{segregacion} → {bloque}</div>
                <div>Período {periodo}: {contenedoresReales} contenedores ({volumen} TEUs)</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
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
    nombre?: string;
    teu?: number;
}

const SegregationSummaryCard: React.FC<SegregationSummaryCardProps> = ({
    segregacion,
    color,
    volumen,
    porcentaje,
    bloques,
    selected = false,
    onClick,
    nombre,
    teu
}) => {
    return (
        <div
            className={`bg-slate-800 rounded-lg p-4 border-2 cursor-pointer transition-all duration-200 ${selected
                ? 'border-cyan-500 shadow-lg scale-105'
                : 'border-slate-700 hover:border-slate-600 hover:shadow-md'
                }`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                    <div
                        className="w-6 h-6 rounded-full mr-2"
                        style={{ backgroundColor: color }}
                    ></div>
                    <span className="font-bold text-lg text-slate-50">{segregacion}</span>
                </div>
                <ChevronRight size={16} className={`text-slate-400 transition-transform ${selected ? 'rotate-90' : ''}`} />
            </div>

            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Movimientos</span>
                    <span className="font-bold text-lg text-slate-50">{volumen.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Porcentaje</span>
                    <span className="font-semibold text-cyan-400">{porcentaje}%</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Bloques</span>
                    <span className="font-medium text-slate-300">{bloques}</span>
                </div>
                {nombre && (
                    <div className="pt-2 border-t border-slate-700">
                        <p className="text-xs text-slate-400">{nombre}</p>
                        <p className="text-xs text-slate-500">{teu === 2 ? 'Contenedor 40ft' : 'Contenedor 20ft'}</p>
                    </div>
                )}
            </div>

            {/* Barra de progreso visual */}
            <div className="mt-3 w-full bg-slate-700 rounded-full h-2">
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

    // Hook llamado al nivel superior del componente
    const { magdalenaMetrics, isLoading, error } = useMagdalenaData(
        timeState.magdalenaConfig?.semana || 3,
        timeState.magdalenaConfig?.participacion || 69,
        timeState.magdalenaConfig?.conDispersion ?? true
    );

    // Procesar datos para el heatmap
    const heatmapData = useMemo(() => {
        if (!magdalenaMetrics?.segregacionesPorBloque || magdalenaMetrics.segregacionesPorBloque.length === 0) {
            console.log('⚠️ No hay datos de segregaciones por bloque');
            return null;
        }

        const data = magdalenaMetrics.segregacionesPorBloque;
        console.log('📊 Procesando', data.length, 'registros de segregaciones');

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

        const result = {
            segregaciones,
            bloques,
            periodos,
            maxVolumen,
            matrix: heatmapMatrix,
            totalMovimientos: data.reduce((sum, item) => sum + item.volumen, 0),
            segregationStats
        };

        console.log('✅ Heatmap procesado:', {
            segregaciones: result.segregaciones.length,
            bloques: result.bloques.length,
            periodos: result.periodos.length,
            totalMovimientos: result.totalMovimientos
        });

        return result;
    }, [magdalenaMetrics]);

    // Generar colores para segregaciones
    const segregationColors = useMemo(() => {
        const baseColors = [
            '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
            '#14b8a6', '#3b82f6', '#84cc16', '#f97316',
            '#ec4899', '#6366f1', '#a855f7', '#f472b6',
            '#22c55e', '#eab308', '#dc2626', '#0891b2'
        ];

        const colors: { [key: string]: string } = {};
        if (heatmapData) {
            heatmapData.segregaciones.forEach((seg, index) => {
                colors[seg] = baseColors[index % baseColors.length];
            });
        }
        return colors;
    }, [heatmapData]);

    if (isLoading) {
        return (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-700 rounded w-48"></div>
                    <div className="h-64 bg-slate-700 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !heatmapData) {
        return (
            <div className="bg-slate-800 rounded-lg border border-red-700 p-6">
                <div className="flex items-center text-red-400 mb-2">
                    <AlertCircle size={20} className="mr-2" />
                    <h3 className="font-semibold">Error en datos de segregación</h3>
                </div>
                <p className="text-sm text-red-400">
                    {error || 'No hay datos de segregaciones disponibles'}
                </p>
            </div>
        );
    }

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
            <div className="bg-gradient-to-r from-green-900/30 to-cyan-900/30 rounded-lg p-6 border border-green-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-50 flex items-center">
                            <Grid3X3 size={28} className="mr-3 text-cyan-400" />
                            Análisis de Segregaciones por Bloque
                        </h2>
                        <p className="text-slate-300 mt-1">
                            Visualización del flujo de contenedores por segregación y período temporal
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-cyan-400">
                            {heatmapData.totalMovimientos.toLocaleString()}
                        </div>
                        <div className="text-sm text-slate-400">Movimientos totales</div>
                    </div>
                </div>

                {/* KPIs principales */}
                <div className="grid grid-cols-4 gap-4 mt-6">
                    <div className="bg-slate-800 rounded-lg p-3 border border-cyan-700">
                        <div className="flex items-center justify-between">
                            <Layers size={20} className="text-cyan-400" />
                            <span className="text-2xl font-bold text-slate-50">{heatmapData.segregaciones.length}</span>
                        </div>
                        <div className="text-sm text-slate-400 mt-1">Segregaciones activas</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3 border border-blue-700">
                        <div className="flex items-center justify-between">
                            <Package size={20} className="text-blue-400" />
                            <span className="text-2xl font-bold text-slate-50">{heatmapData.bloques.length}</span>
                        </div>
                        <div className="text-sm text-slate-400 mt-1">Bloques utilizados</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3 border border-green-700">
                        <div className="flex items-center justify-between">
                            <Clock size={20} className="text-green-400" />
                            <span className="text-2xl font-bold text-slate-50">{heatmapData.periodos.length}</span>
                        </div>
                        <div className="text-sm text-slate-400 mt-1">Períodos analizados</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3 border border-amber-700">
                        <div className="flex items-center justify-between">
                            <TrendingUp size={20} className="text-amber-400" />
                            <span className="text-2xl font-bold text-slate-50">
                                {Math.round(heatmapData.totalMovimientos / heatmapData.periodos.length)}
                            </span>
                        </div>
                        <div className="text-sm text-slate-400 mt-1">Promedio/período</div>
                    </div>
                </div>
            </div>

            {/* Resumen por Segregación - Tarjetas interactivas */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-50 flex items-center">
                        <BarChart3 size={20} className="mr-2 text-cyan-400" />
                        Resumen por Segregación
                    </h3>
                    {selectedSegregation && (
                        <button
                            onClick={() => setSelectedSegregation(null)}
                            className="text-sm text-cyan-400 hover:text-cyan-300 font-medium"
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

                        const info = magdalenaMetrics?.segregacionesInfo?.[segregacion];

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
                                nombre={info?.nombre}
                                teu={info?.teu}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Heatmap Principal Mejorado */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-50">
                            Matriz de Distribución Temporal
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                            {selectedSegregation
                                ? `Mostrando segregación ${selectedSegregation}`
                                : 'Mostrando todas las segregaciones'
                            }
                        </p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-slate-400 flex items-center">
                            <Info size={16} className="mr-1" />
                            Intensidad: 0 - {heatmapData.maxVolumen} mov.
                        </div>
                        <button
                            onClick={() => setViewMode(viewMode === 'compact' ? 'expanded' : 'compact')}
                            className="flex items-center px-3 py-1 bg-cyan-950/30 text-cyan-400 rounded-lg hover:bg-cyan-900/30 transition-colors"
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
                <div className="overflow-auto border border-slate-700 rounded-lg" style={{ maxHeight: '600px' }}>
                    <div className="min-w-max">
                        {/* Header de períodos */}
                        <div className="sticky top-0 bg-slate-700 border-b border-slate-600 flex">
                            <div className="sticky left-0 bg-slate-700 w-32 p-3 text-sm font-semibold text-slate-300 border-r border-slate-600">
                                Segregación / Bloque
                            </div>
                            {periodosToShow.map(periodo => (
                                <div key={periodo} className="w-12 p-2 text-xs font-medium text-slate-300 text-center border-r border-slate-700">
                                    P{periodo}
                                </div>
                            ))}
                            {viewMode === 'compact' && heatmapData.periodos.length > 12 && (
                                <div className="w-16 p-2 text-xs font-medium text-slate-400 text-center">
                                    +{heatmapData.periodos.length - 12} más
                                </div>
                            )}
                        </div>

                        {/* Filas del heatmap */}
                        {filteredSegregaciones.map(segregacion => {
                            const color = segregationColors[segregacion];
                            const teuFactor = magdalenaMetrics?.teusPorSegregacion?.[segregacion] || 1;
                            const bloquesConDatos = heatmapData.bloques.filter(bloque => {
                                return periodosToShow.some(periodo => {
                                    const key = `${segregacion}-${bloque}-${periodo}`;
                                    return heatmapData.matrix[key] > 0;
                                });
                            });

                            if (bloquesConDatos.length === 0) return null;

                            return (
                                <div key={segregacion} className="border-b border-slate-700">
                                    {/* Header de segregación */}
                                    <div className="sticky left-0 bg-slate-800 flex items-center p-3 border-b border-slate-700">
                                        <div
                                            className="w-4 h-4 rounded-full mr-2"
                                            style={{ backgroundColor: color }}
                                        ></div>
                                        <span className="font-semibold text-slate-50">{segregacion}</span>
                                        <span className="ml-2 text-xs text-slate-400">
                                            ({bloquesConDatos.length} bloques)
                                        </span>
                                    </div>

                                    {/* Filas de bloques */}
                                    {bloquesConDatos.map(bloque => (
                                        <div key={`${segregacion}-${bloque}`} className="flex hover:bg-slate-700/50">
                                            <div className="sticky left-0 bg-slate-800 w-32 p-2 text-sm text-slate-300 border-r border-slate-700 pl-8">
                                                {bloque}
                                            </div>
                                            {periodosToShow.map(periodo => {
                                                const key = `${segregacion}-${bloque}-${periodo}`;
                                                const volumen = heatmapData.matrix[key] || 0;
                                                return (
                                                    <div key={key} className="w-12 p-1 border-r border-slate-700">
                                                        <HeatmapCell
                                                            segregacion={segregacion}
                                                            bloque={bloque}
                                                            periodo={periodo}
                                                            volumen={volumen}
                                                            maxVolumen={heatmapData.maxVolumen}
                                                            color={color}
                                                            teuFactor={teuFactor}
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
                        <span className="text-sm text-slate-400">Intensidad:</span>
                        <div className="flex items-center space-x-1">
                            <div className="w-8 h-4 bg-slate-700 border border-slate-600"></div>
                            <span className="text-xs text-slate-400">0</span>
                        </div>
                        <div className="flex items-center">
                            {[0.2, 0.4, 0.6, 0.8, 1].map((opacity, i) => (
                                <div
                                    key={i}
                                    className="w-8 h-4"
                                    style={{
                                        backgroundColor: '#06b6d4',
                                        opacity: opacity
                                    }}
                                ></div>
                            ))}
                            <span className="text-xs text-slate-400 ml-1">{heatmapData.maxVolumen}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Panel de información adicional */}
            <div className="bg-cyan-950/30 rounded-lg p-4 border border-cyan-700">
                <div className="flex items-start">
                    <Info size={20} className="text-cyan-400 mr-3 mt-0.5" />
                    <div className="text-sm text-cyan-300">
                        <p className="font-semibold mb-1">¿Cómo interpretar este heatmap?</p>
                        <ul className="space-y-1 ml-4 list-disc">
                            <li>Cada celda representa el volumen de movimientos para una combinación específica de segregación, bloque y período</li>
                            <li>La intensidad del color indica el volumen relativo de movimientos</li>
                            <li>Los números muestran contenedores reales (convertidos desde TEUs según el tipo)</li>
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