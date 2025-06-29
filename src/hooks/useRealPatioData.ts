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

export const useRealPatioData = (): UseRealPatioDataReturn => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [movementData, setMovementData] = useState<PortMovementData[]>([]);

    const { timeState } = useTimeContext();
    const { currentDate, unit } = timeState;

    // Calcular rango de fechas según la unidad de tiempo
    const getDateRange = () => {
        const startDate = new Date(currentDate);
        const endDate = new Date(currentDate);

        switch (unit) {
            case 'week':
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
                // Determinar turno actual (3 turnos de 8 horas)
                const hour = startDate.getHours();
                if (hour >= 0 && hour < 8) {
                    startDate.setHours(0, 0, 0, 0);
                    endDate.setHours(7, 59, 59, 999);
                } else if (hour >= 8 && hour < 16) {
                    startDate.setHours(8, 0, 0, 0);
                    endDate.setHours(15, 59, 59, 999);
                } else {
                    startDate.setHours(16, 0, 0, 0);
                    endDate.setHours(23, 59, 59, 999);
                }
                break;

            case 'hour':
                startDate.setMinutes(0, 0, 0);
                endDate.setMinutes(59, 59, 999);
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

    useEffect(() => {
        loadData();
    }, [currentDate, unit]);

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