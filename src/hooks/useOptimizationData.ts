// src/hooks/useOptimizationData.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { optimizationApi } from '../services/optimizationApi';
import type { OptimizationMetrics } from '../types/optimization';
import type { TemporalFilters } from '../types/optimization'

interface OptimizationConfig {
    anio: number;
    semana: number;
    participacion: number;
    conDispersion: boolean;
}

interface BloqueDetalle {
    bahiasPorBloque: { [key: string]: { [segregacion: string]: number } };
    volumenPorBloque: { [key: string]: { [segregacion: string]: number } };
    capacidadesPorBloque: { [bloqueId: string]: number };
    teusPorSegregacion: { [segregacion: string]: number };
    segregacionesInfo: { [segregacion: string]: { descripcion: string; movimientos: number } };
    ocupacion?: {
        porBloque: Array<{
            bloque: string;
            ocupacionPromedio: number;
            ocupacionMaxima: number;
            ocupacionMinima: number;
        }>;
    };
}

interface UseOptimizationDataReturn {
    metrics: OptimizationMetrics | null;
    bloqueDetalle: BloqueDetalle | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

// Cache para almacenar datos
const metricsCache = new Map<string, OptimizationMetrics>();
const bloqueCache = new Map<string, BloqueDetalle>();

export const useOptimizationData = (
    config: OptimizationConfig,
    bloqueId?: string,
    periodo?: number,
    temporalFilters?: TemporalFilters
): UseOptimizationDataReturn => {
    const [metrics, setMetrics] = useState<OptimizationMetrics | null>(null);
    const [bloqueDetalle, setBloqueDetalle] = useState<BloqueDetalle | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);

    // Función para obtener métricas generales
    const fetchMetrics = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Cancelar petición anterior si existe
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Crear nuevo AbortController
            abortControllerRef.current = new AbortController();

            // Generar clave de cache
            const cacheKey = `${config.anio}-${config.semana}-${config.participacion}-${config.conDispersion}`;

            // Verificar cache
            if (metricsCache.has(cacheKey) && !temporalFilters) {
                console.log('✅ Usando métricas desde cache:', cacheKey);
                setMetrics(metricsCache.get(cacheKey)!);
                setIsLoading(false);
                return;
            }

            console.log('📊 Obteniendo métricas de optimización:', config);

            // Llamar al API
            const data = await optimizationApi.getDashboard(
                config.anio,
                config.semana,
                config.participacion,
                config.conDispersion
            );

            // Guardar en cache
            if (!temporalFilters) {
                metricsCache.set(cacheKey, data);
            }

            setMetrics(data);

            // Si se especifica un bloque y periodo, obtener detalle
            if (bloqueId && periodo !== undefined && data) {
                await fetchBloqueDetalle(bloqueId, periodo);
            }

        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error('❌ Error obteniendo métricas:', err);
                setError(err.message || 'Error al cargar datos de optimización');
            }
        } finally {
            setIsLoading(false);
        }
    }, [config.anio, config.semana, config.participacion, config.conDispersion, bloqueId, periodo, temporalFilters]);

    // Función para obtener detalle de bloque
    const fetchBloqueDetalle = useCallback(async (
        bloqueId: string,
        periodo: number
    ) => {
        try {
            // Verificar cache primero
            const cacheKey = `${config.anio}-${config.semana}-${config.participacion}-${config.conDispersion}-${bloqueId}-${periodo}`;
            if (bloqueCache.has(cacheKey)) {
                console.log('✅ Usando datos de bloque desde cache:', cacheKey);
                setBloqueDetalle(bloqueCache.get(cacheKey)!);
                return;
            }

            console.log('🔍 Obteniendo detalle de bloque:', { bloqueId, periodo });

            const data = await optimizationApi.getBlockOccupation(
                bloqueId,
                config.anio,
                config.semana,
                config.participacion,
                config.conDispersion,
                periodo
            );

            // Transformar la respuesta al formato esperado
            const bloqueDetail: BloqueDetalle = {
                bahiasPorBloque: data.bahiasPorBloque || {},
                volumenPorBloque: data.volumenPorBloque || {},
                capacidadesPorBloque: data.capacidadesPorBloque || {},
                teusPorSegregacion: data.teusPorSegregacion || {},
                segregacionesInfo: data.segregacionesInfo || {},
                ocupacion: {
                    porBloque: [{
                        bloque: data.bloque?.codigo || bloqueId,
                        ocupacionPromedio: data.ocupacion_actual?.porcentaje || 0,
                        ocupacionMaxima: data.ocupacion_actual?.porcentaje || 0,
                        ocupacionMinima: data.ocupacion_actual?.porcentaje || 0
                    }]
                }
            };

            // Guardar en cache
            bloqueCache.set(cacheKey, bloqueDetail);

            setBloqueDetalle(bloqueDetail);

        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error('❌ Error obteniendo detalle de bloque:', err);
            }
        }
    }, [config]);

    // Función refetch
    const refetch = useCallback(() => {
        // Limpiar cache si es necesario
        const cacheKey = `${config.anio}-${config.semana}-${config.participacion}-${config.conDispersion}`;
        metricsCache.delete(cacheKey);

        if (bloqueId && periodo !== undefined) {
            const bloqueCacheKey = `${cacheKey}-${bloqueId}-${periodo}`;
            bloqueCache.delete(bloqueCacheKey);
        }

        fetchMetrics();
    }, [fetchMetrics, config, bloqueId, periodo]);

    // Effect principal
    useEffect(() => {
        fetchMetrics();

        // Cleanup
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchMetrics]);

    // Effect para actualizar detalle de bloque cuando cambia el periodo
    useEffect(() => {
        if (metrics && bloqueId && periodo !== undefined && !isLoading) {
            fetchBloqueDetalle(bloqueId, periodo);
        }
    }, [metrics, bloqueId, periodo, isLoading, fetchBloqueDetalle]);

    return {
        metrics,
        bloqueDetalle,
        isLoading,
        error,
        refetch
    };
};

// Hook adicional para obtener datos de gráficos
export const useOptimizationCharts = (config: OptimizationConfig) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const chartData = await optimizationApi.getChartData(
                    config.anio,
                    config.semana,
                    config.participacion,
                    config.conDispersion
                );

                setData(chartData);
            } catch (err: any) {
                console.error('Error fetching chart data:', err);
                setError(err.message || 'Error al cargar datos de gráficos');
            } finally {
                setIsLoading(false);
            }
        };

        fetchChartData();
    }, [config.anio, config.semana, config.participacion, config.conDispersion]);

    return { data, isLoading, error };
};

// Hook para obtener comparación simple
export const useOptimizationComparison = (config: OptimizationConfig) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchComparison = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const comparisonData = await optimizationApi.getSimpleComparison(
                    config.anio,
                    config.semana,
                    config.participacion,
                    config.conDispersion
                );

                setData(comparisonData);
            } catch (err: any) {
                console.error('Error fetching comparison data:', err);
                setError(err.message || 'Error al cargar comparación');
            } finally {
                setIsLoading(false);
            }
        };

        fetchComparison();
    }, [config.anio, config.semana, config.participacion, config.conDispersion]);

    return { data, isLoading, error };
};

// Hook para detalle de bloque específico
export const useBloqueDetalle = (
    bloqueId: string,
    periodo: number,
    config: OptimizationConfig
) => {
    const [data, setData] = useState<BloqueDetalle | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!bloqueId) return;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Verificar cache
                const cacheKey = `${config.anio}-${config.semana}-${config.participacion}-${config.conDispersion}-${bloqueId}-${periodo}`;
                if (bloqueCache.has(cacheKey)) {
                    setData(bloqueCache.get(cacheKey)!);
                    setIsLoading(false);
                    return;
                }

                const result = await optimizationApi.getBlockOccupation(
                    bloqueId,
                    config.anio,
                    config.semana,
                    config.participacion,
                    config.conDispersion,
                    periodo
                );

                // Transformar datos
                const bloqueDetail: BloqueDetalle = {
                    bahiasPorBloque: result.bahiasPorBloque || {},
                    volumenPorBloque: result.volumenPorBloque || {},
                    capacidadesPorBloque: result.capacidadesPorBloque || {},
                    teusPorSegregacion: result.teusPorSegregacion || {},
                    segregacionesInfo: result.segregacionesInfo || {}
                };

                // Guardar en cache
                bloqueCache.set(cacheKey, bloqueDetail);

                setData(bloqueDetail);
            } catch (err: any) {
                console.error('Error fetching bloque detail:', err);
                setError(err.message || 'Error al cargar detalle del bloque');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [bloqueId, periodo, config]);

    return { data, isLoading, error };
};

// Función helper para limpiar el cache (útil en desarrollo)
export const clearOptimizationCache = () => {
    metricsCache.clear();
    bloqueCache.clear();
    console.log('🧹 Cache de optimización limpiado');
};