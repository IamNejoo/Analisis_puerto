// src/services/saiApi.ts
import axios from 'axios';

// Definir el tipo SAIMetrics si no está importado
interface SAIMetrics {
    configId?: string;
    fecha: string;
    semana?: number;
    turno: number;
    totalMovimientos: number;
    totalVolumenTeus: number;
    bloquesActivos: number;
    segregacionesActivas: number;
    ocupacionPromedio: number;
    ocupacionPorBloque: Record<string, number>;
    bahiasPorBloque: Record<string, Record<string, number>>;
    volumenPorBloque: Record<string, Record<string, number>>;
    segregacionesInfo: Record<string, {
        id: string;
        nombre: string;
        teus: number;
        tipo: string;
        color: string;
    }>;
    capacidadesPorBloque: Record<string, number>;
    teusPorSegregacion: Record<string, number>;
}

interface BlockPositionsResponse {
    bloque: string;
    turno: number;
    fecha: string;
    hora: string;
    bahiasOcupadas: number;
    ocupacionReal: number;
    segregacionesActivas: number;
    totalVolumenTeus: number;
    capacidadTotalTeus: number;
    bahiasPorBloque: Record<string, Record<string, number>>;
    volumenPorBloque: Record<string, Record<string, number>>;
    segregacionesInfo: Record<string, any>;
    segregacionesStats: Record<string, any>;
    occupancyMatrix: Array<Array<any | null>>;
    capacidadesPorBloque?: Record<string, number>;
    teusPorSegregacion?: Record<string, number>;
}

class SAIApiService {
    private baseUrl = 'http://localhost:8000/api/v1/container-positions';
    private saiBaseUrl = 'http://localhost:8000/api/v1/sai'; // Mantener para otros endpoints SAI

    /**
     * Obtener métricas de contenedores para una fecha y turno específico
     */
    async getMetrics(fecha: Date | string, turno?: number): Promise<SAIMetrics> {
        let fechaParam: string;

        if (fecha instanceof Date) {
            // Formatear como YYYY-MM-DD (solo fecha)
            const year = fecha.getFullYear();
            const month = String(fecha.getMonth() + 1).padStart(2, '0');
            const day = String(fecha.getDate()).padStart(2, '0');
            fechaParam = `${year}-${month}-${day}`;
        } else {
            // Si es string, extraer solo la parte de fecha
            fechaParam = fecha.split('T')[0];
        }

        // Construir URL para el endpoint de container positions
        const url = turno
            ? `${this.baseUrl}/metrics?fecha=${fechaParam}&turno=${turno}`
            : `${this.baseUrl}/metrics?fecha=${fechaParam}`;

        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('No hay datos de contenedores para esta fecha');
            }
            if (response.status === 422) {
                throw new Error('Formato de fecha inválido');
            }
            throw new Error(`Error al cargar datos de contenedores: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Obtener posiciones de contenedores para un bloque específico
     */
    async getBlockPositions(bloque: string, turno: number, fecha: Date | string): Promise<BlockPositionsResponse> {
        let fechaParam: string;

        if (fecha instanceof Date) {
            const year = fecha.getFullYear();
            const month = String(fecha.getMonth() + 1).padStart(2, '0');
            const day = String(fecha.getDate()).padStart(2, '0');
            fechaParam = `${year}-${month}-${day}`;
        } else {
            fechaParam = fecha.split('T')[0];
        }

        const url = `${this.baseUrl}/positions/block/${bloque}/${turno}?fecha=${fechaParam}`;

        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`No hay datos para el bloque ${bloque} en la fecha ${fechaParam}`);
            }
            throw new Error(`Error al obtener posiciones del bloque: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Obtener fechas disponibles con datos
     */
    async getAvailableDates(): Promise<string[]> {
        const response = await fetch(`${this.baseUrl}/positions/dates`);

        if (!response.ok) {
            throw new Error('Error al obtener fechas disponibles');
        }

        return response.json();
    }

    /**
     * Obtener vista de bahías para un bloque específico
     * Actualizado para usar el nuevo endpoint
     */
    async getBlockBahiasView(bloque: string, turno: number, semana: number, fecha?: Date | string) {
        // Si se proporciona fecha, usar el endpoint de container positions
        if (fecha) {
            return this.getBlockPositions(bloque, turno, fecha);
        }

        // Si no hay fecha, intentar con el endpoint SAI original
        const params = new URLSearchParams({
            semana: semana.toString()
        });

        const response = await fetch(`${this.saiBaseUrl}/bahias/${bloque}/${turno}?${params}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`No hay datos para el bloque ${bloque} en semana ${semana}`);
            }
            throw new Error('Error al obtener vista de bahías');
        }

        return response.json();
    }

    /**
     * Obtener lista de configuraciones disponibles (SAI original)
     */
    async getConfigurations(skip = 0, limit = 10): Promise<{
        total: number;
        items: Array<{
            id: string;
            fecha: string;
            semana: number;
            participacion: number;
            con_dispersion: boolean;
            fecha_carga: string;
        }>;
    }> {
        const params = new URLSearchParams({
            skip: skip.toString(),
            limit: limit.toString()
        });

        const response = await fetch(`${this.saiBaseUrl}/configurations?${params}`);

        if (!response.ok) {
            throw new Error('Error al obtener configuraciones SAI');
        }

        return response.json();
    }

    /**
     * Obtener lista de segregaciones
     */
    async getSegregaciones(): Promise<Array<{
        id: string;
        nombre: string;
        teus: number;
        tipo: string;
        color: string;
    }>> {
        // Para container positions, retornar las categorías básicas
        return [
            {
                id: 'IMPRT',
                nombre: 'Importación',
                teus: 2,
                tipo: 'import',
                color: '#3B82F6'
            },
            {
                id: 'EXPRT',
                nombre: 'Exportación',
                teus: 2,
                tipo: 'export',
                color: '#10B981'
            },
            {
                id: 'STRGE',
                nombre: 'Almacenaje',
                teus: 2,
                tipo: 'storage',
                color: '#F59E0B'
            }
        ];
    }

    /**
     * Comparar datos de container positions con Magdalena
     */
    async compareSAIMagdalena(semana: number, turno: number, participacion = 68, fecha?: Date | string) {
        // Por ahora retornar null ya que solo tenemos datos de container positions
        return {
            fecha: fecha,
            semana: semana,
            turno: turno,
            container_metrics: fecha ? await this.getMetrics(fecha, turno) : null,
            magdalena_metrics: null,
            comparacion: {
                container_volumen_total: 0,
                container_bloques_activos: 0,
                container_segregaciones: 3,
                container_ocupacion_promedio: 0
            }
        };
    }

    /**
     * Subir archivos SAI (mantener para compatibilidad)
     */
    async uploadFiles(files: {
        flujos: File;
        instancia: File;
        evolucion?: File;
    }, metadata: {
        fecha: Date | string;
        semana: number;
        participacion?: number;
        con_dispersion?: boolean;
    }) {
        const formData = new FormData();
        formData.append('flujos_file', files.flujos);
        formData.append('instancia_file', files.instancia);
        if (files.evolucion) {
            formData.append('evolucion_file', files.evolucion);
        }

        const fechaParam = metadata.fecha instanceof Date
            ? metadata.fecha.toISOString()
            : metadata.fecha;

        formData.append('fecha', fechaParam);
        formData.append('semana', metadata.semana.toString());
        if (metadata.participacion !== undefined) {
            formData.append('participacion', metadata.participacion.toString());
        }
        if (metadata.con_dispersion !== undefined) {
            formData.append('con_dispersion', metadata.con_dispersion.toString());
        }

        const response = await fetch(`${this.saiBaseUrl}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error al cargar archivos SAI');
        }

        return response.json();
    }

    /**
     * Obtener estadísticas por rango de fechas
     */
    async getStatsByDateRange(fechaInicio: Date | string, fechaFin: Date | string) {
        const params = new URLSearchParams({
            fecha_inicio: fechaInicio instanceof Date ? fechaInicio.toISOString().split('T')[0] : fechaInicio.split('T')[0],
            fecha_fin: fechaFin instanceof Date ? fechaFin.toISOString().split('T')[0] : fechaFin.split('T')[0]
        });

        const response = await fetch(`${this.baseUrl}/stats/range?${params}`);

        if (!response.ok) {
            throw new Error('Error al obtener estadísticas por rango');
        }

        return response.json();
    }

    /**
     * Obtener volumen por bloque y turno
     */
    async getVolumeByBlockAndShift(fecha: Date | string, bloque?: string) {
        const fechaParam = fecha instanceof Date
            ? fecha.toISOString().split('T')[0]
            : fecha.split('T')[0];

        const params = new URLSearchParams({
            fecha: fechaParam,
            ...(bloque && { bloque })
        });

        const response = await fetch(`${this.baseUrl}/volume/by-block-shift?${params}`);

        if (!response.ok) {
            throw new Error('Error al obtener volumen por bloque y turno');
        }

        return response.json();
    }

    /**
     * Obtener segregaciones activas por fecha (categorías de contenedores)
     */
    async getActiveSegregations(fecha: Date | string, turno?: number) {
        // Para container positions, siempre retornar las 3 categorías
        return this.getSegregaciones();
    }

    /**
     * Exportar datos a Excel
     */
    async exportToExcel(configId: string) {
        const response = await fetch(`${this.baseUrl}/export/${configId}`);

        if (!response.ok) {
            throw new Error('Error al exportar datos');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `container_positions_${configId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}

// Exportar instancia única del servicio
export const saiApi = new SAIApiService();