// src/hooks/useCamilaData.ts - VERSIÓN CON API
import { useState, useEffect } from 'react';
import { camilaApi } from '../services/camilaApi';
import type { CamilaConfig, CamilaResults, CamilaRealComparison } from '../types';

export interface UseCamilaDataResult {
    camilaResults: CamilaResults | null;
    realData: number[][] | null;
    comparison: CamilaRealComparison | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
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

    useEffect(() => {
        if (!config) {
            console.log('🔍 [useCamilaData] No hay config, limpiando estado');
            setCamilaResults(null);
            setRealData(null);
            setComparison(null);
            return;
        }

        const loadData = async () => {
            console.log('📁 [useCamilaData] Cargando datos de Camila...');
            console.log('📁 Config:', config);

            setIsLoading(true);
            setError(null);

            try {
                // Llamar al API
                const data = await camilaApi.getMetrics(config);

                setCamilaResults(data.camilaResults);
                setRealData(data.realData);
                setComparison(data.comparison);
                setLastUpdated(new Date());

                console.log('✅ Datos de Camila cargados exitosamente desde el API');

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
                console.error('❌ Error loading Camila data:', errorMessage);
                setError(errorMessage);

                setCamilaResults(null);
                setRealData(null);
                setComparison(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [config]);

    return {
        camilaResults,
        realData,
        comparison,
        isLoading,
        error,
        lastUpdated
    };
};

export default useCamilaData;