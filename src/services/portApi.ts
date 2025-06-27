// src/services/portApi.ts
import type {
    PortMovementData,
    CorePortKPIs,
    ContainerDwellTime,
    TruckTurnaroundTime
} from '../types/portKpis';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface KPIFilters {
    startDate: Date;
    endDate: Date;
    unit?: string;
    patioFilter?: string;
    bloqueFilter?: string;
    operationType?: 'import' | 'export'; // Nuevo para CDT/TTT
}

// Interfaz para la respuesta completa del backend
interface ComprehensiveKPIResponse {
    capacidad: {
        utilizacionPorVolumen: number;
        promedioTeus: number;
        minimoTeus: number;
        maximoTeus: number;
        rangoOperativo: number;
        coeficienteVariacion: number;
        capacidadTotal: number;
        horasCriticas: number;
    };
    flujos: {
        gateEntrada: number;
        gateSalida: number;
        gateThroughput: number;
        muelleEntrada: number;
        muelleSalida: number;
        totalMovimientos: number;
        balanceFlujo: number;
        indiceRemanejos: number;
        productividadOperacional: number;
    };
    tiemposServicio: {
        ttt: {
            promedio: number;
            minimo: number;
            maximo: number;
            mediana: number;
            p90: number;
            p95: number;
            totalCamiones: number;
        };
        cdt: {
            promedioHoras: number;
            promedioDias: number;
            minimo: number;
            maximo: number;
            mediana: number;
            p90: number;
            p95: number;
            totalContenedores: number;
            criticos: number;
        };
    };
    congestion: {
        saturacionOperacional: number;
        percentil95Maximos: number;
        nivelInventario: string;
        indiceFlujo: number;
    };
    kpiRelations: {
        congestionProductividadStatus: 'good' | 'normal' | 'warning' | 'critical';
        utilizacionRemanejosStatus: 'good' | 'normal' | 'warning' | 'critical';
        balanceUtilizacionStatus: 'good' | 'normal' | 'warning' | 'critical';
    };
    metadata: {
        periodo: {
            inicio: string;
            fin: string;
            granularidad: string;
        };
        totalRegistros: number;
        horasUnicas: number;
        filtros: {
            patio: string | null;
            bloque: string | null;
            operacion: string | null;
        };
    };
}

class PortApiService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    async getHistoricalMovements(filters: KPIFilters): Promise<PortMovementData[]> {
        const params = new URLSearchParams({
            start_date: this.formatDate(filters.startDate),
            end_date: this.formatDate(filters.endDate),
            ...(filters.patioFilter && { patio: filters.patioFilter }),
            ...(filters.bloqueFilter && { bloque: filters.bloqueFilter })
        });

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);
            const response = await fetch(`${this.baseUrl}/historical/movements?${params}`, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data.map((item: any) => ({
                bloque: item.bloque,
                hora: item.hora,
                gateEntradaContenedores: item.gateEntradaContenedores,
                gateEntradaTeus: item.gateEntradaTeus,
                gateSalidaContenedores: item.gateSalidaContenedores,
                gateSalidaTeus: item.gateSalidaTeus,
                muelleEntradaContenedores: item.muelleEntradaContenedores,
                muelleEntradaTeus: item.muelleEntradaTeus,
                muelleSalidaContenedores: item.muelleSalidaContenedores,
                muelleSalidaTeus: item.muelleSalidaTeus,
                remanejosContenedores: item.remanejosContenedores,
                remanejosTeus: item.remanejosTeus,
                patioEntradaContenedores: item.patioEntradaContenedores,
                patioEntradaTeus: item.patioEntradaTeus,
                patioSalidaContenedores: item.patioSalidaContenedores,
                patioSalidaTeus: item.patioSalidaTeus,
                terminalEntradaContenedores: item.terminalEntradaContenedores,
                terminalEntradaTeus: item.terminalEntradaTeus,
                terminalSalidaContenedores: item.terminalSalidaContenedores,
                terminalSalidaTeus: item.terminalSalidaTeus,
                minimoContenedores: item.minimoContenedores,
                minimoTeus: item.minimoTeus,
                maximoContenedores: item.maximoContenedores,
                maximosTeus: item.maximosTeus,
                promedioContenedores: item.promedioContenedores,
                promedioTeus: item.promedioTeus
            }));
        } catch (error) {
            console.error('Error fetching historical movements:', error);
            throw error;
        }
    }

    // Método actualizado para usar el endpoint comprehensive
    async calculateKPIs(filters: KPIFilters): Promise<CorePortKPIs> {
        const params = new URLSearchParams({
            start_date: this.formatDate(filters.startDate),
            end_date: this.formatDate(filters.endDate),
            unit: filters.unit || 'day',
            ...(filters.patioFilter && { patio_filter: filters.patioFilter }),
            ...(filters.bloqueFilter && { bloque_filter: filters.bloqueFilter }),
            ...(filters.operationType && { operation_type: filters.operationType })
        });

        try {
            const response = await fetch(`${this.baseUrl}/historical/kpis/comprehensive?${params}`);

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data: ComprehensiveKPIResponse = await response.json();

            // Mapear la respuesta al formato CorePortKPIs
            return {
                // 1. Utilización por Volumen (usando promedio pre-calculado)
                utilizacionPorVolumen: data.capacidad.utilizacionPorVolumen,
                promedioTeus: data.capacidad.promedioTeus,
                capacidadTotal: data.capacidad.capacidadTotal,
                utilizacionPorBloque: {}, // TODO: Solicitar al backend si es necesario
                utilizacionPorPatio: {},

                // 2. Flujo Promedio en Gates (antes Congestión Vehicular)
                flujoPromedioGates: data.flujos.gateThroughput,
                gateThroughput: data.flujos.gateThroughput,

                // 3. Balance de Flujo
                balanceFlujo: data.flujos.balanceFlujo,
                totalEntradas: data.flujos.gateEntrada + data.flujos.muelleEntrada,
                totalSalidas: data.flujos.gateSalida + data.flujos.muelleSalida,

                // 4. Productividad Operacional
                productividadOperacional: data.flujos.productividadOperacional,

                // 5. Índice de Remanejo
                indiceRemanejo: data.flujos.indiceRemanejos,
                totalRemanejos: 0, // TODO: Calcular si es necesario

                // 6. Variabilidad Operacional (reemplaza Saturación)
                variabilidadOperacional: data.capacidad.coeficienteVariacion,
                rangoOperativo: data.capacidad.rangoOperativo,
                minimoTeus: data.capacidad.minimoTeus,
                maximoTeus: data.capacidad.maximoTeus,
                horasCriticas: data.capacidad.horasCriticas,

                // 7. Tiempo de Permanencia (CDT)
                tiempoPermanencia: {
                    promedioHoras: data.tiemposServicio.cdt.promedioHoras,
                    promedioDias: data.tiemposServicio.cdt.promedioDias,
                    minimo: data.tiemposServicio.cdt.minimo,
                    maximo: data.tiemposServicio.cdt.maximo,
                    mediana: data.tiemposServicio.cdt.mediana,
                    p90: data.tiemposServicio.cdt.p90,
                    p95: data.tiemposServicio.cdt.p95,
                    totalContenedores: data.tiemposServicio.cdt.totalContenedores,
                    criticos: data.tiemposServicio.cdt.criticos
                },

                // 8. Tiempo de Camiones (TTT)
                tiempoCamiones: {
                    promedio: data.tiemposServicio.ttt.promedio,
                    minimo: data.tiemposServicio.ttt.minimo,
                    maximo: data.tiemposServicio.ttt.maximo,
                    mediana: data.tiemposServicio.ttt.mediana,
                    p90: data.tiemposServicio.ttt.p90,
                    p95: data.tiemposServicio.ttt.p95,
                    totalCamiones: data.tiemposServicio.ttt.totalCamiones
                },

                // Datos auxiliares
                totalMovimientos: data.flujos.totalMovimientos,
                horasConActividad: data.metadata.horasUnicas,

                // Relaciones KPI (extendidas con nuevas relaciones)
                kpiRelations: {
                    ...data.kpiRelations,
                    // Calcular nuevas relaciones basadas en tiempos de servicio
                    tiempoServicioUtilizacionStatus: this.calcularRelacionTiempoUtilizacion(
                        data.tiemposServicio.cdt.promedioDias,
                        data.capacidad.utilizacionPorVolumen
                    ),
                    tiempoServicioFlujoStatus: this.calcularRelacionTiempoFlujo(
                        data.tiemposServicio.ttt.promedio,
                        data.flujos.gateThroughput
                    )
                }
            };
        } catch (error) {
            console.error('Error calculating KPIs:', error);
            throw error;
        }
    }

    // Métodos auxiliares para calcular nuevas relaciones
    private calcularRelacionTiempoUtilizacion(
        cdtDias: number,
        utilizacion: number
    ): 'good' | 'normal' | 'warning' | 'critical' {
        // Alta utilización + alto CDT = crítico
        if (utilizacion > 85 && cdtDias > 5) return 'critical';
        if (utilizacion > 70 && cdtDias > 4) return 'warning';
        if (cdtDias < 3 && utilizacion < 80) return 'good';
        return 'normal';
    }

    private calcularRelacionTiempoFlujo(
        tttMinutos: number,
        flujoGates: number
    ): 'good' | 'normal' | 'warning' | 'critical' {
        // Alto TTT + bajo flujo = problema en gates
        if (tttMinutos > 120 && flujoGates < 30) return 'critical';
        if (tttMinutos > 90 && flujoGates < 50) return 'warning';
        if (tttMinutos < 60 && flujoGates > 70) return 'good';
        return 'normal';
    }

    async getSummary(): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/historical/summary`);

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching summary:', error);
            throw error;
        }
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

export const portApi = new PortApiService();