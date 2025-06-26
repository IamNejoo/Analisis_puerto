// services/camilaApi.ts
import type { CamilaConfig } from '../types';

class CamilaAPIService {
    private baseUrl = '/api/v1/camila';

    /**
     * Obtener configuraciones disponibles
     */
    async getAvailableConfigurations() {
        const response = await fetch(`${this.baseUrl}/configurations`);
        if (!response.ok) {
            throw new Error('Error al obtener configuraciones');
        }
        return response.json();
    }

    /**
     * Obtener resultados para una configuración específica
     */
    async getResults(config: CamilaConfig) {
        const params = new URLSearchParams({
            semana: config.week.toString(),
            dia: config.day,
            turno: config.shift.toString(),
            modelo_tipo: config.modelType,
            con_segregaciones: config.withSegregations.toString()
        });

        const response = await fetch(`${this.baseUrl}/results?${params}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('No se encontraron datos para esta configuración');
            }
            throw new Error(`Error al cargar resultados: ${response.status}`);
        }
        return response.json();
    }
    /**
     * Obtener flujos filtrados por segregación
     */
    async getFlowsBySegregation(config: CamilaConfig, segregations?: string[]) {
        const params = new URLSearchParams({
            semana: config.week.toString(),
            dia: config.day,
            turno: config.shift.toString(),
            modelo_tipo: config.modelType,
            con_segregaciones: config.withSegregations.toString()
        });

        if (segregations && segregations.length > 0) {
            params.append('segregations', segregations.join(','));
        }

        const response = await fetch(`${this.baseUrl}/flows/by-segregation?${params}`);
        if (!response.ok) {
            throw new Error('Error al obtener flujos por segregación');
        }
        return response.json();
    }

    /**
     * Obtener timeline de grúas con filtros
     */
    async getGruasTimeline(config: CamilaConfig, filters?: {
        gruas?: number[];
        bloques?: string[];
        horaInicio?: number;
        horaFin?: number;
    }) {
        const params = new URLSearchParams({
            semana: config.week.toString(),
            dia: config.day,
            turno: config.shift.toString()
        });

        if (filters?.gruas) params.append('gruas', filters.gruas.join(','));
        if (filters?.bloques) params.append('bloques', filters.bloques.join(','));
        if (filters?.horaInicio !== undefined) params.append('hora_inicio', filters.horaInicio.toString());
        if (filters?.horaFin !== undefined) params.append('hora_fin', filters.horaFin.toString());

        const response = await fetch(`${this.baseUrl}/gruas/timeline?${params}`);
        if (!response.ok) {
            throw new Error('Error al obtener timeline de grúas');
        }
        return response.json();
    }

    /**
     * Obtener bloques por nivel de congestión
     */
    async getBlocksByCongestion(config: CamilaConfig, congestionLevel?: 'low' | 'medium' | 'high') {
        const params = new URLSearchParams({
            semana: config.week.toString(),
            dia: config.day,
            turno: config.shift.toString()
        });

        if (congestionLevel) params.append('nivel_congestion', congestionLevel);

        const response = await fetch(`${this.baseUrl}/blocks/congestion?${params}`);
        if (!response.ok) {
            throw new Error('Error al obtener bloques por congestión');
        }
        return response.json();
    }

    /**
     * Comparar modelos MinMax vs MaxMin
     */
    async compareModels(config: Omit<CamilaConfig, 'modelType'>) {
        const params = new URLSearchParams({
            semana: config.week.toString(),
            dia: config.day,
            turno: config.shift.toString(),
            con_segregaciones: config.withSegregations.toString()
        });

        const response = await fetch(`${this.baseUrl}/comparison/minmax-vs-maxmin?${params}`);
        if (!response.ok) {
            throw new Error('Error al comparar modelos');
        }
        return response.json();
    }

    /**
     * Obtener patrones de horas pico
     */
    async getPeakHourPatterns(config: CamilaConfig) {
        const params = new URLSearchParams({
            semana: config.week.toString(),
            dia: config.day,
            turno: config.shift.toString()
        });

        const response = await fetch(`${this.baseUrl}/patterns/peak-hours?${params}`);
        if (!response.ok) {
            throw new Error('Error al obtener patrones de horas pico');
        }
        return response.json();
    }

    /**
     * Obtener top segregaciones por volumen
     */
    async getTopSegregations(config: CamilaConfig, top: number = 10) {
        const params = new URLSearchParams({
            semana: config.week.toString(),
            dia: config.day,
            turno: config.shift.toString(),
            top: top.toString()
        });

        const response = await fetch(`${this.baseUrl}/segregations/top?${params}`);
        if (!response.ok) {
            throw new Error('Error al obtener top segregaciones');
        }
        return response.json();
    }

    /**
     * Obtener lista de runs con paginación
     */
    async getRuns(skip = 0, limit = 10, filters?: Partial<CamilaConfig>) {
        const params = new URLSearchParams({
            skip: skip.toString(),
            limit: limit.toString()
        });

        if (filters?.week) params.append('semana', filters.week.toString());
        if (filters?.modelType) params.append('modelo_tipo', filters.modelType);

        const response = await fetch(`${this.baseUrl}/runs?${params}`);
        if (!response.ok) {
            throw new Error('Error al obtener runs');
        }
        return response.json();
    }

    /**
     * Obtener estadísticas generales
     */
    async getStats() {
        const response = await fetch(`${this.baseUrl}/stats/summary`);
        if (!response.ok) {
            throw new Error('Error al obtener estadísticas');
        }
        return response.json();
    }

    /**
     * Exportar resultados a Excel
     */
    async exportToExcel(runId: string) {
        const response = await fetch(`${this.baseUrl}/export/${runId}`);
        if (!response.ok) {
            throw new Error('Error al exportar');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `camila_results_${runId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    /**
     * Cargar archivo de resultados
     */
    async uploadFile(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseUrl}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error al cargar archivo');
        }
        return response.json();
    }

    /**
     * Comparar dos configuraciones
     */
    async compareRuns(runId1: string, runId2: string) {
        const params = new URLSearchParams({
            run_id_1: runId1,
            run_id_2: runId2
        });

        const response = await fetch(`${this.baseUrl}/comparison?${params}`);
        if (!response.ok) {
            throw new Error('Error al comparar configuraciones');
        }
        return response.json();
    }

    /**
     * Eliminar un run
     */
    async deleteRun(runId: string) {
        const response = await fetch(`${this.baseUrl}/runs/${runId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Error al eliminar run');
        }
        return response.json();
    }
}

// Exportar instancia única del servicio
export const camilaAPI = new CamilaAPIService();