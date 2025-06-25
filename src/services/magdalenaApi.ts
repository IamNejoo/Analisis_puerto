// src/services/magdalenaApi.ts
import axios, { AxiosError } from 'axios';
import type {
    MagdalenaMetrics,
    RealDataMetrics,
    ComparisonMetrics
} from '../types';

// Configuración base de axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interfaces para las respuestas del backend
interface AvailableConfig {
    semana: number;
    participacion: number;
    dispersion: string;
}

interface BackendMetricsResponse {
    magdalenaMetrics: {
        totalMovimientos: number;
        reubicaciones: number;
        eficienciaReal: number;
        totalMovimientosOptimizados: number;
        reubicacionesEliminadas: number;
        eficienciaGanada: number;
        segregacionesActivas: number;
        bloquesAsignados: number;
        distribucionSegregaciones: Array<{
            segregacion: string;
            bloques: number;
            ocupacion: number;
        }>;
        cargaTrabajoTotal: number;
        variacionCarga: number;
        balanceWorkload: number;
        ocupacionPromedio: number;
        utilizacionEspacio: number;
        movimientosReales: {
            DLVR: number;
            DSCH: number;
            LOAD: number;
            RECV: number;
            OTHR: number;
            YARD: number;
        };
        movimientosOptimizadosDetalle: {
            Recepcion: number;
            Carga: number;
            Descarga: number;
            Entrega: number;
        };
        periodos: number;
        bloquesUnicos: string[];
        ocupacionPorPeriodo: Array<{
            periodo: number;
            ocupacion: number;
            capacidad: number;
        }>;
        workloadPorBloque: Array<{
            bloque: string;
            cargaTrabajo: number;
            periodo: number;
        }>;
        segregacionesPorBloque: Array<{
            segregacion: string;
            bloque: string;
            periodo: number;
            volumen: number;
        }>;
        bloquesMagdalena: Array<{
            bloqueId: string;
            ocupacionPromedio: number;
            capacidad: number;
            ocupacionPorTurno: number[];
            movimientos: {
                entrega: number;
                recepcion: number;
                carga: number;
                descarga: number;
                total: number;
            };
            estado: 'active' | 'restricted' | 'maintenance';
        }>;
        capacidadesPorBloque: { [key: string]: number };
        teusPorSegregacion: { [key: string]: number };
        segregacionesInfo: {
            [key: string]: {
                id: string;
                nombre: string;
                teu: number;
            }
        };
        bahiasPorBloque: { [key: string]: any };
        volumenPorBloque: { [key: string]: any };
        segregacionesColores: { [key: string]: string };
    };
    realMetrics: {
        totalMovimientos: number;
        reubicaciones: number;
        porcentajeReubicaciones: number;
        movimientosPorTipo: {
            DLVR: number;
            DSCH: number;
            LOAD: number;
            RECV: number;
            OTHR: number;
        };
        bloquesUnicos: string[];
        turnos: number[];
        carriers: number;
    };
    comparison: {
        eliminacionReubicaciones: number;
        mejoraPorcentual: number;
        optimizacionSegregaciones: number;
        balanceCargaMejorado: boolean;
        eficienciaTotal: number;
    };
    lastUpdated: string;
    dataNotAvailable: boolean;
}

interface WorkloadData {
    bloque: string;
    periodo: number;
    cargaTrabajo: number;
}

interface SegregationDetail {
    [segregacion: string]: {
        bahias: number;
        volumen: number;
        color: string;
    };
}

// API Service
export const magdalenaApi = {
    // Verificar configuraciones disponibles
    async getAvailableConfigs(): Promise<AvailableConfig[]> {
        try {
            const response = await api.get<AvailableConfig[]>('/api/v1/magdalena/available');
            return response.data;
        } catch (error) {
            console.error('Error fetching available configs:', error);
            throw error;
        }
    },

    // Obtener métricas completas - MAPEO DIRECTO
    async getMetrics(
        semana: number,
        participacion: 68 | 69 | 70,
        conDispersion: boolean
    ): Promise<{
        magdalenaMetrics: MagdalenaMetrics;
        realMetrics: RealDataMetrics;
        comparison: ComparisonMetrics;
    }> {
        try {
            const params = {
                semana,
                participacion,
                dispersion: conDispersion ? 'K' : 'C'
            };

            console.log('📡 Llamando al API con parámetros:', params);

            const response = await api.get<BackendMetricsResponse>(
                '/api/v1/magdalena/metrics',
                { params }
            );

            console.log('✅ Respuesta del backend recibida:', response.data);

            // El backend ya devuelve la estructura correcta, solo devolvemos los datos
            const { magdalenaMetrics, realMetrics, comparison } = response.data;

            return {
                magdalenaMetrics: magdalenaMetrics as MagdalenaMetrics,
                realMetrics: realMetrics as RealDataMetrics,
                comparison: comparison as ComparisonMetrics
            };

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('❌ Error de API:', error.response?.status, error.response?.data);
                if (error.response?.status === 404) {
                    throw new Error('No hay datos disponibles para esta configuración');
                }
            }
            console.error('❌ Error fetching Magdalena metrics:', error);
            throw error;
        }
    },

    // Obtener datos de workload
    async getWorkloadData(
        semana: number,
        participacion: 68 | 69 | 70,
        conDispersion: boolean,
        bloque?: string
    ): Promise<WorkloadData[]> {
        try {
            const params = {
                semana,
                participacion,
                dispersion: conDispersion ? 'K' : 'C',
                ...(bloque && { bloque })
            };

            const response = await api.get<WorkloadData[]>('/api/v1/magdalena/workload', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching workload data:', error);
            throw error;
        }
    },

    // Obtener segregaciones de un bloque/periodo
    async getSegregations(
        bloque: string,
        periodo: number,
        semana: number,
        participacion: 68 | 69 | 70,
        conDispersion: boolean
    ): Promise<SegregationDetail> {
        try {
            const params = {
                semana,
                participacion,
                dispersion: conDispersion ? 'K' : 'C'
            };

            const response = await api.get<SegregationDetail>(
                `/api/v1/magdalena/segregations/${bloque}/${periodo}`,
                { params }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching segregations:', error);
            throw error;
        }
    },

    // Subir nuevos archivos
    async uploadFiles(
        resultadoFile: File,
        instanciaFile?: File,
        realDataFile?: File,
        semana?: number,
        participacion?: 68 | 69 | 70,
        dispersion?: string
    ): Promise<{
        message: string;
        run_id: string;
        config: {
            semana: number;
            participacion: number;
            dispersion: string;
        };
    }> {
        try {
            const formData = new FormData();
            formData.append('resultado_file', resultadoFile);

            if (instanciaFile) {
                formData.append('instancia_file', instanciaFile);
            }
            if (realDataFile) {
                formData.append('real_data_file', realDataFile);
            }
            if (semana !== undefined) {
                formData.append('semana', semana.toString());
            }
            if (participacion !== undefined) {
                formData.append('participacion', participacion.toString());
            }
            if (dispersion) {
                formData.append('dispersion', dispersion);
            }

            const response = await api.post('/api/v1/magdalena/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error uploading files:', error);
            throw error;
        }
    },

    // Función auxiliar para verificar si hay datos para una configuración específica
    async checkConfigAvailability(
        semana: number,
        participacion: 68 | 69 | 70,
        conDispersion: boolean
    ): Promise<boolean> {
        try {
            const configs = await this.getAvailableConfigs();
            return configs.some(
                config =>
                    config.semana === semana &&
                    config.participacion === participacion &&
                    config.dispersion === (conDispersion ? 'K' : 'C')
            );
        } catch (error) {
            console.error('Error checking config availability:', error);
            return false;
        }
    }
};

// Interceptor para logging en desarrollo
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

export default magdalenaApi;