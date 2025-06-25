// src/services/portApi.ts
import type { PortMovementData, CorePortKPIs } from '../types/portKpis';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface KPIFilters {
    startDate: Date;
    endDate: Date;
    unit?: string;
    patioFilter?: string;
    bloqueFilter?: string;
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

            // El backend ahora devuelve array directo
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

    async calculateKPIs(filters: KPIFilters): Promise<CorePortKPIs> {
        const params = new URLSearchParams({
            start_date: this.formatDate(filters.startDate),
            end_date: this.formatDate(filters.endDate),
            unit: filters.unit || 'day',
            ...(filters.patioFilter && { patio_filter: filters.patioFilter }),
            ...(filters.bloqueFilter && { bloque_filter: filters.bloqueFilter })
        });

        try {
            const response = await fetch(`${this.baseUrl}/historical/kpis?${params}`);

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();

            return {
                utilizacionPorVolumen: data.utilizacionPorVolumen,
                congestionVehicular: data.congestionVehicular,
                balanceFlujo: data.balanceFlujo,
                productividadOperacional: data.productividadOperacional,
                indiceRemanejo: data.indiceRemanejo,
                saturacionOperacional: data.saturacionOperacional,
                utilizacionPorBloque: data.detalles?.ocupacionPorBloque || {},
                utilizacionPorPatio: {},
                movimientosPorBloque: {},
                remanejosPorBloque: {},
                horasConActividad: data.detalles?.horasConActividad || 0,
                totalMovimientos: data.detalles?.totalMovimientos || 0,
                kpiRelations: data.kpiRelations
            };
        } catch (error) {
            console.error('Error calculating KPIs:', error);
            throw error;
        }
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