// hooks/useCamilaData.ts - Versión corregida con mejor manejo de filtros

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { CamilaConfig, CamilaResults, CamilaRealComparison } from '../types';
import type { CamilaFilters } from '../types/camila';
import { camilaAPI } from '../services/camilaApi';

export interface UseCamilaDataResult {
    camilaResults: CamilaResults | null;
    realData: number[][] | null;
    comparison: CamilaRealComparison | null;
    filteredData: any | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    filters: CamilaFilters;
    setFilters: (filters: CamilaFilters) => void;
    // Nuevas propiedades para mejor control
    hasDataForConfig: boolean;
    isUsingFallbackData: boolean;
}

export const useCamilaData = (
    config: CamilaConfig | null
): UseCamilaDataResult => {
    const [camilaResults, setCamilaResults] = useState<CamilaResults | null>(null);
    const [realData, setRealData] = useState<number[][] | null>(null);
    const [comparison, setComparison] = useState<CamilaRealComparison | null>(null);
    const [filteredData, setFilteredData] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [hasDataForConfig, setHasDataForConfig] = useState(true);
    const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);

    // Estado para filtros
    const [filters, setFilters] = useState<CamilaFilters>({
        hourRange: { start: 8, end: 16 },
        selectedGruas: [],
        selectedBlocks: [],
        selectedSegregations: [],
        showTopSegregations: false,
        topSegregationsCount: 10,
        congestionLevels: [],
        viewMode: 'summary',
        compareModels: false,
        showPeakHours: false,
        showPatterns: false
    });

    // Función mejorada para aplicar filtros
    const applyFiltersToData = useCallback((
        originalData: CamilaResults,
        currentFilters: CamilaFilters
    ): any => {
        console.log('🔧 Aplicando filtros a los datos:', currentFilters);

        const filtered: any = {
            ...originalData // Mantener datos originales como base
        };

        // Filtrar por rango horario
        if (currentFilters.hourRange.start !== 8 || currentFilters.hourRange.end !== 16) {
            const startIdx = Math.max(0, currentFilters.hourRange.start - 8);
            const endIdx = Math.min(8, currentFilters.hourRange.end - 8);

            console.log('⏰ Aplicando filtro temporal:', { startIdx, endIdx });

            // Filtrar todas las matrices temporales
            filtered.totalFlows = originalData.totalFlows.map(block =>
                block.slice(startIdx, endIdx)
            );

            filtered.capacity = originalData.capacity.map(block =>
                block.slice(startIdx, endIdx)
            );

            filtered.recommendedQuotas = originalData.recommendedQuotas.map(block =>
                block.slice(startIdx, endIdx)
            );

            // Recalcular participación temporal
            filtered.timeParticipation = originalData.timeParticipation.slice(startIdx, endIdx);

            // Filtrar asignación de grúas
            filtered.grueAssignment = originalData.grueAssignment.map(grua => {
                const filtered = [];
                for (let b = 0; b < 9; b++) {
                    for (let t = startIdx; t < endIdx; t++) {
                        filtered.push(grua[b * 8 + t] || 0);
                    }
                }
                return filtered;
            });
        }

        // Filtrar por bloques seleccionados
        if (currentFilters.selectedBlocks.length > 0) {
            const blockIndices = currentFilters.selectedBlocks.map(b =>
                parseInt(b.replace('C', '')) - 1
            );

            console.log('📦 Aplicando filtro de bloques:', blockIndices);

            // Filtrar solo los bloques seleccionados
            filtered.totalFlows = filtered.totalFlows.filter((_: any, idx: number) =>
                blockIndices.includes(idx)
            );

            filtered.capacity = filtered.capacity.filter((_: any, idx: number) =>
                blockIndices.includes(idx)
            );

            filtered.recommendedQuotas = filtered.recommendedQuotas.filter((_: any, idx: number) =>
                blockIndices.includes(idx)
            );

            // Recalcular participación por bloque
            const totalByBlock = blockIndices.map((idx: number) =>
                originalData.totalFlows[idx].reduce((sum, val) => sum + val, 0)
            );
            const totalSum = totalByBlock.reduce((sum: number, val: number) => sum + val, 0);

            filtered.blockParticipation = blockIndices.map((idx: number) =>
                originalData.blockParticipation[idx]
            );
        }

        // Filtrar por grúas seleccionadas
        if (currentFilters.selectedGruas.length > 0) {
            const gruaIndices = currentFilters.selectedGruas.map(g => g - 1);

            console.log('🏗️ Aplicando filtro de grúas:', gruaIndices);

            filtered.grueAssignment = filtered.grueAssignment.filter((_: any, idx: number) =>
                gruaIndices.includes(idx)
            );
        }

        // Recalcular KPIs con datos filtrados
        filtered.workloadBalance = calculateWorkloadBalance(filtered);
        filtered.congestionIndex = calculateCongestionIndex(filtered);

        console.log('✅ Datos filtrados:', filtered);
        return filtered;
    }, []);

    // Cargar datos desde API
    const loadDataFromAPI = useCallback(async (config: CamilaConfig) => {
        console.log('🔍 [useCamilaData] Cargando datos desde API:', config);

        try {
            const params = new URLSearchParams({
                semana: config.week.toString(),
                dia: config.day,
                turno: config.shift.toString(),
                modelo_tipo: config.modelType,
                con_segregaciones: config.withSegregations.toString()
            });

            const response = await fetch(`/api/v1/camila/results?${params}`);

            if (!response.ok) {
                if (response.status === 404) {
                    // Si no hay datos, intentar usar datos de semana 3 como fallback
                    console.warn('⚠️ No hay datos para esta configuración, usando datos de Semana 3');
                    setIsUsingFallbackData(true);

                    // Cargar datos de semana 3 como fallback
                    const fallbackParams = new URLSearchParams({
                        semana: '3',
                        dia: 'Monday',
                        turno: '1',
                        modelo_tipo: config.modelType,
                        con_segregaciones: config.withSegregations.toString()
                    });

                    const fallbackResponse = await fetch(`/api/v1/camila/results?${fallbackParams}`);
                    if (fallbackResponse.ok) {
                        return await fallbackResponse.json();
                    }

                    throw new Error('No se encontraron datos para esta configuración');
                }
                throw new Error(`Error al cargar datos: ${response.status}`);
            }

            setIsUsingFallbackData(false);
            const data = await response.json();
            console.log('📊 Datos cargados exitosamente');
            return data;
        } catch (err) {
            console.error('❌ Error al cargar desde API:', err);
            throw err;
        }
    }, []);

    // Efecto principal para cargar datos
    useEffect(() => {
        if (!config) {
            console.log('🔍 [useCamilaData] No hay config, limpiando estado');
            setCamilaResults(null);
            setRealData(null);
            setComparison(null);
            setError(null);
            return;
        }

        const loadData = async () => {
            console.log('📁 [useCamilaData] ========== INICIANDO CARGA DE DATOS ==========');
            console.log('Config:', config);
            setIsLoading(true);
            setError(null);

            try {
                const apiData = await loadDataFromAPI(config);

                // Mapear la respuesta de la API a la estructura esperada
                const camilaResults: CamilaResults = {
                    grueAssignment: apiData.grue_assignment?.data || [],
                    receptionFlow: apiData.reception_flow?.data || [],
                    deliveryFlow: apiData.delivery_flow?.data || [],
                    loadingFlow: apiData.loading_flow?.data || [],
                    unloadingFlow: apiData.unloading_flow?.data || [],
                    totalFlows: apiData.total_flows?.data || [],
                    capacity: apiData.capacity?.data || [],
                    availability: apiData.availability?.data || [],
                    recommendedQuotas: apiData.recommended_quotas?.data || [],
                    blockParticipation: apiData.block_participation || [],
                    timeParticipation: apiData.time_participation || [],
                    stdDevBlocks: apiData.std_dev_blocks || 0,
                    stdDevTime: apiData.std_dev_time || 0,
                    workloadBalance: apiData.workload_balance || 0,
                    congestionIndex: apiData.congestion_index || 0,
                    modelType: apiData.config?.modelo_tipo || config.modelType,
                    week: apiData.config?.semana || config.week,
                    day: apiData.config?.dia || config.day,
                    shift: apiData.config?.turno || config.shift,
                    objectiveValue: apiData.objective_value || 0
                };

                console.log('📊 CamilaResults mapeados:', {
                    week: camilaResults.week,
                    day: camilaResults.day,
                    shift: camilaResults.shift,
                    totalMovimientos: camilaResults.totalFlows.reduce((sum, block) =>
                        sum + block.reduce((s, v) => s + v, 0), 0
                    )
                });

                setCamilaResults(camilaResults);
                setHasDataForConfig(true);

                // Mapear real_data si existe
                if (apiData.real_data?.data) {
                    setRealData(apiData.real_data.data);
                }

                // Mapear comparison
                if (apiData.comparison) {
                    const mappedComparison = {
                        improvements: {
                            workloadBalance: apiData.comparison.workload_balance_improvement || 0,
                            congestionReduction: apiData.comparison.congestion_reduction || 0,
                            resourceUtilization: apiData.comparison.resource_utilization || 0
                        },
                        totalMovementsDiff: apiData.comparison.total_movements_diff || 0,
                        realMovements: apiData.real_data?.data || [],
                        optimizedMovements: camilaResults.totalFlows || []
                    };
                    setComparison(mappedComparison);
                }

                setLastUpdated(new Date());
                console.log('✅ TODOS LOS DATOS CARGADOS EXITOSAMENTE');

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
                console.error('❌ Error loading Camila data:', errorMessage);
                setError(errorMessage);
                setHasDataForConfig(false);

                setCamilaResults(null);
                setRealData(null);
                setComparison(null);
            } finally {
                setIsLoading(false);
                console.log('📁 [useCamilaData] ========== FIN CARGA DE DATOS ==========');
            }
        };

        loadData();
    }, [config, loadDataFromAPI]);

    // Efecto para aplicar filtros cuando cambien
    useEffect(() => {
        if (!camilaResults) return;

        console.log('🔄 Aplicando filtros...');
        const filtered = applyFiltersToData(camilaResults, filters);
        setFilteredData(filtered);
    }, [camilaResults, filters, applyFiltersToData]);

    // Efecto para cargar datos adicionales según filtros
    useEffect(() => {
        if (!config || !camilaResults) return;

        const loadAdditionalData = async () => {
            const additionalData: any = {};

            try {
                if (filters.showTopSegregations && filters.selectedSegregations.length > 0) {
                    additionalData.segregationFlows = await camilaAPI.getFlowsBySegregation(
                        config,
                        filters.selectedSegregations
                    );
                }

                if (filters.compareModels) {
                    additionalData.modelComparison = await camilaAPI.compareModels({
                        week: config.week,
                        day: config.day,
                        shift: config.shift,
                        withSegregations: config.withSegregations
                    });
                }

                if (filters.showPeakHours) {
                    additionalData.peakPatterns = await camilaAPI.getPeakHourPatterns(config);
                }

                setFilteredData((prev: any) => ({ ...prev, ...additionalData }));
            } catch (err) {
                console.error('Error cargando datos adicionales:', err);
            }
        };

        loadAdditionalData();
    }, [config, camilaResults, filters.showTopSegregations, filters.compareModels, filters.showPeakHours, filters.selectedSegregations]);

    return {
        camilaResults,
        realData,
        comparison,
        filteredData,
        isLoading,
        error,
        lastUpdated,
        filters,
        setFilters,
        hasDataForConfig,
        isUsingFallbackData
    };
};

// Funciones auxiliares para calcular KPIs
const calculateWorkloadBalance = (data: any): number => {
    if (!data.totalFlows || data.totalFlows.length === 0) return 0;

    const blockTotals = data.totalFlows.map((block: number[]) =>
        block.reduce((sum, val) => sum + val, 0)
    );

    const avg = blockTotals.reduce((sum: number, val: number) => sum + val, 0) / blockTotals.length;
    const variance = blockTotals.reduce((sum: number, val: number) => sum + Math.pow(val - avg, 2), 0) / blockTotals.length;
    const stdDev = Math.sqrt(variance);

    return Math.max(0, 100 - (stdDev / avg * 100));
};

const calculateCongestionIndex = (data: any): number => {
    if (!data.totalFlows || !data.capacity) return 0;

    let maxCongestion = 0;

    for (let b = 0; b < data.totalFlows.length; b++) {
        for (let t = 0; t < data.totalFlows[b].length; t++) {
            const flow = data.totalFlows[b][t] || 0;
            const cap = data.capacity[b]?.[t] || 1;
            const congestion = flow / cap;
            maxCongestion = Math.max(maxCongestion, congestion);
        }
    }

    return maxCongestion;
};

export default useCamilaData;