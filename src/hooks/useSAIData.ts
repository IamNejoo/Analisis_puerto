// src/hooks/useSAIData.ts
import { useState, useEffect } from 'react';
import { saiApi } from '../services/saiApi';
import { useTimeContext } from '../contexts/TimeContext';

export interface SAIDataResult {
    saiMetrics: any | null; // Usar el tipo SAIMetrics del servicio
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
}

export const useSAIData = (
    fecha: Date | string | null,
    turno?: number
): SAIDataResult => {
    const [saiMetrics, setSaiMetrics] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Obtener el contexto de tiempo para tener acceso a la hora global
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
                    // Si ya es Date, usarla directamente
                    fechaCompleta = fecha;
                } else if (typeof fecha === 'string') {
                    // Si es string, verificar si ya tiene hora
                    if (fecha.includes('T')) {
                        // Ya tiene formato datetime completo
                        fechaCompleta = fecha;
                    } else {
                        // Solo fecha, necesitamos agregar la hora del contexto global
                        if (timeState.currentDate) {
                            // Combinar la fecha proporcionada con la hora del timeState
                            const [year, month, day] = fecha.split('-').map(Number);
                            const fechaConHora = new Date(timeState.currentDate);
                            fechaConHora.setFullYear(year, month - 1, day);
                            fechaCompleta = fechaConHora;
                        } else {
                            // Si no hay timeState, usar medianoche
                            fechaCompleta = new Date(`${fecha}T00:00:00`);
                        }
                    }
                } else {
                    throw new Error('Formato de fecha inválido');
                }

                console.log(`🔄 Cargando datos SAI para ${fechaCompleta instanceof Date ? fechaCompleta.toISOString() : fechaCompleta}, turno ${turno || 'todos'}`);

                // Llamar al API con la fecha completa
                const data = await saiApi.getMetrics(fechaCompleta, turno);

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
    }, [fecha, turno, timeState.currentDate]); // Agregar timeState.currentDate como dependencia

    return {
        saiMetrics,
        isLoading,
        error,
        lastUpdated
    };
};