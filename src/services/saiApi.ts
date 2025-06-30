// src/services/saiApi.ts
import axios from 'axios';

// Definir el tipo SAIMetrics si no está importado
interface SAIMetrics {
    configId: string;
    fecha: string;
    semana: number;
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

class SAIApiService {
    private baseUrl = 'http://localhost:8000/api/v1/sai';

    /**
     * Obtener métricas SAI para una fecha y turno específico
     * La fecha debe venir ya formateada correctamente desde el TimeContext
     */
    async getMetrics(fecha: Date | string, turno?: number): Promise<SAIMetrics> {
        let fechaParam: string;

        if (fecha instanceof Date) {
            // Formatear como YYYY-MM-DDTHH:mm:ss sin zona horaria
            const year = fecha.getFullYear();
            const month = String(fecha.getMonth() + 1).padStart(2, '0');
            const day = String(fecha.getDate()).padStart(2, '0');
            const hours = String(fecha.getHours()).padStart(2, '0');
            const minutes = String(fecha.getMinutes()).padStart(2, '0');
            const seconds = String(fecha.getSeconds()).padStart(2, '0');

            fechaParam = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        } else {
            // Si es string, remover la Z del final si existe
            fechaParam = fecha.replace(/\.000Z$/, '').replace(/Z$/, '');
        }

        // Construir URL manualmente para evitar codificación de :
        const url = turno
            ? `${this.baseUrl}/metrics?fecha=${fechaParam}&turno=${turno}`
            : `${this.baseUrl}/metrics?fecha=${fechaParam}`;

        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('No hay datos disponibles para esta fecha');
            }
            if (response.status === 422) {
                throw new Error('Formato de fecha inválido. Se requiere formato datetime completo');
            }
            throw new Error(`Error al cargar métricas SAI: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Obtener lista de configuraciones disponibles
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

        const response = await fetch(`${this.baseUrl}/configurations?${params}`);

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
        const response = await fetch(`${this.baseUrl}/segregaciones`);

        if (!response.ok) {
            throw new Error('Error al obtener segregaciones');
        }

        return response.json();
    }

    /**
     * Obtener vista de bahías para un bloque específico
     */
    async getBlockBahiasView(bloque: string, turno: number, semana: number, fecha?: Date | string) {
        const params = new URLSearchParams({
            semana: semana.toString()
        });

        // Si se proporciona fecha, usar el formato completo
        if (fecha) {
            const fechaParam = fecha instanceof Date ? fecha.toISOString() : fecha;
            params.append('fecha', fechaParam);
        }

        const response = await fetch(`${this.baseUrl}/bahias/${bloque}/${turno}?${params}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`No hay datos para el bloque ${bloque} en semana ${semana}`);
            }
            throw new Error('Error al obtener vista de bahías');
        }

        return response.json();
    }

    /**
     * Comparar SAI con Magdalena
     */
    async compareSAIMagdalena(semana: number, turno: number, participacion = 68, fecha?: Date | string) {
        const params = new URLSearchParams({
            participacion: participacion.toString()
        });

        if (fecha) {
            const fechaParam = fecha instanceof Date ? fecha.toISOString() : fecha;
            params.append('fecha', fechaParam);
        }

        const response = await fetch(`${this.baseUrl}/comparison/${semana}/${turno}?${params}`);

        if (!response.ok) {
            throw new Error('Error al comparar SAI con Magdalena');
        }

        return response.json();
    }

    /**
     * Subir archivos SAI
     */
    async uploadFiles(files: {
        flujos: File;
        instancia: File;
        evolucion?: File;
    }, metadata: {
        fecha: Date | string;  // Acepta Date o string con formato completo
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

        // Convertir fecha a formato correcto
        const fechaParam = metadata.fecha instanceof Date
            ? metadata.fecha.toISOString()
            : metadata.fecha;

        // Agregar metadata
        formData.append('fecha', fechaParam);
        formData.append('semana', metadata.semana.toString());
        if (metadata.participacion !== undefined) {
            formData.append('participacion', metadata.participacion.toString());
        }
        if (metadata.con_dispersion !== undefined) {
            formData.append('con_dispersion', metadata.con_dispersion.toString());
        }

        const response = await fetch(`${this.baseUrl}/upload`, {
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
            fecha_inicio: fechaInicio instanceof Date ? fechaInicio.toISOString() : fechaInicio,
            fecha_fin: fechaFin instanceof Date ? fechaFin.toISOString() : fechaFin
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
        const params = new URLSearchParams({
            fecha: fecha instanceof Date ? fecha.toISOString() : fecha,
            ...(bloque && { bloque })
        });

        const response = await fetch(`${this.baseUrl}/volume/by-block-shift?${params}`);

        if (!response.ok) {
            throw new Error('Error al obtener volumen por bloque y turno');
        }

        return response.json();
    }

    /**
     * Obtener segregaciones activas por fecha
     */
    async getActiveSegregations(fecha: Date | string, turno?: number) {
        const params = new URLSearchParams({
            fecha: fecha instanceof Date ? fecha.toISOString() : fecha,
            ...(turno && { turno: turno.toString() })
        });

        const response = await fetch(`${this.baseUrl}/segregations/active?${params}`);

        if (!response.ok) {
            throw new Error('Error al obtener segregaciones activas');
        }

        return response.json();
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
        a.download = `sai_data_${configId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}

// Exportar instancia única del servicio
export const saiApi = new SAIApiService();