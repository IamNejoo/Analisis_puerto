// src/services/camilaApi.ts - Versión actualizada para datos reales

import type {
    CamilaConfig,
    CamilaDashboardData,
    CamilaEstadisticas,
    CamilaComparacionTemporal,
    CamilaAnalisisAccuracy,
    CamilaResultadosList,
    CamilaCuotasDetalle,
    CamilaMetricasGruas,
    CamilaAgrupacionHora,
    CamilaLogProcesamiento,
    CamilaFilterConfig
} from '../types/camila';

class CamilaService {
    private baseUrl = import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/api/v1/camila`
        : 'http://localhost:8000/api/v1/camila';

    constructor() {
        console.log('🚀 CamilaService inicializado con baseUrl:', this.baseUrl);
    }

    private async handleResponse<T>(response: Response, url: string): Promise<T> {
        console.log(`📥 Respuesta de ${url}:`, {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        });

        if (!response.ok) {
            let errorDetail = 'Error desconocido';
            try {
                const errorData = await response.json();
                console.error('❌ Error data:', errorData);
                errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData);
            } catch (e) {
                console.error('❌ No se pudo parsear el error:', e);
            }

            throw new Error(`Error ${response.status}: ${errorDetail}`);
        }

        try {
            const data = await response.json();
            console.log(`✅ Datos recibidos de ${url}:`, data);
            return data;
        } catch (e) {
            console.error('❌ Error parseando JSON:', e);
            throw new Error('Error al parsear la respuesta del servidor');
        }
    }

    async getDashboard(config: CamilaConfig): Promise<CamilaDashboardData> {
        console.log('🔵 getDashboard llamado con config:', config);

        const params = new URLSearchParams({
            anio: config.anio.toString(),
            semana: config.semana.toString(),
            turno: config.turno.toString(),
            participacion: config.participacion.toString(),
            dispersion: config.dispersion
        });

        const url = `${this.baseUrl}/dashboard?${params}`;
        console.log('📤 Fetching URL:', url);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });

            const data = await this.handleResponse<CamilaDashboardData>(response, url);
            console.log('✅ Dashboard data received:', data);
            return data;
        } catch (error) {
            console.error('❌ Error en getDashboard:', error);
            throw error;
        }
    }

    async getEstadisticas(): Promise<CamilaEstadisticas> {
        console.log('🔵 getEstadisticas llamado');
        const url = `${this.baseUrl}/estadisticas`;

        try {
            const response = await fetch(url);
            return this.handleResponse<CamilaEstadisticas>(response, url);
        } catch (error) {
            console.error('❌ Error en getEstadisticas:', error);
            throw error;
        }
    }

    async getComparacionTemporal(
        config: Omit<CamilaConfig, 'turno'>,
        incluirDetalles: boolean = false
    ): Promise<CamilaComparacionTemporal> {
        console.log('🔵 getComparacionTemporal llamado con config:', config);

        const params = new URLSearchParams({
            anio: config.anio.toString(),
            semana: config.semana.toString(),
            participacion: config.participacion.toString(),
            dispersion: config.dispersion,
            incluir_detalles: incluirDetalles.toString()
        });

        const url = `${this.baseUrl}/comparacion-temporal?${params}`;

        try {
            const response = await fetch(url);
            return this.handleResponse<CamilaComparacionTemporal>(response, url);
        } catch (error) {
            console.error('❌ Error en getComparacionTemporal:', error);
            throw error;
        }
    }

    async getAnalisisAccuracy(filters?: {
        anio?: number;
        semana?: number;
        participacion?: number;
        min_accuracy?: number;
        max_accuracy?: number;
        limit?: number;
    }): Promise<CamilaAnalisisAccuracy> {
        console.log('🔵 getAnalisisAccuracy llamado con filtros:', filters);

        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    params.append(key, value.toString());
                }
            });
        }

        const url = `${this.baseUrl}/analisis-accuracy?${params}`;

        try {
            const response = await fetch(url);
            return this.handleResponse<CamilaAnalisisAccuracy>(response, url);
        } catch (error) {
            console.error('❌ Error en getAnalisisAccuracy:', error);
            throw error;
        }
    }

    async getResultadosDisponibles(filters?: {
        anio?: number;
        semana?: number;
        turno?: number;
        participacion?: number;
        con_dispersion?: boolean;
        con_comparacion_real?: boolean;
        limit?: number;
        offset?: number;
        ordenar_por?: 'fecha' | 'accuracy' | 'utilizacion';
        orden?: 'asc' | 'desc';
    }): Promise<CamilaResultadosList> {
        console.log('🔵 getResultadosDisponibles llamado con filtros:', filters);

        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    params.append(key, value.toString());
                }
            });
        }

        const url = `${this.baseUrl}/resultados?${params}`;

        try {
            const response = await fetch(url);
            return this.handleResponse<CamilaResultadosList>(response, url);
        } catch (error) {
            console.error('❌ Error en getResultadosDisponibles:', error);
            throw error;
        }
    }

    async getCuotasDetalle(resultadoId: string): Promise<CamilaCuotasDetalle> {
        console.log('🔵 getCuotasDetalle llamado para:', resultadoId);
        const url = `${this.baseUrl}/cuotas/${resultadoId}`;

        try {
            const response = await fetch(url);
            return this.handleResponse<CamilaCuotasDetalle>(response, url);
        } catch (error) {
            console.error('❌ Error en getCuotasDetalle:', error);
            throw error;
        }
    }

    async getMetricasGruas(config: {
        anio: number;
        semana: number;
        turno?: number;
        participacion: number;
        dispersion: string;
    }): Promise<CamilaMetricasGruas> {
        console.log('🔵 getMetricasGruas llamado con config:', config);

        const params = new URLSearchParams({
            anio: config.anio.toString(),
            semana: config.semana.toString(),
            participacion: config.participacion.toString(),
            dispersion: config.dispersion
        });

        if (config.turno) {
            params.append('turno', config.turno.toString());
        }

        const url = `${this.baseUrl}/metricas-gruas?${params}`;

        try {
            const response = await fetch(url);
            return this.handleResponse<CamilaMetricasGruas>(response, url);
        } catch (error) {
            console.error('❌ Error en getMetricasGruas:', error);
            throw error;
        }
    }

    async getLogs(resultadoId: string): Promise<{
        resultado_id: string;
        codigo: string;
        total_logs: number;
        logs: CamilaLogProcesamiento[];
    }> {
        console.log('🔵 getLogs llamado para:', resultadoId);
        const url = `${this.baseUrl}/logs/${resultadoId}`;

        try {
            const response = await fetch(url);
            return this.handleResponse(response, url);
        } catch (error) {
            console.error('❌ Error en getLogs:', error);
            throw error;
        }
    }

    // Método para agrupar por hora (personalizado)
    async getAgrupacionPorHora(config: CamilaFilterConfig): Promise<CamilaAgrupacionHora[]> {
        console.log('🔵 getAgrupacionPorHora llamado con config:', config);

        // Si el backend no tiene endpoint específico, podemos obtener datos de toda la semana
        // y agruparlos en el frontend
        const comparacionTemporal = await this.getComparacionTemporal(config, true);

        // Agrupar por hora
        const porHora = new Map<number, CamilaAgrupacionHora>();

        comparacionTemporal.serie_temporal.forEach(turno => {
            // Calcular hora basada en turno_del_dia
            const horaBase = { 1: 8, 2: 16, 3: 0 }[turno.turno_del_dia] ?? 0;

            // Para cada periodo del turno
            if (turno.detalle_periodos) {
                turno.detalle_periodos.forEach((periodo, idx) => {
                    const hora = (horaBase + idx) % 24;

                    if (!porHora.has(hora)) {
                        porHora.set(hora, {
                            hora,
                            turnos_incluidos: [],
                            estadisticas: {
                                movimientos_modelo_total: 0,
                                movimientos_real_total: 0,
                                accuracy_promedio: 0,
                                utilizacion_promedio: 0,
                                num_turnos: 0
                            },
                            distribucion_bloques: {}
                        });
                    }

                    const horaData = porHora.get(hora)!;
                    horaData.turnos_incluidos.push({
                        turno: turno.turno,
                        dia: turno.dia,
                        fecha: turno.fecha_hora
                    });

                    horaData.estadisticas.movimientos_modelo_total += periodo.modelo;
                    horaData.estadisticas.movimientos_real_total += periodo.real;
                    horaData.estadisticas.accuracy_promedio += periodo.accuracy;
                    horaData.estadisticas.num_turnos += 1;
                });
            }
        });

        // Calcular promedios
        porHora.forEach(data => {
            if (data.estadisticas.num_turnos > 0) {
                data.estadisticas.accuracy_promedio /= data.estadisticas.num_turnos;
                data.estadisticas.utilizacion_promedio /= data.estadisticas.num_turnos;
            }
        });

        return Array.from(porHora.values()).sort((a, b) => a.hora - b.hora);
    }

    async exportarResultados(config: CamilaConfig, formato: 'excel' | 'csv' = 'excel'): Promise<void> {
        console.log('🔵 exportarResultados llamado con config:', config, 'formato:', formato);

        const params = new URLSearchParams({
            anio: config.anio.toString(),
            semana: config.semana.toString(),
            turno: config.turno.toString(),
            participacion: config.participacion.toString(),
            dispersion: config.dispersion,
            formato
        });

        const url = `${this.baseUrl}/export?${params}`;
        console.log('📤 Export URL:', url);

        try {
            const response = await fetch(url);

            if (!response.ok) {
                console.error('❌ Error en export:', response.status, response.statusText);
                throw new Error('Error al exportar datos');
            }

            const blob = await response.blob();
            console.log('✅ Blob recibido:', blob.size, 'bytes');

            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `camila_${config.anio}_S${config.semana}_T${config.turno}.${formato}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);

            console.log('✅ Archivo descargado exitosamente');
        } catch (error) {
            console.error('❌ Error en exportarResultados:', error);
            throw error;
        }
    }

    // Método helper para obtener resumen rápido de accuracy por semana
    async getResumenAccuracySemana(anio: number, semana: number): Promise<{
        accuracy_promedio: number;
        turnos_con_datos: number;
        turnos_totales: number;
        mejor_accuracy: number;
        peor_accuracy: number;
    }> {
        const analisis = await this.getAnalisisAccuracy({ anio, semana });

        return {
            accuracy_promedio: analisis.estadisticas.accuracy_promedio,
            turnos_con_datos: analisis.total_resultados,
            turnos_totales: 21,
            mejor_accuracy: analisis.estadisticas.accuracy_max,
            peor_accuracy: analisis.estadisticas.accuracy_min
        };
    }

    // Método de prueba para verificar la conexión
    async testConnection(): Promise<boolean> {
        console.log('🔵 Probando conexión con el API...');
        try {
            const response = await fetch(`${this.baseUrl}/estadisticas`);
            console.log('✅ Conexión exitosa:', response.ok);
            return response.ok;
        } catch (error) {
            console.error('❌ Error de conexión:', error);
            return false;
        }
    }
}

export const camilaService = new CamilaService();

// Exportar también la clase por si se necesita crear instancias adicionales
export { CamilaService };

// Test de conexión automático en desarrollo
if (import.meta.env.DEV) {
    camilaService.testConnection().then(connected => {
        if (connected) {
            console.log('✅ Camila API está disponible');
        } else {
            console.warn('⚠️ Camila API no está disponible');
        }
    });
}