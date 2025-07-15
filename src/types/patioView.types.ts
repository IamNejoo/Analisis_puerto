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
    asignaciones: {
        grua_id: number;
        bloque_codigo: string;
        periodo: number;
        asignada: boolean;
        activada: boolean;
        movimientos_asignados: number;
    }[];
    gruas: number[];
    metricas: {
        grua_id: number;
        movimientos_modelo: number;
        bloques_visitados: number;
        periodos_activa: number;
        cambios_bloque: number;
        tiempo_productivo_hrs: number;
        tiempo_improductivo_hrs: number;
        utilizacion_pct: number;
        movimientos_reales_estimados?: number;
        diferencia_vs_real?: number;
    }[];
    cuotas?: {
        periodo: number;
        bloque_codigo: string;
        cuota_modelo: number;
        capacidad_maxima: number;
        gruas_asignadas: number;
        movimientos_reales?: number;
        utilizacion_real?: number;
        tipo_operacion: string;
        segregaciones: string[];
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