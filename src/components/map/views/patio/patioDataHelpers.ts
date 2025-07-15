// src/components/map/views/patio/patioDataHelpers.ts - MODIFICADO PARA CAMILA
import type { CamilaDashboardData } from '../../../../types/camila';
import type { OptimizationMetrics } from '../../../../types/optimization';
import type { CamilaBlockData, MagdalenaBlockData } from '../../../../types/patioView.types';

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
    magdalenaMetrics: OptimizationMetrics | null | undefined
): MagdalenaBlockData | null => {
    if (!magdalenaMetrics) return null;

    try {
        const bloqueData = magdalenaMetrics.ocupacion?.porBloque?.find(
            b => b?.bloque === bloqueId
        );

        const segregacionesActivas = magdalenaMetrics.segregaciones?.activas?.filter(
            s => 'bloques' in s && Array.isArray((s as any).bloques) && (s as any).bloques.includes(bloqueId)
        ) || [];

        return {
            segregaciones: segregacionesActivas.length,
            ocupacionPromedio: bloqueData?.ocupacionPromedio || 0,
            ocupacionMaxima: bloqueData?.ocupacionMaxima || 0,
            ocupacionMinima: bloqueData?.ocupacionMinima || 0
        };
    } catch (error) {
        console.error('Error en getMagdalenaDataForBlock:', error);
        return null;
    }
};