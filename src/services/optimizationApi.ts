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

// Función helper para mapear respuesta simplificada a OptimizationMetrics
const mapSimplifiedResponse = (response: any): OptimizationMetrics => {
    console.log('📊 Mapeando respuesta simplificada:', response);

    if (response.status === 'error') {
        throw new Error(response.message || 'Error al obtener datos');
    }

    const data = response.data;

    // Si es respuesta del endpoint simple
    if (data.kpis) {
        // Extraer movimientos por tipo si están disponibles
        const movimientosPorTipo = data.movimientos_por_tipo || {};
        const movimientosOptimizadosPorTipo = data.movimientos_optimizados_por_tipo || {};

        // Calcular totales
        const totalMovimientosReal = Object.values(movimientosPorTipo).reduce((sum: number, val: any) => sum + (val || 0), 0) ||
            data.kpis.movimientos.total_real ||
            (data.kpis.movimientos.eliminados * 2);

        const totalMovimientosOptimizados = Object.values(movimientosOptimizadosPorTipo).reduce((sum: number, val: any) => sum + (val || 0), 0) ||
            data.kpis.movimientos.optimizados ||
            Math.round(data.kpis.movimientos.eliminados * (100 - data.kpis.movimientos.reduccion_porcentaje) / 100);

        return {
            // Identificación
            instanciaId: data.metadata.instancia_id || 'temp-id',
            codigo: data.metadata.codigo,
            anio: data.metadata.anio,
            semana: data.metadata.semana,
            participacion: data.metadata.participacion,
            conDispersion: data.metadata.dispersion === 'Con dispersión',
            fechaInicio: new Date().toISOString(),
            fechaFin: new Date().toISOString(),

            // KPIs principales
            eficiencia: {
                real: 100 - data.kpis.eficiencia.valor,
                optimizada: 100,
                ganancia: data.kpis.eficiencia.valor
            },

            movimientos: {
                totalReal: totalMovimientosReal,
                yardEliminados: data.kpis.movimientos.eliminados,
                optimizados: totalMovimientosOptimizados,
                reduccionPorcentaje: data.kpis.movimientos.reduccion_porcentaje,
                porTipo: {
                    DLVR: movimientosPorTipo.DLVR || movimientosPorTipo.entrega || 0,
                    DSCH: movimientosPorTipo.DSCH || movimientosPorTipo.descarga || 0,
                    LOAD: movimientosPorTipo.LOAD || movimientosPorTipo.carga || 0,
                    RECV: movimientosPorTipo.RECV || movimientosPorTipo.recepcion || 0,
                    YARD: movimientosPorTipo.YARD || data.kpis.movimientos.eliminados || 0,
                    OTHR: movimientosPorTipo.OTHR || 0
                },
                optimizadosPorTipo: {
                    recepcion: movimientosOptimizadosPorTipo.RECV || movimientosOptimizadosPorTipo.recepcion || 0,
                    carga: movimientosOptimizadosPorTipo.LOAD || movimientosOptimizadosPorTipo.carga || 0,
                    descarga: movimientosOptimizadosPorTipo.DSCH || movimientosOptimizadosPorTipo.descarga || 0,
                    entrega: movimientosOptimizadosPorTipo.DLVR || movimientosOptimizadosPorTipo.entrega || 0
                }
            },

            distancias: {
                totalReal: data.kpis.distancia.total_real || data.kpis.distancia.ahorrada_metros * 2,
                totalModelo: data.kpis.distancia.total_modelo || data.kpis.distancia.ahorrada_metros,
                yardEliminada: data.kpis.distancia.ahorrada_metros,
                load: data.distancias_por_tipo?.LOAD || 0,
                dlvr: data.distancias_por_tipo?.DLVR || 0,
                reduccionMetros: data.kpis.distancia.ahorrada_metros,
                reduccionPorcentaje: data.kpis.distancia.reduccion_porcentaje || 50,
                distanciaAhorrada: data.kpis.distancia.ahorrada_metros,
                porTipo: {
                    LOAD: data.distancias_por_tipo?.LOAD || 0,
                    DLVR: data.distancias_por_tipo?.DLVR || 0,
                    YARD: data.kpis.distancia.ahorrada_metros
                }
            },

            segregaciones: {
                total: data.kpis.segregaciones.total,
                optimizadas: data.kpis.segregaciones.optimizadas,
                porcentaje: data.kpis.segregaciones.porcentaje,
                activas: data.segregaciones_activas || []
            },

            ocupacion: {
                promedio: data.ocupacion?.promedio || 0,
                capacidadTotal: data.ocupacion?.capacidad_total || 0,
                porBloque: data.ocupacion?.por_bloque || []
            },

            cargaTrabajo: {
                total: data.carga_trabajo?.total || 0,
                variacion: data.carga_trabajo?.variacion || 0,
                balance: data.carga_trabajo?.balance || 0
            },

            evolucionTemporal: data.evolucion_temporal || [],

            comparacionResumen: {
                eliminacionReubicaciones: {
                    valor: data.kpis.movimientos.eliminados,
                    porcentaje: 100
                },
                reduccionMovimientos: {
                    valor: totalMovimientosReal - totalMovimientosOptimizados,
                    porcentaje: data.kpis.movimientos.reduccion_porcentaje
                },
                mejoraEficiencia: {
                    valor: data.kpis.eficiencia.valor,
                    unidad: 'puntos porcentuales'
                },
                ahorroDistancia: {
                    valor: data.kpis.distancia.ahorrada_metros,
                    metrosAhorrados: data.kpis.distancia.ahorrada_metros,
                    porcentaje: data.kpis.distancia.reduccion_porcentaje || 50,
                    unidad: 'metros'
                }
            }
        };
    }

    // Si es la respuesta original del dashboard, usar el mapeo existente
    return mapDashboardResponse(data);
};

// Función de validación existente
const validateMetrics = (metrics: OptimizationMetrics): OptimizationMetrics => {
    if (metrics.eficiencia.ganancia > 0 && metrics.distancias.distanciaAhorrada === 0) {
        console.warn('⚠️ Distancia ahorrada es 0 pero hay eficiencia ganada:', metrics.eficiencia.ganancia);
    }
    return metrics;
};

// Función de mapeo original (para compatibilidad)
const mapDashboardResponse = (data: any): OptimizationMetrics => {
    console.log('📊 Mapeando respuesta del dashboard:', data);

    const mapped = {
        instanciaId: data.metadata?.instancia_id || data.instancia_id || 'temp-id',
        codigo: data.metadata?.codigo || data.codigo || '',
        anio: data.metadata?.anio || data.anio,
        semana: data.metadata?.semana || data.semana,
        participacion: data.metadata?.participacion || data.participacion,
        conDispersion: data.metadata?.con_dispersion || false,
        fechaInicio: data.metadata?.fecha_inicio || new Date().toISOString(),
        fechaFin: data.metadata?.fecha_fin || new Date().toISOString(),

        eficiencia: data.kpis_principales?.eficiencia || {
            real: 0,
            optimizada: 100,
            ganancia: 0
        },

        metadata: data.metadata,

        movimientos: {
            totalReal: data.kpis_principales?.movimientos?.total_real || 0,
            yardEliminados: data.kpis_principales?.movimientos?.yard_eliminados || 0,
            optimizados: data.kpis_principales?.movimientos?.optimizados || 0,
            reduccionPorcentaje: data.kpis_principales?.movimientos?.reduccion_porcentaje || 0,
            porTipo: {
                DLVR: data.movimientos_por_tipo?.DLVR || 0,
                DSCH: data.movimientos_por_tipo?.DSCH || 0,
                LOAD: data.movimientos_por_tipo?.LOAD || 0,
                RECV: data.movimientos_por_tipo?.RECV || 0,
                YARD: data.movimientos_por_tipo?.YARD || data.kpis_principales?.movimientos?.yard_eliminados || 0,
                OTHR: data.movimientos_por_tipo?.OTHR || 0
            },
            optimizadosPorTipo: {
                recepcion: data.movimientos_optimizados_por_tipo?.RECV || 0,
                carga: data.movimientos_optimizados_por_tipo?.LOAD || 0,
                descarga: data.movimientos_optimizados_por_tipo?.DSCH || 0,
                entrega: data.movimientos_optimizados_por_tipo?.DLVR || 0
            }
        },

        distancias: {
            totalReal: data.kpis_principales?.distancias?.total_real || 0,
            totalModelo: data.kpis_principales?.distancias?.total_modelo || 0,
            yardEliminada: data.kpis_principales?.distancias?.yard_eliminada || 0,
            load: data.distancias_por_tipo?.LOAD || 0,
            dlvr: data.distancias_por_tipo?.DLVR || 0,
            reduccionMetros: data.kpis_principales?.distancias?.distancia_ahorrada || 0,
            reduccionPorcentaje: data.kpis_principales?.distancias?.reduccion_porcentaje || 0,
            distanciaAhorrada: data.kpis_principales?.distancias?.distancia_ahorrada || 0,
            porTipo: {
                LOAD: data.distancias_por_tipo?.LOAD || 0,
                DLVR: data.distancias_por_tipo?.DLVR || 0,
                YARD: data.distancias_por_tipo?.YARD || 0
            }
        },

        segregaciones: {
            total: data.kpis_principales?.segregaciones?.total || 0,
            optimizadas: data.kpis_principales?.segregaciones?.optimizadas || 0,
            porcentaje: data.kpis_principales?.segregaciones?.porcentaje || 0,
            activas: data.segregaciones_activas || []
        },

        ocupacion: {
            promedio: data.kpis_principales?.ocupacion?.promedio || 0,
            capacidadTotal: data.kpis_principales?.ocupacion?.capacidad_total || 0,
            porBloque: data.ocupacion_por_bloque || []
        },

        cargaTrabajo: {
            total: data.kpis_principales?.carga_trabajo?.total || 0,
            variacion: data.kpis_principales?.carga_trabajo?.variacion || 0,
            balance: data.kpis_principales?.carga_trabajo?.balance || 0
        },

        evolucionTemporal: data.evolucion_temporal || [],

        comparacionResumen: data.comparacion_resumen || {
            eliminacionReubicaciones: { valor: 0, porcentaje: 0 },
            reduccionMovimientos: { valor: 0, porcentaje: 0 },
            mejoraEficiencia: { valor: 0, unidad: '' },
            ahorroDistancia: { valor: 0, metrosAhorrados: 0, porcentaje: 0, unidad: 'metros' }
        },

        kpiDistanciaAhorrada: data.kpi_distancia_ahorrada
    };

    return validateMetrics(mapped);
};

export const optimizationApi = {
    // Obtener configuraciones disponibles
    async getAvailableConfigurations(): Promise<AvailableConfiguration[]> {
        try {
            const response = await api.get('/api/v1/optimization/instancias/lista');

            if (response.data.status === 'success') {
                return response.data.data.map((inst: any) => ({
                    id: inst.id,
                    codigo: inst.texto,
                    anio: inst.anio,
                    semana: inst.semana,
                    participacion: inst.participacion,
                    dispersion: inst.dispersion,
                    fechaInicio: new Date().toISOString(),
                    fechaFin: new Date().toISOString(),
                    totalMovimientos: 0,
                    totalSegregaciones: 0
                }));
            }

            // Fallback al endpoint original
            const fallbackResponse = await api.get('/api/v1/optimization/instancias');
            return fallbackResponse.data.instancias.map((inst: any) => ({
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

            // Intentar primero con el endpoint simplificado
            try {
                const response = await api.get('/api/v1/optimization/dashboard/summary', { params });
                console.log('✅ Dashboard simplificado recibido:', response.data);
                return mapSimplifiedResponse(response.data);
            } catch (simpleError) {
                console.log('🔄 Intentando con endpoint original...');
                // Fallback al endpoint original
                const response = await api.get('/api/v1/optimization/dashboard', { params });
                console.log('✅ Dashboard original recibido:', response.data);
                return mapDashboardResponse(response.data);
            }

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

    // Obtener datos para gráficos
    async getChartData(
        anio: number,
        semana: number,
        participacion: number,
        conDispersion: boolean
    ): Promise<any> {
        try {
            const params = {
                anio,
                semana,
                participacion,
                dispersion: conDispersion ? 'K' : 'N'
            };

            const response = await api.get('/api/v1/optimization/dashboard/charts', { params });

            if (response.data.status === 'success') {
                return response.data.data;
            }

            throw new Error('Error al obtener datos de gráficos');
        } catch (error) {
            console.error('❌ Error fetching chart data:', error);
            throw error;
        }
    },

    // Obtener comparación simple
    async getSimpleComparison(
        anio: number,
        semana: number,
        participacion: number,
        conDispersion: boolean
    ): Promise<any> {
        try {
            const params = {
                anio,
                semana,
                participacion,
                dispersion: conDispersion ? 'K' : 'N'
            };

            const response = await api.get('/api/v1/optimization/comparacion/simple', { params });

            if (response.data.status === 'success') {
                return response.data.data;
            }

            throw new Error('Error al obtener comparación');
        } catch (error) {
            console.error('❌ Error fetching comparison:', error);
            throw error;
        }
    },

    // Obtener ocupación de bloque
    async getBlockOccupation(
        bloqueId: string,
        anio: number,
        semana: number,
        participacion: number,
        conDispersion: boolean,
        periodo: number
    ): Promise<any> {
        try {
            const params = {
                anio,
                semana,
                participacion,
                dispersion: conDispersion ? 'K' : 'N',
                periodo
            };

            const response = await api.get(`/api/v1/optimization/bloques/ocupacion/${bloqueId}`, { params });

            if (response.data.status === 'success') {
                return response.data.data;
            }

            throw new Error('Error al obtener ocupación del bloque');
        } catch (error) {
            console.error('❌ Error fetching block occupation:', error);
            throw error;
        }
    },

    // Obtener resumen anual
    async getAnnualSummary(anio: number): Promise<any> {
        try {
            const response = await api.get(`/api/v1/optimization/resumen/anual/${anio}`);

            if (response.data.status === 'success') {
                return response.data.data;
            }

            throw new Error('Error al obtener resumen anual');
        } catch (error) {
            console.error('❌ Error fetching annual summary:', error);
            throw error;
        }
    },

    // Obtener estadísticas globales
    async getGlobalStats(): Promise<any> {
        try {
            const response = await api.get('/api/v1/optimization/stats/global');

            if (response.data.status === 'success') {
                return response.data.data;
            }

            // Fallback al endpoint original
            const fallbackResponse = await api.get('/api/v1/optimization/estadisticas');
            return fallbackResponse.data;
        } catch (error) {
            console.error('❌ Error fetching global stats:', error);
            throw error;
        }
    },

    // Verificar salud del API
    async healthCheck(): Promise<boolean> {
        try {
            const response = await api.get('/api/v1/optimization/health');
            return response.data.status === 'ok';
        } catch (error) {
            console.error('❌ API health check failed:', error);
            return false;
        }
    },

    // Subir archivos (simplificado)
    async uploadFiles(
        resultadoFile: File,
        fechaInicio: string,
        semana: number,
        anio: number,
        participacion: number,
        dispersion: string
    ): Promise<any> {
        try {
            const formData = new FormData();
            formData.append('resultado_file', resultadoFile);

            const params = new URLSearchParams({
                fecha_inicio: fechaInicio,
                semana: semana.toString(),
                anio: anio.toString(),
                participacion: participacion.toString(),
                dispersion: dispersion
            });

            console.log('📤 Subiendo archivo con parámetros:', params.toString());

            const response = await api.post(`/api/v1/optimization/upload/simple?${params}`, formData, {
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

            if (response.data.status === 'success') {
                return response.data.data;
            }

            throw new Error(response.data.message || 'Error al cargar archivo');
        } catch (error) {
            console.error('❌ Error uploading file:', error);
            throw error;
        }
    },

    // Métodos de compatibilidad para mantener la interfaz existente
    async getDetailedComparison(instanciaId: string): Promise<any> {
        // Implementar si es necesario o usar getSimpleComparison
        console.warn('getDetailedComparison no implementado, usando datos mock');
        return {};
    },

    async getWorkloadData(instanciaId: string): Promise<WorkloadData> {
        // Implementar si es necesario
        console.warn('getWorkloadData no implementado, usando datos mock');
        return {} as WorkloadData;
    },

    async getSegregationHeatmap(instanciaId: string): Promise<SegregationHeatmapData> {
        // Implementar si es necesario
        console.warn('getSegregationHeatmap no implementado, usando datos mock');
        return {} as SegregationHeatmapData;
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