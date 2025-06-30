// src/hooks/useRealPatioData.ts
import { useState, useEffect, useMemo } from 'react';
import { useTimeContext } from '../contexts/TimeContext';
import { portApi } from '../services/portApi';
import { BLOCK_CAPACITIES, BLOCK_TOTAL_BAYS, BLOCK_REEFER_BAYS } from '../constants/blockCapacities';
import type { PatioData, BloqueData } from '../types';
import type { PortMovementData } from '../types/portKpis';

interface UseRealPatioDataReturn {
    patioData: PatioData[];
    isLoading: boolean;
    error: string | null;
    refreshData: () => void;
}

// Mapeo de semanas a fechas (AÑADIR)
const weekToDateMap: { [key: number]: string } = {
    1: '2022-01-03', 2: '2022-01-10', 3: '2022-01-17', 4: '2022-01-24', 5: '2022-01-31',
    6: '2022-02-07', 7: '2022-02-14', 8: '2022-02-21', 9: '2022-02-28', 10: '2022-03-07',
    11: '2022-03-14', 12: '2022-03-21', 13: '2022-03-28', 14: '2022-04-04', 15: '2022-04-11',
    16: '2022-04-18', 17: '2022-04-25', 18: '2022-05-02', 19: '2022-05-09', 20: '2022-05-16',
    21: '2022-05-23', 22: '2022-05-30', 23: '2022-06-06', 24: '2022-06-13', 25: '2022-06-20',
    26: '2022-06-27', 27: '2022-07-04', 28: '2022-07-11', 29: '2022-07-18', 30: '2022-07-25',
    31: '2022-08-01', 32: '2022-08-08', 33: '2022-08-15', 34: '2022-08-22', 35: '2022-08-29',
    36: '2022-09-05', 37: '2022-09-12', 38: '2022-09-19', 39: '2022-09-26', 40: '2022-10-03',
    41: '2022-10-10', 42: '2022-10-17', 43: '2022-10-24', 44: '2022-10-31', 45: '2022-11-07',
    46: '2022-11-14', 47: '2022-11-21', 48: '2022-11-28', 49: '2022-12-05', 50: '2022-12-12',
    51: '2022-12-19', 52: '2022-12-26'
};

// Función helper para obtener el rango de fechas de una semana
const getWeekDateRange = (weekNumber: number) => {
    const startDateStr = weekToDateMap[weekNumber];
    if (!startDateStr) return null;

    const startDate = new Date(startDateStr);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
};

// Función para obtener el número de semana desde una fecha
const getWeekNumberFromDate = (date: Date): number => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    // Buscar coincidencia exacta
    for (const [week, weekDate] of Object.entries(weekToDateMap)) {
        if (weekDate === dateStr) {
            return parseInt(week);
        }
    }

    // Buscar en qué rango cae
    for (let week = 1; week <= 52; week++) {
        const range = getWeekDateRange(week);
        if (range && date >= range.startDate && date <= range.endDate) {
            return week;
        }
    }

    return 1;
};

export const useRealPatioData = (): UseRealPatioDataReturn => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [movementData, setMovementData] = useState<PortMovementData[]>([]);

    const { timeState } = useTimeContext();
    const { currentDate, unit, magdalenaConfig } = timeState;

    // Calcular rango de fechas según la unidad de tiempo
    const getDateRange = () => {
        const startDate = new Date(currentDate);
        const endDate = new Date(currentDate);

        switch (unit) {
            case 'week':
                // USAR EL MAPEO DE SEMANAS EN LUGAR DEL CÁLCULO ESTÁNDAR
                const weekNumber = magdalenaConfig?.semana || getWeekNumberFromDate(startDate);
                const weekRange = getWeekDateRange(weekNumber);

                if (weekRange) {
                    console.log('🗓️ Usando mapeo de semanas:', {
                        weekNumber,
                        startDate: weekRange.startDate.toISOString(),
                        endDate: weekRange.endDate.toISOString()
                    });
                    return weekRange;
                }

                // Fallback al cálculo estándar si algo falla
                const dayOfWeek = startDate.getDay();
                startDate.setDate(startDate.getDate() - dayOfWeek);
                startDate.setHours(0, 0, 0, 0);
                endDate.setDate(startDate.getDate() + 6);
                endDate.setHours(23, 59, 59, 999);
                break;

            case 'day':
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                break;

            case 'shift':
                // Determinar turno actual según el mapeo del TimeControl
                const hour = startDate.getHours();
                if (hour >= 6 && hour < 14) {
                    startDate.setHours(6, 0, 0, 0);
                    endDate.setHours(13, 59, 59, 999);
                } else if (hour >= 14 && hour < 22) {
                    startDate.setHours(14, 0, 0, 0);
                    endDate.setHours(21, 59, 59, 999);
                } else {
                    // Turno nocturno (22:00 - 06:00)
                    if (hour >= 22) {
                        startDate.setHours(22, 0, 0, 0);
                        endDate.setDate(endDate.getDate() + 1);
                        endDate.setHours(5, 59, 59, 999);
                    } else {
                        // Si es de madrugada (00:00-05:59)
                        startDate.setDate(startDate.getDate() - 1);
                        startDate.setHours(22, 0, 0, 0);
                        endDate.setHours(5, 59, 59, 999);
                    }
                }
                break;

            case 'hour':
                // Para hora, usar el rango de horas del contexto
                const hourRange = timeState.hourRange || { start: 8, end: 16 };
                startDate.setHours(hourRange.start, 0, 0, 0);
                endDate.setHours(hourRange.end - 1, 59, 59, 999);
                break;
        }

        return { startDate, endDate };
    };

    // Cargar datos de la API
    const loadData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { startDate, endDate } = getDateRange();

            console.log('📊 Cargando datos de patios:', {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                unit,
                semana: unit === 'week' ? (magdalenaConfig?.semana || getWeekNumberFromDate(currentDate)) : undefined
            });

            const movements = await portApi.getHistoricalMovements({
                startDate,
                endDate,
                unit
            });

            setMovementData(movements);
        } catch (err) {
            console.error('Error cargando datos:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar datos cuando cambien las dependencias relevantes
    useEffect(() => {
        // Solo cargar datos si estamos en modo histórico
        if (timeState.dataSource !== 'historical') {
            setMovementData([]);
            setIsLoading(false);
            return;
        }

        loadData();
    }, [currentDate, unit, magdalenaConfig?.semana, timeState.dataSource, timeState.hourRange]);

    // Transformar datos de movimientos a estructura de PatioData
    const patioData = useMemo(() => {
        if (movementData.length === 0) return [];

        // Agrupar datos por bloque
        const bloqueDataMap = new Map<string, PortMovementData[]>();

        movementData.forEach(movement => {
            const bloque = movement.bloque;
            if (!bloqueDataMap.has(bloque)) {
                bloqueDataMap.set(bloque, []);
            }
            bloqueDataMap.get(bloque)!.push(movement);
        });

        // Crear estructura de patios
        const patios: PatioData[] = [
            {
                id: 'costanera',
                name: 'Patio Costanera',
                type: 'contenedores',
                ocupacionTotal: 0, // Se calculará después
                bounds: { x: 447, y: 518, width: 400, height: 120 },
                description: 'Principal área de almacenamiento de contenedores del terminal',
                operatingHours: { start: '00:00', end: '23:59' },
                restrictions: [],
                bloques: []
            },
            {
                id: 'ohiggins',
                name: 'Patio O\'Higgins',
                type: 'ohiggins',
                ocupacionTotal: 0,
                bounds: { x: 302, y: 437, width: 200, height: 150 },
                description: 'Área especializada para contenedores refrigerados',
                operatingHours: { start: '00:00', end: '23:59' },
                restrictions: [],
                bloques: []
            },
            {
                id: 'tebas',
                name: 'Patio Tebas',
                type: 'tebas',
                ocupacionTotal: 0,
                bounds: { x: 278, y: 336, width: 60, height: 80 },
                description: 'Área de almacenamiento temporal',
                operatingHours: { start: '00:00', end: '23:59' },
                restrictions: [],
                bloques: []
            },
            {
                id: 'imo',
                name: 'Zona IMO',
                type: 'imo',
                ocupacionTotal: 0,
                bounds: { x: 178, y: 421, width: 60, height: 32 },
                description: 'Área para mercancías peligrosas',
                operatingHours: { start: '00:00', end: '23:59' },
                restrictions: [],
                bloques: []
            },
            {
                id: 'espingon',
                name: 'Patio Espingón',
                type: 'espingon',
                ocupacionTotal: 0,
                bounds: { x: 946, y: 467, width: 80, height: 60 },
                description: 'Área de operaciones especiales',
                operatingHours: { start: '00:00', end: '23:59' },
                restrictions: [],
                bloques: []
            }
        ];

        // Mapeo de bloques a patios
        const bloquePatioMap: Record<string, string> = {
            'C1': 'costanera', 'C2': 'costanera', 'C3': 'costanera',
            'C4': 'costanera', 'C5': 'costanera', 'C6': 'costanera',
            'C7': 'costanera', 'C8': 'costanera', 'C9': 'costanera',
            'H1': 'ohiggins', 'H2': 'ohiggins', 'H3': 'ohiggins',
            'H4': 'ohiggins', 'H5': 'ohiggins',
            'T1': 'tebas', 'T2': 'tebas', 'T3': 'tebas', 'T4': 'tebas',
            'I1': 'imo', 'I2': 'imo',
            'E1': 'espingon', 'E2': 'espingon'
        };

        // Procesar cada bloque
        bloqueDataMap.forEach((movements, bloqueId) => {
            const patioId = bloquePatioMap[bloqueId];
            if (!patioId) return;

            const patio = patios.find(p => p.id === patioId);
            if (!patio) return;

            // Calcular ocupación actual del bloque
            // Para el período seleccionado, tomar el último valor de promedioTeus
            const lastMovement = movements[movements.length - 1];
            const capacidad = BLOCK_CAPACITIES[bloqueId] || 1000;
            const ocupacionTeus = lastMovement.promedioTeus || 0;
            const ocupacionPorcentaje = Math.round((ocupacionTeus / capacidad) * 100);

            // Calcular estadísticas adicionales
            const totalEntradas = movements.reduce((sum, m) =>
                sum + m.gateEntradaTeus + m.muelleEntradaTeus + m.patioEntradaTeus, 0
            );
            const totalSalidas = movements.reduce((sum, m) =>
                sum + m.gateSalidaTeus + m.muelleSalidaTeus + m.patioSalidaTeus, 0
            );
            const totalRemanejos = movements.reduce((sum, m) => sum + m.remanejosTeus, 0);

            const bloque: BloqueData = {
                id: bloqueId,
                patioId: patioId,
                name: `Bloque ${bloqueId}`,
                ocupacion: Math.min(100, Math.max(0, ocupacionPorcentaje)),
                capacidadTotal: capacidad,
                tipo: 'contenedores' as const,
                bounds: { x: 0, y: 0, width: 100, height: 50 }, // Se ajustarán en PatioView
                lastUpdate: new Date(),
                operationalStatus: ocupacionPorcentaje > 90 ? 'restricted' : 'active',
                equipmentType: bloqueId.startsWith('C') ? 'rtg' : 'reach_stacker',
                bahias: [], // Por ahora vacío, se puede llenar después
                // Datos adicionales para mostrar
                stats: {
                    entradas: totalEntradas,
                    salidas: totalSalidas,
                    remanejos: totalRemanejos,
                    teusActuales: ocupacionTeus,
                    bahiasTotales: BLOCK_TOTAL_BAYS[bloqueId] || 30,
                    bahiasReefer: BLOCK_REEFER_BAYS[bloqueId] || 0
                }
            };

            patio.bloques.push(bloque);
        });

        // Calcular ocupación total de cada patio
        patios.forEach(patio => {
            if (patio.bloques.length > 0) {
                const totalCapacidad = patio.bloques.reduce((sum, b) => sum + b.capacidadTotal, 0);
                const totalOcupado = patio.bloques.reduce((sum, b) =>
                    sum + (b.capacidadTotal * b.ocupacion / 100), 0
                );
                patio.ocupacionTotal = Math.round((totalOcupado / totalCapacidad) * 100);
            }
        });

        // Ordenar bloques dentro de cada patio
        patios.forEach(patio => {
            patio.bloques.sort((a, b) => {
                const numA = parseInt(a.id.replace(/\D/g, ''));
                const numB = parseInt(b.id.replace(/\D/g, ''));
                return numA - numB;
            });
        });

        return patios;
    }, [movementData]);

    const refreshData = () => {
        loadData();
    };

    return {
        patioData,
        isLoading,
        error,
        refreshData
    };
};