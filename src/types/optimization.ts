// src/types/optimization.ts
export interface OptimizationConfig {
    anio: number;
    semana: number;
    participacion: number;
    conDispersion: boolean;
}

export interface OptimizationMetrics {
    // Identificación
    instanciaId: string;
    codigo: string;
    anio: number;
    semana: number;
    participacion: number;
    conDispersion: boolean;
    fechaInicio: string;
    fechaFin: string;

    // KPIs principales
    eficiencia: {
        real: number;
        optimizada: number;
        ganancia: number;
    };

    // Metadata del backend
    metadata?: {
        instancia_id: string;
        codigo: string;
        anio: number;
        semana: number;
        participacion: number;
        con_dispersion: boolean;
        fecha_inicio: string;
        fecha_fin: string;
        periodos: number;
        fecha_procesamiento: string | null;
        archivo_distancias?: string;
    };

    movimientos: {
        totalReal: number;
        yardEliminados: number;
        optimizados: number;
        reduccionPorcentaje: number;
        porTipo: {
            DLVR: number;
            DSCH: number;
            LOAD: number;
            RECV: number;
            YARD: number;
            OTHR: number;
        };
        optimizadosPorTipo: {
            recepcion: number;
            carga: number;
            descarga: number;
            entrega: number;
        };
    };

    distancias: {
        totalReal: number;
        totalModelo: number;
        yardEliminada: number;
        load: number;
        dlvr: number;
        reduccionMetros: number;
        reduccionPorcentaje: number;
        distanciaAhorrada: number;
        porTipo: {
            LOAD: number;
            DLVR: number;
            YARD: number;
        };
        desglose?: {
            yardEliminada: number;
            loadDiferencia: number;
            dlvrDiferencia: number;
        };
    };

    segregaciones: {
        total: number;
        optimizadas: number;
        porcentaje: number;
        activas: Array<{
            codigo: string;
            descripcion: string;
            movimientos: number;
            bloquesUsados?: number;
            bloquesAsignados?: number;
        }>;
    };

    ocupacion: {
        promedio: number;
        capacidadTotal: number;
        porBloque: Array<{
            bloque: string;
            capacidad?: number;
            ocupacionPromedio: number;
            ocupacionMaxima: number;
            ocupacionMinima: number;
            teusPromedio?: number;
            utilizacion?: number;
        }>;
    };

    cargaTrabajo: {
        total: number;
        maxima?: number;
        minima?: number;
        variacion: number;
        balance: number;
    };

    // Datos temporales
    evolucionTemporal: Array<{
        periodo: number;
        dia: number;
        turno: number;
        movimientosReal: number;
        movimientosYard: number;
        movimientosModelo: number;
        cargaTrabajo?: number;
        ocupacionPromedio: number;
    }>;

    // Comparación
    comparacionResumen: {
        eliminacionReubicaciones: {
            valor: number;
            porcentaje: number;
        };
        reduccionMovimientos: {
            valor: number;
            porcentaje: number;
        };
        mejoraEficiencia: {
            valor: number;
            unidad: string;
        };
        ahorroDistancia: {
            valor: number;
            metrosAhorrados: number;
            porcentaje: number;
            unidad: string;
            desglose?: {
                yardEliminada: number;
                loadDiferencia: number;
                dlvrDiferencia: number;
            };
        };
    };

    // KPI destacado
    kpiDistanciaAhorrada?: {
        valor: number;
        unidad: string;
        descripcion: string;
        equivalencia: string;
        componentes?: {
            yardEliminada: string;
            optimizacionOperaciones: string;
        };
    };
}

export interface AvailableConfiguration {
    id: string;
    codigo: string;
    anio: number;
    semana: number;
    participacion: number;
    dispersion: string;
    fechaInicio: string;
    fechaFin: string;
    totalMovimientos: number;
    totalSegregaciones: number;
    estado?: string;
}

export interface WorkloadData {
    periodo: number;
    bloque: string;
    cargaTrabajo: number;
    cargaMaxima?: number;
    cargaMinima?: number;
}

export interface SegregationHeatmapData {
    segregacion: string;
    bloque: string;
    periodo: number;
    volumen: number;
    tipo?: string;
    categoria?: string;
}

export interface TemporalFilters {
    vista: 'semana' | 'turno' | 'dia' | 'hora';
    dia?: number;
    turno?: number;
    periodoInicio?: number;
    periodoFin?: number;
}

export interface BloqueInfo {
    codigo: string;
    capacidadTeus: number;
    capacidadBahias: number;
    capacidadOriginal?: number;
    activo: boolean;
}

export interface SegregacionInfo {
    id: string;
    codigo: string;
    descripcion: string;
    tipo: string;
    categoria: string;
    tamano: number;
}

export interface MetricaTemporal {
    periodo: number;
    dia: number;
    turno: number;
    movimientosReal: number;
    movimientosYard: number;
    movimientosModelo: number;
    cargaTrabajo: number;
    ocupacionPromedio: number;
    distanciaReal?: number;
    distanciaModelo?: number;
}

export interface KPIComparativo {
    categoria: string;
    metrica: string;
    valorReal: number;
    valorModelo: number;
    diferencia: number;
    porcentajeMejora: number;
    unidad: string;
}