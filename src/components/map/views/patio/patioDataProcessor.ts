// src/components/map/views/patio/patioDataProcessor.ts - CORREGIDO
import type { PatioData } from '../../../../types';
import type { BloqueDataExtended } from '../../../../types/patioView.types';
import { getMagdalenaDataForBlock } from './patioDataHelpers';

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

// Función auxiliar para crear stats completos
const createCompleteStats = (partial?: Partial<BloqueDataExtended['stats']>): BloqueDataExtended['stats'] => {
    const baseStats = {
        teusActuales: 0,
        bahiasTotales: 35,
        bahiasReefer: 0,
        gate: { entradas: 0, salidas: 0 },
        gateEntradas: 0,
        gateSalidas: 0,
        muelle: { entradas: 0, salidas: 0 },
        muelleEntradas: 0,
        muelleSalidas: 0,
        despejes: 0,
        despejosBloques: 0,
        despejosPatios: 0,
        reubicacionesEntreBloques: 0,
        reubicacionesEntrePatios: 0,
        entradas: 0,
        salidas: 0,
        remanejos: 0,
        bahias: 35
    };

    return { ...baseStats, ...partial };
};

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
            console.log('🏗️ Procesando datos de Camila para el patio', {
                hasAsignaciones: !!camilaData.asignaciones,
                periodo: currentPeriod,
                resultado: camilaData.resultado
            });

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
                    (sum: number, a: any) => sum + (a.movimientos_asignados || 0),
                    0
                );

                // Calcular ocupación basada en los movimientos del bloque
                let ocupacion = 0;
                if (totalMovimientos > 0 && camilaData.resultado?.total_movimientos_modelo > 0) {
                    // Ocupación proporcional a los movimientos
                    ocupacion = Math.min(95, (totalMovimientos / camilaData.resultado.total_movimientos_modelo) * 100 * 9); // *9 porque hay 9 bloques
                }

                return {
                    id: bloqueId,
                    patioId: patioId,
                    name: `Bloque ${bloqueId}`,
                    ocupacion: Math.round(ocupacion),
                    capacidadTotal: 350,
                    bahias: [],
                    tipo: 'contenedores' as const,
                    bounds: { x: 0, y: 0, width: 100, height: 100 },
                    operationalStatus: totalMovimientos > 0 ? 'active' as const : 'restricted' as const,
                    equipmentType: 'rtg' as const,
                    stats: createCompleteStats({
                        teusActuales: Math.round(350 * ocupacion / 100),
                        entradas: asignacionesBloque.filter((a: any) => a.tipo_operacion === 'RECV').length,
                        salidas: asignacionesBloque.filter((a: any) => a.tipo_operacion === 'DLVR').length
                    })
                };
            }).sort((a, b) => a.id.localeCompare(b.id));

            const estadoSolucion = camilaData.resultado?.total_movimientos_modelo > 0 ?
                'Solución Óptima' : 'Sin Solución Factible';

            return {
                id: 'costanera',
                name: 'Patio Costanera - Modelo Camila',
                type: 'contenedores',
                bloques: bloquesOptimizados,
                ocupacionTotal: Math.round(camilaData.resultado?.utilizacion_promedio || 0),
                bounds: { x: 0, y: 0, width: 1000, height: 600 },
                description: `Semana ${camilaData.resultado?.semana || 'N/A'} - Período ${currentPeriod} - ${estadoSolucion}`,
                operatingHours: { start: '00:00', end: '23:59' },
                restrictions: []
            };
        }

        // Procesar datos de Magdalena - MEJORADO
        if (isMagdalenaActive && magdalenaMetrics) {
            console.log('🏗️ Procesando datos de Magdalena para el patio', {
                turno: currentTurno,
                ocupacionPromedio: magdalenaMetrics.ocupacion?.promedio,
                bloquesConDatos: magdalenaMetrics.ocupacion?.porBloque?.length,
                evolucionTemporal: magdalenaMetrics.evolucionTemporal?.length
            });

            const bloquesIds = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'];

            const bloquesOptimizados: BloqueDataExtended[] = bloquesIds.map(bloqueId => {
                // Obtener datos específicos del bloque usando el helper
                const magdalenaBlockData = getMagdalenaDataForBlock(bloqueId, magdalenaMetrics, currentTurno);

                // Buscar datos de ocupación del bloque en el array porBloque
                const bloqueOcupacion = magdalenaMetrics.ocupacion?.porBloque?.find(
                    (b: any) => b.bloque === bloqueId
                );

                // Determinar ocupación actual
                let ocupacionActual = 0;

                // Prioridad 1: Ocupación específica del turno
                if (magdalenaBlockData?.ocupacionTurno !== undefined && magdalenaBlockData.ocupacionTurno > 0) {
                    ocupacionActual = magdalenaBlockData.ocupacionTurno;
                }
                // Prioridad 2: Ocupación promedio del bloque
                else if (bloqueOcupacion?.ocupacionPromedio !== undefined) {
                    ocupacionActual = bloqueOcupacion.ocupacionPromedio;
                }
                // Prioridad 3: Distribuir ocupación promedio entre bloques
                else if (magdalenaMetrics.ocupacion?.promedio) {
                    // Distribuir la ocupación promedio del patio entre los 9 bloques
                    ocupacionActual = magdalenaMetrics.ocupacion.promedio;
                }

                console.log(`📊 Bloque ${bloqueId}:`, {
                    ocupacionTurno: magdalenaBlockData?.ocupacionTurno,
                    ocupacionPromedio: bloqueOcupacion?.ocupacionPromedio,
                    ocupacionFinal: ocupacionActual,
                    segregaciones: magdalenaBlockData?.segregaciones
                });

                // Determinar si el bloque está activo
                const estaActivo = ocupacionActual > 0 ||
                    (magdalenaBlockData?.movimientos || 0) > 0 ||
                    (magdalenaBlockData?.segregaciones || 0) > 0;

                return {
                    id: bloqueId,
                    patioId: patioId,
                    name: `Bloque ${bloqueId}`,
                    ocupacion: Math.round(ocupacionActual),
                    ocupacionPromedio: Math.round(bloqueOcupacion?.ocupacionPromedio || ocupacionActual),
                    capacidadTotal: 350,
                    bahias: [],
                    tipo: 'contenedores' as const,
                    bounds: { x: 0, y: 0, width: 100, height: 100 },
                    operationalStatus: estaActivo ? 'active' as const : 'restricted' as const,
                    equipmentType: 'rtg' as const,
                    ocupacionPorTurno: magdalenaMetrics.evolucionTemporal?.map((t: any) =>
                        Math.round(t.ocupacionPromedio || 0)
                    ) || [],
                    stats: createCompleteStats({
                        teusActuales: Math.round(350 * ocupacionActual / 100),
                        bahiasTotales: 35,
                        entradas: magdalenaBlockData?.movimientos || 0,
                        salidas: 0,
                        remanejos: 0 // YARD eliminados en Magdalena
                    })
                };
            });

            // Calcular ocupación total del patio
            let ocupacionTotalPatio = 0;

            // Si hay evolución temporal, usar el turno actual
            if (magdalenaMetrics.evolucionTemporal && currentTurno <= magdalenaMetrics.evolucionTemporal.length) {
                const datosTurno = magdalenaMetrics.evolucionTemporal[currentTurno - 1];
                ocupacionTotalPatio = datosTurno?.ocupacionPromedio || 0;
            }
            // Si no, usar el promedio general
            else {
                ocupacionTotalPatio = magdalenaMetrics.ocupacion?.promedio || 0;
            }

            return {
                id: 'costanera',
                name: 'Patio Costanera - Modelo Magdalena',
                type: 'contenedores',
                bloques: bloquesOptimizados,
                ocupacionTotal: Math.round(ocupacionTotalPatio),
                bounds: { x: 0, y: 0, width: 1000, height: 600 },
                description: `${magdalenaMetrics.anio || 2022} - Semana ${magdalenaMetrics.semana || 'N/A'} - P${magdalenaMetrics.participacion || 'N/A'}% ${magdalenaMetrics.conDispersion ? 'con' : 'sin'} dispersión - Turno ${currentTurno}/21`,
                operatingHours: { start: '00:00', end: '23:59' },
                restrictions: []
            };
        }

        // Procesar datos históricos
        if (timeState?.dataSource === 'historical' && realPatioData) {
            console.log('🏗️ Procesando datos históricos del patio');

            // Si hay datos del API de puerto
            if (realPatioData.patios && Array.isArray(realPatioData.patios)) {
                const patioReal = realPatioData.patios.find((p: any) => p.id === patioId);
                if (patioReal) {
                    return patioReal;
                }
            }

            // Si no se encuentra, crear patio por defecto con datos básicos
            console.warn(`Patio ${patioId} no encontrado en datos históricos, creando patio por defecto`);
            return createDefaultPatio(patioId);
        }

        // Si no hay ninguna fuente de datos activa
        console.warn('No hay fuente de datos activa o datos disponibles');
        return createDefaultPatio(patioId);

    } catch (error) {
        console.error('Error procesando datos del patio:', error);
        return createDefaultPatio(patioId);
    }
};

// Función auxiliar para crear un patio por defecto
function createDefaultPatio(patioId: string): PatioData {
    const bloques: BloqueDataExtended[] = [];

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
            stats: createCompleteStats()
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