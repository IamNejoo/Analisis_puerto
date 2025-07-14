// src/types/patioView.types.ts
import type { CamilaDashboardData } from '../types/camila';
import type { BloqueData, PatioData } from '../types';

export interface BloqueDataExtended extends BloqueData {
    ocupacionPromedio?: number;
    ocupacionPorTurno?: number[];
    stats?: {
        entradas: number;
        salidas: number;
        remanejos: number;
        teusActuales: number;
        bahiasTotales: number;
        bahiasReefer: number;
        gate: {
            entradas: number;
            salidas: number;
        };
        muelle: {
            entradas: number;
            salidas: number;
        };
        despejes: number;
        reubicacionesEntreBloques: number;
        reubicacionesEntrePatios: number;
    };
}

export interface CamilaBlockData {
    asignaciones: Array<{
        segregacion_codigo: string;
        bloque_codigo: string;
        periodo: number;
        frecuencia: number;
    }>;
    gruas: number[];
    metricas?: {
        movimientos_asignados: number;
        bloques_visitados: number;
        utilizacion_pct: number;
    }[];
    cuotas?: {
        cuota_camiones: number;
        capacidad_maxima: number;
        utilizacion_pct: number;
    };
}

export interface MagdalenaBlockData {
    segregaciones: number;
    ocupacionPromedio: number;
    ocupacionMaxima: number;
    ocupacionMinima: number;
}

export interface BloqueComponentProps {
    bloque: BloqueDataExtended;
    isSelected: boolean;
    onClick: () => void;
    getColorForOcupacion: (value: number) => string;
    isMagdalenaActive?: boolean;
    isCamilaActive?: boolean;
    ocupacionTurno?: number;
    camilaData?: CamilaBlockData;
    currentPeriod?: number;
    dashboardData?: CamilaDashboardData;
    magdalenaData?: MagdalenaBlockData;
}