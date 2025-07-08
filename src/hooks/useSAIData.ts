// src/hooks/useSAIData.ts
import { useState, useEffect } from 'react';
import { saiApi } from '../services/saiApi';
import { useTimeContext } from '../contexts/TimeContext';

export interface SAIDataResult {
    saiMetrics: any | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
}

export const useSAIData = (
    fecha: Date | string | null,
    turno?: number,
    bloque?: string  // Agregar parámetro opcional de bloque
): SAIDataResult => {
    const [saiMetrics, setSaiMetrics] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const { timeState } = useTimeContext();

    useEffect(() => {
        const loadData = async () => {
            if (!fecha) {
                setSaiMetrics(null);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                let fechaCompleta: Date | string;

                if (fecha instanceof Date) {
                    fechaCompleta = fecha;
                } else if (typeof fecha === 'string') {
                    if (fecha.includes('T')) {
                        fechaCompleta = fecha;
                    } else {
                        if (timeState.currentDate) {
                            const [year, month, day] = fecha.split('-').map(Number);
                            const fechaConHora = new Date(timeState.currentDate);
                            fechaConHora.setFullYear(year, month - 1, day);
                            fechaCompleta = fechaConHora;
                        } else {
                            fechaCompleta = new Date(`${fecha}T00:00:00`);
                        }
                    }
                } else {
                    throw new Error('Formato de fecha inválido');
                }

                console.log(`🔄 Cargando datos SAI para ${fechaCompleta instanceof Date ? fechaCompleta.toISOString() : fechaCompleta}, turno ${turno || 'todos'}, bloque ${bloque || 'general'}`);

                let data;

                // Si hay bloque especificado, usar el endpoint de posiciones del bloque
                if (bloque && turno) {
                    data = await saiApi.getBlockPositions(bloque, turno, fechaCompleta);
                } else {
                    // Si no, usar el endpoint de métricas generales
                    data = await saiApi.getMetrics(fechaCompleta, turno);
                }

                setSaiMetrics(data);
                setLastUpdated(new Date());

                console.log('✅ Datos SAI cargados exitosamente');

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
                console.error('❌ Error cargando datos SAI:', errorMessage);

                setError(errorMessage);
                setSaiMetrics(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [fecha, turno, bloque, timeState.currentDate]);

    return {
        saiMetrics,
        isLoading,
        error,
        lastUpdated
    };
};