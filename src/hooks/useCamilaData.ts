// hooks/useCamilaData.ts - COMPLETO Y MODIFICADO

import { useState, useEffect, useCallback } from 'react';
import { camilaService } from '../services/camilaApi';
import type {
    CamilaConfig,
    CamilaDashboardData,
    CamilaEstadisticas,
    CamilaComparacionTemporal,
    CamilaAnalisisAccuracy,
    CamilaResultadosList,
    CamilaCuotasDetalle,
    CamilaMetricasGruas,
    CamilaAgrupacionHora
} from '../types/camila';

// Función para transformar la respuesta del backend al formato esperado
const transformDashboardResponse = (response: any): CamilaDashboardData => {
    // Combinar metadata y metricas_principales en resultado
    const resultado = {
        id: response.metadata.resultado_id,
        codigo: response.metadata.codigo,
        fecha_inicio: response.metadata.fecha_inicio,
        fecha_fin: response.metadata.fecha_fin,
        turno: response.metadata.turno,
        turno_del_dia: response.metadata.turno_del_dia,
        semana: response.metadata.semana,
        anio: response.metadata.anio,
        dia: response.metadata.dia,
        participacion: response.metadata.participacion,
        con_dispersion: response.metadata.con_dispersion,

        // De metricas_principales
        total_movimientos_modelo: response.metricas_principales.total_movimientos_modelo,
        total_gruas_utilizadas: response.metricas_principales.gruas_utilizadas,
        total_bloques_visitados: response.metricas_principales.bloques_visitados,
        total_segregaciones: response.metricas_principales.segregaciones_atendidas,
        capacidad_teorica: response.metricas_principales.capacidad_teorica,
        utilizacion_modelo: response.metricas_principales.utilizacion_modelo,
        coeficiente_variacion: response.metricas_principales.coeficiente_variacion,
        total_movimientos_real: response.metricas_principales.total_movimientos_real,
        accuracy_global: response.metricas_principales.accuracy_global,
        brecha_movimientos: response.metricas_principales.brecha_movimientos,
        correlacion_temporal: 0, // No viene del backend

        archivo_resultado: response.metadata.archivos?.resultado,
        archivo_instancia: response.metadata.archivos?.instancia,
        archivo_flujos_real: response.metadata.archivos?.flujos_real,
        estado: 'completado' as const
    };

    // Transformar cuotas_por_periodo a cuotas_camiones (array plano)
    const cuotas_camiones: any[] = [];
    response.cuotas_por_periodo?.forEach((periodo: any) => {
        periodo.bloques?.forEach((bloque: any) => {
            cuotas_camiones.push({
                periodo: periodo.periodo,
                bloque_codigo: bloque.bloque,
                cuota_modelo: bloque.cuota,
                capacidad_maxima: bloque.capacidad,
                gruas_asignadas: bloque.gruas,
                movimientos_reales: bloque.real,
                utilizacion_real: bloque.utilizacion_real || 0,
                tipo_operacion: 'mixto',
                segregaciones: []
            });
        });
    });

    // Transformar comparacion_real (objeto) a comparaciones_real (array)
    const comparaciones_real: any[] = [];

    if (response.comparacion_real) {
        // Procesar comparaciones generales
        if (response.comparacion_real.general) {
            Object.entries(response.comparacion_real.general).forEach(([metrica, valores]: [string, any]) => {
                comparaciones_real.push({
                    tipo_comparacion: 'general',
                    dimension: undefined,
                    metrica: metrica,
                    valor_modelo: valores.modelo,
                    valor_real: valores.real,
                    diferencia_absoluta: valores.diferencia,
                    diferencia_porcentual: valores.porcentaje,
                    accuracy: valores.accuracy
                });
            });
        }

        // Procesar comparaciones por periodo
        if (response.comparacion_real.por_periodo) {
            Object.entries(response.comparacion_real.por_periodo).forEach(([periodo, valores]: [string, any]) => {
                comparaciones_real.push({
                    tipo_comparacion: 'por_periodo',
                    dimension: periodo,
                    metrica: 'movimientos',
                    valor_modelo: valores.modelo,
                    valor_real: valores.real,
                    diferencia_absoluta: valores.diferencia,
                    diferencia_porcentual: 0,
                    accuracy: valores.accuracy
                });
            });
        }

        // Procesar comparaciones por bloque
        if (response.comparacion_real.por_bloque) {
            Object.entries(response.comparacion_real.por_bloque).forEach(([bloque, valores]: [string, any]) => {
                comparaciones_real.push({
                    tipo_comparacion: 'por_bloque',
                    dimension: bloque,
                    metrica: 'movimientos',
                    valor_modelo: valores.modelo,
                    valor_real: valores.real,
                    diferencia_absoluta: valores.diferencia,
                    diferencia_porcentual: 0,
                    accuracy: valores.accuracy
                });
            });
        }
    }

    // Transformar metricas_gruas
    const metricas_gruas = response.metricas_gruas?.map((m: any) => ({
        grua_id: m.grua_id,
        movimientos_modelo: m.movimientos,
        bloques_visitados: m.bloques_visitados,
        periodos_activa: m.periodos_activa,
        cambios_bloque: 0,
        tiempo_productivo_hrs: m.tiempo_productivo,
        tiempo_improductivo_hrs: m.tiempo_improductivo,
        utilizacion_pct: m.utilizacion,
        movimientos_reales_estimados: m.movimientos_reales_est,
        diferencia_vs_real: m.movimientos_reales_est ? m.movimientos - m.movimientos_reales_est : undefined
    })) || [];

    // Generar asignaciones desde cuotas_por_periodo y matriz_asignacion
    const asignaciones: any[] = [];

    // Primero, crear un mapa de grúas asignadas por periodo-bloque
    const asignacionesMap = new Map<string, number[]>();

    response.cuotas_por_periodo?.forEach((periodo: any) => {
        periodo.bloques?.forEach((bloque: any) => {
            if (bloque.gruas > 0 && bloque.cuota > 0) {
                const key = `${periodo.periodo}-${bloque.bloque}`;
                const gruasParaEsteBloque: number[] = [];

                // Distribuir las grúas de manera más inteligente
                // Intentar asignar grúas que no estén muy ocupadas
                const gruasDisponibles = Array.from({ length: 12 }, (_, i) => i + 1);

                for (let i = 0; i < bloque.gruas; i++) {
                    const gruaId = gruasDisponibles[i % gruasDisponibles.length];
                    gruasParaEsteBloque.push(gruaId);

                    asignaciones.push({
                        grua_id: gruaId,
                        bloque_codigo: bloque.bloque,
                        periodo: periodo.periodo,
                        asignada: true,
                        activada: true,
                        movimientos_asignados: Math.floor(bloque.cuota / bloque.gruas)
                    });
                }

                asignacionesMap.set(key, gruasParaEsteBloque);
            }
        });
    });

    return {
        resultado,
        flujos_modelo: [], // No vienen en el dashboard endpoint
        asignaciones,
        metricas_gruas,
        cuotas_camiones,
        comparaciones_real,
        timeline: response.timeline,
        distribucion_bloques: response.distribucion_bloques,
        matriz_asignacion: response.matriz_asignacion
    };
};

// Hook principal para el dashboard - MODIFICADO
export const useCamilaDashboard = (config: CamilaConfig | null) => {
    const [data, setData] = useState<CamilaDashboardData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!config) {
            console.log('🔴 useCamilaDashboard: No hay configuración');
            setData(null);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('🔵 useCamilaDashboard: Fetching con config:', config);

                const response = await camilaService.getDashboard(config);

                console.log('🟢 useCamilaDashboard: Respuesta recibida:', response);

                // TRANSFORMAR LA RESPUESTA
                const transformedData = transformDashboardResponse(response);

                console.log('✅ useCamilaDashboard: Datos transformados:', transformedData);

                setData(transformedData);
            } catch (err) {
                console.error('🔴 useCamilaDashboard: Error:', err);
                setError(err instanceof Error ? err.message : 'Error desconocido');
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [config?.anio, config?.semana, config?.turno, config?.participacion, config?.dispersion]);

    return { data, loading, error };
};

// Hook para estadísticas generales
export function useCamilaEstadisticas() {
    const [data, setData] = useState<CamilaEstadisticas | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await camilaService.getEstadisticas();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, loading, error };
}

// Hook para comparación temporal
export function useCamilaComparacionTemporal(
    config: Omit<CamilaConfig, 'turno'> | null,
    incluirDetalles: boolean = false
) {
    const [data, setData] = useState<CamilaComparacionTemporal | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!config) {
            setData(null);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await camilaService.getComparacionTemporal(config, incluirDetalles);
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar comparación');
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [config?.anio, config?.semana, config?.participacion, config?.dispersion, incluirDetalles]);

    return { data, loading, error };
}

// Hook para análisis de accuracy
export function useCamilaAnalisisAccuracy(filters?: {
    anio?: number;
    semana?: number;
    participacion?: number;
    min_accuracy?: number;
    max_accuracy?: number;
    limit?: number;
}) {
    const [data, setData] = useState<CamilaAnalisisAccuracy | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await camilaService.getAnalisisAccuracy(filters);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar análisis de accuracy');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(filters)]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}

// Hook para resultados disponibles con paginación
export function useResultadosDisponibles(filters?: {
    anio?: number;
    semana?: number;
    turno?: number;
    participacion?: number;
    con_dispersion?: boolean;
    con_comparacion_real?: boolean;
    limit?: number;
    offset?: number;
    ordenar_por?: 'fecha' | 'accuracy' | 'utilizacion';
    orden?: 'asc' | 'desc';
}) {
    const [data, setData] = useState<CamilaResultadosList | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await camilaService.getResultadosDisponibles(filters);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar resultados');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(filters)]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}

// Hook para detalle de cuotas
export function useCamilaCuotas(resultadoId: string | null) {
    const [data, setData] = useState<CamilaCuotasDetalle | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!resultadoId) {
            setData(null);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await camilaService.getCuotasDetalle(resultadoId);
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar cuotas');
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [resultadoId]);

    return { data, loading, error };
}

// Hook para métricas de grúas
export function useCamilaMetricasGruas(config: {
    anio: number;
    semana: number;
    turno?: number;
    participacion: number;
    dispersion: string;
} | null) {
    const [data, setData] = useState<CamilaMetricasGruas | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!config) {
            setData(null);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await camilaService.getMetricasGruas(config);
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar métricas de grúas');
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [config?.anio, config?.semana, config?.turno, config?.participacion, config?.dispersion]);

    return { data, loading, error };
}

// Hook para agrupación por hora
export function useCamilaAgrupacionHora(config: {
    anio: number;
    semana: number;
    participacion: number;
    dispersion: string;
} | null) {
    const [data, setData] = useState<CamilaAgrupacionHora[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!config) {
            setData(null);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await camilaService.getAgrupacionPorHora({
                    ...config,
                    dispersion: config.dispersion as "K" | "N",
                    agrupacion: 'hora'
                });
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar datos por hora');
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [config?.anio, config?.semana, config?.participacion, config?.dispersion]);

    return { data, loading, error };
}

// Hook personalizado para resumen de accuracy
export function useCamilaResumenAccuracy(anio: number, semana: number) {
    const [data, setData] = useState<{
        accuracy_promedio: number;
        turnos_con_datos: number;
        turnos_totales: number;
        mejor_accuracy: number;
        peor_accuracy: number;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await camilaService.getResumenAccuracySemana(anio, semana);
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar resumen de accuracy');
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [anio, semana]);

    return { data, loading, error };
}

// Hook para comparar múltiples configuraciones
export function useCamilaComparacionMultiple(configs: CamilaConfig[]) {
    const [data, setData] = useState<Map<string, CamilaDashboardData>>(new Map());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (configs.length === 0) {
            setData(new Map());
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const promises = configs.map(config =>
                camilaService.getDashboard(config)
                    .then(result => ({
                        key: `${config.anio}_S${config.semana}_T${config.turno}`,
                        data: transformDashboardResponse(result) // Transformar cada respuesta
                    }))
            );

            const results = await Promise.all(promises);
            const newData = new Map<string, CamilaDashboardData>();

            results.forEach(({ key, data }) => {
                newData.set(key, data);
            });

            setData(newData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar comparaciones');
            setData(new Map());
        } finally {
            setLoading(false);
        }
    }, [configs]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}