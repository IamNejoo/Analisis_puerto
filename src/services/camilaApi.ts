// services/camilaApi.ts - Actualizado para el nuevo backend
import type { CamilaConfig, CamilaResultsV2 } from '../types/camila';

class CamilaAPIService {
    private baseUrl = 'http://localhost:8000/api/v1/camila';

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
     * Obtener resultados del modelo (nuevo formato)
     */
    async getResultsV2(config: CamilaConfig): Promise<CamilaResultsV2> {
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
     * Obtener resultados en formato legacy (para compatibilidad)
     */
    async getResults(config: CamilaConfig) {
        // Obtener datos del nuevo formato
        const v2Results = await this.getResultsV2(config);

        // Transformar al formato anterior
        return this.transformToLegacyFormat(v2Results);
    }

    /**
     * Transformar resultados V2 a formato legacy
     */
    private transformToLegacyFormat(v2: CamilaResultsV2) {
        // Extraer flujos por tipo de las variables
        const receptionFlow = this.createFlowMatrix(v2, 'flujo_recepcion');
        const deliveryFlow = this.createFlowMatrix(v2, 'flujo_entrega');
        const loadingFlow = this.createFlowMatrix(v2, 'flujo_carga');
        const unloadingFlow = this.createFlowMatrix(v2, 'flujo_descarga');

        // Calcular cuotas recomendadas
        const recommendedQuotas = this.calculateRecommendedQuotas(
            receptionFlow,
            v2.matriz_disponibilidad
        );

        return {
            // Datos de configuración
            run_id: v2.run_id,
            config: v2.config,

            // Matrices de flujos
            grue_assignment: {
                data: v2.matriz_gruas
            },
            reception_flow: {
                data: receptionFlow
            },
            delivery_flow: {
                data: deliveryFlow
            },
            loading_flow: {
                data: loadingFlow
            },
            unloading_flow: {
                data: unloadingFlow
            },
            total_flows: {
                data: v2.matriz_flujos
            },
            capacity: {
                data: v2.matriz_capacidad
            },
            availability: {
                data: v2.matriz_disponibilidad
            },
            recommended_quotas: {
                data: recommendedQuotas
            },

            // Métricas
            block_participation: v2.participacion_bloques,
            time_participation: v2.participacion_tiempo,
            std_dev_blocks: this.calculateStdDev(v2.participacion_bloques),
            std_dev_time: this.calculateStdDev(v2.participacion_tiempo),
            workload_balance: v2.balance_workload,
            congestion_index: v2.indice_congestion,
            objective_value: v2.funcion_objetivo,

            // Datos reales si existen
            real_data: null,
            comparison: null
        };
    }

    /**
     * Crear matriz de flujo específica desde variables
     */
    private createFlowMatrix(v2: CamilaResultsV2, tipoFlujo: string): number[][] {
        const matrix = Array(9).fill(null).map(() => Array(8).fill(0));

        const flujos = tipoFlujo === 'flujo_recepcion' ? v2.variables_summary.flujos_recepcion :
            tipoFlujo === 'flujo_entrega' ? v2.variables_summary.flujos_entrega :
                [];

        flujos.forEach(flujo => {
            if (flujo.bloque && flujo.tiempo) {
                const bIdx = parseInt(flujo.bloque.substring(1)) - 1;
                const tIdx = flujo.tiempo - 1;

                if (bIdx >= 0 && bIdx < 9 && tIdx >= 0 && tIdx < 8) {
                    matrix[bIdx][tIdx] += flujo.valor;
                }
            }
        });

        return matrix;
    }

    /**
     * Calcular cuotas recomendadas
     */
    private calculateRecommendedQuotas(reception: number[][], availability: number[][]): number[][] {
        const quotas = Array(9).fill(null).map(() => Array(8).fill(0));
        const FACTOR_SEGURIDAD = 0.8;

        for (let b = 0; b < 9; b++) {
            for (let t = 0; t < 8; t++) {
                quotas[b][t] = Math.round(reception[b][t] + (availability[b][t] * FACTOR_SEGURIDAD));
            }
        }

        return quotas;
    }

    /**
     * Calcular desviación estándar
     */
    private calculateStdDev(values: number[]): number {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const squareDiffs = values.map(value => Math.pow(value - avg, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(avgSquareDiff);
    }

    /**
     * Obtener timeline de grúa
     */
    async getGruaTimeline(runId: string, gruaId: string) {
        const response = await fetch(`${this.baseUrl}/gruas/${gruaId}/timeline?run_id=${runId}`);
        if (!response.ok) {
            throw new Error('Error al obtener timeline de grúa');
        }
        return response.json();
    }

    /**
     * Obtener detalle de bloque
     */
    async getBlockDetail(runId: string, blockId: string) {
        const response = await fetch(`${this.baseUrl}/blocks/${blockId}/detail?run_id=${runId}`);
        if (!response.ok) {
            throw new Error('Error al obtener detalle de bloque');
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

        const response = await fetch(`${this.baseUrl}/comparison/models?${params}`);
        if (!response.ok) {
            throw new Error('Error al comparar modelos');
        }
        return response.json();
    }

    /**
     * Cargar archivos del modelo
     */
    async uploadFiles(
        resultadoFile: File,
        instanciaFile: File,
        config: CamilaConfig
    ) {
        const formData = new FormData();
        formData.append('resultado_file', resultadoFile);
        formData.append('instancia_file', instanciaFile);
        formData.append('semana', config.week.toString());
        formData.append('dia', config.day);
        formData.append('turno', config.shift.toString());
        formData.append('modelo_tipo', config.modelType);
        formData.append('con_segregaciones', config.withSegregations.toString());

        const response = await fetch(`${this.baseUrl}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error al cargar archivos');
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