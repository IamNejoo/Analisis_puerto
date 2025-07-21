// src/services/optimizationApi.ts
import axios, { AxiosError } from 'axios';
import type {
    OptimizationMetrics,
    AvailableConfiguration,
    WorkloadData,
    SegregationHeatmapData
} from '../types/optimization';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Función mejorada para mapear la respuesta del dashboard
const mapDashboardResponse = (data: any): OptimizationMetrics => {
    console.log('📊 Mapeando respuesta del dashboard:', data);

    // Extraer movimientos del detalle si existe
    const detalleMovimientos = data.kpis_principales?.movimientos?.detalle || {};

    // Calcular movimientos operativos correctamente
    const movimientosOperativosReal = data.kpis_principales?.movimientos?.operativos_real ||
        (detalleMovimientos.dlvr_real + detalleMovimientos.load_real + data.kpis_principales?.movimientos?.yard_eliminados) || 0;

    const movimientosOperativosModelo = data.kpis_principales?.movimientos?.operativos_modelo ||
        (detalleMovimientos.dlvr_modelo + detalleMovimientos.load_modelo) || 0;

    const mapped: OptimizationMetrics = {
        // Identificación
        instanciaId: data.metadata?.instancia_id || 'temp-id',
        codigo: data.metadata?.codigo || '',
        anio: data.metadata?.anio || 0,
        semana: data.metadata?.semana || 0,
        participacion: data.metadata?.participacion || 0,
        conDispersion: data.metadata?.con_dispersion || false,
        fechaInicio: data.metadata?.fecha_inicio || new Date().toISOString(),
        fechaFin: data.metadata?.fecha_fin || new Date().toISOString(),

        // KPIs principales con valores correctos del backend
        eficiencia: {
            real: data.kpis_principales?.eficiencia?.real || 0,
            optimizada: data.kpis_principales?.eficiencia?.optimizada || 100,
            ganancia: data.kpis_principales?.eficiencia?.ganancia || 0
        },

        // Metadata completa
        metadata: data.metadata,

        // Movimientos con estructura correcta
        movimientos: {
            totalReal: data.kpis_principales?.movimientos?.total_real || movimientosOperativosReal,
            yardEliminados: data.kpis_principales?.movimientos?.yard_eliminados || 0,
            optimizados: data.kpis_principales?.movimientos?.optimizados || movimientosOperativosModelo,
            reduccionPorcentaje: data.kpis_principales?.movimientos?.reduccion_porcentaje || 0,
            porTipo: {
                DLVR: detalleMovimientos.dlvr_real || 0,
                DSCH: detalleMovimientos.dsch_real || 0,
                LOAD: detalleMovimientos.load_real || 0,
                RECV: detalleMovimientos.recv_real || 0,
                YARD: data.kpis_principales?.movimientos?.yard_eliminados || 0,
                OTHR: 0
            },
            optimizadosPorTipo: {
                recepcion: detalleMovimientos.recv_real || 0,
                carga: detalleMovimientos.load_modelo || 0,
                descarga: detalleMovimientos.dsch_real || 0,
                entrega: detalleMovimientos.dlvr_modelo || 0
            }
        },

        // Distancias correctas del backend
        distancias: {
            totalReal: data.kpis_principales?.distancias?.total_real || 0,
            totalModelo: data.kpis_principales?.distancias?.total_modelo || 0,
            yardEliminada: data.kpis_principales?.distancias?.yard_eliminada || 0,
            load: data.kpis_principales?.distancias?.load_real || 0,
            dlvr: data.kpis_principales?.distancias?.dlvr_real || 0,
            reduccionMetros: data.kpis_principales?.distancias?.distancia_ahorrada || 0,
            reduccionPorcentaje: data.kpis_principales?.distancias?.reduccion_porcentaje || 0,
            distanciaAhorrada: data.kpis_principales?.distancias?.distancia_ahorrada || 0,
            porTipo: {
                LOAD: data.kpis_principales?.distancias?.load_real || 0,
                DLVR: data.kpis_principales?.distancias?.dlvr_real || 0,
                YARD: data.kpis_principales?.distancias?.yard_eliminada || 0
            },
            desglose: data.comparacion_resumen?.ahorro_distancia?.desglose
        },

        // Segregaciones
        segregaciones: {
            total: data.kpis_principales?.segregaciones?.total || 0,
            optimizadas: data.kpis_principales?.segregaciones?.optimizadas || 0,
            porcentaje: data.kpis_principales?.segregaciones?.porcentaje || 0,
            activas: data.segregaciones_activas || []
        },

        // Ocupación con capacidad incluida
        ocupacion: {
            promedio: data.kpis_principales?.ocupacion?.promedio || 0,
            capacidadTotal: data.kpis_principales?.ocupacion?.capacidad_total || 0,
            porBloque: data.ocupacion_por_bloque?.map((bloque: any) => ({
                bloque: bloque.bloque,
                capacidad: bloque.capacidad,
                ocupacionPromedio: bloque.ocupacion_promedio,
                ocupacionMaxima: bloque.ocupacion_maxima,
                ocupacionMinima: bloque.ocupacion_minima,
                teusPromedio: bloque.teus_promedio,
                utilizacion: bloque.utilizacion
            })) || []
        },

        // Carga de trabajo con valores correctos
        cargaTrabajo: {
            total: data.kpis_principales?.carga_trabajo?.total || 0,
            variacion: data.kpis_principales?.carga_trabajo?.variacion || 0,
            balance: data.kpis_principales?.carga_trabajo?.balance || 0,
            maxima: data.kpis_principales?.carga_trabajo?.maxima || 0,
            minima: data.kpis_principales?.carga_trabajo?.minima || 0
        },

        // Evolución temporal con campos correctos
        evolucionTemporal: data.evolucion_temporal?.map((item: any) => ({
            periodo: item.periodo,
            dia: item.dia,
            turno: item.turno,
            movimientosReal: item.movimientos_real,
            movimientosYard: item.movimientos_yard,
            movimientosModelo: item.movimientos_modelo,
            cargaTrabajo: item.carga_trabajo || 0,
            ocupacionPromedio: item.ocupacion_promedio
        })) || [],

        // Comparación resumen correcta
        comparacionResumen: {
            eliminacionReubicaciones: {
                valor: data.comparacion_resumen?.eliminacion_reubicaciones?.valor || 0,
                porcentaje: data.comparacion_resumen?.eliminacion_reubicaciones?.porcentaje || 100
            },
            reduccionMovimientos: {
                valor: data.comparacion_resumen?.reduccion_movimientos_operativos?.valor || 0,
                porcentaje: data.comparacion_resumen?.reduccion_movimientos_operativos?.porcentaje || 0
            },
            mejoraEficiencia: {
                valor: data.comparacion_resumen?.mejora_eficiencia?.valor || 0,
                unidad: data.comparacion_resumen?.mejora_eficiencia?.unidad || 'puntos porcentuales'
            },
            ahorroDistancia: {
                valor: data.comparacion_resumen?.ahorro_distancia?.valor || 0,
                metrosAhorrados: data.comparacion_resumen?.ahorro_distancia?.metros_ahorrados || 0,
                porcentaje: data.comparacion_resumen?.ahorro_distancia?.porcentaje || 0,
                unidad: data.comparacion_resumen?.ahorro_distancia?.unidad || 'metros',
                desglose: data.comparacion_resumen?.ahorro_distancia?.desglose
            }
        },

        // KPI destacado
        kpiDistanciaAhorrada: data.kpi_distancia_ahorrada
    };

    return validateMetrics(mapped);
};

// Función de validación mejorada
const validateMetrics = (metrics: OptimizationMetrics): OptimizationMetrics => {
    // Validaciones básicas
    if (metrics.eficiencia.ganancia > 0 && metrics.distancias.distanciaAhorrada === 0) {
        console.warn('⚠️ Distancia ahorrada es 0 pero hay eficiencia ganada');
    }

    // Asegurar que los movimientos totales sean consistentes
    if (metrics.movimientos.totalReal === 0 && metrics.movimientos.yardEliminados > 0) {
        metrics.movimientos.totalReal = metrics.movimientos.yardEliminados + metrics.movimientos.optimizados;
    }

    return metrics;
};

export const optimizationApi = {
    // Obtener configuraciones disponibles
    async getAvailableConfigurations(): Promise<AvailableConfiguration[]> {
        try {
            const response = await api.get('/api/v1/optimization/instancias');

            return response.data.instancias.map((inst: any) => ({
                id: inst.id,
                codigo: inst.codigo,
                anio: inst.anio,
                semana: inst.semana,
                participacion: inst.participacion,
                dispersion: inst.dispersion,
                fechaInicio: inst.fecha_inicio,
                fechaFin: inst.fecha_fin,
                totalMovimientos: inst.total_movimientos,
                totalSegregaciones: inst.total_segregaciones,
                estado: inst.estado || 'completado'
            }));
        } catch (error) {
            console.error('❌ Error fetching configurations:', error);
            throw error;
        }
    },

    // Obtener métricas del dashboard - CORREGIDO CON VALIDACIONES
    async getDashboard(
        anio: number,
        semana: number,
        participacion: number,
        conDispersion: boolean
    ): Promise<OptimizationMetrics> {
        try {
            // Validar parámetros
            if (anio < 2017 || anio > 2023) {
                throw new Error(`Año ${anio} fuera de rango válido (2017-2023)`);
            }
            if (semana < 1 || semana > 52) {
                throw new Error(`Semana ${semana} fuera de rango válido (1-52)`);
            }
            if (participacion < 60 || participacion > 80) {
                throw new Error(`Participación ${participacion}% fuera de rango válido (60-80%)`);
            }

            const params = {
                anio,
                semana,
                participacion,
                dispersion: conDispersion ? 'K' : 'N'
            };

            console.log('📡 Llamando al API de optimización:', params);

            const response = await api.get('/api/v1/optimization/dashboard', { params });
            console.log('✅ Dashboard recibido:', response.data);

            return mapDashboardResponse(response.data);

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('❌ Error de API:', error.response?.status, error.response?.data);
                if (error.response?.status === 404) {
                    throw new Error(`No hay datos para ${anio} semana ${semana} con participación ${participacion}%`);
                }
                if (error.response?.status === 500) {
                    throw new Error('Error en el servidor. Por favor, intente más tarde.');
                }
            }
            throw error;
        }
    },

    // Obtener dashboard temporal con filtros - CORREGIDO
    async getDashboardTemporal(
        anio: number,
        semana: number,
        participacion: number,
        conDispersion: boolean,
        filters?: {
            dia?: number;
            turno?: number;
            periodoInicio?: number;
            periodoFin?: number;
        }
    ): Promise<any> {
        try {
            // Validar parámetros base
            if (anio < 2017 || anio > 2023) {
                throw new Error(`Año ${anio} fuera de rango válido (2017-2023)`);
            }
            if (semana < 1 || semana > 52) {
                throw new Error(`Semana ${semana} fuera de rango válido (1-52)`);
            }
            if (participacion < 60 || participacion > 80) {
                throw new Error(`Participación ${participacion}% fuera de rango válido (60-80%)`);
            }

            // Validar filtros temporales
            if (filters?.dia && (filters.dia < 1 || filters.dia > 7)) {
                throw new Error(`Día ${filters.dia} fuera de rango válido (1-7)`);
            }
            if (filters?.turno && (filters.turno < 1 || filters.turno > 3)) {
                throw new Error(`Turno ${filters.turno} fuera de rango válido (1-3)`);
            }
            if (filters?.periodoInicio && (filters.periodoInicio < 1 || filters.periodoInicio > 21)) {
                throw new Error(`Periodo inicio ${filters.periodoInicio} fuera de rango válido (1-21)`);
            }
            if (filters?.periodoFin && (filters.periodoFin < 1 || filters.periodoFin > 21)) {
                throw new Error(`Periodo fin ${filters.periodoFin} fuera de rango válido (1-21)`);
            }

            const params = {
                anio,
                semana,
                participacion,
                dispersion: conDispersion ? 'K' : 'N',
                ...filters
            };

            const response = await api.get('/api/v1/optimization/dashboard/temporal', { params });
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching temporal dashboard:', error);
            throw error;
        }
    },

    // Obtener detalle de bloque - CORREGIDO COMPLETAMENTE
    async getBlockOccupation(
        bloqueId: string,
        instanciaId: string,
        periodo: number
    ): Promise<any> {
        try {
            // Validar parámetros
            if (!bloqueId.match(/^C[1-9]$/)) {
                throw new Error(`ID de bloque inválido: ${bloqueId}. Debe ser C1-C9`);
            }
            if (!instanciaId) {
                throw new Error('Se requiere instancia_id');
            }
            if (periodo < 1 || periodo > 21) {
                throw new Error(`Periodo ${periodo} fuera de rango válido (1-21)`);
            }

            const response = await api.get(`/api/v1/optimization/bloques/${bloqueId}/detalle`, {
                params: {
                    instancia_id: instanciaId,
                    periodo
                }
            });

            return response.data;
        } catch (error) {
            console.error('❌ Error fetching block occupation:', error);
            throw error;
        }
    },

    // Obtener análisis de segregaciones - CORREGIDO
    async getSegregationAnalysis(instanciaId: string, topN: number = 20): Promise<any> {
        try {
            if (!instanciaId) {
                throw new Error('Se requiere instancia_id');
            }
            if (topN < 1 || topN > 50) {
                throw new Error(`Top N ${topN} fuera de rango válido (1-50)`);
            }

            const response = await api.get(`/api/v1/optimization/analisis/segregaciones/${instanciaId}`, {
                params: { top_n: topN }
            });
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching segregation analysis:', error);
            throw error;
        }
    },

    // Obtener análisis de bloques - CORREGIDO
    async getBlockAnalysis(instanciaId: string, periodo?: number): Promise<any> {
        try {
            if (!instanciaId) {
                throw new Error('Se requiere instancia_id');
            }
            if (periodo && (periodo < 1 || periodo > 21)) {
                throw new Error(`Periodo ${periodo} fuera de rango válido (1-21)`);
            }

            const response = await api.get(`/api/v1/optimization/analisis/bloques/${instanciaId}`, {
                params: periodo ? { periodo } : {}
            });
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching block analysis:', error);
            throw error;
        }
    },

    // Obtener comparación detallada - CORREGIDO
    async getDetailedComparison(instanciaId: string): Promise<any> {
        try {
            if (!instanciaId) {
                throw new Error('Se requiere instancia_id');
            }

            const response = await api.get(`/api/v1/optimization/comparacion/${instanciaId}`);
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching detailed comparison:', error);
            throw error;
        }
    },

    // Obtener estadísticas globales
    async getGlobalStats(): Promise<any> {
        try {
            const response = await api.get('/api/v1/optimization/estadisticas');
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching global stats:', error);
            throw error;
        }
    },

    // Obtener resumen de KPIs - CORREGIDO
    async getKPISummary(anio?: number, participacion?: number): Promise<any> {
        try {
            const params: any = {};

            if (anio !== undefined) {
                if (anio < 2017 || anio > 2023) {
                    throw new Error(`Año ${anio} fuera de rango válido (2017-2023)`);
                }
                params.anio = anio;
            }

            if (participacion !== undefined) {
                if (participacion < 60 || participacion > 80) {
                    throw new Error(`Participación ${participacion}% fuera de rango válido (60-80%)`);
                }
                params.participacion = participacion;
            }

            const response = await api.get('/api/v1/optimization/kpis/resumen', { params });
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching KPI summary:', error);
            throw error;
        }
    },

    // Obtener diagnóstico de instancia - CORREGIDO
    async getDiagnostics(instanciaId: string): Promise<any> {
        try {
            if (!instanciaId) {
                throw new Error('Se requiere instancia_id');
            }

            const response = await api.get(`/api/v1/optimization/diagnostico/${instanciaId}`);
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching diagnostics:', error);
            throw error;
        }
    },

    // Subir archivos - CORREGIDO
    async uploadFiles(
        resultadoFile: File,
        fechaInicio: string,
        semana: number,
        anio: number,
        participacion: number,
        dispersion: string,
        additionalFiles?: {
            instanciaFile?: File;
            flujosFile?: File;
            distanciasFile?: File;
        }
    ): Promise<any> {
        try {
            // Validar parámetros
            if (anio < 2017 || anio > 2023) {
                throw new Error(`Año ${anio} fuera de rango válido (2017-2023)`);
            }
            if (semana < 1 || semana > 52) {
                throw new Error(`Semana ${semana} fuera de rango válido (1-52)`);
            }
            if (participacion < 60 || participacion > 80) {
                throw new Error(`Participación ${participacion}% fuera de rango válido (60-80%)`);
            }
            if (!['K', 'N'].includes(dispersion)) {
                throw new Error(`Dispersión ${dispersion} inválida. Debe ser K o N`);
            }

            const formData = new FormData();
            formData.append('resultado_file', resultadoFile);

            if (additionalFiles?.instanciaFile) {
                formData.append('instancia_file', additionalFiles.instanciaFile);
            }
            if (additionalFiles?.flujosFile) {
                formData.append('flujos_file', additionalFiles.flujosFile);
            }
            if (additionalFiles?.distanciasFile) {
                formData.append('distancias_file', additionalFiles.distanciasFile);
            }

            const params = new URLSearchParams({
                fecha_inicio: fechaInicio,
                semana: semana.toString(),
                anio: anio.toString(),
                participacion: participacion.toString(),
                dispersion: dispersion
            });

            const response = await api.post(`/api/v1/optimization/upload?${params}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / (progressEvent.total || 1)
                    );
                    console.log(`📤 Progreso de carga: ${percentCompleted}%`);
                }
            });

            return response.data;
        } catch (error) {
            console.error('❌ Error uploading files:', error);
            throw error;
        }
    },

    // Obtener información de bloques
    async getBlocks(): Promise<any> {
        try {
            const response = await api.get('/api/v1/optimization/bloques');
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching blocks:', error);
            throw error;
        }
    },

    // Obtener información de segregaciones - CORREGIDO
    async getSegregations(tipo?: string, categoria?: string): Promise<any> {
        try {
            const params: any = {};

            if (tipo) {
                if (!['expo', 'impo', 'desconocido'].includes(tipo)) {
                    throw new Error(`Tipo ${tipo} inválido. Debe ser expo, impo o desconocido`);
                }
                params.tipo = tipo;
            }

            if (categoria) {
                if (!['dry', 'reefer', 'desconocido'].includes(categoria)) {
                    throw new Error(`Categoría ${categoria} inválida. Debe ser dry, reefer o desconocido`);
                }
                params.categoria = categoria;
            }

            const response = await api.get('/api/v1/optimization/segregaciones', { params });
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching segregations:', error);
            throw error;
        }
    },

    // TEST: Endpoint de mapeo
    async testMapeo(instanciaId: string): Promise<any> {
        try {
            if (!instanciaId) {
                throw new Error('Se requiere instancia_id');
            }

            const response = await api.get(`/api/v1/optimization/test/mapeo/${instanciaId}`);
            return response.data;
        } catch (error) {
            console.error('❌ Error testing mapeo:', error);
            throw error;
        }
    },

    // Verificar salud del API
    async healthCheck(): Promise<boolean> {
        try {
            const response = await api.get('/health');
            return response.status === 200;
        } catch (error) {
            console.error('❌ API health check failed:', error);
            return false;
        }
    }
};

// Interceptors para desarrollo
if (import.meta.env.DEV) {
    api.interceptors.request.use(
        (config) => {
            console.log('🚀 API Request:', config.method?.toUpperCase(), config.url, config.params);
            return config;
        },
        (error) => {
            console.error('❌ API Request Error:', error);
            return Promise.reject(error);
        }
    );

    api.interceptors.response.use(
        (response) => {
            console.log('✅ API Response:', response.status, response.config.url);
            return response;
        },
        (error: AxiosError) => {
            console.error('❌ API Response Error:', error.response?.status, error.response?.data);
            return Promise.reject(error);
        }
    );
}

export default optimizationApi;