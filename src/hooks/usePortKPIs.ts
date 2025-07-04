// src/hooks/usePortKPIs.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTimeContext } from '../contexts/TimeContext';
import { portApi, type KPIFilters } from '../services/portApi';
import type {
    CorePortKPIs,
    PortMovementData,
    NumericKPIs,
    KPIStatus,
    KPIThreshold
} from '../types/portKpis';

interface UsePortKPIsOptions {
    patioFilter?: string;
    bloqueFilter?: string;
    operationType?: 'import' | 'export';
}

interface UsePortKPIsReturn {
    currentKPIs: CorePortKPIs | null;
    historicalData: PortMovementData[];
    maximoTeus: number;
    aggregatedData: any[];
    isLoading: boolean;
    error: string | null;
    getStatusForKPI: (kpi: NumericKPIs) => KPIStatus;
    formatKPIValue: (kpi: NumericKPIs) => string;
    refreshData: () => void;
}

import {
    CAPACIDADES_BLOQUES as CAPACIDADES,
    CAPACIDAD_TOTAL_TERMINAL as CAPACIDAD_TERMINAL,
    PATIO_BLOCKS as PATIOS
} from '../types/portKpis';

// Mapeo de semanas a fechas
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

// Umbrales actualizados para incluir nuevos KPIs
const KPI_THRESHOLDS: Record<string, KPIThreshold> = {
    utilizacionPorVolumen: {
        warning: 70,
        critical: 85,
        isHigherBetter: false
    },
    flujoPromedioGates: {
        warning: 50,
        critical: 100,
        isHigherBetter: true
    },
    balanceFlujo: {
        warning: 1.2,
        critical: 1.5,
        isHigherBetter: false,
        optimalMin: 0.8,
        optimalMax: 1.2
    },
    productividadOperacional: {
        warning: 100,
        critical: 50,
        isHigherBetter: true
    },
    indiceRemanejo: {
        warning: 3,
        critical: 5,
        isHigherBetter: false
    },
    variabilidadOperacional: {
        warning: 20,
        critical: 30,
        isHigherBetter: false
    },
    tiempoPermanencia: {
        warning: 4, // días
        critical: 7, // días
        isHigherBetter: false
    },
    tiempoCamiones: {
        warning: 90, // minutos
        critical: 120, // minutos
        isHigherBetter: false
    },
    movimientosGateHora: {
        warning: 30,
        critical: 20,
        isHigherBetter: true
    },
    movimientosPatioHora: {
        warning: 40,
        critical: 60,
        isHigherBetter: false // Menos movimientos internos es mejor
    },
    movimientosMuelleHora: {
        warning: 30,
        critical: 20,
        isHigherBetter: true
    }
};

const getDefaultCoreKPIs = (): CorePortKPIs => ({
    utilizacionPorVolumen: 0,
    promedioTeus: 0,
    capacidadTotal: CAPACIDAD_TERMINAL,
    utilizacionPorBloque: {},
    utilizacionPorPatio: {},
    flujoPromedioGates: 0,
    gateThroughput: 0,
    balanceFlujo: 1,
    totalEntradas: 0,
    totalSalidas: 0,
    productividadOperacional: 0,
    indiceRemanejo: 0,
    totalRemanejos: 0,
    variabilidadOperacional: 0,
    rangoOperativo: 0,
    minimoTeus: 0,
    maximoTeus: 0,
    horasCriticas: 0,
    tiempoPermanencia: {
        promedioHoras: 0,
        promedioDias: 0,
        minimo: 0,
        maximo: 0,
        mediana: 0,
        p90: 0,
        p95: 0,
        totalContenedores: 0,
        criticos: 0
    },
    tiempoCamiones: {
        promedio: 0,
        minimo: 0,
        maximo: 0,
        mediana: 0,
        p90: 0,
        p95: 0,
        totalCamiones: 0
    },
    // NUEVOS CAMPOS con valores default
    movimientosGateHora: 0,
    movimientosPatioHora: 0,
    movimientosMuelleHora: 0,
    labelMovimientos1: "Movimientos Gate",
    labelMovimientos2: "Movimientos Patio",
    labelMovimientos3: "Movimientos Muelle",
    vistaContexto: 'terminal',
    movimientosPorBloque: {},
    remanejosPorBloque: {},
    horasConActividad: 0,
    totalMovimientos: 0
});

export const usePortKPIs = ({
    patioFilter,
    bloqueFilter,
    operationType
}: UsePortKPIsOptions = {}): UsePortKPIsReturn => {
    const [currentKPIs, setCurrentKPIs] = useState<CorePortKPIs | null>(null);
    const [historicalData, setHistoricalData] = useState<PortMovementData[]>([]);
    const [aggregatedData, setAggregatedData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchingRef = useRef(false);
    const { timeState } = useTimeContext();
    const { unit, currentDate, dataSource } = timeState;

    const getDateRange = useCallback(() => {
        const startDate = new Date(currentDate);
        const endDate = new Date(currentDate);

        switch (unit) {
            case 'week':
                const weekNumber = timeState.magdalenaConfig?.semana || getWeekNumberFromDate(startDate);
                const weekRange = getWeekDateRange(weekNumber);

                if (weekRange) {
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

            case 'hour':
                startDate.setMinutes(0, 0, 0);
                endDate.setMinutes(59, 59, 999);
                break;

            case 'shift':
                const hour = startDate.getHours();
                if (hour >= 6 && hour < 14) {
                    startDate.setHours(6, 0, 0, 0);
                    endDate.setHours(13, 59, 59, 999);
                } else if (hour >= 14 && hour < 22) {
                    startDate.setHours(14, 0, 0, 0);
                    endDate.setHours(21, 59, 59, 999);
                } else {
                    startDate.setHours(22, 0, 0, 0);
                    endDate.setHours(5, 59, 59, 999);
                    endDate.setDate(endDate.getDate() + 1);
                }
                break;
        }

        return { startDate, endDate };
    }, [currentDate, unit, timeState.magdalenaConfig?.semana]);

    const loadDataFromAPI = useCallback(async () => {
        if (fetchingRef.current) return;

        fetchingRef.current = true;
        setIsLoading(true);
        setError(null);

        try {
            const { startDate, endDate } = getDateRange();

            const filters: KPIFilters = {
                startDate,
                endDate,
                unit,
                patioFilter,
                bloqueFilter,
                operationType
            };

            console.log('Llamando API con unit:', unit);
            console.log('Filters completos:', filters);

            const [kpisData, historicalMovements] = await Promise.all([
                portApi.calculateKPIs(filters),
                portApi.getHistoricalMovements(filters)
            ]);

            setCurrentKPIs(kpisData);
            setHistoricalData(historicalMovements);
            setAggregatedData([]);

        } catch (err) {
            console.error('Error cargando datos:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setCurrentKPIs(getDefaultCoreKPIs());
            setHistoricalData([]);
        } finally {
            setIsLoading(false);
            fetchingRef.current = false;
        }

    }, [getDateRange, unit, patioFilter, bloqueFilter, operationType]);

    useEffect(() => {
        if (dataSource !== 'historical') {
            setCurrentKPIs(null);
            setHistoricalData([]);
            setAggregatedData([]);
            return;
        }

        loadDataFromAPI();
    }, [dataSource, currentDate, unit, patioFilter, bloqueFilter, operationType, loadDataFromAPI]);

    const getStatusForKPI = useCallback((kpi: NumericKPIs): KPIStatus => {
        if (!currentKPIs) return 'normal';

        let value: number;

        // Manejar KPIs compuestos
        if (kpi === 'tiempoPermanencia' && currentKPIs.tiempoPermanencia) {
            value = currentKPIs.tiempoPermanencia.promedioDias;
        } else if (kpi === 'tiempoCamiones' && currentKPIs.tiempoCamiones) {
            value = currentKPIs.tiempoCamiones.promedio;
        } else if (typeof currentKPIs[kpi as keyof CorePortKPIs] === 'number') {
            value = currentKPIs[kpi as keyof CorePortKPIs] as number;
        } else {
            return 'normal';
        }
        if (kpi === 'movimientosGateHora') {
            value = currentKPIs.movimientosGateHora || 0;
        } else if (kpi === 'movimientosPatioHora') {
            value = currentKPIs.movimientosPatioHora || 0;
        } else if (kpi === 'movimientosMuelleHora') {
            value = currentKPIs.movimientosMuelleHora || 0;
        } else if (kpi === 'tiempoPermanencia' && currentKPIs.tiempoPermanencia) {
            value = currentKPIs.tiempoPermanencia.promedioDias;
        }
        const threshold = KPI_THRESHOLDS[kpi];
        if (!threshold) return 'normal';

        if (kpi === 'balanceFlujo') {
            const { optimalMin, optimalMax, critical } = threshold as any;
            if (value >= optimalMin && value <= optimalMax) return 'good';
            if (value > critical || value < 0.8) return 'critical';
            return 'warning';
        }

        if (threshold.isHigherBetter) {
            if (value >= threshold.warning) return 'good';
            if (value >= threshold.critical) return 'warning';
            return 'critical';
        } else {
            if (value >= threshold.critical) return 'critical';
            if (value >= threshold.warning) return 'warning';
            return 'good';
        }
    }, [currentKPIs]);

    const formatKPIValue = useCallback((kpi: NumericKPIs): string => {
        if (!currentKPIs) return 'N/A';

        let value: number | undefined;

        switch (kpi) {
            case 'tiempoPermanencia':
                value = currentKPIs.tiempoPermanencia?.promedioDias;
                return value !== undefined ? `${value.toFixed(1)} días` : 'N/A';

            case 'tiempoCamiones':
                value = currentKPIs.tiempoCamiones?.promedio;
                return value !== undefined ? `${Math.round(value)} min` : 'N/A';

            case 'utilizacionPorVolumen':
            case 'indiceRemanejo':
            case 'variabilidadOperacional':
                value = currentKPIs[kpi as keyof CorePortKPIs] as number;
                return value !== undefined ? `${value.toFixed(1)}%` : 'N/A';

            case 'flujoPromedioGates':
                value = currentKPIs.flujoPromedioGates;
                if (value === null || value === undefined || isNaN(value)) {
                    return '0';
                }
                return value !== undefined ? `${value.toFixed(0)} cont/h` : 'N/A';

            case 'balanceFlujo':
                value = currentKPIs.balanceFlujo;
                return value !== undefined ? value.toFixed(2) : 'N/A';

            case 'productividadOperacional':
                value = currentKPIs.productividadOperacional;
                return value !== undefined ? `${value.toFixed(0)} mov/h` : 'N/A';

            default:
                value = currentKPIs[kpi as keyof CorePortKPIs] as number;
                return value !== undefined ? value.toFixed(2) : 'N/A';
        }
    }, [currentKPIs]);

    const refreshData = useCallback(() => {
        loadDataFromAPI();
    }, [loadDataFromAPI]);

    return {
        currentKPIs,
        historicalData,
        aggregatedData,
        maximoTeus: currentKPIs ? currentKPIs.maximoTeus : 0,
        isLoading,
        error,
        getStatusForKPI,
        formatKPIValue,
        refreshData
    };
};