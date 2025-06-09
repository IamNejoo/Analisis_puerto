// src/types/portKpis.ts

// Datos base de movimientos portuarios
export interface PortMovementData {
    bloque: string;
    hora: string;
    gateEntradaContenedores: number;
    gateEntradaTeus: number;
    gateSalidaContenedores: number;
    gateSalidaTeus: number;
    muelleEntradaContenedores: number;
    muelleEntradaTeus: number;
    muelleSalidaContenedores: number;
    muelleSalidaTeus: number;
    remanejosContenedores: number;
    remanejosTeus: number;
    patioSalidaContenedores: number;
    patioSalidaTeus: number;
    patioEntradaContenedores: number;
    patioEntradaTeus: number;
    terminalSalidaContenedores: number;
    terminalSalidaTeus: number;
    terminalEntradaContenedores: number;
    terminalEntradaTeus: number;
    minimoContenedores: number;
    minimoTeus: number;
    maximoContenedores: number;
    maximosTeus: number;
    promedioContenedores: number;
    promedioTeus: number;
}

// KPIs fundamentales del terminal - 6 PRINCIPALES + RELACIONES
export interface CorePortKPIs {
    // 1. UTILIZACIÓN POR VOLUMEN
    utilizacionPorVolumen: number; // Porcentaje de TEUs vs capacidad máxima
    utilizacionPorBloque: Record<string, number>;
    utilizacionPorPatio: Record<string, number>;

    // 2. CONGESTIÓN VEHICULAR
    congestionVehicular: number; // Movimientos/hora en gates
    congestionPorHora?: Record<string, number>;

    // 3. BALANCE DE FLUJO ENTRADA/SALIDA
    balanceFlujo: number; // Ratio entrada/salida

    // 4. PRODUCTIVIDAD OPERACIONAL
    productividadOperacional: number; // Contenedores/hora

    // 5. ÍNDICE DE REMANEJO
    indiceRemanejo: number; // Porcentaje sobre total movimientos

    // 6. SATURACIÓN OPERACIONAL
    saturacionOperacional: number; // Actual vs máximo histórico

    // Datos auxiliares para vistas detalladas
    movimientosPorBloque?: Record<string, number>;
    remanejosPorBloque?: Record<string, number>;
    horasConActividad?: number;
    totalMovimientos?: number;

    // ANÁLISIS DE RELACIONES ENTRE KPIs
    kpiRelations?: {
        congestionProductividadStatus: 'good' | 'warning' | 'critical' | 'normal';
        utilizacionRemanejosStatus: 'good' | 'warning' | 'critical' | 'normal';
        balanceUtilizacionStatus: 'good' | 'warning' | 'critical' | 'normal';
    };
}

// KPIs numéricos que pueden tener deltas
export type NumericKPIs =
    | 'utilizacionPorVolumen'
    | 'congestionVehicular'
    | 'balanceFlujo'
    | 'productividadOperacional'
    | 'indiceRemanejo'
    | 'saturacionOperacional';

// Estados de los KPIs
export type KPIStatus = 'good' | 'warning' | 'critical' | 'normal';

// Umbrales para cada KPI
export interface KPIThreshold {
    warning: number;
    critical: number;
    isHigherBetter: boolean;
    optimalMin?: number;
    optimalMax?: number;
}

// Capacidades máximas de los bloques
export const CAPACIDADES_BLOQUES: Record<string, number> = {
    'C1': 1008, 'C2': 1008, 'C3': 1008, 'C4': 1008, 'C5': 1008,
    'C6': 1008, 'C7': 1008, 'C8': 1008, 'C9': 1008,
    'H1': 1008, 'H2': 1008, 'H3': 1008, 'H4': 1008, 'H5': 1008,
    'T1': 1008, 'T2': 1008, 'T3': 1008, 'T4': 1008
};

// Capacidad total del terminal
export const CAPACIDAD_TOTAL_TERMINAL = 18144; // 18 bloques × 1008 TEUs

// Configuración de patios
export const PATIO_BLOCKS = {
    costanera: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'],
    ohiggins: ['H1', 'H2', 'H3', 'H4', 'H5'],
    tebas: ['T1', 'T2', 'T3', 'T4']
};

// Capacidades por patio
export const CAPACIDAD_POR_PATIO = {
    costanera: 9072, // 9 bloques × 1008
    ohiggins: 5040,  // 5 bloques × 1008
    tebas: 4032      // 4 bloques × 1008
};

// Descripciones de KPIs
export const KPI_DESCRIPTIONS: Record<NumericKPIs, string> = {
    utilizacionPorVolumen: 'Porcentaje de TEUs almacenados respecto a la capacidad máxima',
    congestionVehicular: 'Flujo de vehículos por hora en gates del terminal',
    balanceFlujo: 'Ratio entre contenedores que entran vs salen',
    productividadOperacional: 'Contenedores procesados por hora',
    indiceRemanejo: 'Porcentaje de movimientos innecesarios',
    saturacionOperacional: 'Ocupación actual vs máximo histórico'
};

// Notas y limitaciones de KPIs
export const KPI_NOTES: Record<NumericKPIs, string> = {
    utilizacionPorVolumen: 'Solo considera capacidad de apilamiento vertical, no rutas de tránsito',
    congestionVehicular: 'No incluye cantidad de vehículos ni velocidad. Debe complementarse con otros indicadores',
    balanceFlujo: 'Valores >1.5 indican riesgo de multas por almacenaje prolongado',
    productividadOperacional: 'Solo incluye entrada/salida del terminal, no movimientos internos',
    indiceRemanejo: 'Cada remanejo representa doble costo operativo',
    saturacionOperacional: 'Diferente a utilización que usa capacidad teórica'
};

// Unidades de medida
export const KPI_UNITS: Record<NumericKPIs, string> = {
    utilizacionPorVolumen: '%',
    congestionVehicular: 'mov/h',
    balanceFlujo: 'ratio',
    productividadOperacional: 'cont/h',
    indiceRemanejo: '%',
    saturacionOperacional: '%'
};

// Comparaciones entre períodos
export interface KPIComparison {
    deltas: {
        vsHistorical: Partial<Record<NumericKPIs, number>>;
        vsPrevious: Partial<Record<NumericKPIs, number>>;
    };
}

// Datos agregados por período
export interface AggregatedKPIData {
    timeUnit: string;
    data: CorePortKPIs;
}

// Contexto temporal
export interface TimeContextData {
    unit: 'hour' | 'shift' | 'day' | 'week';
    currentTime?: Date;
    startTime?: Date;
    endTime?: Date;
    dataSource: 'historical' | 'modelMagdalena' | 'modelCamila';
}

export type TimeState = TimeContextData;

// Props para componentes de KPI
export interface KPICardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    status: KPIStatus;
    delta?: number | null;
    description: string;
    isInverseDelta?: boolean;
    tooltip?: string;
    note?: string;
}