// src/services/camilaApi.ts
import axios from 'axios';
import type { CamilaConfig, CamilaResults, CamilaRealComparison } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

interface AvailableCamilaConfig {
    semana: number;
    dia: string;
    turno: number;
    modeloTipo: string;
    conSegregaciones: boolean;
}

interface CamilaMetricsResponse {
    camilaResults: CamilaResults;
    realData: number[][];
    comparison: CamilaRealComparison;
}

export const camilaApi = {
    // Obtener configuraciones disponibles
    async getAvailableConfigs(): Promise<AvailableCamilaConfig[]> {
        try {
            const response = await api.get<AvailableCamilaConfig[]>('/api/v1/camila/available');
            return response.data;
        } catch (error) {
            console.error('Error fetching available Camila configs:', error);
            throw error;
        }
    },

    // Obtener métricas completas
    async getMetrics(config: CamilaConfig): Promise<{
        camilaResults: CamilaResults;
        realData: number[][];
        comparison: CamilaRealComparison;
    }> {
        try {
            const params = {
                semana: config.week,
                dia: config.day,
                turno: config.shift,
                modelo_tipo: config.modelType,
                con_segregaciones: config.withSegregations
            };

            console.log('📡 Llamando API Camila con parámetros:', params);

            const response = await api.get<CamilaMetricsResponse>(
                '/api/v1/camila/metrics',
                { params }
            );

            console.log('✅ Respuesta de Camila recibida');

            return {
                camilaResults: response.data.camilaResults,
                realData: response.data.realData,
                comparison: response.data.comparison
            };

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('❌ Error de API:', error.response?.status, error.response?.data);
                if (error.response?.status === 404) {
                    throw new Error('No hay datos disponibles para esta configuración');
                }
            }
            console.error('❌ Error fetching Camila metrics:', error);
            throw error;
        }
    },

    // Subir archivo de resultados
    async uploadFile(
        file: File,
        config: CamilaConfig
    ): Promise<{
        message: string;
        run_id: string;
        config: any;
    }> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('semana', config.week.toString());
            formData.append('dia', config.day);
            formData.append('turno', config.shift.toString());
            formData.append('modelo_tipo', config.modelType);
            formData.append('con_segregaciones', config.withSegregations.toString());

            const response = await api.post('/api/v1/camila/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error uploading Camila file:', error);
            throw error;
        }
    },

    // Verificar si existe configuración
    async checkConfigAvailability(config: CamilaConfig): Promise<boolean> {
        try {
            const configs = await this.getAvailableConfigs();
            return configs.some(c =>
                c.semana === config.week &&
                c.dia === config.day &&
                c.turno === config.shift &&
                c.modeloTipo === config.modelType &&
                c.conSegregaciones === config.withSegregations
            );
        } catch (error) {
            console.error('Error checking config availability:', error);
            return false;
        }
    }
};

export default camilaApi;