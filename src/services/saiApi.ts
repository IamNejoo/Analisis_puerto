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
    estadisticas?: {
        bahiasOcupadas?: number;
        ocupacionReal?: number;
        segregacionesActivas?: number;
    };
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
    private baseUrl = 'http://localhost:8000/api/v1/sai';

    /**
     * Obtener posiciones de contenedores para un bloque específico
     * USANDO EL ENDPOINT CORRECTO DE SAI
     */
    async getBlockPositions(
        bloque: string,
        turno: number | undefined,
        fecha: Date | string,
        unidadTemporal: string = 'turno'
    ): Promise<BlockPositionsResponse> {
        let fechaParam: string;

        if (fecha instanceof Date) {
            fechaParam = fecha.toISOString();
        } else {
            fechaParam = fecha.includes('T') ? fecha : `${fecha}T00:00:00.000Z`;
        }

        // Construir parámetros según la unidad temporal
        const params = new URLSearchParams({
            fecha: fechaParam,
            unidad_temporal: unidadTemporal
        });

        // Solo agregar turno si no es vista semanal y si está definido
        if (unidadTemporal !== 'semana' && turno !== undefined) {
            params.append('turno', turno.toString());
        }

        const url = `${this.baseUrl}/bloques/${bloque}/historico?${params}`;
        console.log('🔍 Llamando a:', url);

        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`No hay datos para el bloque ${bloque} en la fecha ${fechaParam}`);
            }
            const errorText = await response.text();
            console.error('❌ Error response:', errorText);
            throw new Error(`Error al obtener posiciones del bloque: ${response.status}`);
        }

        const data = await response.json();

        return data;
    }

    /**
     * Obtener métricas de contenedores para una fecha y turno específico
     */
    async getMetrics(fecha: Date | string, turno?: number): Promise<SAIMetrics> {
        let fechaParam: string;

        if (fecha instanceof Date) {
            fechaParam = fecha.toISOString();
        } else {
            fechaParam = fecha.includes('T') ? fecha : `${fecha}T00:00:00.000Z`;
        }

        // Usar endpoint de dashboard histórico
        const params = new URLSearchParams({
            fecha: fechaParam,
            unidad_temporal: turno ? 'turno' : 'dia'
        });

        const url = `${this.baseUrl}/dashboard/historico?${params}`;
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

        const data = await response.json();

        // Transformar respuesta del dashboard al formato SAIMetrics
        return {
            configId: '',
            fecha: fechaParam,
            turno: turno || 1,
            totalMovimientos: data.kpis_principales?.movimientos?.total_real || 0,
            totalVolumenTeus: data.kpis_principales?.ocupacion?.teus_total || 0,
            bloquesActivos: data.kpis_principales?.ocupacion?.bloques_activos || 0,
            segregacionesActivas: data.kpis_principales?.segregaciones?.total || 0,
            ocupacionPromedio: 0,
            ocupacionPorBloque: data.ocupacion_por_bloque?.reduce((acc: any, item: any) => {
                acc[item.bloque] = item.ocupacion_estimada;
                return acc;
            }, {}) || {},
            bahiasPorBloque: {},
            volumenPorBloque: {},
            segregacionesInfo: {},
            capacidadesPorBloque: {},
            teusPorSegregacion: {}
        };
    }

    /**
     * Obtener fechas disponibles con datos
     */
    async getAvailableDates(): Promise<string[]> {
        const response = await fetch(`${this.baseUrl}/estadisticas/historico`);

        if (!response.ok) {
            throw new Error('Error al obtener fechas disponibles');
        }

        const data = await response.json();

        // Extraer fechas del resumen
        if (data.resumen?.fecha_inicio && data.resumen?.fecha_fin) {
            // Generar array de fechas disponibles (simplificado)
            return [
                data.resumen.fecha_inicio,
                data.resumen.fecha_fin
            ];
        }

        return [];
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
        // No hay endpoint específico de segregaciones, usar valores por defecto
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
     * Obtener estadísticas por rango de fechas
     */
    async getStatsByDateRange(fechaInicio: Date | string, fechaFin: Date | string) {
        const fechaInicioParam = fechaInicio instanceof Date
            ? fechaInicio.toISOString()
            : fechaInicio.includes('T') ? fechaInicio : `${fechaInicio}T00:00:00.000Z`;

        const fechaFinParam = fechaFin instanceof Date
            ? fechaFin.toISOString()
            : fechaFin.includes('T') ? fechaFin : `${fechaFin}T23:59:59.999Z`;

        const params = new URLSearchParams({
            fecha: fechaInicioParam,
            unidad_temporal: 'dia'
        });

        const response = await fetch(`${this.baseUrl}/dashboard/historico?${params}`);

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
            ? fecha.toISOString()
            : fecha.includes('T') ? fecha : `${fecha}T00:00:00.000Z`;

        const params = new URLSearchParams({
            fecha: fechaParam,
            unidad_temporal: 'turno'
        });

        if (bloque) {
            params.append('patio', bloque);
        }

        const response = await fetch(`${this.baseUrl}/dashboard/historico?${params}`);

        if (!response.ok) {
            throw new Error('Error al obtener volumen por bloque y turno');
        }

        const data = await response.json();

        // Transformar respuesta
        return data.ocupacion_por_bloque || [];
    }

    /**
     * Obtener segregaciones activas por fecha
     */
    async getActiveSegregations(fecha: Date | string, turno?: number) {
        const fechaParam = fecha instanceof Date
            ? fecha.toISOString()
            : fecha.includes('T') ? fecha : `${fecha}T00:00:00.000Z`;

        const params = new URLSearchParams({
            fecha: fechaParam,
            unidad_temporal: turno ? 'turno' : 'dia'
        });

        const response = await fetch(`${this.baseUrl}/dashboard/historico?${params}`);

        if (!response.ok) {
            return this.getSegregaciones();
        }

        const data = await response.json();

        // Transformar segregaciones activas del dashboard
        if (data.segregaciones_activas) {
            return data.segregaciones_activas.map((seg: any) => ({
                id: seg.codigo,
                nombre: seg.codigo,
                teus: 2,
                tipo: seg.codigo.includes('IMP') ? 'import' :
                    seg.codigo.includes('EXP') ? 'export' : 'storage',
                color: seg.codigo.includes('IMP') ? '#3B82F6' :
                    seg.codigo.includes('EXP') ? '#10B981' : '#F59E0B'
            }));
        }

        return this.getSegregaciones();
    }
}

// Exportar instancia única del servicio
export const saiApi = new SAIApiService();