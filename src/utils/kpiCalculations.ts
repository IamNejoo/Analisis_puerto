// src/utils/kpiCalculations.ts
import type { PortMovementData, CorePortKPIs } from '../types/portKpis';

// Funciones auxiliares para cálculos
export const sum = (data: PortMovementData[], field: keyof PortMovementData): number => {
    return data.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);
};

export const average = (data: PortMovementData[], field: keyof PortMovementData): number => {
    if (data.length === 0) return 0;
    return sum(data, field) / data.length;
};

export const max = (data: PortMovementData[], field: keyof PortMovementData): number => {
    return Math.max(...data.map(item => Number(item[field]) || 0));
};

export const min = (data: PortMovementData[], field: keyof PortMovementData): number => {
    return Math.min(...data.map(item => Number(item[field]) || 0));
};

// Función para obtener KPIs por defecto
export function getDefaultCoreKPIs(): CorePortKPIs {
    return {
        factorUtilizacionPatio: 0,
        balanceFlujoTerminal: 1,
        tasaRemanejos: 0,
        productividadMuelle: 0,
        tiempoPermanencia: 0,
        variabilidadOperativa: 0,
        utilizacionPorBloque: {},
        movimientosPorBloque: {},
        indiceCongestionVehicular: 0,
        factorSaturacionOperativa: 0,
        eficienciaTeus: 0,
        tasaEficienciaOperacional: 0,
        indiceDispersionCarga: 0,
        velocidadProcesamiento: 0
    };
}

// Función simplificada para calcular solo los KPIs fundamentales
export function calculateCoreKPIs(
    data: PortMovementData[],
    blockCapacities?: Record<string, number>
): CorePortKPIs {
    console.log('📊 DEBUG - calculateCoreKPIs llamado con:', {
        cantidadDatos: data.length,
        primerDato: data[0]
    });
    // Si no hay datos, retornar valores por defecto
    if (!data.length) {
        return getDefaultCoreKPIs();
    }

    // Agregaciones básicas
    const totalGateEntrada = sum(data, 'gateEntradaContenedores');
    const totalGateSalida = sum(data, 'gateSalidaContenedores');
    const totalMuelleEntrada = sum(data, 'muelleEntradaContenedores');
    const totalMuelleSalida = sum(data, 'muelleSalidaContenedores');
    const totalRemanejos = sum(data, 'remanejosContenedores');
    const totalTerminalEntrada = sum(data, 'terminalEntradaContenedores');
    const totalTerminalSalida = sum(data, 'terminalSalidaContenedores');

    const totalEntradaContenedores = totalGateEntrada + totalMuelleEntrada;

    const promedioContenedores = average(data, 'promedioContenedores');
    const maximoContenedores = max(data, 'maximoContenedores');
    const minimoContenedores = min(data, 'minimoContenedores');

    // Cálculos por bloque
    const utilizacionPorBloque: Record<string, number> = {};
    const movimientosPorBloque: Record<string, number> = {};

    const bloques = [...new Set(data.map(d => d.bloque))];

    bloques.forEach(bloque => {
        const bloqueData = data.filter(d => d.bloque === bloque);
        const promedioBloqueContenedores = average(bloqueData, 'promedioContenedores');
        const capacidadBloque = blockCapacities?.[bloque] || 49; // Capacidad por defecto

        utilizacionPorBloque[bloque] = promedioBloqueContenedores / capacidadBloque;

        const movimientosBloqueEntrada = sum(bloqueData, 'terminalEntradaContenedores');
        const movimientosBloqueSalida = sum(bloqueData, 'terminalSalidaContenedores');
        movimientosPorBloque[bloque] = (movimientosBloqueEntrada + movimientosBloqueSalida) / (promedioBloqueContenedores || 1);
    });

    // Cálculo de KPIs fundamentales
    return {
        factorUtilizacionPatio: promedioContenedores / (maximoContenedores || 1),
        balanceFlujoTerminal: totalTerminalEntrada / (totalTerminalSalida || 1),
        tasaRemanejos: totalRemanejos / (totalEntradaContenedores || 1),
        productividadMuelle: (totalMuelleEntrada + totalMuelleSalida) / (data.length || 1),
        tiempoPermanencia: promedioContenedores / (totalTerminalSalida / (data.length / 24) || 1),
        variabilidadOperativa: (maximoContenedores - minimoContenedores) / (promedioContenedores || 1),
        utilizacionPorBloque,
        movimientosPorBloque
    };
}