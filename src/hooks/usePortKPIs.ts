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

const KPI_THRESHOLDS: Record<string, KPIThreshold> = {
    utilizacionPorVolumen: {
        warning: 60,
        critical: 85,
        isHigherBetter: false
    },
    congestionVehicular: {
        warning: 50,
        critical: 100,
        isHigherBetter: false
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
    saturacionOperacional: {
        warning: 70,
        critical: 90,
        isHigherBetter: false
    }
};

const getDefaultCoreKPIs = (): CorePortKPIs => ({
    utilizacionPorVolumen: 0,
    congestionVehicular: 0,
    balanceFlujo: 1,
    productividadOperacional: 0,
    indiceRemanejo: 0,
    saturacionOperacional: 0,
    utilizacionPorBloque: {},
    utilizacionPorPatio: {},
    movimientosPorBloque: {},
    remanejosPorBloque: {},
    horasConActividad: 0,
    totalMovimientos: 0
});

export const usePortKPIs = ({
    patioFilter,
    bloqueFilter
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
                bloqueFilter
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
    }, [getDateRange, unit, patioFilter, bloqueFilter]);

    useEffect(() => {
        if (dataSource !== 'historical') {
            setCurrentKPIs(null);
            setHistoricalData([]);
            setAggregatedData([]);
            return;
        }

        loadDataFromAPI();
    }, [dataSource, currentDate, unit, patioFilter, bloqueFilter, loadDataFromAPI]);

    const getStatusForKPI = useCallback((kpi: NumericKPIs): KPIStatus => {
        if (!currentKPIs || typeof currentKPIs[kpi] !== 'number') {
            return 'normal';
        }

        const value = currentKPIs[kpi] as number;
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
        if (!currentKPIs || typeof currentKPIs[kpi] !== 'number') {
            return 'N/A';
        }

        const value = currentKPIs[kpi] as number;

        switch (kpi) {
            case 'utilizacionPorVolumen':
            case 'indiceRemanejo':
            case 'saturacionOperacional':
                return `${value.toFixed(1)}%`;
            case 'congestionVehicular':
                return `${value.toFixed(0)} mov/h`;
            case 'balanceFlujo':
                return value.toFixed(2);
            case 'productividadOperacional':
                return `${value.toFixed(0)} cont/h`;
            default:
                return value.toFixed(2);
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