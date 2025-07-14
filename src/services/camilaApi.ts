// src/services/camilaApi.ts - VERSIÓN CORREGIDA

import type {
    CamilaConfig,
    CamilaDashboardData,
    CamilaEstadisticas,
    CamilaComparacionTemporal
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

    private transformDashboardResponse(rawData: any): CamilaDashboardData {
        console.log('🔄 Transformando respuesta del dashboard:', rawData);

        // Extraer metadata y métricas
        const metadata = rawData.metadata || {};
        const metricas = rawData.metricas_principales || {};

        // Transformar la estructura - INICIALIZAR TODOS LOS ARRAYS
        const transformed: CamilaDashboardData = {
            resultado: {
                id: metadata.resultado_id || '',
                codigo: metadata.codigo || '',
                fecha_inicio: metadata.fecha_inicio || '',
                anio: metadata.anio || 2022,
                semana: metadata.semana || 1,
                turno: metadata.turno || 1,
                turno_del_dia: metadata.turno_del_dia || 1,
                participacion: metadata.participacion || 68,
                total_gruas: metricas.gruas_utilizadas || 12,
                con_dispersion: metadata.con_dispersion || false,
                total_movimientos: metricas.total_movimientos || 0,
                total_segregaciones: metricas.segregaciones_atendidas || 0,
                total_bloques_visitados: metricas.bloques_visitados || 0,
                utilizacion_promedio: metricas.utilizacion_promedio || 0,
                coeficiente_variacion: metricas.coeficiente_variacion || 0,
                tiempo_idle_promedio: metricas.tiempo_idle_promedio || 0,
                total_frecuencias: metricas.total_frecuencias || 0,
                total_cuotas_camiones: rawData.resumen_operacional?.total_cuotas_camiones || 0,
                estado: metricas.total_movimientos > 0 ? 'Factible' : 'Sin solución'
            },
            asignaciones: [],
            metricas_gruas: [],
            cuotas_camiones: [],
            comparaciones: [] // Siempre inicializado como array vacío
        };

        // Transformar asignaciones por periodo
        if (rawData.asignaciones_por_periodo) {
            Object.entries(rawData.asignaciones_por_periodo).forEach(([periodo, asignaciones]: [string, any]) => {
                if (Array.isArray(asignaciones)) {
                    asignaciones.forEach(asig => {
                        transformed.asignaciones.push({
                            segregacion_codigo: asig.segregacion || '',
                            bloque_codigo: asig.bloque || '',
                            periodo: parseInt(periodo),
                            frecuencia: asig.frecuencia || 0
                        });
                    });
                }
            });
        }

        // Transformar métricas por grúa
        if (rawData.metricas_por_grua && Array.isArray(rawData.metricas_por_grua)) {
            transformed.metricas_gruas = rawData.metricas_por_grua.map((metrica: any) => ({
                grua_id: metrica.grua_id || 0,
                movimientos_asignados: metrica.movimientos || 0,
                bloques_visitados: metrica.bloques_visitados || 0,
                tiempo_trabajado: metrica.tiempo_productivo || 0,
                tiempo_idle: metrica.tiempo_improductivo || 0,
                utilizacion_pct: metrica.utilizacion || 0
            }));
        }

        // Transformar cuotas por periodo
        if (rawData.cuotas_por_periodo) {
            Object.entries(rawData.cuotas_por_periodo).forEach(([periodo, cuotas]: [string, any]) => {
                if (Array.isArray(cuotas)) {
                    cuotas.forEach(cuota => {
                        transformed.cuotas_camiones.push({
                            bloque_codigo: cuota.bloque || '',
                            periodo: parseInt(periodo),
                            cuota_camiones: cuota.cuota || 0,
                            capacidad_maxima: cuota.capacidad || 0,
                            utilizacion_pct: cuota.capacidad > 0
                                ? ((cuota.cuota || 0) / cuota.capacidad) * 100
                                : 0
                        });
                    });
                }
            });
        }

        // Transformar comparaciones con Magdalena si existen
        if (rawData.comparacion_con_magdalena && rawData.comparacion_con_magdalena.por_bloque) {
            const comparacionesPorBloque = rawData.comparacion_con_magdalena.por_bloque;

            Object.entries(comparacionesPorBloque).forEach(([bloque, datos]: [string, any]) => {
                // Solo agregar si hay movimientos en alguno de los dos modelos
                if ((datos.magdalena && datos.magdalena > 0) || (datos.camila && datos.camila > 0)) {
                    // Verificar que comparaciones existe antes de hacer push
                    if (transformed.comparaciones) {
                        transformed.comparaciones.push({
                            tipo_comparacion: 'por_bloque',
                            metrica: 'movimientos',
                            valor_real: Math.round(datos.magdalena || 0),
                            valor_camila: Math.round(datos.camila || 0),
                            diferencia_absoluta: Math.round(datos.diferencia || 0),
                            porcentaje_diferencia: 0, // Calcularlo si es necesario
                            descripcion: `Bloque ${bloque}`
                        });
                    }
                }
            });
        }

        // Actualizar bloques visitados basado en asignaciones
        const bloquesUnicos = new Set(transformed.asignaciones.map(a => a.bloque_codigo));
        transformed.resultado.total_bloques_visitados = bloquesUnicos.size;

        // Actualizar total de segregaciones basado en asignaciones
        const segregacionesUnicas = new Set(transformed.asignaciones.map(a => a.segregacion_codigo));
        transformed.resultado.total_segregaciones = segregacionesUnicas.size;

        console.log('✅ Dashboard transformado:', {
            tieneResultado: !!transformed.resultado,
            numAsignaciones: transformed.asignaciones.length,
            numMetricas: transformed.metricas_gruas.length,
            numCuotas: transformed.cuotas_camiones.length,
            numComparaciones: transformed.comparaciones?.length || 0,
            bloquesVisitados: transformed.resultado.total_bloques_visitados,
            segregacionesUnicas: transformed.resultado.total_segregaciones
        });

        return transformed;
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

            const rawData = await this.handleResponse<any>(response, url);

            // Transformar la respuesta al formato esperado
            const transformedData = this.transformDashboardResponse(rawData);

            return transformedData;
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

    async getComparacionTemporal(config: Omit<CamilaConfig, 'turno'>): Promise<CamilaComparacionTemporal> {
        console.log('🔵 getComparacionTemporal llamado con config:', config);

        const params = new URLSearchParams({
            anio: config.anio.toString(),
            semana: config.semana.toString(),
            participacion: config.participacion.toString(),
            dispersion: config.dispersion
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

    async getResultadosDisponibles(): Promise<Array<{
        anio: number;
        semanas: number[];
        participaciones: number[];
    }>> {
        console.log('🔵 getResultadosDisponibles llamado');
        const url = `${this.baseUrl}/resultados?limit=1000`;

        try {
            const response = await fetch(url);
            const data = await this.handleResponse<{
                total: number;
                items: any[];
            }>(response, url);

            // Agrupar por año
            const grouped = new Map<number, { semanas: Set<number>, participaciones: Set<number> }>();

            data.items.forEach(item => {
                if (!grouped.has(item.anio)) {
                    grouped.set(item.anio, { semanas: new Set(), participaciones: new Set() });
                }
                const group = grouped.get(item.anio)!;
                group.semanas.add(item.semana);
                group.participaciones.add(item.participacion);
            });

            const result = Array.from(grouped.entries()).map(([anio, data]) => ({
                anio,
                semanas: Array.from(data.semanas).sort((a, b) => a - b),
                participaciones: Array.from(data.participaciones).sort((a, b) => a - b)
            }));

            console.log('✅ Resultados disponibles procesados:', result);
            return result;
        } catch (error) {
            console.error('❌ Error en getResultadosDisponibles:', error);
            throw error;
        }
    }

    async exportarResultados(config: CamilaConfig, formato: 'excel' | 'csv' = 'excel') {
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

    // Método de prueba para verificar la conexión
    async testConnection(): Promise<boolean> {
        console.log('🔵 Probando conexión con el API...');
        try {
            const response = await fetch(`${this.baseUrl}/dashboard?anio=2022&semana=1&turno=1&participacion=68&dispersion=K`);
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