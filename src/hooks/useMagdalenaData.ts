// src/hooks/useMagdalenaData.ts - VERSIÓN ACTUALIZADA
import { useState, useEffect } from 'react';
import axios from 'axios';
import { magdalenaApi } from '../services/magdalenaApi';
import type { MagdalenaMetrics, RealDataMetrics, ComparisonMetrics } from '../types';

export interface MagdalenaDataResult {
    magdalenaMetrics: MagdalenaMetrics | null;
    realMetrics: RealDataMetrics | null;
    comparison: ComparisonMetrics | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    dataNotAvailable?: boolean;
}

export const useMagdalenaData = (
    semana: number = 3,
    participacion: 68 | 69 | 70 = 69,
    conDispersion: boolean = true
): MagdalenaDataResult => {
    const [magdalenaMetrics, setMagdalenaMetrics] = useState<MagdalenaMetrics | null>(null);
    const [realMetrics, setRealMetrics] = useState<RealDataMetrics | null>(null);
    const [comparison, setComparison] = useState<ComparisonMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [dataNotAvailable, setDataNotAvailable] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            setDataNotAvailable(false);

            try {
                console.log(`🔄 Cargando datos para semana ${semana}, participación ${participacion}%, ${conDispersion ? 'con dispersión' : 'centralizada'}`);

                // Llamar al API
                const data = await magdalenaApi.getMetrics(semana, participacion, conDispersion);

                setMagdalenaMetrics(data.magdalenaMetrics);
                setRealMetrics(data.realMetrics);
                setComparison(data.comparison);
                setLastUpdated(new Date());

                console.log('✅ Datos cargados exitosamente desde el API');

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
                console.error('❌ Error cargando datos:', errorMessage);

                // Si el error es 404 o contiene mensaje de no disponibilidad
                if (
                    (axios.isAxiosError(err) && err.response?.status === 404) ||
                    errorMessage.includes('No hay datos disponibles')
                ) {
                    setDataNotAvailable(true);
                    setError('No hay datos disponibles para esta configuración');
                } else {
                    setError(errorMessage);
                }

                setMagdalenaMetrics(null);
                setRealMetrics(null);
                setComparison(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [semana, participacion, conDispersion]);

    return {
        magdalenaMetrics,
        realMetrics,
        comparison,
        isLoading,
        error,
        lastUpdated,
        dataNotAvailable
    };
};

export default useMagdalenaData;