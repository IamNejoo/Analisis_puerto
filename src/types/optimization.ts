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
        reduccionPorcentaje: number;
        porTipo?: {
            LOAD: number;
            DLVR: number;
            YARD: number;
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
        }>;
    };

    ocupacion: {
        promedio: number;
        capacidadTotal: number;
        porBloque: Array<{
            bloque: string;
            ocupacionPromedio: number;
            ocupacionMaxima: number;
            ocupacionMinima: number;
        }>;
    };

    cargaTrabajo: {
        total: number;
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
            porcentaje: number;
            unidad: string;
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