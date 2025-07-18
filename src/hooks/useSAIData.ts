// src/hooks/useSAIData.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { saiApi } from '../services/saiApi';

interface SAIMetrics {
    bahiasPorBloque: { [key: string]: { [segregacion: string]: number } };
    volumenPorBloque: { [key: string]: { [segregacion: string]: number } };
    capacidadesPorBloque: { [bloqueId: string]: number };
    teusPorSegregacion: { [segregacion: string]: number };
    segregacionesInfo: { [segregacion: string]: { descripcion: string; movimientos: number } };
}

interface UseSAIDataReturn {
    saiMetrics: SAIMetrics | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

// Cache para datos SAI
const saiCache = new Map<string, SAIMetrics>();

export const useSAIData = (
    fecha: Date | null,
    turno?: number,
    bloqueId?: string,
    unidadTemporal: 'semana' | 'dia' | 'turno' | 'hora' = 'turno'
): UseSAIDataReturn => {
    const [saiMetrics, setSaiMetrics] = useState<SAIMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchSAIData = useCallback(async () => {
        if (!fecha || !bloqueId) {
            setSaiMetrics(null);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Cancelar petición anterior
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            // Crear clave de cache
            const cacheKey = `${bloqueId}-${fecha.toISOString()}-${unidadTemporal}-${turno || 0}`;

            // Verificar cache
            if (saiCache.has(cacheKey)) {
                console.log('✅ Usando datos SAI desde cache:', cacheKey);
                setSaiMetrics(saiCache.get(cacheKey)!);
                setIsLoading(false);
                return;
            }

            console.log('🔍 Obteniendo datos históricos SAI:', {
                bloqueId,
                fecha: fecha.toISOString(),
                unidadTemporal,
                turno
            });

            // Usar saiApi con la unidad temporal
            const data = await saiApi.getBlockPositions(
                bloqueId,
                turno,
                fecha,
                unidadTemporal
            );

            // Transformar la respuesta al formato esperado
            const metrics: SAIMetrics = {
                bahiasPorBloque: data.bahiasPorBloque || {},
                volumenPorBloque: data.volumenPorBloque || {},
                capacidadesPorBloque: data.capacidadesPorBloque || { [bloqueId]: 35 },
                teusPorSegregacion: data.teusPorSegregacion || {},
                segregacionesInfo: data.segregacionesInfo || {}
            };

            // Guardar en cache
            saiCache.set(cacheKey, metrics);
            setSaiMetrics(metrics);

        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error('❌ Error obteniendo datos SAI:', err);
                setError(err.message || 'Error al cargar datos históricos');
            }
        } finally {
            setIsLoading(false);
        }
    }, [fecha, bloqueId, turno, unidadTemporal]);

    const refetch = useCallback(() => {
        if (fecha && bloqueId) {
            const cacheKey = `${bloqueId}-${fecha.toISOString()}-${unidadTemporal}-${turno || 0}`;
            saiCache.delete(cacheKey);
        }
        fetchSAIData();
    }, [fetchSAIData, fecha, bloqueId, turno, unidadTemporal]);

    useEffect(() => {
        fetchSAIData();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchSAIData]);

    return {
        saiMetrics,
        isLoading,
        error,
        refetch
    };
};

// Hook para dashboard histórico SAI
export const useSAIDashboard = (
    fecha: Date,
    unidadTemporal: 'semana' | 'dia' | 'turno' | 'hora' = 'dia',
    patio?: string
) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const params = new URLSearchParams({
                    fecha: fecha.toISOString(),
                    unidad_temporal: unidadTemporal
                });

                if (patio) {
                    params.append('patio', patio);
                }

                const response = await fetch(`/api/v1/sai/dashboard/historico?${params}`);

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                setData(result);

            } catch (err: any) {
                console.error('Error fetching SAI dashboard:', err);
                setError(err.message || 'Error al cargar dashboard histórico');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboard();
    }, [fecha, unidadTemporal, patio]);

    return { data, isLoading, error };
};

// Función helper para limpiar cache
export const clearSAICache = () => {
    saiCache.clear();
    console.log('🧹 Cache SAI limpiado');
};