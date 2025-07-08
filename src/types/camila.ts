// types/camila.ts - Tipos actualizados para el nuevo backend

export interface CamilaConfig {
    week: number;
    day: string;
    shift: number;
    modelType: 'minmax' | 'maxmin';
    withSegregations: boolean;
}

// Tipos para las variables del modelo
export interface VariableInfo {
    variable: string;
    indice: string | null;
    valor: number;
    segregacion: string | null;
    grua: string | null;
    bloque: string | null;
    tiempo: number | null;
    tipo_variable: string;
}

export interface VariablesSummary {
    flujos_recepcion: VariableInfo[];
    flujos_entrega: VariableInfo[];
    asignacion_gruas: VariableInfo[];
    alpha_variables: VariableInfo[];
    z_variables: VariableInfo[];
    funcion_objetivo: number;
    total_variables: number;
}

// Métricas por entidad
export interface MetricasBloque {
    bloque: string;
    movimientos_total: number;
    recepcion: number;
    entrega: number;
    gruas_asignadas: number;
    periodos_activos: number;
    participacion: number;
    utilizacion: number;
}

export interface MetricasGrua {
    grua: string;
    periodos_activos: number;
    bloques_asignados: string[];
    movimientos_teoricos: number;
    utilizacion: number;
    asignaciones: Array<{ tiempo: number; bloque: string }>;
}

export interface MetricasTiempo {
    tiempo: number;
    hora_real: string;
    movimientos_total: number;
    gruas_activas: number;
    bloques_activos: number;
    participacion: number;
}

export interface MetricasSegregacion {
    segregacion: string;
    descripcion: string;
    tipo: string;
    movimientos_recepcion: number;
    movimientos_entrega: number;
    bloques: string[];
}

// Resultado principal del modelo
export interface CamilaResultsV2 {
    // Identificación
    run_id: string;
    config: CamilaConfig;

    // Métricas principales
    funcion_objetivo: number;
    total_movimientos: number;
    balance_workload: number;
    indice_congestion: number;
    utilizacion_sistema: number;

    // Resumen de variables
    variables_summary: VariablesSummary;

    // Métricas agregadas
    metricas_bloques: MetricasBloque[];
    metricas_gruas: MetricasGrua[];
    metricas_tiempo: MetricasTiempo[];
    metricas_segregaciones: MetricasSegregacion[];

    // Matrices para visualización
    matriz_flujos: number[][];  // [9 bloques][8 tiempos]
    matriz_gruas: number[][];   // [12 gruas][72 slots]
    matriz_capacidad: number[][];
    matriz_disponibilidad: number[][];

    // Distribuciones
    participacion_bloques: number[];
    participacion_tiempo: number[];

    // Parámetros del modelo
    parametros: {
        mu?: number;
        W?: number;
        K?: number;
        Rmax?: number;
        [key: string]: any;
    };
}

// Mantener interfaz anterior para compatibilidad
export interface CamilaResults {
    // Matrices principales del modelo
    grueAssignment: number[][];
    receptionFlow: number[][];
    deliveryFlow: number[][];
    loadingFlow: number[][];
    unloadingFlow: number[][];

    // Métricas calculadas
    totalFlows: number[][];
    capacity: number[][];
    availability: number[][];

    // KPIs
    workloadBalance: number;
    congestionIndex: number;
    blockParticipation: number[];
    timeParticipation: number[];
    stdDevBlocks: number;
    stdDevTime: number;
    recommendedQuotas: number[][];

    // Metadatos
    objectiveValue: number;
    modelType: 'minmax' | 'maxmin';
    week: number;
    day: string;
    shift: number;
}

// Comparación con datos reales
export interface CamilaRealComparison {
    improvements: {
        workloadBalance: number;
        congestionReduction: number;
        resourceUtilization: number;
    };
    totalMovementsDiff: number;
    realMovements: number[][];
    optimizedMovements: number[][];
}

// Timeline de grúa
export interface GruaTimeline {
    grua: string;
    timeline: Array<{
        tiempo: number;
        bloque: string;
        tipo: string;
    }>;
    total_periodos: number;
    bloques_unicos: number;
    utilizacion: number;
}

// Detalle de bloque
export interface BlockDetail {
    bloque: string;
    movimientos_por_tiempo: number[];
    gruas_por_tiempo: string[][];
    capacidad_por_tiempo: number[];
    disponibilidad_por_tiempo: number[];
    segregaciones: string[];
    total_movimientos: number;
    utilizacion_promedio: number;
}

// Comparación de modelos
export interface ModelComparison {
    config1: CamilaConfig;
    config2: CamilaConfig;
    metricas_comparadas: {
        [key: string]: {
            minmax: number;
            maxmin: number;
        };
    };
    mejoras: {
        [key: string]: number;
    };
    distribucion_bloques1: number[];
    distribucion_bloques2: number[];
    recomendacion: string;
    analisis: string[];
}