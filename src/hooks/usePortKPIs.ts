// src/hooks/usePortKPIs.ts - COMPLETO Y CORREGIDO
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

// Umbrales base completos para todos los KPIs
const KPI_THRESHOLDS: Record<string, KPIThreshold> = {
    // MOVIMIENTOS
    movimientosGate: {
        warning: 30,
        critical: 20,
        isHigherBetter: true
    },
    movimientosGateHora: {
        warning: 30,
        critical: 20,
        isHigherBetter: true
    },
    movimientosPatio: {
        warning: 50,
        critical: 70,
        isHigherBetter: false
    },
    movimientosPatioHora: {
        warning: 50,
        critical: 70,
        isHigherBetter: false
    },
    movimientosMuelle: {
        warning: 30,
        critical: 20,
        isHigherBetter: true
    },
    movimientosMuelleHora: {
        warning: 30,
        critical: 20,
        isHigherBetter: true
    },

    // FLUJOS PROMEDIO
    flujoPromedioGates: {
        warning: 30,
        critical: 20,
        isHigherBetter: true
    },
    flujoPromedioPatio: {
        warning: 50,
        critical: 70,
        isHigherBetter: false
    },
    flujoPromedioMuelle: {
        warning: 30,
        critical: 20,
        isHigherBetter: true
    },

    // CAPACIDAD Y UTILIZACIÓN
    utilizacionPorVolumen: {
        warning: 70,
        critical: 85,
        isHigherBetter: false,
        optimalMin: 50,
        optimalMax: 70
    },

    // VARIABILIDAD
    variabilidadOperacional: {
        warning: 40,
        critical: 60,
        isHigherBetter: false
    },

    // BALANCE - Con rango óptimo
    balanceFlujo: {
        warning: 1.3,
        critical: 1.5,
        isHigherBetter: false,
        optimalMin: 0.9,
        optimalMax: 1.1
    },

    // EFICIENCIA
    indiceRemanejo: {
        warning: 5,
        critical: 8,
        isHigherBetter: false
    },

    // TIEMPOS
    tiempoPermanencia: {
        warning: 5,
        critical: 7,
        isHigherBetter: false
    },
    tiempoCamiones: {
        warning: 90,
        critical: 120,
        isHigherBetter: false
    },

    // PRODUCTIVIDAD
    productividadOperacional: {
        warning: 50,
        critical: 30,
        isHigherBetter: true
    }
};

// Función para obtener umbrales según el nivel
const getThresholdForLevel = (
    kpiName: string,
    viewLevel: 'terminal' | 'patio' | 'bloque'
): KPIThreshold => {

    // KPIs con umbrales variables según nivel
    if (kpiName === 'flujoPromedioGates' || kpiName === 'movimientosGateHora') {
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
    const { viewState } = useViewNavigation();

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

    // Función getStatusForKPI CORREGIDA para manejar correctamente Balance y TTT
    const getStatusForKPI = useCallback((kpiName: NumericKPIs): KPIStatus => {
        if (!sharedData.kpis) return 'normal';

        const kpis = sharedData.kpis;
        const value = kpis[kpiName];
        if (value === undefined || value === null) return 'normal';

        // Obtener threshold para el KPI
        const threshold = getThresholdForLevel(kpiName, currentLevel);
        if (!threshold) return 'normal';

        // Determinar el valor actual
        let actualValue: number;

        // Casos especiales para KPIs anidados
        if (kpiName === 'tiempoPermanencia' && kpis.tiempoPermanencia) {
            actualValue = kpis.tiempoPermanencia.promedioDias;
        } else if (kpiName === 'tiempoCamiones' && kpis.tiempoCamiones) {
            actualValue = kpis.tiempoCamiones.promedio;
        } else if (typeof value === 'number') {
            actualValue = value;
        } else {
            return 'normal';
        }

        // CASO ESPECIAL PARA BALANCE
        if (kpiName === 'balanceFlujo') {
            // Balance óptimo es 1.0 (equilibrio perfecto)
            // 0.9 - 1.1 = Good (verde)
            // 0.7 - 0.9 o 1.1 - 1.3 = Warning (amarillo)
            // < 0.7 o > 1.3 = Critical (rojo)
            if (actualValue >= 0.9 && actualValue <= 1.1) return 'good';
            if (actualValue >= 0.7 && actualValue <= 1.3) return 'warning';
            return 'critical';
        }

        // LÓGICA PARA OTROS KPIs
        if (threshold.isHigherBetter) {
            // Para KPIs donde más es mejor
            if (actualValue >= threshold.critical) return 'good';
            if (actualValue >= threshold.warning) return 'warning';
            return 'critical';
        } else {
            // Para KPIs donde menos es mejor

            // Verificar si tiene rango óptimo (principalmente Utilización)
            if (threshold.optimalMin !== undefined && threshold.optimalMax !== undefined) {
                // Si está en el rango óptimo, es GOOD
                if (actualValue >= threshold.optimalMin && actualValue <= threshold.optimalMax) {
                    return 'good';
                }

                // Para utilización: fuera del rango óptimo
                if (kpiName === 'utilizacionPorVolumen') {
                    if (actualValue < threshold.optimalMin) {
                        // Subutilización
                        if (actualValue < 30) return 'critical';
                        if (actualValue < 50) return 'warning';
                        return 'normal';
                    } else {
                        // Sobreutilización
                        if (actualValue >= threshold.critical) return 'critical'; // >= 85
                        if (actualValue >= threshold.warning) return 'warning';   // >= 70
                        return 'normal';
                    }
                }

                // Para otros KPIs con rango óptimo (si los hubiera)
                if (actualValue >= threshold.critical) return 'critical';
                if (actualValue >= threshold.warning) return 'warning';
                return 'warning'; // Cualquier valor fuera del óptimo es al menos warning
            } else {
                // Para KPIs sin rango óptimo (TTT, CDT, Remanejos, etc.)
                if (actualValue <= threshold.warning) return 'good';
                if (actualValue <= threshold.critical) return 'warning';
                return 'critical';
            }
        }
    }, [sharedData.kpis, currentLevel]);

    console.log('📊 usePortKPIs - Returning data:', {
        hasKPIs: !!sharedData.kpis,
        movementsCount: filteredMovements.length,
        isLoading: sharedData.isLoading,
        error: sharedData.error,
        filters: options,
        currentLevel,
        // Debug específico para Balance y TTT
        balanceValue: sharedData.kpis?.balanceFlujo,
        balanceStatus: sharedData.kpis ? getStatusForKPI('balanceFlujo') : 'N/A',
        tttValue: sharedData.kpis?.tiempoCamiones?.promedio,
        tttStatus: sharedData.kpis ? getStatusForKPI('tiempoCamiones') : 'N/A'
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