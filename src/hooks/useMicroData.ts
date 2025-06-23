// src/hooks/useMicroData.ts - VERSIÓN SIMPLIFICADA PARA MAGDALENA
import { useState, useEffect, useMemo } from 'react';
import { useTimeContext } from '../contexts/TimeContext';
import type { DataSource, TimeUnit } from '../types';

// Tipos (mantener los mismos)
export interface MicroBahiaData {
    c: number;
    text: string;
    color: string;
    group: string;
}

export interface MicroTimeFrame {
    timeLabel: string;
    defaultText: string;
    defaultColor: string;
    bahias?: MicroBahiaData[];
    contenedores?: Array<{ r: number; c: number; text: string; color: string; group: string }>;
}

export interface MicroDataResult {
    timeFrames: MicroTimeFrame[];
    isLoading: boolean;
    error: string | null;
    colorStats: ColorStatistic[];
    totalBahias: number;
    currentFrame: number;
    setCurrentFrame: (frame: number) => void;
    processedBahias: MicroBahiaData[];
    colorMap: Record<string, string>;
}

export interface ColorStatistic {
    color: string;
    count: number;
    percentage: number;
    label?: string;
}

const CONFIG = {
    numCols: 30,
    numRows: 7,
    targetVisibleCols: 20,
    rowLabels: ['A', 'B', 'C', 'D', 'E', 'F', 'G']
};

// Función helper para generar mapa de colores
const generaMapaColoresPorGrupo = (frames: MicroTimeFrame[]): Record<string, string> => {
    const gruposSet = new Set<string>();

    frames.forEach((frame) => {
        if (Array.isArray(frame.bahias)) {
            frame.bahias.forEach((b) => {
                if (b.group) gruposSet.add(b.group);
            });
        }
    });

    const gruposArr = Array.from(gruposSet);
    const mapa: Record<string, string> = {};
    gruposArr.forEach((grp, idx) => {
        const hue = Math.round((idx * 360) / gruposArr.length) % 360;
        mapa[grp] = `hsl(${hue}, 60%, 70%)`;
    });
    return mapa;
};

export const useMicroData = (
    patioId: string,
    bloqueId: string,
    dataSource: DataSource,
    timeUnit: TimeUnit
): MicroDataResult => {
    const [timeFrames, setTimeFrames] = useState<MicroTimeFrame[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [colorMap, setColorMap] = useState<Record<string, string>>({});

    const { timeState } = useTimeContext();

    // Función principal de carga
    const loadTimelineData = async (): Promise<{ allTimeData: MicroTimeFrame[], colorMapByGroup: Record<string, string> }> => {
        try {
            // SIMPLIFICADO: Para Magdalena, leer del mismo JSON pero buscar datos específicos de Magdalena
            if (dataSource === 'modelMagdalena') {
                console.log('📊 Cargando datos de Magdalena desde JSON...');
                
                // Intentar cargar desde un JSON específico de Magdalena primero
                let response = await fetch('/data/data_magdalena.json');
                
                // Si no existe, usar el JSON general
                if (!response.ok) {
                    console.log('📊 No se encontró data_magdalena.json, usando data_bahias.json...');
                    response = await fetch('/data/data_bahias.json');
                }

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const jsonData = await response.json();
                
                // Buscar datos en la estructura del JSON
                const patioData = jsonData.patios;
                if (!patioData) {
                    throw new Error('No se encontró la propiedad "patios" en el JSON');
                }

                // Buscar el patio
                const patioKeys = Object.keys(patioData);
                const matchedPatioKey = patioKeys.find(key =>
                    key.toLowerCase() === patioId.toLowerCase()
                );

                if (!matchedPatioKey) {
                    // Si no hay datos, crear frames vacíos para Magdalena
                    const allTimeData: MicroTimeFrame[] = [];
                    for (let i = 1; i <= 21; i++) {
                        allTimeData.push({
                            timeLabel: `${i}`,
                            defaultText: '',
                            defaultColor: '#FFFFFF',
                            bahias: []
                        });
                    }
                    return { allTimeData, colorMapByGroup: {} };
                }

                const patio = patioData[matchedPatioKey];
                if (!patio.bloques) {
                    throw new Error(`No se encontraron bloques en el patio '${matchedPatioKey}'`);
                }

                // Buscar el bloque
                const bloqueKeys = Object.keys(patio.bloques);
                const matchedBloqueKey = bloqueKeys.find(key =>
                    key.toLowerCase() === bloqueId.toLowerCase()
                );

                if (!matchedBloqueKey) {
                    // Si no hay datos del bloque, crear frames vacíos
                    const allTimeData: MicroTimeFrame[] = [];
                    for (let i = 1; i <= 21; i++) {
                        allTimeData.push({
                            timeLabel: `${i}`,
                            defaultText: '',
                            defaultColor: '#FFFFFF',
                            bahias: []
                        });
                    }
                    return { allTimeData, colorMapByGroup: {} };
                }

                const allTimeData = patio.bloques[matchedBloqueKey];

                if (!Array.isArray(allTimeData) || allTimeData.length === 0) {
                    // Crear 21 frames vacíos para Magdalena
                    const frames: MicroTimeFrame[] = [];
                    for (let i = 1; i <= 21; i++) {
                        frames.push({
                            timeLabel: `${i}`,
                            defaultText: '',
                            defaultColor: '#FFFFFF',
                            bahias: []
                        });
                    }
                    return { allTimeData: frames, colorMapByGroup: {} };
                }

                // Si hay datos, asegurarse de que haya 21 frames
                while (allTimeData.length < 21) {
                    allTimeData.push({
                        timeLabel: `${allTimeData.length + 1}`,
                        defaultText: '',
                        defaultColor: '#FFFFFF',
                        bahias: []
                    });
                }

                const colorMapByGroup = generaMapaColoresPorGrupo(allTimeData);

                console.log(`✅ Datos Magdalena cargados desde JSON: ${allTimeData.length} frames`);
                return { allTimeData, colorMapByGroup };
            }
            
            // Para datos históricos, mantener la lógica original
            if (dataSource === 'historical') {
                const response = await fetch('/data/data_2022-01-03');
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                const jsonData = await response.json();

                const patioData = jsonData.patios;
                if (!patioData) {
                    throw new Error('No se encontró la propiedad "patios" en el JSON');
                }

                const patioKeys = Object.keys(patioData);
                const matchedPatioKey = patioKeys.find(key =>
                    key.toLowerCase() === patioId.toLowerCase()
                );

                if (!matchedPatioKey) {
                    throw new Error(
                        `Patio '${patioId}' no encontrado. Patios disponibles: ${patioKeys.join(', ')}`
                    );
                }

                const patio = patioData[matchedPatioKey];
                if (!patio.bloques) {
                    throw new Error(`No se encontraron bloques en el patio '${matchedPatioKey}'`);
                }

                const bloqueKeys = Object.keys(patio.bloques);
                const matchedBloqueKey = bloqueKeys.find(key =>
                    key.toLowerCase() === bloqueId.toLowerCase()
                );

                if (!matchedBloqueKey) {
                    throw new Error(
                        `Bloque '${bloqueId}' no encontrado en patio '${matchedPatioKey}'. Bloques disponibles: ${bloqueKeys.join(', ')}`
                    );
                }

                const allTimeData = patio.bloques[matchedBloqueKey];

                if (!Array.isArray(allTimeData)) {
                    throw new Error(
                        `Los datos del bloque '${matchedBloqueKey}' no son un array válido`
                    );
                }

                if (allTimeData.length === 0) {
                    throw new Error(
                        `No hay frames de tiempo para el bloque '${matchedBloqueKey}'`
                    );
                }

                const colorMapByGroup = generaMapaColoresPorGrupo(allTimeData);

                console.log(`✅ Datos históricos cargados: ${matchedPatioKey}/${matchedBloqueKey} - ${allTimeData.length} frames`);

                return { allTimeData, colorMapByGroup };
            }
            
            // Para otros modelos
            console.log(`⚠️ Vista micro no implementada para: ${dataSource}`);
            return { 
                allTimeData: [], 
                colorMapByGroup: {} 
            };

        } catch (err) {
            console.error("Error en loadTimelineData:", err);
            throw err;
        }
    };

    // Función para procesar frame actual
    const processCurrentFrame = (currentFrameData: MicroTimeFrame, colorMapByGroup: Record<string, string>): MicroBahiaData[] => {
        if (!currentFrameData) return [];

        const processedBahias: MicroBahiaData[] = [];

        // Si ya hay bahías procesadas, usarlas directamente
        if (Array.isArray(currentFrameData.bahias) && currentFrameData.bahias.length > 0) {
            return currentFrameData.bahias;
        }

        // Procesar según formato antiguo (compatibilidad)
        const bayDataMap = new Map();
        if (Array.isArray(currentFrameData.bahias)) {
            currentFrameData.bahias.forEach((bay) => {
                bayDataMap.set(bay.c, bay);
            });
        }

        // Iterar sobre todas las columnas
        for (let c = 0; c < CONFIG.numCols; c++) {
            let nuevoTexto = currentFrameData.defaultText || '';
            let nuevoColor = currentFrameData.defaultColor || '#FFFFFF';
            let grupoAttr = '';

            const bayProps = bayDataMap.get(c);
            if (bayProps) {
                nuevoTexto = bayProps.text || nuevoTexto;
                nuevoColor = bayProps.color || nuevoColor;
                grupoAttr = bayProps.group || grupoAttr;
            }

            // Aplicar color del grupo si existe
            if (grupoAttr && colorMapByGroup[grupoAttr]) {
                nuevoColor = colorMapByGroup[grupoAttr];
            }

            processedBahias.push({
                c,
                text: nuevoTexto,
                color: nuevoColor,
                group: grupoAttr
            });
        }

        return processedBahias;
    };

    // Efecto de carga
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const { allTimeData, colorMapByGroup } = await loadTimelineData();

                setTimeFrames(allTimeData);
                setColorMap(colorMapByGroup);
                setCurrentFrame(0);

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error loading data';
                setError(errorMessage);
                setTimeFrames([]);
                
                // Para Magdalena, no es error crítico si no hay datos
                if (dataSource === 'modelMagdalena') {
                    setError(null);
                    const emptyFrames: MicroTimeFrame[] = [];
                    for (let i = 1; i <= 21; i++) {
                        emptyFrames.push({
                            timeLabel: `${i}`,
                            defaultText: '',
                            defaultColor: '#FFFFFF',
                            bahias: []
                        });
                    }
                    setTimeFrames(emptyFrames);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [patioId, bloqueId, dataSource]);

    // Procesar bahías del frame actual
    const processedBahias = useMemo(() => {
        if (!timeFrames[currentFrame]) return [];
        return processCurrentFrame(timeFrames[currentFrame], colorMap);
    }, [timeFrames, currentFrame, colorMap]);

    // Calcular estadísticas de color
    const colorStats = useMemo((): ColorStatistic[] => {
        if (processedBahias.length === 0) return [];

        const gruposVisibles = new Map<string, { color: string; count: number; group: string }>();

        processedBahias.forEach(bahia => {
            if (bahia.group) {
                const existing = gruposVisibles.get(bahia.group);
                if (existing) {
                    existing.count++;
                } else {
                    gruposVisibles.set(bahia.group, {
                        color: bahia.color,
                        count: 1,
                        group: bahia.group
                    });
                }
            }
        });

        const total = 30;

        return Array.from(gruposVisibles.values())
            .map(({ color, count, group }) => ({
                color,
                count,
                percentage: Math.round((count / total) * 100),
                label: group
            }))
            .sort((a, b) => b.count - a.count);

    }, [processedBahias]);

    return {
        timeFrames,
        isLoading,
        error,
        colorStats,
        totalBahias: CONFIG.numCols,
        currentFrame,
        setCurrentFrame: (frame: number) => {
            if (frame >= 0 && frame < timeFrames.length) {
                setCurrentFrame(frame);
            }
        },
        processedBahias,
        colorMap
    };
};

// Hook auxiliar para obtener frame actual
export const useCurrentMicroFrame = (
    microData: MicroDataResult
): MicroTimeFrame | null => {
    return useMemo(() => {
        if (microData.timeFrames.length === 0) return null;
        return microData.timeFrames[microData.currentFrame] || null;
    }, [microData.timeFrames, microData.currentFrame]);
};

export default useMicroData;