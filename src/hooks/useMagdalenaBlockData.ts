// src/hooks/useMagdalenaBlockData.ts
import { useState, useEffect } from 'react';
import { useTimeContext } from '../contexts/TimeContext';
import { useMagdalenaData } from './useMagdalenaData';
import type { BloqueData } from '../types';

interface MagdalenaBlockData {
    bloqueId: string;
    ocupacion: number;
    capacidad: number;
    estado: 'active' | 'restricted' | 'maintenance';
    movimientos: number;
    turnos: number[];
}

export const useMagdalenaBlockData = (patioId: string) => {
    const { timeState } = useTimeContext();
    const { magdalenaMetrics, isLoading, error } = useMagdalenaData(
        timeState?.magdalenaConfig?.semana || 3,
        timeState?.magdalenaConfig?.participacion || 69,
        timeState?.magdalenaConfig?.conDispersion || true
    );

    const [bloques, setBloques] = useState<BloqueData[]>([]);

    useEffect(() => {
        if (!magdalenaMetrics || patioId !== 'costanera') return;

        // Procesar datos de ocupación por bloque
        const bloquesMap = new Map<string, MagdalenaBlockData>();

        // Inicializar bloques C1-C9 con capacidad 49
        for (let i = 1; i <= 9; i++) {
            bloquesMap.set(`C${i}`, {
                bloqueId: `C${i}`,
                ocupacion: 0,
                capacidad: 49,
                estado: 'active',
                movimientos: 0,
                turnos: []
            });
        }

        // Procesar ocupación desde los datos
        magdalenaMetrics.ocupacionPorPeriodo.forEach(periodo => {
            // Distribuir la ocupación entre los bloques
            const ocupacionPorBloque = periodo.ocupacion;
            magdalenaMetrics.bloquesUnicos.forEach(bloqueId => {
                const bloque = bloquesMap.get(bloqueId);
                if (bloque) {
                    bloque.ocupacion = Math.max(bloque.ocupacion, ocupacionPorBloque);
                }
            });
        });

        // Procesar workload por bloque
        magdalenaMetrics.workloadPorBloque.forEach(workload => {
            const bloque = bloquesMap.get(workload.bloque);
            if (bloque) {
                bloque.movimientos += workload.cargaTrabajo;
                if (!bloque.turnos.includes(workload.periodo)) {
                    bloque.turnos.push(workload.periodo);
                }
            }
        });

        // Asignar ocupaciones específicas basadas en los datos del Excel
        const ocupacionesEspecificas: Record<string, number> = {
            'C1': 82,
            'C2': 75,
            'C3': 90,
            'C4': 65,
            'C5': 70,
            'C6': 95,
            'C7': 80,
            'C8': 60,
            'C9': 85
        };

        // Convertir a formato BloqueData
        const bloquesData: BloqueData[] = Array.from(bloquesMap.values()).map(bloque => ({
            id: bloque.bloqueId,
            patioId: 'costanera',
            name: `Bloque ${bloque.bloqueId}`,
            ocupacion: ocupacionesEspecificas[bloque.bloqueId] || bloque.ocupacion,
            capacidadTotal: bloque.capacidad,
            bahias: [], // Se llenaría con datos detallados si los tuviéramos
            tipo: 'contenedores',
            bounds: { x: 0, y: 0, width: 100, height: 100 },
            operationalStatus: bloque.bloqueId === 'C6' ? 'restricted' as const : 'active' as const,
            equipmentType: 'rtg' as const
        }));

        setBloques(bloquesData);
    }, [magdalenaMetrics, patioId]);

    return { bloques, isLoading, error };
};