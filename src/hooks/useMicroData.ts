// src/hooks/useMicroData.ts
import { useState, useEffect, useMemo } from 'react';
import type { DataSource, TimeUnit } from '../types';

// Tipos adaptados de tu vista_micro
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

export interface DistanceData {
    semana: number;
    distanciaModelo: number;
    distanciaRealSinYard: number;
    distanciaRealConYard: number;
    mejoraPorcentaje: number;
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
    distanceData?: DistanceData;
    colorMap: Record<string, string>;
}

export interface ColorStatistic {
    color: string;
    count: number;
    percentage: number;
    label?: string;
}

// Configuración adaptada de tu config.js
const CONFIG = {
    numCols: 30,
    numRows: 7,
    targetVisibleCols: 20,
    rowLabels: ['A', 'B', 'C', 'D', 'E', 'F', 'G']
};

// Función helper para generar mapa de colores HSL
const generaMapaColoresPorGrupo = (frames: MicroTimeFrame[]): Record<string, string> => {
    const gruposSet = new Set<string>();

    frames.forEach((frame) => {
        if (Array.isArray(frame.bahias)) {
            frame.bahias.forEach((b) => {
                if (b.group) gruposSet.add(b.group);
            });
        }
        if (Array.isArray(frame.contenedores)) {
            frame.contenedores.forEach((c) => {
                if (c.group) gruposSet.add(c.group);
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
    const [distanceData, setDistanceData] = useState<DistanceData | undefined>();

    // Función para cargar datos de distancias
    const loadDistanceData = async (week: number): Promise<DistanceData | undefined> => {
        try {
            // Cargar distancias del modelo
            const modelResponse = await fetch(`/data/distancias_modelo/semana_${week}.json`);
            if (!modelResponse.ok) return undefined;
            const modelData = await modelResponse.json();

            // Cargar distancias reales
            const realResponse = await fetch('/data/Distancias_reales.xlsx');
            if (!realResponse.ok) return undefined;
            // Aquí necesitarías parsear el Excel o tener los datos en JSON

            return {
                semana: week,
                distanciaModelo: modelData.distancia_total || 0,
                distanciaRealSinYard: 0, // Datos del Excel
                distanciaRealConYard: 0, // Datos del Excel
                mejoraPorcentaje: 0 // Calcular
            };
        } catch (err) {
            console.error('Error loading distance data:', err);
            return undefined;
        }
    };

    // Función principal de carga adaptada de tu dataLoader.js
    const loadTimelineData = async (): Promise<{ allTimeData: MicroTimeFrame[], colorMapByGroup: Record<string, string> }> => {
        try {
            const response = await fetch('/data/data_2022-01-03.json');
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const jsonData = await response.json();

            const patioData = jsonData.patios;
            if (!patioData) {
                throw new Error('No se encontró la propiedad "patios" en el JSON');
            }

            // Buscar el patio de forma case-insensitive
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

            // Buscar el bloque de forma case-insensitive
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

            console.log(`✅ Datos cargados exitosamente: ${matchedPatioKey}/${matchedBloqueKey} - ${allTimeData.length} frames`);

            return { allTimeData, colorMapByGroup };
        } catch (err) {
            console.error("Error en loadTimelineData:", err);
            throw err;
        }
    };

    // Función para procesar frame actual (adaptada de tu applyStateToAllContainers)
    const processCurrentFrame = (currentFrameData: MicroTimeFrame, colorMapByGroup: Record<string, string>): MicroBahiaData[] => {
        if (!currentFrameData) return [];

        const processedBahias: MicroBahiaData[] = [];

        // Crear mapas auxiliares para bahías y contenedores
        const bayDataMap = new Map();
        if (Array.isArray(currentFrameData.bahias)) {
            currentFrameData.bahias.forEach((bay) => {
                bayDataMap.set(bay.c, bay);
            });
        }

        const contDataMap = new Map();
        if (Array.isArray(currentFrameData.contenedores)) {
            currentFrameData.contenedores.forEach((c) => {
                contDataMap.set(`C-${c.r}-${c.c}`, c);
            });
        }

        // Iterar sobre todas las columnas (bahías)
        for (let c = 0; c < CONFIG.numCols; c++) {
            // Valores por defecto (del frame)
            let nuevoTexto = currentFrameData.defaultText !== undefined ? currentFrameData.defaultText : 'N/A';
            let nuevoColor = currentFrameData.defaultColor !== undefined ? currentFrameData.defaultColor : '#D3D3D3';
            let grupoAttr = null;

            // Si existe info en bahias (por índice c)
            const bayProps = bayDataMap.get(c);
            if (bayProps) {
                nuevoTexto = bayProps.text !== undefined ? bayProps.text : nuevoTexto;
                grupoAttr = bayProps.group !== undefined ? bayProps.group : grupoAttr;
            }

            // Si existe info específica para algún contenedor en esta columna
            // (tomamos el primero que encontremos para simplificar)
            for (let r = 0; r < CONFIG.numRows; r++) {
                const containerId = `C-${r}-${c}`;
                const contProps = contDataMap.get(containerId);
                if (contProps) {
                    nuevoTexto = contProps.text !== undefined ? contProps.text : nuevoTexto;
                    grupoAttr = contProps.group !== undefined ? contProps.group : grupoAttr;
                    break;
                }
            }

            // Color según grupo (si existe en el mapa)
            if (grupoAttr && colorMapByGroup[grupoAttr]) {
                nuevoColor = colorMapByGroup[grupoAttr];
            }

            processedBahias.push({
                c,
                text: nuevoTexto,
                color: nuevoColor,
                group: grupoAttr || ''
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

                if (!allTimeData || allTimeData.length === 0) {
                    throw new Error(`No se encontraron datos de turnos para ${patioId} - ${bloqueId}`);
                }

                setTimeFrames(allTimeData);
                setColorMap(colorMapByGroup);
                setCurrentFrame(0);

                // Cargar datos de distancias si es modelo Magdalena
                if (dataSource === 'modelMagdalena') {
                    const week = 3; // Por defecto semana 3, ajustar según necesidad
                    const distances = await loadDistanceData(week);
                    setDistanceData(distances);
                }

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error loading data';
                setError(errorMessage);
                setTimeFrames([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [patioId, bloqueId, dataSource]);

    // Procesar bahías del frame actual
    const processedBahias = useMemo(() => {
        if (!timeFrames[currentFrame] || !colorMap) return [];
        return processCurrentFrame(timeFrames[currentFrame], colorMap);
    }, [timeFrames, currentFrame, colorMap]);

    // Calcular estadísticas de color (adaptada de tu updateLegend)
    const colorStats = useMemo((): ColorStatistic[] => {
        if (processedBahias.length === 0) return [];

        const gruposVisibles = new Map<string, { color: string; count: number; group: string }>();

        processedBahias.forEach(bahia => {
            const key = bahia.group || bahia.color;
            const existing = gruposVisibles.get(key);
            if (existing) {
                existing.count++;
            } else {
                gruposVisibles.set(key, {
                    color: bahia.color,
                    count: 1,
                    group: bahia.group
                });
            }
        });

        const total = processedBahias.length;

        return Array.from(gruposVisibles.values())
            .map(({ color, count, group }) => ({
                color,
                count,
                percentage: Math.round((count / total) * 100),
                label: group || `Color ${color.slice(1, 4)}`
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
        distanceData,
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

// Hook para filtrar bahías
export const useFilteredMicroBahias = (
    processedBahias: MicroBahiaData[],
    filters: {
        colorFilter?: string;
        textFilter?: string;
        groupFilter?: string;
    }
) => {
    return useMemo(() => {
        if (!processedBahias) return [];

        return processedBahias.filter(bahia => {
            if (filters.colorFilter && filters.colorFilter !== 'all') {
                if (bahia.color !== filters.colorFilter) return false;
            }

            if (filters.textFilter) {
                const searchTerm = filters.textFilter.toLowerCase();
                if (!bahia.text.toLowerCase().includes(searchTerm) &&
                    !bahia.c.toString().includes(searchTerm) &&
                    !(bahia.group && bahia.group.toLowerCase().includes(searchTerm))) {
                    return false;
                }
            }

            if (filters.groupFilter && filters.groupFilter !== 'all') {
                if (bahia.group !== filters.groupFilter) return false;
            }

            return true;
        });
    }, [processedBahias, filters]);
};

export default useMicroData;