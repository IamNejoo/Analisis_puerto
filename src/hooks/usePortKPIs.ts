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

// Umbrales actualizados para incluir nuevos KPIs
const KPI_THRESHOLDS: Record<string, KPIThreshold> = {
    utilizacionPorVolumen: {
        warning: 70,
        critical: 85,
        isHigherBetter: false
    },
    flujoPromedioGates: { // Renombrado de congestionVehicular
        warning: 50,
        critical: 100,
        isHigherBetter: true // Cambió a true porque más flujo es mejor
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
    variabilidadOperacional: { // Nuevo, reemplaza saturacionOperacional
        warning: 20,
        critical: 30,
        isHigherBetter: false // Menor variabilidad es mejor
    },
    tiempoPermanencia: { // Nuevo CDT
        warning: 4, // días
        critical: 7, // días
        isHigherBetter: false
    },
    tiempoCamiones: { // Nuevo TTT
        warning: 90, // minutos
        critical: 120, // minutos
        isHigherBetter: false
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
            case 'year':
                startDate.setMonth(0, 1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setMonth(11, 31);
                endDate.setHours(23, 59, 59, 999);
                break;

            case 'month':
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setMonth(endDate.getMonth() + 1, 0);
                endDate.setHours(23, 59, 59, 999);
                break;

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

            case 'hour':
                startDate.setMinutes(0, 0, 0);
                endDate.setMinutes(59, 59, 999);
                break;
        }

        return { startDate, endDate };
    }, [currentDate, unit]);

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

            const [kpisData] = await Promise.all([
                portApi.calculateKPIs(filters)
            ]);

            setCurrentKPIs(kpisData);
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

        // Manejar KPIs compuestos
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
        isLoading,
        error,
        getStatusForKPI,
        formatKPIValue,
        refreshData
    };
};