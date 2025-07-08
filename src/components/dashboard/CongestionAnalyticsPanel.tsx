// src/components/dashboard/CongestionAnalyticsPanel.tsx
import React, { useState, useMemo } from 'react';
import { usePortKPIs } from '../../hooks/usePortKPIs';
import { useTimeContext } from '../../contexts/TimeContext';
import { useViewNavigation } from '../../contexts/ViewNavigationContext';
import { useTemporalAggregation } from '../../hooks/useTemporalAggregation';
import { BarChart3 } from 'lucide-react';

// Importar los componentes separados
import { MovementTypesAnalysis } from './congestion/MovementTypesAnalysis';
import { BottleneckAnalysis } from './congestion/BottleneckAnalysis';
import { ControlChartsAnalysis } from './congestion/ControlChartsAnalysis';

// Importar los tipos (puedes moverlos a un archivo types.ts separado)
interface PercentileData {
    label: string;
    p50: number;
    p70: number;
    p90: number;
    p95: number;
    max: number;
    current: number;
}

interface MovementTypeAnalysis {
    hora: string;
    productivos: number;
    noProductivos: number;
    reacomodosBloque: number;
    entreBloques: number;
    entrePatios: number;
    total: number;
}

interface CongestionPattern {
    dayOfWeek: string;
    hourOfDay: number;
    avgCongestion: number;
    peakCongestion: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface BottleneckAnalysisData {
    location: 'gate' | 'muelle' | 'patio' | 'organizacion';
    severity: number;
    indicators: string[];
    recommendation: string;
}

interface CongestionAnalyticsPanelProps {
    patioFilter?: string;
    bloqueFilter?: string;
}

export const CongestionAnalyticsPanel: React.FC<CongestionAnalyticsPanelProps> = ({
    patioFilter,
    bloqueFilter
}) => {
    const { timeState } = useTimeContext();
    const { viewState } = useViewNavigation();
    const [selectedAnalysis, setSelectedAnalysis] = useState<'control-charts' | 'movement-types' | 'patterns' | 'bottleneck'>('movement-types');
    const [temporalGranularity, setTemporalGranularity] = useState<'hora' | 'turno' | 'dia' | 'semana'>('hora');

    // Adaptación según nivel de vista
    const currentLevel = viewState.level;
    const currentPatio = viewState.selectedPatio || patioFilter;
    const currentBloque = viewState.selectedBloque || bloqueFilter;

    const {
        currentKPIs,
        historicalData,
        isLoading,
        error
    } = usePortKPIs({
        patioFilter: currentPatio,
        bloqueFilter: currentBloque
    });

    // Hook para agregaciones temporales
    const temporalData = useTemporalAggregation(historicalData, currentBloque, currentPatio);

    // Análisis de cuellos de botella
    const bottleneckAnalysis = useMemo((): BottleneckAnalysisData[] => {
        if (!currentKPIs || !historicalData || historicalData.length === 0) return [];

        const analyses: BottleneckAnalysisData[] = [];

        // Análisis del Gate
        const flujoGate = currentKPIs.flujoPromedioGates || 0;
        const ocupacion = currentKPIs.utilizacionPorVolumen || 0;
        const balanceFlujo = currentKPIs.balanceFlujo || 0;

        if (flujoGate > 40 && ocupacion < 70) {
            analyses.push({
                location: 'gate',
                severity: 80,
                indicators: [
                    `Alto flujo en gates (${flujoGate.toFixed(1)} cont/h)`,
                    `Ocupación bajo el umbral crítico (${ocupacion.toFixed(1)}%)`,
                    'El gate está procesando muchos contenedores'
                ],
                recommendation: 'El cuello de botella está en el GATE. Considerar abrir más carriles o extender horarios.'
            });
        }

        // Análisis del Muelle
        const flujoMuelle = historicalData.reduce((sum, d) =>
            sum + d.muelleEntradaContenedores + d.muelleSalidaContenedores, 0
        ) / historicalData.length;

        if (flujoMuelle < 10 && flujoGate > 20) {
            analyses.push({
                location: 'muelle',
                severity: 60,
                indicators: [
                    `Bajo flujo en muelle (${flujoMuelle.toFixed(1)} cont/h)`,
                    'Gates activos pero muelle lento',
                    'Posible falta de naves o grúas'
                ],
                recommendation: 'El cuello de botella está en el MUELLE. Revisar programación de naves y disponibilidad de grúas.'
            });
        }

        // Análisis del Patio
        if (ocupacion > 70) {
            analyses.push({
                location: 'patio',
                severity: ocupacion > 85 ? 90 : 75,
                indicators: [
                    `Ocupación sobre umbral operativo (${ocupacion.toFixed(1)}%)`,
                    ocupacion > 70 && ocupacion <= 85 ?
                        'Aumentan significativamente los reacomodos' :
                        'Espacio crítico para operaciones',
                    `Balance de flujo: ${balanceFlujo.toFixed(2)}`
                ],
                recommendation: ocupacion > 85 ?
                    'El cuello de botella está en el PATIO. Urgente acelerar salidas y optimizar espacios.' :
                    'Ocupación elevada. Los reacomodos están aumentando según estándar de San Antonio.'
            });
        }

        // Análisis de Organización
        const indiceReacomodo = currentKPIs.indiceRemanejo || 0;
        if (indiceReacomodo > 5 && ocupacion > 70) {
            analyses.push({
                location: 'organizacion',
                severity: 70,
                indicators: [
                    `Alto índice de reacomodos (${indiceReacomodo.toFixed(1)}%)`,
                    'Muchos movimientos improductivos',
                    'Desorganización en la ubicación de contenedores'
                ],
                recommendation: 'El cuello de botella está en la ORGANIZACIÓN. Implementar mejor estrategia de apilamiento.'
            });
        }

        return analyses.sort((a, b) => b.severity - a.severity);
    }, [currentKPIs, historicalData]);

    // Calcular percentiles para control charts
    const percentileAnalysis = useMemo((): PercentileData[] => {
        if (!historicalData || historicalData.length === 0) return [];

        const metrics = {
            flujoGates: [] as number[],
            utilizacion: [] as number[],
            reacomodos: [] as number[],
            tiempoPermanencia: [] as number[],
            congestionHoraria: [] as number[]
        };

        historicalData.forEach(data => {
            const flujo = (data.gateEntradaContenedores + data.gateSalidaContenedores);
            metrics.flujoGates.push(flujo);

            const utilizacion = (data.promedioTeus / 16254) * 100;
            metrics.utilizacion.push(utilizacion);

            const reacomodosTotales = data.remanejosContenedores +
                (data.patioEntradaContenedores + data.patioSalidaContenedores) +
                (data.terminalEntradaContenedores + data.terminalSalidaContenedores);
            metrics.reacomodos.push(reacomodosTotales);

            const totalMovimientos = flujo + data.muelleEntradaContenedores +
                data.muelleSalidaContenedores + reacomodosTotales;
            metrics.congestionHoraria.push(totalMovimientos);
        });

        const calculatePercentile = (arr: number[], p: number): number => {
            if (arr.length === 0) return 0;
            const sorted = [...arr].sort((a, b) => a - b);
            const index = (p / 100) * (sorted.length - 1);
            const lower = Math.floor(index);
            const upper = Math.ceil(index);
            const weight = index % 1;
            return sorted[lower] * (1 - weight) + sorted[upper] * weight;
        };

        return [
            {
                label: 'Flujo en Gates (cont/h)',
                p50: calculatePercentile(metrics.flujoGates, 50),
                p70: calculatePercentile(metrics.flujoGates, 70),
                p90: calculatePercentile(metrics.flujoGates, 90),
                p95: calculatePercentile(metrics.flujoGates, 95),
                max: Math.max(...metrics.flujoGates),
                current: currentKPIs?.flujoPromedioGates || 0
            },
            {
                label: 'Utilización (%)',
                p50: calculatePercentile(metrics.utilizacion, 50),
                p70: calculatePercentile(metrics.utilizacion, 70),
                p90: calculatePercentile(metrics.utilizacion, 90),
                p95: calculatePercentile(metrics.utilizacion, 95),
                max: Math.max(...metrics.utilizacion),
                current: currentKPIs?.utilizacionPorVolumen || 0
            },
            {
                label: 'Reacomodos Totales (cont)',
                p50: calculatePercentile(metrics.reacomodos, 50),
                p70: calculatePercentile(metrics.reacomodos, 70),
                p90: calculatePercentile(metrics.reacomodos, 90),
                p95: calculatePercentile(metrics.reacomodos, 95),
                max: Math.max(...metrics.reacomodos),
                current: currentKPIs?.totalRemanejos || 0
            },
            {
                label: 'Congestión Total (mov/h)',
                p50: calculatePercentile(metrics.congestionHoraria, 50),
                p70: calculatePercentile(metrics.congestionHoraria, 70),
                p90: calculatePercentile(metrics.congestionHoraria, 90),
                p95: calculatePercentile(metrics.congestionHoraria, 95),
                max: Math.max(...metrics.congestionHoraria),
                current: currentKPIs?.totalMovimientos || 0
            }
        ];
    }, [historicalData, currentKPIs]);

    // Análisis por tipo de movimiento
    // Análisis por tipo de movimiento
    const movementTypeAnalysis = useMemo((): MovementTypeAnalysis[] => {
        if (!historicalData || historicalData.length === 0) return [];

        let filteredData = historicalData;

        // Filtrar por nivel (bloque/patio)
        if (currentLevel === 'bloque' && currentBloque) {
            filteredData = historicalData.filter(d => d.bloque === currentBloque);
        } else if (currentLevel === 'patio' && currentPatio) {
            const patioPrefix = currentPatio === 'costanera' ? 'C' :
                currentPatio === 'ohiggins' ? 'H' : 'T';
            filteredData = historicalData.filter(d => d.bloque.startsWith(patioPrefix));
        }

        // Si estamos en modo turno, filtrar por las horas del turno actual
        if (timeState.unit === 'shift') {
            const currentHour = timeState.currentDate.getHours();
            let shiftStart, shiftEnd;

            // Determinar el turno actual
            if (currentHour >= 8 && currentHour < 16) {
                shiftStart = 8;
                shiftEnd = 16;
            } else if (currentHour >= 16 && currentHour < 24) {
                shiftStart = 16;
                shiftEnd = 24;
            } else {
                shiftStart = 0;
                shiftEnd = 8;
            }

            // Filtrar datos por las horas del turno
            filteredData = filteredData.filter(data => {
                const hour = new Date(data.hora).getHours();
                if (shiftStart === 0) {
                    // Turno 3: incluir horas 0-7
                    return hour >= 0 && hour < 8;
                } else {
                    return hour >= shiftStart && hour < shiftEnd;
                }
            });

            console.log('DEBUG CongestionAnalytics - Shift filtering:', {
                turno: shiftStart === 0 ? 3 : (shiftStart === 8 ? 1 : 2),
                shiftStart,
                shiftEnd,
                originalCount: historicalData.length,
                filteredCount: filteredData.length
            });
        }

        const hourlyData = new Map<number, MovementTypeAnalysis>();

        // Inicializar solo las horas relevantes según el contexto
        if (timeState.unit === 'shift') {
            const currentHour = timeState.currentDate.getHours();
            let startHour, endHour;

            if (currentHour >= 8 && currentHour < 16) {
                startHour = 8;
                endHour = 16;
            } else if (currentHour >= 16 && currentHour < 24) {
                startHour = 16;
                endHour = 24;
            } else {
                startHour = 0;
                endHour = 8;
            }

            for (let hour = startHour; hour < endHour; hour++) {
                hourlyData.set(hour, {
                    hora: `${hour}:00`,
                    productivos: 0,
                    noProductivos: 0,
                    reacomodosBloque: 0,
                    entreBloques: 0,
                    entrePatios: 0,
                    total: 0
                });
            }
        } else {
            // Para otros modos, inicializar las 24 horas
            for (let hour = 0; hour < 24; hour++) {
                hourlyData.set(hour, {
                    hora: `${hour}:00`,
                    productivos: 0,
                    noProductivos: 0,
                    reacomodosBloque: 0,
                    entreBloques: 0,
                    entrePatios: 0,
                    total: 0
                });
            }
        }

        // Procesar los datos filtrados
        filteredData.forEach(data => {
            const hour = new Date(data.hora).getHours();
            const hourData = hourlyData.get(hour);

            if (!hourData) return;

            const productivos = (data.gateEntradaContenedores || 0) +
                (data.gateSalidaContenedores || 0) +
                (data.muelleEntradaContenedores || 0) +
                (data.muelleSalidaContenedores || 0);

            const reacomodosBloque = data.remanejosContenedores || 0;
            const entreBloques = (data.patioEntradaContenedores || 0) +
                (data.patioSalidaContenedores || 0);
            const entrePatios = (data.terminalEntradaContenedores || 0) +
                (data.terminalSalidaContenedores || 0);
            const noProductivos = reacomodosBloque + entreBloques + entrePatios;

            hourData.productivos += productivos;
            hourData.noProductivos += noProductivos;
            hourData.reacomodosBloque += reacomodosBloque;
            hourData.entreBloques += entreBloques;
            hourData.entrePatios += entrePatios;
            hourData.total += productivos + noProductivos;
        });

        return Array.from(hourlyData.values())
            .filter(h => h.total > 0 || timeState.unit === 'shift') // En modo turno, mostrar todas las horas aunque estén vacías
            .sort((a, b) => parseInt(a.hora) - parseInt(b.hora));
    }, [historicalData, currentLevel, currentBloque, currentPatio, timeState.unit, timeState.currentDate]);


    if (isLoading) {
        return (
            <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700">
                <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                    <span className="text-slate-400">Cargando análisis avanzado...</span>
                </div>
            </div>
        );
    }

    if (error || !currentKPIs) {
        return null;
    }

    // Título adaptativo según nivel
    const getTitleByLevel = () => {
        switch (currentLevel) {
            case 'terminal':
                return 'Análisis de Congestión - Terminal Completo';
            case 'patio':
                return `Análisis de Congestión - Patio ${currentPatio?.charAt(0).toUpperCase()}${currentPatio?.slice(1)}`;
            case 'bloque':
                return `Análisis de Congestión - Bloque ${currentBloque}`;
            default:
                return 'Análisis Avanzado de Congestión';
        }
    };

    return (
        <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700">
            {/* Header */}
            <div className="p-6 border-b border-slate-700">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100 flex items-center">
                            <BarChart3 className="mr-2 text-cyan-400" size={24} />
                            {getTitleByLevel()}
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            Control charts, percentiles y patrones de movimiento
                            {currentLevel === 'bloque' && temporalGranularity === 'hora' && (
                                <span className="text-yellow-400 ml-2">
                                    (valores únicos por hora, no promedios)
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setSelectedAnalysis('movement-types')}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${selectedAnalysis === 'movement-types'
                                ? 'bg-cyan-500 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                        >
                            Tipos de Movimiento
                        </button>
                        <button
                            onClick={() => setSelectedAnalysis('control-charts')}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${selectedAnalysis === 'control-charts'
                                ? 'bg-cyan-500 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                        >
                            Control Charts
                        </button>
                        <button
                            onClick={() => setSelectedAnalysis('bottleneck')}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${selectedAnalysis === 'bottleneck'
                                ? 'bg-cyan-500 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                        >
                            Cuellos de Botella
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Análisis por Tipo de Movimiento */}
                {selectedAnalysis === 'movement-types' && (
                    <MovementTypesAnalysis
                        temporalGranularity={temporalGranularity}
                        currentLevel={currentLevel}
                        currentBloque={currentBloque}
                        movementTypeAnalysis={movementTypeAnalysis}
                        temporalData={temporalData}
                        historicalData={historicalData}
                        currentKPIs={currentKPIs}
                    />
                )}

                {/* Análisis de Cuellos de Botella */}
                {selectedAnalysis === 'bottleneck' && (
                    <BottleneckAnalysis
                        currentLevel={currentLevel}
                        currentPatio={currentPatio}
                        currentBloque={currentBloque}
                        bottleneckAnalysis={bottleneckAnalysis}
                    />
                )}

                {/* Control Charts con Percentiles */}
                {selectedAnalysis === 'control-charts' && (
                    <ControlChartsAnalysis
                        currentLevel={currentLevel}
                        currentBloque={currentBloque}
                        percentileAnalysis={percentileAnalysis}
                    />
                )}

            </div>

            {/* Footer con información contextual */}
            <div className="px-6 pb-4 border-t border-slate-700 mt-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                    <div>
                        Análisis basado en {historicalData.length} registros
                        {currentLevel !== 'terminal' && (
                            <span> filtrados para {currentLevel === 'patio' ? currentPatio : currentBloque}</span>
                        )}
                    </div>
                    <div>
                        Última actualización: {new Date().toLocaleTimeString('es-CL', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};