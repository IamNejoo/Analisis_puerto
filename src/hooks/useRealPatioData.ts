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
            };
        }

        if (!sharedData.movements || sharedData.movements.length === 0) {
            return {
                bloques: [],
                stats: null,
                patioData: staticPatioData
            };
        }

        // DEBUG: Ver todos los movimientos
        console.log('🔍 DEBUG - Total movimientos recibidos:', sharedData.movements.length);
        console.log('🔍 DEBUG - Primeros 3 movimientos:', sharedData.movements.slice(0, 3));

        // DEBUG: Ver si hay despejos en los datos
        const movimientosConDespejos = sharedData.movements.filter(m =>
            m.despejosBloques > 0 || m.despejosPatios > 0
        );
        console.log('🔍 DEBUG - Movimientos con despejos:', movimientosConDespejos.length);
        if (movimientosConDespejos.length > 0) {
            console.log('🔍 DEBUG - Ejemplo con despejos:', movimientosConDespejos[0]);
        }

        // Agrupar movimientos por bloque
        const movimientosPorBloque = new Map<string, number>();
        const ocupacionPorBloque = new Map<string, number>();

        // NUEVO: Agrupar TODOS los movimientos por bloque para sumarlos
        const movimientosAgrupadosPorBloque = new Map<string, any[]>();

        sharedData.movements.forEach(mov => {
            // Agrupar para suma posterior
            if (!movimientosAgrupadosPorBloque.has(mov.bloque)) {
                movimientosAgrupadosPorBloque.set(mov.bloque, []);
            }
            movimientosAgrupadosPorBloque.get(mov.bloque)!.push(mov);

            // Cálculos existentes
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

        // DEBUG: Ver agrupación
        console.log('🔍 DEBUG - Bloques encontrados:', Array.from(movimientosAgrupadosPorBloque.keys()));

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

            // CAMBIO: Sumar TODOS los movimientos del bloque
            const todosLosMovimientos = movimientosAgrupadosPorBloque.get(bloqueId) || [];

            console.log(`🔍 DEBUG - Bloque ${bloqueId}: ${todosLosMovimientos.length} registros`);

            // Sumar todos los campos
            const sumaMovimientos = todosLosMovimientos.reduce((acc, mov) => ({
                gateEntradaContenedores: (acc.gateEntradaContenedores || 0) + (mov.gateEntradaContenedores || 0),
                gateSalidaContenedores: (acc.gateSalidaContenedores || 0) + (mov.gateSalidaContenedores || 0),
                muelleEntradaContenedores: (acc.muelleEntradaContenedores || 0) + (mov.muelleEntradaContenedores || 0),
                muelleSalidaContenedores: (acc.muelleSalidaContenedores || 0) + (mov.muelleSalidaContenedores || 0),
                despejosBloques: (acc.despejosBloques || 0) + (mov.despejosBloques || 0),
                despejosPatios: (acc.despejosPatios || 0) + (mov.despejosPatios || 0),
                patioEntradaContenedores: (acc.patioEntradaContenedores || 0) + (mov.patioEntradaContenedores || 0),
                patioSalidaContenedores: (acc.patioSalidaContenedores || 0) + (mov.patioSalidaContenedores || 0),
                terminalEntradaContenedores: (acc.terminalEntradaContenedores || 0) + (mov.terminalEntradaContenedores || 0),
                terminalSalidaContenedores: (acc.terminalSalidaContenedores || 0) + (mov.terminalSalidaContenedores || 0),
                remanejosContenedores: (acc.remanejosContenedores || 0) + (mov.remanejosContenedores || 0),
                bahias: mov.bahias || totalBays,
                bahiasReefer: mov.bahiasReefer || reeferBays
            }), {
                gateEntradaContenedores: 0,
                gateSalidaContenedores: 0,
                muelleEntradaContenedores: 0,
                muelleSalidaContenedores: 0,
                despejosBloques: 0,
                despejosPatios: 0,
                patioEntradaContenedores: 0,
                patioSalidaContenedores: 0,
                terminalEntradaContenedores: 0,
                terminalSalidaContenedores: 0,
                remanejosContenedores: 0,
                bahias: totalBays,
                bahiasReefer: reeferBays
            });

            // DEBUG: Ver suma para bloques específicos
            if (bloqueId === 'C9') {
                console.log('🔍 DEBUG - Suma C9:', sumaMovimientos);
            }

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

                    // Gate
                    gate: {
                        entradas: sumaMovimientos.gateEntradaContenedores,
                        salidas: sumaMovimientos.gateSalidaContenedores
                    },
                    gateEntradas: sumaMovimientos.gateEntradaContenedores,
                    gateSalidas: sumaMovimientos.gateSalidaContenedores,

                    // Muelle
                    muelle: {
                        entradas: sumaMovimientos.muelleEntradaContenedores,
                        salidas: sumaMovimientos.muelleSalidaContenedores
                    },
                    muelleEntradas: sumaMovimientos.muelleEntradaContenedores,
                    muelleSalidas: sumaMovimientos.muelleSalidaContenedores,

                    // Despejos - usar los valores sumados
                    despejosBloques: sumaMovimientos.despejosBloques,
                    despejosPatios: sumaMovimientos.despejosPatios,
                    bahias: sumaMovimientos.bahias,

                    // Otros campos
                    despejes: sumaMovimientos.despejosBloques + sumaMovimientos.despejosPatios,
                    reubicacionesEntreBloques: sumaMovimientos.patioEntradaContenedores,
                    reubicacionesEntrePatios: sumaMovimientos.terminalEntradaContenedores,
                    entradas: sumaMovimientos.patioEntradaContenedores,
                    salidas: sumaMovimientos.patioSalidaContenedores,
                    remanejos: sumaMovimientos.remanejosContenedores
                }
            };
        });

        // DEBUG: Ver resultado final
        const bloqueC9 = bloquesData.find(b => b.id === 'C9');
        if (bloqueC9) {
            console.log('🔍 DEBUG - Bloque C9 final:', bloqueC9.stats);
        }

        // Actualizar patioData con los bloques procesados
        const updatedPatioData = staticPatioData.map(patio => {
            const bloquesDelPatio = bloquesData.filter(b => b.patioId === patio.id);
            const ocupacionTotal = bloquesDelPatio.length > 0
                ? bloquesDelPatio.reduce((sum, b) => sum + (b.ocupacion * b.capacidadTotal), 0) /
                bloquesDelPatio.reduce((sum, b) => sum + b.capacidadTotal, 0)
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