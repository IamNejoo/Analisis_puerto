// src/hooks/useOptimizationData.ts
import { useState, useEffect } from 'react';
import { optimizationApi } from '../services/optimizationApi';
import type { OptimizationMetrics, OptimizationConfig } from '../types/optimization';

export interface OptimizationDataResult {
    metrics: OptimizationMetrics | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    refetch: () => void;
}

export const useOptimizationData = (
    config: OptimizationConfig
): OptimizationDataResult => {
    const [metrics, setMetrics] = useState<OptimizationMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const loadData = async () => {
        if (!config.anio || !config.semana || !config.participacion) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log(`🔄 Cargando datos de optimización:`, config);

            const data = await optimizationApi.getDashboard(
                config.anio,
                config.semana,
                config.participacion,
                config.conDispersion
            );

            setMetrics(data);
            setLastUpdated(new Date());
            console.log('✅ Datos de optimización cargados:', data);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            console.error('❌ Error cargando datos:', errorMessage);
            setError(errorMessage);
            setMetrics(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [config.anio, config.semana, config.participacion, config.conDispersion]);

    return {
        metrics,
        isLoading,
        error,
        lastUpdated,
        refetch: loadData
    };
};

// Hook para configuraciones disponibles
export const useAvailableConfigurations = () => {
    const [configurations, setConfigurations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadConfigs = async () => {
            setIsLoading(true);
            try {
                const configs = await optimizationApi.getAvailableConfigurations();
                setConfigurations(configs);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error loading configurations');
            } finally {
                setIsLoading(false);
            }
        };

        loadConfigs();
    }, []);

    return { configurations, isLoading, error };
};

// Mantener compatibilidad con el nombre anterior
export const useMagdalenaData = (
    semana: number,
    participacion: number,
    conDispersion: boolean
) => {
    const config: OptimizationConfig = {
        anio: 2022, // Año por defecto
        semana,
        participacion,
        conDispersion
    };

    const { metrics, isLoading, error, lastUpdated } = useOptimizationData(config);

    // Adaptar la respuesta al formato esperado por componentes antiguos
    return {
        magdalenaMetrics: metrics ? {
            totalMovimientos: metrics.movimientos.totalReal,
            reubicacionesEliminadas: metrics.movimientos.yardEliminados,
            eficienciaGanada: metrics.eficiencia.ganancia,
            segregacionesActivas: metrics.segregaciones.optimizadas,
            bloquesAsignados: metrics.ocupacion.porBloque.length,
            balanceWorkload: metrics.cargaTrabajo.balance,
            ocupacionPromedio: metrics.ocupacion.promedio,
            cargaTrabajoTotal: metrics.cargaTrabajo.total,
            totalMovimientosOptimizados: metrics.movimientos.optimizados,
            variacionCarga: metrics.cargaTrabajo.variacion,
            periodos: metrics.evolucionTemporal.length,
            movimientosOptimizadosDetalle: {
                Recepcion: metrics.movimientos.optimizadosPorTipo.recepcion,
                Carga: metrics.movimientos.optimizadosPorTipo.carga,
                Descarga: metrics.movimientos.optimizadosPorTipo.descarga,
                Entrega: metrics.movimientos.optimizadosPorTipo.entrega
            },
            workloadPorBloque: [],
            segregacionesPorBloque: [],
            bloquesMagdalena: metrics.ocupacion.porBloque.map((b) => ({
                bloqueId: b.bloque,
                ocupacionPromedio: b.ocupacionPromedio,
                capacidad: metrics.ocupacion.capacidadTotal / metrics.ocupacion.porBloque.length,
                ocupacionPorTurno: [],
                movimientos: {
                    entrega: 0,
                    recepcion: 0,
                    carga: 0,
                    descarga: 0,
                    total: 0
                },
                estado: 'active' as const
            })),
            segregacionesInfo: metrics.segregaciones.activas.reduce((acc, seg) => {
                acc[seg.codigo] = {
                    descripcion: seg.descripcion,
                    movimientos: seg.movimientos
                };
                return acc;
            }, {} as any)
        } : null,
        realMetrics: metrics ? {
            totalMovimientos: metrics.movimientos.totalReal,
            reubicaciones: metrics.movimientos.yardEliminados,
            porcentajeReubicaciones: (metrics.movimientos.yardEliminados / metrics.movimientos.totalReal * 100),
            movimientosPorTipo: metrics.movimientos.porTipo
        } : null,
        comparison: metrics ? metrics.comparacionResumen : null,
        isLoading,
        error,
        lastUpdated,
        dataNotAvailable: error?.includes('No hay datos') || false
    };
};