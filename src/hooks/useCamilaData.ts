import { useState, useEffect, useCallback } from 'react';
import type { CamilaConfig, CamilaResults, CamilaRealComparison } from '../types';
import { camilaAPI } from '../services/camilaApi';

export interface UseCamilaDataResult {
    camilaResults: CamilaResults | null;
    realData: number[][] | null;
    comparison: CamilaRealComparison | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    hasDataForConfig: boolean;
}

export const useCamilaData = (
    config: CamilaConfig | null
): UseCamilaDataResult => {
    const [camilaResults, setCamilaResults] = useState<CamilaResults | null>(null);
    const [realData, setRealData] = useState<number[][] | null>(null);
    const [comparison, setComparison] = useState<CamilaRealComparison | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [hasDataForConfig, setHasDataForConfig] = useState(true);

    // Cargar datos desde API
    const loadDataFromAPI = useCallback(async (config: CamilaConfig) => {
        console.log('🔍 [useCamilaData] Cargando datos desde API:', config);

        try {
            const data = await camilaAPI.getResults(config);
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

                setCamilaResults(camilaResults);
                setHasDataForConfig(true);

                // Mapear real_data si existe
                if (apiData.real_data?.data) {
                    setRealData(apiData.real_data.data);
                }

                // Mapear comparison
                if (apiData.comparison) {
                    const mappedComparison: CamilaRealComparison = {
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

    return {
        camilaResults,
        realData,
        comparison,
        isLoading,
        error,
        lastUpdated,
        hasDataForConfig
    };
};

export default useCamilaData;