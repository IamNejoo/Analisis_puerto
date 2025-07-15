// types/camila.ts - COMPLETO

export interface CamilaConfig {
    anio: number;
    semana: number;
    turno: number;
    participacion: number;
    dispersion: 'K' | 'N';
}

// Nuevo tipo para filtros de agrupación
export interface CamilaFilterConfig extends Omit<CamilaConfig, 'turno'> {
    agrupacion: 'turno' | 'semana' | 'hora';
    turno?: number; // Opcional para cuando se agrupa por semana
    hora?: number; // Opcional para filtrar por hora específica (0-23)
}

export interface CamilaDashboardData {
    resultado: {
        id: string;
        codigo: string;
        fecha_inicio: string;
        fecha_fin: string;
        turno: number;
        turno_del_dia: number;
        semana: number;
        anio: number;
        dia: number;
        participacion: number;
        con_dispersion: boolean;

        // Métricas del modelo
        total_movimientos_modelo: number;
        total_gruas_utilizadas: number;
        total_bloques_visitados: number;
        total_segregaciones: number;
        capacidad_teorica: number;
        utilizacion_modelo: number;
        coeficiente_variacion: number;

        // Métricas de comparación con realidad
        total_movimientos_real: number;
        accuracy_global: number;
        brecha_movimientos: number;
        correlacion_temporal: number;

        // Metadata
        archivo_resultado?: string;
        archivo_instancia?: string;
        archivo_flujos_real?: string;
        estado: 'completado' | 'procesando' | 'error';
    };

    // Flujos del modelo
    flujos_modelo: {
        tipo_flujo: 'fr' | 'fe' | 'fc' | 'fd';
        segregacion_codigo: string;
        bloque_codigo: string;
        periodo: number;
        cantidad: number;
        tipo_operacion: 'recepcion' | 'entrega' | 'carga' | 'descarga';
    }[];

    // Asignaciones de grúas
    asignaciones: {
        grua_id: number;
        bloque_codigo: string;
        periodo: number;
        asignada: boolean;
        activada: boolean;
        movimientos_asignados: number;
    }[];

    // Métricas por grúa
    metricas_gruas: MetricaGrua[];

    // Cuotas de camiones
    cuotas_camiones: {
        periodo: number;
        bloque_codigo: string;
        cuota_modelo: number;
        capacidad_maxima: number;
        gruas_asignadas: number;
        movimientos_reales?: number;
        utilizacion_real?: number;
        tipo_operacion: string;
        segregaciones: string[];
    }[];

    // Comparaciones con realidad (reemplaza comparaciones con Magdalena)
    comparaciones_real: {
        tipo_comparacion: 'general' | 'por_periodo' | 'por_bloque' | 'por_tipo';
        dimension?: string; // periodo, bloque o tipo específico
        metrica: string;
        valor_modelo: number;
        valor_real: number;
        diferencia_absoluta: number;
        diferencia_porcentual: number;
        accuracy: number;
        descripcion?: string;
    }[];

    // Timeline para visualización
    timeline?: {
        periodo: number;
        hora: string;
        movimientos_modelo: number;
        movimientos_real: number;
        capacidad: number;
        bloques_activos: number;
        accuracy_periodo?: number;
    }[];

    // Distribución por bloque
    distribucion_bloques?: {
        [bloque: string]: number;
    };

    // Matriz de asignación
    matriz_asignacion?: {
        [key: string]: number; // key: "P{periodo}-{bloque}"
    };
}

// Interfaz separada para MetricaGrua para mayor claridad
export interface MetricaGrua {
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
    // Propiedades adicionales que pueden o no venir del backend
    movimientos_asignados?: number;
    tiempo_trabajado?: number;
    tiempo_idle?: number;
}

// Estadísticas actualizadas
export interface CamilaEstadisticas {
    resumen_global: {
        total_resultados: number;
        movimientos_modelo_total: number;
        movimientos_real_total: number;
        utilizacion_promedio: number;
        accuracy_promedio: number;
        registros_por_tabla: {
            [tabla: string]: number;
        };
    };
    estadisticas_por_anio: {
        anio: number;
        resultados: number;
        semanas: number;
        utilizacion_promedio: number;
        cv_promedio: number;
        accuracy_promedio: number;
        movimientos_modelo: number;
        movimientos_real: number;
    }[];
    comparaciones_por_tipo: {
        tipo: string;
        total: number;
        accuracy_promedio: number;
        diferencia_promedio: number;
    }[];
    parametros_modelo: {
        codigo: string;
        descripcion: string;
        valor_actual: number;
        valor_default: number;
        unidad: string;
    }[];
}

// Comparación temporal actualizada
export interface CamilaComparacionTemporal {
    metadata: {
        anio: number;
        semana: number;
        participacion: number;
        dispersion: string;
        turnos_procesados: number;
        turnos_totales: number;
    };
    serie_temporal: {
        turno: number;
        dia: number;
        turno_del_dia: number;
        fecha_hora: string;
        movimientos_modelo: number;
        movimientos_real: number;
        accuracy: number;
        utilizacion_modelo: number;
        utilizacion_real: number;
        coeficiente_variacion: number;
        detalle_periodos?: {
            periodo: number;
            modelo: number;
            real: number;
            accuracy: number;
        }[];
    }[];
    estadisticas_semanales: {
        totales: {
            movimientos_modelo: number;
            movimientos_real: number;
            brecha_total: number;
            accuracy_global: number;
        };
        promedios: {
            accuracy: number;
            utilizacion_modelo: number;
            utilizacion_real: number;
            coeficiente_variacion: number;
        };
        cobertura: {
            turnos_con_datos: number;
            turnos_faltantes: number;
            porcentaje_cobertura: number;
        };
    };
    analisis_patrones: {
        por_turno_del_dia: {
            [key: string]: {
                promedio_accuracy: number;
                desviacion: number;
                num_observaciones: number;
            };
        };
        mejor_turno: {
            turno: number;
            accuracy: number;
            fecha: string;
        };
        peor_turno: {
            turno: number;
            accuracy: number;
            fecha: string;
        };
        tendencia: {
            tipo: 'mejorando' | 'empeorando' | 'estable' | 'insuficientes_datos';
            cambio_porcentual?: number;
            primera_mitad_promedio?: number;
            segunda_mitad_promedio?: number;
        };
    };
}

// Análisis de accuracy
export interface CamilaAnalisisAccuracy {
    total_resultados: number;
    estadisticas: {
        accuracy_promedio: number;
        accuracy_mediana: number;
        accuracy_min: number;
        accuracy_max: number;
        desviacion_estandar: number;
        brecha_promedio: number;
        brecha_max: number;
        brecha_min: number;
    };
    distribucion_accuracy: {
        excelente: number; // >= 80%
        bueno: number; // 60-79%
        regular: number; // 40-59%
        bajo: number; // 20-39%
        muy_bajo: number; // < 20%
    };
    resultados: {
        id: string;
        codigo: string;
        anio: number;
        semana: number;
        turno: number;
        participacion: number;
        accuracy: number;
        movimientos_modelo: number;
        movimientos_real: number;
        brecha: number;
        utilizacion_modelo: number;
    }[];
    recomendaciones: string[];
}

// Resultados disponibles
export interface CamilaResultadoDisponible {
    id: string;
    codigo: string;
    anio: number;
    semana: number;
    dia: number;
    turno: number;
    turno_del_dia: number;
    participacion: number;
    dispersion: 'K' | 'N';
    fecha_inicio: string;
    movimientos_modelo: number;
    movimientos_real?: number;
    accuracy?: number;
    utilizacion: number;
    tiene_comparacion_real: boolean;
}

// Lista de resultados
export interface CamilaResultadosList {
    total: number;
    limit: number;
    offset: number;
    ordenar_por: 'fecha' | 'accuracy' | 'utilizacion';
    orden: 'asc' | 'desc';
    resultados: CamilaResultadoDisponible[];
}

// Detalle de cuotas
export interface CamilaCuotasDetalle {
    resultado_id: string;
    turno: number;
    fecha: string;
    cuotas_detalle: {
        periodo: number;
        bloque: string;
        cuota_modelo: number;
        capacidad_maxima: number;
        gruas_asignadas: number;
        movimientos_reales: number;
        utilizacion_modelo: number;
        utilizacion_real: number;
        brecha: number;
        tipo_operacion: string;
        segregaciones: string[];
    }[];
    resumen_por_periodo: {
        periodo: number;
        cuota_total: number;
        capacidad_total: number;
        movimientos_reales_total: number;
        bloques_activos: number;
        gruas_totales: number;
    }[];
    resumen_global: {
        total_cuota_modelo: number;
        total_capacidad: number;
        total_movimientos_reales: number;
        utilizacion_modelo: number;
        utilizacion_real: number;
        accuracy: number;
        periodos_activos: number;
        bloques_unicos: number;
    };
}

// Métricas de grúas agregadas
export interface CamilaMetricasGruas {
    metadata: {
        anio: number;
        semana: number;
        turno?: number;
        participacion: number;
        dispersion: string;
        turnos_analizados: number;
    };
    metricas_por_grua: {
        grua_id: number;
        movimientos_total: number;
        bloques_visitados_total: number;
        movimientos_por_turno: number;
        turnos_activa: number;
        turnos_inactiva: number;
        utilizacion_promedio: number;
        utilizacion_max: number;
        utilizacion_min: number;
        tiempo_productivo_total: number;
        tiempo_improductivo_total: number;
    }[];
    estadisticas_globales: {
        total_movimientos: number;
        promedio_utilizacion: number;
        gruas_con_trabajo: number;
        gruas_sin_trabajo: number;
        movimientos_por_grua: number;
        balance_trabajo: number;
        grua_mas_ocupada?: number;
        grua_menos_ocupada?: number;
    };
    distribucion_trabajo: {
        tipo: 'muy_equitativa' | 'equitativa' | 'moderada' | 'desigual' | 'sin_trabajo';
        indice_gini: number;
        gruas_80_20: number; // Cuántas grúas hacen el 80% del trabajo
    };
}

// Agrupación por hora (nuevo)
export interface CamilaAgrupacionHora {
    hora: number; // 0-23
    turnos_incluidos: {
        turno: number;
        dia: number;
        fecha: string;
    }[];
    estadisticas: {
        movimientos_modelo_total: number;
        movimientos_real_total: number;
        accuracy_promedio: number;
        utilizacion_promedio: number;
        num_turnos: number;
    };
    distribucion_bloques: {
        [bloque: string]: {
            modelo: number;
            real: number;
        };
    };
}

// Logs de procesamiento
export interface CamilaLogProcesamiento {
    id: string;
    tipo_proceso: string;
    archivo: string;
    fecha_inicio: string;
    fecha_fin?: string;
    duracion_segundos?: number;
    estado: 'procesando' | 'completado' | 'error';
    registros_procesados: number;
    registros_error: number;
    mensaje?: string;
    detalle_error?: any;
    metricas?: any;
}

// Tipo para exportación
export interface CamilaExportOptions {
    formato: 'excel' | 'csv' | 'pdf';
    incluir_comparaciones?: boolean;
    incluir_metricas_detalladas?: boolean;
    incluir_graficos?: boolean;
}

// Respuestas de la API
export interface CamilaApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    timestamp: string;
}

// Error personalizado
export interface CamilaError {
    code: string;
    message: string;
    detail?: any;
    timestamp: string;
}