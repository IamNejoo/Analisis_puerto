// src/hooks/usePortKPIs.ts
import { useCallback, useMemo } from 'react';
import { useSharedPortData } from './useSharedPortData';
import { useViewNavigation } from '../contexts/ViewNavigationContext';
import type {
    CorePortKPIs,
    PortMovementData,
    NumericKPIs,
    KPIStatus,
    KPIThreshold
} from '../types/portKpis';

// Umbrales base (para KPIs que no varían)
const KPI_THRESHOLDS: Record<string, KPIThreshold> = {
    utilizacionPorVolumen: {
        warning: 70,
        critical: 85,
        isHigherBetter: false,
        optimalMin: 50,
        optimalMax: 70
    },
    balanceFlujo: {
        warning: 1.3,
        critical: 1.5,
        isHigherBetter: false,
        optimalMin: 0.9,
        optimalMax: 1.1
    },
    indiceRemanejo: {
        warning: 5,
        critical: 8,
        isHigherBetter: false
    },
    tiempoPermanencia: {
        warning: 5,
        critical: 7,
        isHigherBetter: false
    },
    tiempoCamiones: {
        warning: 90,
        critical: 120,
        isHigherBetter: false
    }
};

// NUEVA FUNCIÓN: Obtener umbrales según el nivel
const getThresholdForLevel = (
    kpiName: string,
    viewLevel: 'terminal' | 'patio' | 'bloque'
): KPIThreshold => {

    // KPIs con umbrales variables según nivel
    if (kpiName === 'flujoPromedioGates') {
        switch (viewLevel) {
            case 'terminal':
                return { warning: 50, critical: 70, isHigherBetter: true };
            case 'patio':
                return { warning: 30, critical: 50, isHigherBetter: true };
            case 'bloque':
                return { warning: 10, critical: 20, isHigherBetter: true };
        }
    }

    if (kpiName === 'productividadOperacional') {
        switch (viewLevel) {
            case 'terminal':
                return { warning: 80, critical: 100, isHigherBetter: true };
            case 'patio':
                return { warning: 40, critical: 60, isHigherBetter: true };
            case 'bloque':
                return { warning: 20, critical: 30, isHigherBetter: true };
        }
    }

    if (kpiName === 'variabilidadOperacional') {
        switch (viewLevel) {
            case 'terminal':
                return { warning: 30, critical: 50, isHigherBetter: false };
            case 'patio':
                return { warning: 40, critical: 60, isHigherBetter: false };
            case 'bloque':
                return { warning: 50, critical: 70, isHigherBetter: false };
        }
    }

    // Para los demás KPIs, usar umbrales fijos
    return KPI_THRESHOLDS[kpiName] || { warning: 0, critical: 0, isHigherBetter: true };
};

interface UsePortKPIsOptions {
    patioFilter?: string;
    bloqueFilter?: string;
}

interface UsePortKPIsReturn {
    currentKPIs: CorePortKPIs | null;
    historicalData: PortMovementData[];
    isLoading: boolean;
    error: string | null;
    formatKPIValue: (kpiName: NumericKPIs) => string;
    getStatusForKPI: (kpiName: NumericKPIs) => KPIStatus;
    refresh: () => void;
    refreshData: () => void;
    aggregatedData?: any;
}

export const usePortKPIs = (options?: UsePortKPIsOptions): UsePortKPIsReturn => {
    const sharedData = useSharedPortData();
    const { viewState } = useViewNavigation(); // AGREGAR ESTO

    // Determinar el nivel actual
    const currentLevel = viewState.level as 'terminal' | 'patio' | 'bloque';

    // Filtrar movimientos localmente si es necesario
    const filteredMovements = useMemo(() => {
        if (!sharedData.movements || sharedData.movements.length === 0) return [];

        let filtered = [...sharedData.movements];

        if (options?.bloqueFilter) {
            filtered = filtered.filter(m => m.bloque === options.bloqueFilter);
        } else if (options?.patioFilter) {
            const prefix = options.patioFilter === 'costanera' ? 'C' :
                options.patioFilter === 'ohiggins' ? 'H' :
                    options.patioFilter === 'tebas' ? 'T' : '';
            if (prefix) {
                filtered = filtered.filter(m => m.bloque.startsWith(prefix));
            }
        }

        return filtered;
    }, [sharedData.movements, options?.patioFilter, options?.bloqueFilter]);

    // Función para formatear valores de KPI
    const formatKPIValue = useCallback((kpiName: NumericKPIs): string => {
        if (!sharedData.kpis) return '-';

        const kpis = sharedData.kpis;
        const value = kpis[kpiName];
        if (value === undefined || value === null) return '-';

        switch (kpiName) {
            case 'utilizacionPorVolumen':
            case 'variabilidadOperacional':
            case 'indiceRemanejo':
                return `${(typeof value === 'number' ? value : (value as any)?.promedio ?? 0).toFixed(1)}%`;

            case 'flujoPromedioGates':
            case 'productividadOperacional':
                return `${Math.round(typeof value === 'number' ? value : 0)} mov/h`;

            case 'balanceFlujo':
                return `${(typeof value === 'number' ? value : (value as any)?.promedio ?? 0).toFixed(2)}`;

            case 'tiempoPermanencia':
                return `${kpis.tiempoPermanencia?.promedioDias.toFixed(1)} días`;

            case 'tiempoCamiones':
                return `${Math.round(kpis.tiempoCamiones?.promedio || 0)} min`;

            case 'movimientosGateHora':
            case 'movimientosPatioHora':
            case 'movimientosMuelleHora':
                return `${Math.round(typeof value === 'number' ? value : 0)} mov/h`;

            default:
                return value.toString();
        }
    }, [sharedData.kpis]);

    // MODIFICAR getStatusForKPI para usar umbrales dinámicos
    const getStatusForKPI = useCallback((kpiName: NumericKPIs): KPIStatus => {
        if (!sharedData.kpis) return 'normal';

        const kpis = sharedData.kpis;
        const value = kpis[kpiName];
        if (value === undefined || value === null) return 'normal';

        // USAR LA FUNCIÓN getThresholdForLevel CON EL NIVEL ACTUAL
        const threshold = getThresholdForLevel(kpiName, currentLevel);
        if (!threshold) return 'normal';

        let actualValue: number;
        if (kpiName === 'tiempoPermanencia' && kpis.tiempoPermanencia) {
            actualValue = kpis.tiempoPermanencia.promedioDias;
        } else if (kpiName === 'tiempoCamiones' && kpis.tiempoCamiones) {
            actualValue = kpis.tiempoCamiones.promedio;
        } else if (typeof value === 'number') {
            actualValue = value;
        } else {
            return 'normal';
        }

        if (threshold.isHigherBetter) {
            if (actualValue >= threshold.critical) return 'good';
            if (actualValue >= threshold.warning) return 'normal';
            return 'warning';
        } else {
            if (actualValue >= threshold.critical) return 'critical';
            if (actualValue >= threshold.warning) return 'warning';

            if (threshold.optimalMin !== undefined && threshold.optimalMax !== undefined) {
                if (actualValue >= threshold.optimalMin && actualValue <= threshold.optimalMax) {
                    return 'good';
                }
            }

            return 'normal';
        }
    }, [sharedData.kpis, currentLevel]); // AGREGAR currentLevel como dependencia

    console.log('📊 usePortKPIs - Returning data:', {
        hasKPIs: !!sharedData.kpis,
        movementsCount: filteredMovements.length,
        isLoading: sharedData.isLoading,
        error: sharedData.error,
        filters: options,
        currentLevel // Log del nivel actual
    });

    return {
        currentKPIs: sharedData.kpis,
        historicalData: filteredMovements,
        isLoading: sharedData.isLoading,
        error: sharedData.error,
        formatKPIValue,
        getStatusForKPI,
        refresh: sharedData.refresh,
        refreshData: sharedData.refresh
    };
};