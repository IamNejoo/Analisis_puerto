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

export const optimizationApi = {
    // Obtener configuraciones disponibles
    async getAvailableConfigurations(): Promise<AvailableConfiguration[]> {
        try {
            const response = await api.get<{
                total: number;
                instancias: AvailableConfiguration[];
            }>('/api/v1/optimization/instancias');
            return response.data.instancias;
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

            const response = await api.get<OptimizationMetrics>(
                '/api/v1/optimization/dashboard',
                { params }
            );

            console.log('✅ Dashboard recibido:', response.data);
            return response.data;

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

            formData.append('fecha_inicio', fechaInicio);
            formData.append('semana', semana.toString());
            formData.append('anio', anio.toString());
            formData.append('participacion', participacion.toString());
            formData.append('dispersion', dispersion);

            const response = await api.post('/api/v1/optimization/upload', formData, {
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