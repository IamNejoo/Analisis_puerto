// src/types/portKpis.ts
import type { DataSource } from './index';

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
    maximoTeus: number;
    promedioContenedores: number;
    promedioTeus: number;

    despejosBloques: number;    // Movimientos entre bloques del mismo patio
    despejosPatios: number;     // Movimientos entre diferentes patios
    bahias: number;             // Total de bahías del bloque
    bahiasReefer: number;       // Bahías con refrigeración
}

// Nuevas interfaces para CDT y TTT
export interface ContainerDwellTime {
    promedioHoras: number;
    promedioDias: number;
    minimo: number;
    maximo: number;
    mediana: number;
    p90: number;
    p95: number;
    totalContenedores: number;
    criticos: number; // Contenedores > 7 días
}

export interface TruckTurnaroundTime {
    promedio: number; // minutos
    minimo: number;
    maximo: number;
    mediana: number;
    p90: number;
    p95: number;
    totalCamiones: number;
}

// KPIs fundamentales del terminal - ACTUALIZADO CON CDT Y TTT
export interface CorePortKPIs {
    // 1. UTILIZACIÓN POR VOLUMEN (mejorado con promedio pre-calculado)
    utilizacionPorVolumen: number;
    promedioTeus: number; // Nuevo campo para el valor pre-calculado
    capacidadTotal: number; // Capacidad del terminal
    utilizacionPorBloque: Record<string, number>;
    utilizacionPorPatio: Record<string, number>;

    // 2. FLUJO PROMEDIO EN GATES (antes Congestión Vehicular)
    flujoPromedioGates: number; // Renombrado
    gateThroughput: number; // Gate entrada + salida / horas

    // 3. BALANCE DE FLUJO ENTRADA/SALIDA
    balanceFlujo: number;
    totalEntradas: number;
    totalSalidas: number;
    // AGREGAR los totales
    totalMovimientosGate?: number;
    totalMovimientosPatio?: number;
    totalMovimientosMuelle?: number;
    // 4. PRODUCTIVIDAD OPERACIONAL
    productividadOperacional: number;

    // 5. ÍNDICE DE REMANEJO
    indiceRemanejo: number;
    totalRemanejos: number;

    // 6. VARIABILIDAD OPERACIONAL (reemplaza Saturación Operacional)
    variabilidadOperacional: number; // Coeficiente de variación
    rangoOperativo: number; // Máximo - Mínimo TEUs
    minimoTeus: number;
    maximoTeus: number;
    horasCriticas: number; // Horas > 85% capacidad

    // 7. TIEMPO DE PERMANENCIA (CDT) - NUEVO
    tiempoPermanencia: ContainerDwellTime;

    // 8. TIEMPO DE CAMIONES (TTT) - NUEVO
    tiempoCamiones: TruckTurnaroundTime;

    // Datos auxiliares
    movimientosPorBloque?: Record<string, number>;
    remanejosPorBloque?: Record<string, number>;
    horasConActividad?: number;
    totalMovimientos?: number;
    movimientosGateHora?: number;
    movimientosPatioHora?: number;
    movimientosMuelleHora?: number;

    // Labels dinámicas del backend
    labelMovimientos1?: string;
    labelMovimientos2?: string;
    labelMovimientos3?: string;
    vistaContexto?: 'terminal' | 'patio' | 'bloque';
    // ANÁLISIS DE RELACIONES ENTRE KPIs (actualizado)
    kpiRelations?: {
        congestionProductividadStatus: 'good' | 'normal' | 'warning' | 'critical';
        utilizacionRemanejosStatus: 'good' | 'normal' | 'warning' | 'critical';
        balanceUtilizacionStatus: 'good' | 'normal' | 'warning' | 'critical';
        // Nuevas relaciones con tiempos de servicio
        tiempoServicioUtilizacionStatus: 'good' | 'normal' | 'warning' | 'critical';
        tiempoServicioFlujoStatus: 'good' | 'normal' | 'warning' | 'critical';
    };
}

// KPIs numéricos que pueden tener deltas (actualizado)
export type NumericKPIs =
    | 'utilizacionPorVolumen'
    | 'flujoPromedioGates'
    | 'balanceFlujo'
    | 'productividadOperacional'
    | 'indiceRemanejo'
    | 'variabilidadOperacional'
    | 'tiempoPermanencia'
    | 'tiempoCamiones'
    | 'movimientosGateHora'
    | 'movimientosPatioHora'
    | 'movimientosMuelleHora';

// Estados de los KPIs
export type KPIStatus = 'good' | 'warning' | 'critical' | 'normal';

// Umbrales para cada KPI (actualizado)
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
    'H1': 866, 'H2': 866, 'H3': 866, 'H4': 866, 'H5': 1050,
    'T1': 714, 'T2': 714, 'T3': 714, 'T4': 714
};

// Capacidad total del terminal (actualizada según documentación)
export const CAPACIDAD_TOTAL_TERMINAL = 16254; // Suma real de capacidades

// Configuración de patios
export const PATIO_BLOCKS = {
    costanera: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'],
    ohiggins: ['H1', 'H2', 'H3', 'H4', 'H5'],
    tebas: ['T1', 'T2', 'T3', 'T4']
};

// Capacidades por patio (actualizadas)
export const CAPACIDAD_POR_PATIO = {
    costanera: 9072,  // 9 bloques × 1008
    ohiggins: 4316,   // H1-H4: 866×4 + H5: 1050
    tebas: 2856       // 4 bloques × 714
};

// Descripciones de KPIs (actualizadas)
export const KPI_DESCRIPTIONS: Record<string, string> = {
    utilizacionPorVolumen: 'Porcentaje de TEUs almacenados respecto a la capacidad máxima',
    flujoPromedioGates: 'Contenedores procesados por hora en gates del terminal',
    balanceFlujo: 'Ratio entre contenedores que entran vs salen',
    productividadOperacional: 'Total de movimientos por hora',
    indiceRemanejo: 'Porcentaje de movimientos innecesarios',
    variabilidadOperacional: 'Estabilidad del inventario en el período',
    tiempoPermanencia: 'Tiempo promedio de contenedores en el terminal',
    tiempoCamiones: 'Tiempo promedio de camiones en el terminal'
};

// Notas y limitaciones de KPIs (actualizadas)
export const KPI_NOTES: Record<string, string> = {
    utilizacionPorVolumen: 'Basado en promedio de TEUs del período vs capacidad total',
    flujoPromedioGates: 'Suma de entradas y salidas por gates dividido por horas activas',
    balanceFlujo: 'Valores >1.5 indican riesgo de saturación',
    productividadOperacional: 'Incluye todos los movimientos: gates, muelle y remanejos',
    indiceRemanejo: 'Cada remanejo representa doble costo operativo',
    variabilidadOperacional: 'Menor variabilidad indica operación más estable',
    tiempoPermanencia: 'Valores > 7 días se consideran críticos',
    tiempoCamiones: 'Objetivo: < 90 minutos para operación eficiente'
};

// Unidades de medida (actualizadas)
export const KPI_UNITS: Record<string, string> = {
    utilizacionPorVolumen: '%',
    flujoPromedioGates: 'cont/h',
    balanceFlujo: 'ratio',
    productividadOperacional: 'mov/h',
    indiceRemanejo: '%',
    variabilidadOperacional: '%',
    tiempoPermanencia: 'días',
    tiempoCamiones: 'min'
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
    unit: 'hour' | 'shift' | 'day' | 'week' | 'month' | 'year';
    currentTime?: Date;
    startTime?: Date;
    endTime?: Date;
    dataSource: DataSource;
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
    subtitle?: string;
    showInfoIcon?: boolean;
}



// src/types/congestion.ts

export interface CongestionData {
    bloque: string;
    hora: string;

    // Movimientos productivos (contenedores)
    gateEntradaContenedores: number;
    gateSalidaContenedores: number;
    muelleEntradaContenedores: number;
    muelleSalidaContenedores: number;

    // Movimientos productivos (TEUs)
    gateEntradaTeus: number;
    gateSalidaTeus: number;
    muelleEntradaTeus: number;
    muelleSalidaTeus: number;

    // Movimientos no productivos (contenedores)
    remanejosContenedores: number;
    patioEntradaContenedores: number;
    patioSalidaContenedores: number;
    terminalEntradaContenedores: number;
    terminalSalidaContenedores: number;

    // Movimientos no productivos (TEUs)
    remanejosTeus: number;
    patioEntradaTeus: number;
    patioSalidaTeus: number;
    terminalEntradaTeus: number;
    terminalSalidaTeus: number;

    // Inventarios (contenedores)
    minimoContenedores: number;
    maximoContenedores: number;
    promedioContenedores: number;

    // Inventarios (TEUs)
    minimoTeus: number;
    maximoTeus: number;
    promedioTeus: number;
}

export interface PercentileData {
    label: string;
    p50: number;
    p70: number;
    p90: number;
    p95: number;
    max: number;
    current: number;
}

export interface MovementTypeAnalysis {
    hora: string;
    productivos: number;
    noProductivos: number;
    reacomodosBloque: number;
    entreBloques: number;
    entrePatios: number;
    total: number;
}

export interface CongestionPattern {
    dayOfWeek: string;
    hourOfDay: number;
    avgCongestion: number;
    peakCongestion: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface BottleneckAnalysisData {
    location: 'gate' | 'muelle' | 'patio' | 'organizacion';
    severity: number;
    indicators: string[];
    recommendation: string;
}