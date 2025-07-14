// src/components/map/views/patio/patioDataProcessor.ts
import type { PatioData } from '../../../../types';
import type { BloqueDataExtended } from '../../../../types/patioView.types';

interface ProcessPatioDataParams {
    isCamilaActive: boolean;
    isMagdalenaActive: boolean;
    camilaData: any;
    magdalenaMetrics: any;
    realPatioData: any;
    timeState: any;
    patioId: string;
    currentTurno: number;
    currentPeriod: number;
}

export const processPatioData = ({
    isCamilaActive,
    isMagdalenaActive,
    camilaData,
    magdalenaMetrics,
    realPatioData,
    timeState,
    patioId,
    currentTurno,
    currentPeriod
}: ProcessPatioDataParams): PatioData | null => {
    try {
        // Procesar datos de Camila
        if (isCamilaActive && camilaData) {
            console.log('🏗️ Procesando datos de Camila para el patio');

            const bloquesSet = new Set<string>();
            if (camilaData.asignaciones && Array.isArray(camilaData.asignaciones)) {
                camilaData.asignaciones.forEach((asig: any) => {
                    if (asig?.bloque_codigo) {
                        bloquesSet.add(asig.bloque_codigo);
                    }
                });
            }

            // Si no hay bloques, crear los 9 bloques por defecto
            if (bloquesSet.size === 0) {
                for (let i = 1; i <= 9; i++) {
                    bloquesSet.add(`C${i}`);
                }
            }

            const bloquesOptimizados: BloqueDataExtended[] = Array.from(bloquesSet).map(bloqueId => {
                const asignacionesBloque = camilaData.asignaciones?.filter(
                    (a: any) => a.bloque_codigo === bloqueId && a.periodo === currentPeriod
                ) || [];

                const totalMovimientos = asignacionesBloque.reduce(
                    (sum: number, a: any) => sum + (a.frecuencia || 0),
                    0
                );
                const utilizacion = camilaData.resultado?.utilizacion_promedio || 0;

                return {
                    id: bloqueId,
                    patioId: patioId,
                    name: `Bloque ${bloqueId}`,
                    ocupacion: Math.round(utilizacion),
                    capacidadTotal: 350,
                    bahias: [],
                    tipo: 'contenedores' as const,
                    bounds: { x: 0, y: 0, width: 100, height: 100 },
                    operationalStatus: totalMovimientos > 0 ? 'active' as const : 'restricted' as const,
                    equipmentType: 'rtg' as const,
                    stats: {
                        entradas: 0,
                        salidas: 0,
                        remanejos: 0,
                        teusActuales: Math.round(350 * utilizacion / 100),
                        bahiasTotales: 35,
                        bahiasReefer: 0,
                        gate: { entradas: 0, salidas: 0 },
                        muelle: { entradas: 0, salidas: 0 },
                        despejes: 0,
                        reubicacionesEntreBloques: 0,
                        reubicacionesEntrePatios: 0
                    }
                };
            }).sort((a, b) => a.id.localeCompare(b.id));

            const estadoSolucion = camilaData.resultado?.total_movimientos > 0 ?
                'Solución Óptima' : 'Sin Solución Factible';

            return {
                id: 'costanera',
                name: 'Patio Costanera - Modelo Camila',
                type: 'contenedores',
                bloques: bloquesOptimizados,
                ocupacionTotal: Math.round(camilaData.resultado?.utilizacion_promedio || 0),
                bounds: { x: 0, y: 0, width: 1000, height: 600 },
                description: `Semana ${camilaData.resultado?.semana || 'N/A'} - Turno ${camilaData.resultado?.turno || 'N/A'} - ${estadoSolucion}`,
                operatingHours: { start: '00:00', end: '23:59' },
                restrictions: []
            };
        }

        // Procesar datos de Magdalena
        if (isMagdalenaActive && magdalenaMetrics) {
            console.log('🏗️ Procesando datos de Magdalena para el patio');

            const bloquesOptimizados: BloqueDataExtended[] = magdalenaMetrics.ocupacion?.porBloque?.map((bloqueData: any) => {
                const evolucionActual = magdalenaMetrics.evolucionTemporal?.find(
                    (t: any) => t.periodo === currentTurno
                );
                const ocupacionActual = evolucionActual?.ocupacionPromedio || bloqueData.ocupacionPromedio || 0;

                return {
                    id: bloqueData.bloque,
                    patioId: patioId,
                    name: `Bloque ${bloqueData.bloque}`,
                    ocupacion: Math.round(ocupacionActual),
                    ocupacionPromedio: Math.round(bloqueData.ocupacionPromedio || 0),
                    capacidadTotal: Math.round((magdalenaMetrics.ocupacion?.capacidadTotal || 3150) / 9),
                    bahias: [],
                    tipo: 'contenedores' as const,
                    bounds: { x: 0, y: 0, width: 100, height: 100 },
                    operationalStatus: 'active' as const,
                    equipmentType: 'rtg' as const,
                    ocupacionPorTurno: magdalenaMetrics.evolucionTemporal?.map((t: any) =>
                        Math.round(t.ocupacionPromedio || 0)
                    ) || [],
                    stats: {
                        entradas: 0,
                        salidas: 0,
                        remanejos: 0,
                        teusActuales: 0,
                        bahiasTotales: 35,
                        bahiasReefer: 0,
                        gate: { entradas: 0, salidas: 0 },
                        muelle: { entradas: 0, salidas: 0 },
                        despejes: 0,
                        reubicacionesEntreBloques: 0,
                        reubicacionesEntrePatios: 0
                    }
                };
            }) || [];

            // Si no hay bloques, crear los 9 bloques por defecto
            if (bloquesOptimizados.length === 0) {
                for (let i = 1; i <= 9; i++) {
                    bloquesOptimizados.push({
                        id: `C${i}`,
                        patioId: patioId,
                        name: `Bloque C${i}`,
                        ocupacion: 0,
                        ocupacionPromedio: 0,
                        capacidadTotal: 350,
                        bahias: [],
                        tipo: 'contenedores' as const,
                        bounds: { x: 0, y: 0, width: 100, height: 100 },
                        operationalStatus: 'active' as const,
                        equipmentType: 'rtg' as const,
                        ocupacionPorTurno: [],
                        stats: {
                            entradas: 0,
                            salidas: 0,
                            remanejos: 0,
                            teusActuales: 0,
                            bahiasTotales: 35,
                            bahiasReefer: 0,
                            gate: { entradas: 0, salidas: 0 },
                            muelle: { entradas: 0, salidas: 0 },
                            despejes: 0,
                            reubicacionesEntreBloques: 0,
                            reubicacionesEntrePatios: 0
                        }
                    });
                }
            }

            return {
                id: 'costanera',
                name: 'Patio Costanera - Modelo Magdalena',
                type: 'contenedores',
                bloques: bloquesOptimizados,
                ocupacionTotal: Math.round(magdalenaMetrics.ocupacion?.promedio || 0),
                bounds: { x: 0, y: 0, width: 1000, height: 600 },
                description: `${magdalenaMetrics.anio || 2022} - Semana ${magdalenaMetrics.semana || 'N/A'} - P${magdalenaMetrics.participacion || 'N/A'}% - Turno ${currentTurno}`,
                operatingHours: { start: '00:00', end: '23:59' },
                restrictions: []
            };
        }

        // Datos históricos
        if (timeState?.dataSource === 'historical' && realPatioData) {
            // Verificar que realPatioData tiene la estructura esperada
            if (realPatioData.patios && Array.isArray(realPatioData.patios)) {
                const patioReal = realPatioData.patios.find((p: any) => p.id === patioId);
                if (patioReal) {
                    return patioReal;
                }
            }

            // Si no encuentra el patio, crear uno por defecto
            console.warn(`Patio ${patioId} no encontrado en datos históricos`);
            return createDefaultPatio(patioId);
        }

        return null;
    } catch (error) {
        console.error('Error procesando datos del patio:', error);
        return null;
    }
};

// Función auxiliar para crear un patio por defecto
function createDefaultPatio(patioId: string): PatioData {
    const bloques: BloqueDataExtended[] = [];

    // Crear 9 bloques por defecto
    for (let i = 1; i <= 9; i++) {
        bloques.push({
            id: `C${i}`,
            patioId: patioId,
            name: `Bloque C${i}`,
            ocupacion: 0,
            capacidadTotal: 350,
            bahias: [],
            tipo: 'contenedores' as const,
            bounds: { x: 0, y: 0, width: 100, height: 100 },
            operationalStatus: 'active' as const,
            equipmentType: 'rtg' as const,
            stats: {
                entradas: 0,
                salidas: 0,
                remanejos: 0,
                teusActuales: 0,
                bahiasTotales: 35,
                bahiasReefer: 0,
                gate: { entradas: 0, salidas: 0 },
                muelle: { entradas: 0, salidas: 0 },
                despejes: 0,
                reubicacionesEntreBloques: 0,
                reubicacionesEntrePatios: 0
            }
        });
    }

    return {
        id: patioId,
        name: `Patio ${patioId.charAt(0).toUpperCase() + patioId.slice(1)}`,
        type: 'contenedores',
        bloques: bloques,
        ocupacionTotal: 0,
        bounds: { x: 0, y: 0, width: 1000, height: 600 },
        description: 'Sin datos disponibles',
        operatingHours: { start: '00:00', end: '23:59' },
        restrictions: []
    };
}