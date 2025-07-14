// hooks/useCamilaData.ts

import { useState, useEffect, useCallback } from 'react';
import { camilaService } from '../services/camilaApi';
import type {
    CamilaConfig,
    CamilaDashboardData,
    CamilaEstadisticas,
    CamilaComparacionTemporal
} from '../types/camila';

export const useCamilaDashboard = (config: CamilaConfig | null) => {
    const [data, setData] = useState<CamilaDashboardData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!config) {
            console.log('🔴 useCamilaDashboard: No hay configuración');
            setData(null);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('🔵 useCamilaDashboard: Fetching con config:', config);

                const response = await camilaService.getDashboard(config);

                console.log('🟢 useCamilaDashboard: Respuesta recibida:', response);

                setData(response);
            } catch (err) {
                console.error('🔴 useCamilaDashboard: Error:', err);
                setError(err instanceof Error ? err.message : 'Error desconocido');
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [config?.anio, config?.semana, config?.turno, config?.participacion, config?.dispersion]);

    return { data, loading, error };
};

export function useCamilaEstadisticas() {
    const [data, setData] = useState<CamilaEstadisticas | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await camilaService.getEstadisticas();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, loading, error };
}

export function useCamilaComparacionTemporal(config: Omit<CamilaConfig, 'turno'> | null) {
    const [data, setData] = useState<CamilaComparacionTemporal | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!config) {
            setData(null);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await camilaService.getComparacionTemporal(config);
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar comparación');
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [config?.anio, config?.semana, config?.participacion, config?.dispersion]);

    return { data, loading, error };
}

export function useResultadosDisponibles() {
    const [data, setData] = useState<Array<{
        anio: number;
        semanas: number[];
        participaciones: number[];
    }>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await camilaService.getResultadosDisponibles();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar configuraciones');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, loading, error };
}