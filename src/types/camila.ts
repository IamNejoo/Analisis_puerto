// types/camila.types.ts

export interface CamilaConfig {
    anio: number;
    semana: number;
    turno: number;
    participacion: number;
    dispersion: 'K' | 'N';
}

export interface CamilaDashboardData {
    resultado: {
        id: string;
        codigo: string;
        fecha_inicio: string;
        turno: number;
        turno_del_dia: number;
        semana: number;
        anio: number;
        participacion: number;
        total_gruas: number;
        con_dispersion: boolean;
        total_movimientos: number;
        tiempo_idle_promedio: number;
        total_segregaciones: number;
        total_bloques_visitados: number;
        total_cuotas_camiones: number;
        total_frecuencias: number;
        utilizacion_promedio: number;
        coeficiente_variacion: number;
        estado: string;
    };
    asignaciones: {
        segregacion_codigo: string;
        bloque_codigo: string;
        periodo: number;
        frecuencia: number;
        movimientos_planificados?: number;
    }[];
    metricas_gruas: {
        grua_id: number;
        movimientos_asignados: number;
        bloques_visitados: number;
        cambios_bloque: number;
        tiempo_productivo_hrs: number;
        tiempo_improductivo_hrs: number;
        utilizacion_pct: number;
        distancia_recorrida_m: number;
    }[];
    cuotas_camiones: {
        bloque_codigo: string;
        periodo: number;
        cuota_camiones: number;
        capacidad_maxima: number;
        utilizacion_pct: number;
    }[];
    comparaciones?: {
        tipo_comparacion: string;
        metrica: string;
        valor_real: number;
        valor_camila: number;
        diferencia_absoluta: number;
        porcentaje_diferencia: number;
        descripcion: string;
    }[];
}

export interface CamilaEstadisticas {
    total_resultados: number;
    resultados_con_solucion: number;
    resultados_sin_solucion: number;
    promedio_utilizacion: number;
    promedio_movimientos: number;
    total_gruas_utilizadas: number;
    distribucion_por_semana: {
        semana: number;
        total: number;
        con_solucion: number;
        sin_solucion: number;
    }[];
}

export interface CamilaComparacionTemporal {
    semana: number;
    participacion: number;
    con_dispersion: boolean;
    turnos: {
        turno: number;
        tiene_solucion: boolean;
        movimientos_totales: number;
        utilizacion_promedio: number;
        gruas_activas: number;
        bloques_atendidos: number;
    }[];
}

export interface MetricaGrua {
    grua_id: number;
    timeline: {
        periodo: number;
        bloque: string | null;
        activa: boolean;
    }[];
    resumen: {
        bloques_visitados: number;
        cambios_bloque: number;
        utilizacion_pct: number;
    };
}