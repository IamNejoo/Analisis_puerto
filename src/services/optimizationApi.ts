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

// Función para mapear la respuesta del backend al tipo OptimizationMetrics
const mapDashboardResponse = (data: any): OptimizationMetrics => {
    return {
        // Identificación
        instanciaId: data.metadata.instancia_id,
        codigo: data.metadata.codigo,
        anio: data.metadata.anio,
        semana: data.metadata.semana,
        participacion: data.metadata.participacion,
        conDispersion: data.metadata.con_dispersion,
        fechaInicio: data.metadata.fecha_inicio,
        fechaFin: data.metadata.fecha_fin,

        // KPIs principales
        eficiencia: {
            real: data.kpis_principales.eficiencia.real,
            optimizada: data.kpis_principales.eficiencia.optimizada,
            ganancia: data.kpis_principales.eficiencia.ganancia
        },

        movimientos: {
            totalReal: data.kpis_principales.movimientos.total_real,
            yardEliminados: data.kpis_principales.movimientos.yard_eliminados,
            optimizados: data.kpis_principales.movimientos.optimizados,
            reduccionPorcentaje: data.kpis_principales.movimientos.reduccion_porcentaje,
            porTipo: {
                DLVR: data.kpis_detallados?.movimientos?.DLVR?.valor_real || 0,
                DSCH: data.kpis_detallados?.movimientos?.DSCH?.valor_real || 0,
                LOAD: data.kpis_detallados?.movimientos?.LOAD?.valor_real || 0,
                RECV: data.kpis_detallados?.movimientos?.RECV?.valor_real || 0,
                YARD: data.kpis_detallados?.movimientos?.YARD?.valor_real || 0,
                OTHR: 0
            },
            optimizadosPorTipo: {
                recepcion: data.kpis_detallados?.movimientos?.RECV?.valor_modelo || 0,
                carga: data.kpis_detallados?.movimientos?.LOAD?.valor_modelo || 0,
                descarga: data.kpis_detallados?.movimientos?.DSCH?.valor_modelo || 0,
                entrega: data.kpis_detallados?.movimientos?.DLVR?.valor_modelo || 0
            }
        },

        distancias: {
            totalReal: data.kpis_principales.distancias.total_real,
            totalModelo: data.kpis_principales.distancias.total_modelo,
            yardEliminada: data.kpis_principales.distancias.yard_eliminada,
            reduccionPorcentaje: data.kpis_principales.distancias.reduccion_porcentaje,
            porTipo: {
                LOAD: data.kpis_detallados?.distancias?.LOAD?.valor_real || 0,
                DLVR: data.kpis_detallados?.distancias?.DLVR?.valor_real || 0,
                YARD: data.kpis_detallados?.distancias?.YARD?.valor_real || 0
            }
        },

        segregaciones: {
            total: data.kpis_principales.segregaciones.total,
            optimizadas: data.kpis_principales.segregaciones.optimizadas,
            porcentaje: data.kpis_principales.segregaciones.porcentaje,
            activas: data.segregaciones_activas || []
        },

        ocupacion: {
            promedio: data.kpis_principales.ocupacion.promedio,
            capacidadTotal: data.kpis_principales.ocupacion.capacidad_total,
            porBloque: data.ocupacion_por_bloque.map((b: any) => ({
                bloque: b.bloque,
                ocupacionPromedio: b.ocupacion_promedio,
                ocupacionMaxima: b.ocupacion_maxima,
                ocupacionMinima: b.ocupacion_minima
            }))
        },

        cargaTrabajo: {
            total: data.kpis_principales.carga_trabajo.total,
            variacion: data.kpis_principales.carga_trabajo.variacion,
            balance: data.kpis_principales.carga_trabajo.balance
        },

        // Datos temporales
        evolucionTemporal: data.evolucion_temporal.map((item: any) => ({
            periodo: item.periodo,
            dia: item.dia,
            turno: item.turno,
            movimientosReal: item.movimientos_real,
            movimientosYard: item.movimientos_yard,
            movimientosModelo: item.movimientos_modelo,
            ocupacionPromedio: item.ocupacion_promedio
        })),

        // Comparación
        comparacionResumen: {
            eliminacionReubicaciones: data.comparacion_resumen.eliminacion_reubicaciones,
            reduccionMovimientos: data.comparacion_resumen.reduccion_movimientos,
            mejoraEficiencia: data.comparacion_resumen.mejora_eficiencia,
            ahorroDistancia: data.comparacion_resumen.ahorro_distancia
        }
    };
};

export const optimizationApi = {
    // Obtener configuraciones disponibles
    async getAvailableConfigurations(): Promise<AvailableConfiguration[]> {
        try {
            const response = await api.get<{
                total: number;
                instancias: any[];
            }>('/api/v1/optimization/instancias');

            // Mapear las propiedades del backend al formato esperado por el frontend
            return response.data.instancias.map(inst => ({
                id: inst.id,
                codigo: inst.codigo,
                anio: inst.anio,
                semana: inst.semana,
                participacion: inst.participacion,
                dispersion: inst.dispersion,
                fechaInicio: inst.fecha_inicio,
                fechaFin: inst.fecha_fin,
                totalMovimientos: inst.total_movimientos,  // Mapeo de snake_case a camelCase
                totalSegregaciones: inst.total_segregaciones  // Mapeo de snake_case a camelCase
            }));
        } catch (error) {
            console.error('Error fetching available configurations:', error);
            throw error;
        }
    },

    // Obtener métricas del dashboard
    async getDashboard(
        anio: number,
        semana: number,
        participacion: number,
        conDispersion: boolean
    ): Promise<OptimizationMetrics> {
        try {
            const params = {
                anio,
                semana,
                participacion,
                dispersion: conDispersion ? 'K' : 'N'
            };

            console.log('📡 Llamando al API de optimización:', params);

            // Usar el endpoint /metrics que es un alias de /dashboard
            const response = await api.get('/api/v1/optimization/metrics', { params });

            console.log('✅ Dashboard recibido:', response.data);

            // Mapear la respuesta al formato esperado
            return mapDashboardResponse(response.data);

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('❌ Error de API:', error.response?.status, error.response?.data);
                if (error.response?.status === 404) {
                    throw new Error(`No hay datos para ${anio} semana ${semana}`);
                }
            }
            throw error;
        }
    },

    // Obtener comparación detallada
    async getDetailedComparison(instanciaId: string): Promise<any> {
        try {
            const response = await api.get(`/api/v1/optimization/comparacion/${instanciaId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching comparison:', error);
            throw error;
        }
    },

    // Obtener estadísticas globales
    async getGlobalStats(): Promise<any> {
        try {
            const response = await api.get('/api/v1/optimization/estadisticas');
            return response.data;
        } catch (error) {
            console.error('Error fetching stats:', error);
            throw error;
        }
    },

    // Subir archivos
    async uploadFiles(
        resultadoFile: File,
        fechaInicio: string,
        semana: number,
        anio: number,
        participacion: number,
        dispersion: string,
        instanciaFile?: File,
        flujosFile?: File,
        distanciasFile?: File
    ): Promise<any> {
        try {
            const formData = new FormData();
            formData.append('resultado_file', resultadoFile);

            if (instanciaFile) formData.append('instancia_file', instanciaFile);
            if (flujosFile) formData.append('flujos_file', flujosFile);
            if (distanciasFile) formData.append('distancias_file', distanciasFile);

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
            });

            return response.data;
        } catch (error) {
            console.error('Error uploading files:', error);
            throw error;
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