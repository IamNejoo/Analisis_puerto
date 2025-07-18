// src/components/map/views/patio/patioDataHelpers.ts
import type { CamilaDashboardData } from '../../../../types/camila';
import type { OptimizationMetrics } from '../../../../types/optimization';

// Interfaces con todas las propiedades necesarias
export interface MagdalenaBlockData {
    segregaciones: number;
    ocupacionPromedio: number;
    ocupacionMaxima: number;
    ocupacionMinima: number;
    ocupacionTurno: number;
    movimientos: number;
    capacidad: number;
}

export interface CamilaBlockData {
    asignaciones: any[];
    gruas: number[];
    metricas?: any[];
    cuotas?: any;
}

export const getCamilaDataForBlock = (
    bloqueId: string,
    camilaData: CamilaDashboardData | null | undefined,
    currentPeriod: number
): CamilaBlockData | null => {
    if (!camilaData || !camilaData.asignaciones) return null;

    try {
        // Filtrar asignaciones del bloque y período actual
        const asignacionesBloque = camilaData.asignaciones.filter(
            a => a?.bloque_codigo === bloqueId &&
                a?.periodo === currentPeriod &&
                a?.asignada === true
        ) || [];

        // Obtener grúas únicas asignadas a este bloque
        const gruasBloque = new Set<number>();
        asignacionesBloque.forEach(asig => {
            if (asig.grua_id) {
                gruasBloque.add(asig.grua_id);
            }
        });

        // Obtener cuota del bloque
        const cuotaBloque = camilaData.cuotas_camiones?.find(
            c => c?.bloque_codigo === bloqueId && c?.periodo === currentPeriod
        );

        // Obtener métricas de las grúas asignadas
        const metricasGruas = camilaData.metricas_gruas?.filter(
            m => gruasBloque.has(m.grua_id)
        ) || [];

        return {
            asignaciones: asignacionesBloque,
            gruas: Array.from(gruasBloque),
            metricas: metricasGruas,
            cuotas: cuotaBloque
        };
    } catch (error) {
        console.error('Error en getCamilaDataForBlock:', error);
        return null;
    }
};

export const getMagdalenaDataForBlock = (
    bloqueId: string,
    magdalenaMetrics: OptimizationMetrics | null | undefined,
    currentTurno?: number
): MagdalenaBlockData | null => {
    if (!magdalenaMetrics) return null;

    try {
        // Buscar datos del bloque en ocupacion.porBloque
        const bloqueData = magdalenaMetrics.ocupacion?.porBloque?.find(
            b => b?.bloque === bloqueId
        );

        // Si hay un turno específico, buscar la ocupación para ese turno
        let ocupacionTurno = bloqueData?.ocupacionPromedio || 0;

        if (currentTurno && magdalenaMetrics.evolucionTemporal) {
            // Buscar datos específicos del turno
            const datosTurno = magdalenaMetrics.evolucionTemporal.find(
                t => t.periodo === currentTurno
            );

            if (datosTurno) {
                // Si hay datos específicos del turno, calcular ocupación proporcional
                // basada en los movimientos del modelo para ese turno
                const movimientosTurno = datosTurno.movimientosModelo || 0;
                const movimientosTotales = magdalenaMetrics.movimientos?.optimizados || 1;

                // Ajustar ocupación basada en la proporción de movimientos
                if (movimientosTotales > 0) {
                    const factorTurno = movimientosTurno / movimientosTotales;
                    ocupacionTurno = (bloqueData?.ocupacionPromedio || 0) * factorTurno * 3; // *3 porque son 3 turnos por día
                }
            }
        }

        // Contar segregaciones activas que usan este bloque
        let segregacionesBloque = 0;

        // Método 1: Si hay información de segregaciones activas
        if (magdalenaMetrics.segregaciones?.activas) {
            segregacionesBloque = magdalenaMetrics.segregaciones.activas.filter(
                s => {
                    // Si la segregación tiene información de bloques
                    if ('bloques' in s && Array.isArray((s as any).bloques)) {
                        return (s as any).bloques.includes(bloqueId);
                    }
                    // Si no hay información específica, asumir distribución uniforme
                    return true;
                }
            ).length;
        }

        // Método 2: Si no hay info específica, distribuir uniformemente
        if (segregacionesBloque === 0 && magdalenaMetrics.segregaciones?.optimizadas) {
            // Distribuir segregaciones entre los 9 bloques
            segregacionesBloque = Math.ceil(magdalenaMetrics.segregaciones.optimizadas / 9);
        }

        // Calcular movimientos del bloque para el turno actual
        let movimientosBloque = 0;
        if (currentTurno && magdalenaMetrics.evolucionTemporal) {
            const datosTurno = magdalenaMetrics.evolucionTemporal.find(
                t => t.periodo === currentTurno
            );
            if (datosTurno) {
                // Distribuir movimientos proporcionalmente entre bloques activos
                const bloquesActivos = magdalenaMetrics.ocupacion?.porBloque?.filter(
                    b => b.ocupacionPromedio > 0
                ).length || 9;
                movimientosBloque = Math.round(datosTurno.movimientosModelo / bloquesActivos);
            }
        }

        // Obtener capacidad del bloque (si está disponible)
        const capacidadBloque = (bloqueData as any)?.capacidad || 350; // 350 TEUs por defecto

        return {
            segregaciones: segregacionesBloque,
            ocupacionPromedio: bloqueData?.ocupacionPromedio || 0,
            ocupacionMaxima: bloqueData?.ocupacionMaxima || 100,
            ocupacionMinima: bloqueData?.ocupacionMinima || 0,
            ocupacionTurno: Math.min(100, Math.round(ocupacionTurno)),
            movimientos: movimientosBloque,
            capacidad: capacidadBloque
        };
    } catch (error) {
        console.error('Error en getMagdalenaDataForBlock:', error);
        return null;
    }
};

// Helper para calcular estadísticas agregadas
export const getAggregatedStats = (
    magdalenaMetrics: OptimizationMetrics | null | undefined,
    camilaData: CamilaDashboardData | null | undefined,
    currentPeriod: number
) => {
    const stats = {
        magdalena: {
            ocupacionPromedio: 0,
            segregacionesActivas: 0,
            movimientosOptimizados: 0,
            eficienciaGanada: 0
        },
        camila: {
            asignacionesActivas: 0,
            movimientosTotales: 0,
            gruasOperando: 0,
            bloquesActivos: 0
        }
    };

    if (magdalenaMetrics) {
        stats.magdalena = {
            ocupacionPromedio: magdalenaMetrics.ocupacion?.promedio || 0,
            segregacionesActivas: magdalenaMetrics.segregaciones?.optimizadas || 0,
            movimientosOptimizados: magdalenaMetrics.movimientos?.optimizados || 0,
            eficienciaGanada: magdalenaMetrics.eficiencia?.ganancia || 0
        };
    }

    if (camilaData) {
        const asignacionesPeriodo = camilaData.asignaciones.filter(
            a => a.periodo === currentPeriod && a.asignada
        );

        stats.camila = {
            asignacionesActivas: asignacionesPeriodo.length,
            movimientosTotales: asignacionesPeriodo.reduce((sum, a) => sum + a.movimientos_asignados, 0),
            gruasOperando: new Set(asignacionesPeriodo.map(a => a.grua_id)).size,
            bloquesActivos: new Set(asignacionesPeriodo.map(a => a.bloque_codigo)).size
        };
    }

    return stats;
};