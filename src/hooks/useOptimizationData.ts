// src/hooks/useOptimizationData.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { optimizationApi } from '../services/optimizationApi';
import type { OptimizationMetrics } from '../types/optimization';
import type { TemporalFilters } from '../types/optimization';

interface OptimizationConfig {
    anio: number;
    semana: number;
    participacion: number;
    conDispersion: boolean;
}

interface BloqueDetalle {
    bloque: {
        codigo: string;
        capacidad_teus: number;
        capacidad_bahias: number;
    };
    periodo: number;
    ocupacion_actual: {
        contenedores: number;
        porcentaje: number;
        estado: string;
    };
    bahiasPorBloque: { [key: string]: { [segregacion: string]: number } };
    volumenPorBloque: { [key: string]: { [segregacion: string]: number } };
    capacidadesPorBloque: { [bloqueId: string]: number };
    teusPorSegregacion: { [segregacion: string]: number };
    segregacionesInfo: { [segregacion: string]: { descripcion: string; movimientos: number; detalle?: any } };
    resumen: {
        total_bahias_ocupadas: number;
        total_volumen_teus: number;
        segregaciones_activas: number;
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

            // Validar configuración antes de llamar al API
            if (config.anio < 2017 || config.anio > 2023) {
                throw new Error(`Año ${config.anio} fuera de rango válido (2017-2023)`);
            }
            if (config.semana < 1 || config.semana > 52) {
                throw new Error(`Semana ${config.semana} fuera de rango válido (1-52)`);
            }
            if (config.participacion < 60 || config.participacion > 80) {
                throw new Error(`Participación ${config.participacion}% fuera de rango válido (60-80%)`);
            }

            // Llamar al API con o sin filtros temporales
            let data: OptimizationMetrics;

            if (temporalFilters) {
                // Usar endpoint temporal si hay filtros
                const response = await optimizationApi.getDashboardTemporal(
                    config.anio,
                    config.semana,
                    config.participacion,
                    config.conDispersion,
                    {
                        dia: temporalFilters.dia,
                        turno: temporalFilters.turno,
                        periodoInicio: temporalFilters.periodoInicio,
                        periodoFin: temporalFilters.periodoFin
                    }
                );
                // Mapear respuesta temporal al formato de OptimizationMetrics
                data = mapTemporalResponse(response);
            } else {
                // Usar endpoint normal
                data = await optimizationApi.getDashboard(
                    config.anio,
                    config.semana,
                    config.participacion,
                    config.conDispersion
                );
            }

            // Guardar en cache solo si no hay filtros temporales
            if (!temporalFilters) {
                metricsCache.set(cacheKey, data);
            }

            setMetrics(data);

            // Si se especifica un bloque y periodo, obtener detalle
            if (bloqueId && periodo !== undefined && data) {
                await fetchBloqueDetalle(bloqueId, periodo, data.instanciaId);
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

    // Función para obtener detalle de bloque - CORREGIDA
    const fetchBloqueDetalle = useCallback(async (
        bloqueId: string,
        periodo: number,
        instanciaId?: string
    ) => {
        try {
            // Verificar cache primero
            const cacheKey = `${config.anio}-${config.semana}-${config.participacion}-${config.conDispersion}-${bloqueId}-${periodo}`;
            if (bloqueCache.has(cacheKey)) {
                console.log('✅ Usando datos de bloque desde cache:', cacheKey);
                setBloqueDetalle(bloqueCache.get(cacheKey)!);
                return;
            }

            console.log('🔍 Obteniendo detalle de bloque:', { bloqueId, periodo, instanciaId });

            // Si no tenemos instanciaId, obtenerlo primero
            if (!instanciaId && metrics) {
                instanciaId = metrics.instanciaId;
            }

            if (!instanciaId) {
                // Necesitamos obtener primero el dashboard para tener el instanciaId
                const dashboardData = await optimizationApi.getDashboard(
                    config.anio,
                    config.semana,
                    config.participacion,
                    config.conDispersion
                );
                instanciaId = dashboardData.instanciaId;
            }

            // Validar parámetros
            if (!bloqueId.match(/^C[1-9]$/)) {
                throw new Error(`ID de bloque inválido: ${bloqueId}`);
            }
            if (periodo < 1 || periodo > 21) {
                throw new Error(`Periodo ${periodo} fuera de rango (1-21)`);
            }

            // Ahora sí, obtener el detalle del bloque
            const data = await optimizationApi.getBlockOccupation(
                bloqueId,
                instanciaId,
                periodo
            );

            // El backend ya devuelve la estructura correcta
            setBloqueDetalle(data);

            // Guardar en cache
            bloqueCache.set(cacheKey, data);

        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error('❌ Error obteniendo detalle de bloque:', err);
                // No seteamos error aquí para no afectar la visualización principal
            }
        }
    }, [config, metrics]);

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
            fetchBloqueDetalle(bloqueId, periodo, metrics.instanciaId);
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

// Función auxiliar para mapear respuesta temporal
function mapTemporalResponse(response: any): OptimizationMetrics {
    // Mapear la respuesta del endpoint temporal al formato estándar
    return {
        instanciaId: response.filtros_aplicados?.instancia_id || 'temp-id',
        codigo: '',
        anio: response.filtros_aplicados?.anio || 0,
        semana: response.filtros_aplicados?.semana || 0,
        participacion: response.filtros_aplicados?.participacion || 0,
        conDispersion: response.filtros_aplicados?.dispersion === 'K',
        fechaInicio: new Date().toISOString(),
        fechaFin: new Date().toISOString(),

        eficiencia: {
            real: response.kpis_principales?.eficiencia_real || 0,
            optimizada: response.kpis_principales?.eficiencia_modelo || 100,
            ganancia: response.kpis_principales?.eficiencia_ganada || 0
        },

        movimientos: {
            totalReal: response.kpis_principales?.reduccion_movimientos?.operativos_real || 0,
            yardEliminados: response.kpis_principales?.yard_eliminados || 0,
            optimizados: response.kpis_principales?.reduccion_movimientos?.operativos_modelo || 0,
            reduccionPorcentaje: response.kpis_principales?.reduccion_movimientos?.porcentaje || 0,
            porTipo: {
                DLVR: 0, DSCH: 0, LOAD: 0, RECV: 0, YARD: 0, OTHR: 0
            },
            optimizadosPorTipo: {
                recepcion: 0, carga: 0, descarga: 0, entrega: 0
            }
        },

        distancias: {
            totalReal: 0,
            totalModelo: 0,
            yardEliminada: 0,
            load: 0,
            dlvr: 0,
            reduccionMetros: response.kpis_principales?.distancia_ahorrada || 0,
            reduccionPorcentaje: 0,
            distanciaAhorrada: response.kpis_principales?.distancia_ahorrada || 0,
            porTipo: { LOAD: 0, DLVR: 0, YARD: 0 },
            desglose: undefined
        },

        segregaciones: {
            total: 0,
            optimizadas: response.metricas_operacionales?.segregaciones_activas || 0,
            porcentaje: 0,
            activas: response.top_segregaciones || []
        },

        ocupacion: {
            promedio: response.metricas_operacionales?.ocupacion_promedio || 0,
            capacidadTotal: 0,
            porBloque: response.ocupacion_bloques || []
        },

        cargaTrabajo: {
            total: 0,
            variacion: 0,
            balance: response.metricas_operacionales?.balance_carga || 0,
            maxima: response.metricas_operacionales?.carga_maxima || 0,
            minima: response.metricas_operacionales?.carga_minima || 0
        },

        evolucionTemporal: response.evolucion_temporal || [],

        comparacionResumen: {
            eliminacionReubicaciones: { valor: 0, porcentaje: 100 },
            reduccionMovimientos: { valor: 0, porcentaje: 0 },
            mejoraEficiencia: { valor: 0, unidad: 'puntos porcentuales' },
            ahorroDistancia: { valor: 0, metrosAhorrados: 0, porcentaje: 0, unidad: 'metros' }
        }
    };
}

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

                // Obtener el dashboard para el instanciaId
                const dashboardData = await optimizationApi.getDashboard(
                    config.anio,
                    config.semana,
                    config.participacion,
                    config.conDispersion
                );

                if (dashboardData.instanciaId) {
                    const comparisonData = await optimizationApi.getDetailedComparison(dashboardData.instanciaId);
                    setData(comparisonData);
                }
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

// Hook para análisis de bloques
export const useBlockAnalysis = (config: OptimizationConfig, periodo?: number) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const dashboardData = await optimizationApi.getDashboard(
                    config.anio,
                    config.semana,
                    config.participacion,
                    config.conDispersion
                );

                if (dashboardData.instanciaId) {
                    const analysisData = await optimizationApi.getBlockAnalysis(dashboardData.instanciaId, periodo);
                    setData(analysisData);
                }
            } catch (err: any) {
                console.error('Error fetching block analysis:', err);
                setError(err.message || 'Error al cargar análisis de bloques');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalysis();
    }, [config, periodo]);

    return { data, isLoading, error };
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

                // Por ahora usar los mismos datos del dashboard
                const dashboardData = await optimizationApi.getDashboard(
                    config.anio,
                    config.semana,
                    config.participacion,
                    config.conDispersion
                );

                // Transformar datos para charts
                setData({
                    evolucion_temporal: dashboardData.evolucionTemporal,
                    ocupacion_bloques: dashboardData.ocupacion.porBloque,
                    segregaciones_activas: dashboardData.segregaciones.activas
                });
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

                // Primero obtener el instanciaId
                const dashboardData = await optimizationApi.getDashboard(
                    config.anio,
                    config.semana,
                    config.participacion,
                    config.conDispersion
                );

                // Luego obtener el detalle del bloque
                const result = await optimizationApi.getBlockOccupation(
                    bloqueId,
                    dashboardData.instanciaId,
                    periodo
                );

                // Guardar en cache
                bloqueCache.set(cacheKey, result);

                setData(result);
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