// src/hooks/useRealPatioData.ts
import { useMemo } from 'react';
import { useSharedPortData } from './useSharedPortData';
import { useTimeContext } from '../contexts/TimeContext';
import { useViewNavigation } from '../contexts/ViewNavigationContext';
import { BLOCK_CAPACITIES, BLOCK_TOTAL_BAYS, BLOCK_REEFER_BAYS } from '../constants/blockCapacities';
import type { BloqueData, PatioData } from '../types';
import { patioData as staticPatioData } from '../data/patioData';

interface PatioStats {
    ocupacionPromedio: number;
    movimientosTotales: number;
    capacidadTotal: number;
    bahiasOcupadas: number;
}

export const useRealPatioData = () => {
    const sharedData = useSharedPortData();
    const { timeState } = useTimeContext();
    const { viewState } = useViewNavigation();

    // Procesar datos de bloques basados en los movimientos compartidos
    const { bloques, stats, patioData } = useMemo(() => {
        // Si no es histórico, devolver datos estáticos
        if (timeState?.dataSource !== 'historical') {
            return {
                bloques: [],
                stats: null,
                patioData: staticPatioData
            };
        }

        if (!sharedData.movements || sharedData.movements.length === 0) {
            return {
                bloques: [],
                stats: null,
                patioData: staticPatioData
            };
        }

        // Agrupar movimientos por bloque
        const movimientosPorBloque = new Map<string, number>();
        const ocupacionPorBloque = new Map<string, number>();

        sharedData.movements.forEach(mov => {
            const totalMovimientos =
                mov.gateEntradaContenedores + mov.gateSalidaContenedores +
                mov.muelleEntradaContenedores + mov.muelleSalidaContenedores +
                mov.remanejosContenedores;

            movimientosPorBloque.set(
                mov.bloque,
                (movimientosPorBloque.get(mov.bloque) || 0) + totalMovimientos
            );

            const capacidad = BLOCK_CAPACITIES[mov.bloque] || 1000;
            const ocupacion = (mov.promedioContenedores / capacidad) * 100;
            ocupacionPorBloque.set(mov.bloque, ocupacion);
        });

        // Crear objetos de bloque
        const bloquesData: BloqueData[] = Array.from(movimientosPorBloque.keys()).map(bloqueId => {
            const movimientos = movimientosPorBloque.get(bloqueId) || 0;
            const ocupacion = ocupacionPorBloque.get(bloqueId) || 0;
            const capacidad = BLOCK_CAPACITIES[bloqueId] || 1000;
            const totalBays = BLOCK_TOTAL_BAYS[bloqueId] || 30;
            const reeferBays = BLOCK_REEFER_BAYS[bloqueId] || 0;

            let tipo: 'contenedores' | 'imo' | 'reefer' = 'contenedores';
            if (bloqueId.startsWith('I')) tipo = 'imo';
            else if (reeferBays > 0) tipo = 'reefer';

            let patioId = 'costanera';
            if (bloqueId.startsWith('H')) patioId = 'ohiggins';
            else if (bloqueId.startsWith('T')) patioId = 'tebas';
            else if (bloqueId.startsWith('I')) patioId = 'imo';
            else if (bloqueId.startsWith('E')) patioId = 'espingon';

            const movimientoActual = sharedData.movements.find(m => m.bloque === bloqueId);

            return {
                id: bloqueId,
                patioId,
                name: `Bloque ${bloqueId}`,
                ocupacion,
                capacidadTotal: capacidad,
                tipo,
                bounds: { x: 0, y: 0, width: 100, height: 50 },
                bahias: [],
                stats: {
                    teusActuales: Math.round(ocupacion * capacidad / 100),
                    bahiasTotales: totalBays,
                    bahiasReefer: reeferBays,
                    gate: {
                        entradas: movimientoActual?.gateEntradaContenedores || 0,
                        salidas: movimientoActual?.gateSalidaContenedores || 0
                    },
                    muelle: {
                        entradas: movimientoActual?.muelleEntradaContenedores || 0,
                        salidas: movimientoActual?.muelleSalidaContenedores || 0
                    },
                    despejes: 0,
                    reubicacionesEntreBloques: movimientoActual?.patioEntradaContenedores || 0,
                    reubicacionesEntrePatios: movimientoActual?.terminalEntradaContenedores || 0,
                    entradas: movimientoActual?.patioEntradaContenedores || 0,
                    salidas: movimientoActual?.patioSalidaContenedores || 0,
                    remanejos: movimientoActual?.remanejosContenedores || 0
                }
            };
        });

        // Actualizar patioData con los bloques procesados
        const updatedPatioData = staticPatioData.map(patio => {
            const bloquesDelPatio = bloquesData.filter(b => b.patioId === patio.id);
            const ocupacionTotal = bloquesDelPatio.length > 0
                ? bloquesDelPatio.reduce((sum, b) => sum + b.ocupacion, 0) / bloquesDelPatio.length
                : 0;

            return {
                ...patio,
                bloques: bloquesDelPatio,
                ocupacionTotal: Math.round(ocupacionTotal)
            };
        });

        // Calcular estadísticas generales
        const patioStats: PatioStats = {
            ocupacionPromedio: bloquesData.reduce((sum, b) => sum + b.ocupacion, 0) / bloquesData.length,
            movimientosTotales: Array.from(movimientosPorBloque.values()).reduce((sum, val) => sum + val, 0),
            capacidadTotal: bloquesData.reduce((sum, b) => sum + b.capacidadTotal, 0),
            bahiasOcupadas: bloquesData.reduce((sum, b) => sum + Math.round(b.ocupacion * (b.stats?.bahiasTotales || 30) / 100), 0)
        };

        return {
            bloques: bloquesData,
            stats: patioStats,
            patioData: updatedPatioData
        };
    }, [sharedData.movements, timeState?.dataSource]);

    console.log('🏗️ useRealPatioData - Procesando datos:', {
        movementsCount: sharedData.movements.length,
        bloquesCount: bloques.length,
        isLoading: sharedData.isLoading,
        error: sharedData.error,
        dataSource: timeState?.dataSource
    });

    return {
        bloques,
        stats,
        patioData,
        isLoading: sharedData.isLoading,
        error: sharedData.error,
        movements: sharedData.movements,
        refreshData: sharedData.refresh
    };
};