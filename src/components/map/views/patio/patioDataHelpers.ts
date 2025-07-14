// src/components/map/views/patio/patioDataHelpers.ts
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
        const asignacionesBloque = camilaData.asignaciones.filter(
            a => a?.bloque_codigo === bloqueId && a?.periodo === currentPeriod
        ) || [];

        const gruasBloque = new Set<number>();
        if (camilaData.metricas_gruas && Array.isArray(camilaData.metricas_gruas)) {
            camilaData.metricas_gruas.forEach((metrica, idx) => {
                if (metrica?.movimientos_asignados > 0 && asignacionesBloque.length > 0) {
                    gruasBloque.add(idx + 1);
                }
            });
        }

        const cuotaBloque = camilaData.cuotas_camiones?.find(
            c => c?.bloque_codigo === bloqueId && c?.periodo === currentPeriod
        );

        return {
            asignaciones: asignacionesBloque,
            gruas: Array.from(gruasBloque),
            metricas: camilaData.metricas_gruas?.filter((_, idx) => gruasBloque.has(idx + 1)) || [],
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