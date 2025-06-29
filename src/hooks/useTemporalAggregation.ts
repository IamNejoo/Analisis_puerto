// src/hooks/useTemporalAggregation.ts
import { useMemo } from 'react';
import type { CongestionData } from '../types/portKpis';

interface AggregatedData {
    hora: CongestionData[];
    turno: TurnoData[];
    dia: DiaData[];
    semana: SemanaData[];
}

interface TurnoData {
    turno: number;
    dia: number;
    fechaInicio: Date;
    fechaFin: Date;
    // Movimientos agregados
    gateEntrada: number;
    gateSalida: number;
    muelleEntrada: number;
    muelleSalida: number;
    remanejos: number;
    patioEntrada: number;
    patioSalida: number;
    terminalEntrada: number;
    terminalSalida: number;
    // Inventarios
    minimoContenedores: number;
    maximoContenedores: number;
    promedioContenedores: number;
    // Métricas calculadas
    movimientosProductivos: number;
    movimientosNoProductivos: number;
    tasaProductividad: number;
    flujoNeto: number;
    congestionScore: number;
}

interface DiaData {
    dia: number;
    fecha: Date;
    // Agregados del día
    totalMovimientos: number;
    picoCongestion: number;
    horasPico: number[];
    turnoMasCongestionado: number;
    // Promedios diarios
    promedioOcupacion: number;
    promedioFlujoGates: number;
    promedioRemanejos: number;
    // Análisis
    patronCongestion: 'normal' | 'pico-manana' | 'pico-tarde' | 'pico-noche' | 'sostenido';
}

interface SemanaData {
    semana: number;
    fechaInicio: Date;
    fechaFin: Date;
    // Resumen semanal
    totalMovimientosSemana: number;
    diasCriticos: number[];
    eficienciaOperacional: number;
    // Patrones semanales
    patronSemanal: 'estable' | 'creciente' | 'decreciente' | 'irregular';
    recomendaciones: string[];
}

export const useTemporalAggregation = (
    data: CongestionData[],
    bloqueFilter?: string,
    patioFilter?: string

) => {
    const aggregatedData = useMemo((): AggregatedData => {
        if (!data || data.length === 0) {
            return {
                hora: [],
                turno: [],
                dia: [],
                semana: []
            };
        }

        // Filtrar datos según los filtros
        const filteredData = data.filter(d => {
            if (bloqueFilter && d.bloque !== bloqueFilter) return false;
            if (patioFilter) {
                // Asumiendo que los bloques tienen formato "C1", "H2", etc.
                const patioBloque = d.bloque.charAt(0);
                const patioMap: Record<string, string> = {
                    'C': 'costanera',
                    'H': 'hanga-roa',
                    'T': 'terminal'
                };
                if (patioMap[patioBloque] !== patioFilter) return false;
            }
            return true;
        });

        // 1. Datos por hora (sin agregación)
        const horaData = filteredData;

        // 2. Agregación por TURNO (8 horas)
        const turnoData: TurnoData[] = [];
        const turnoGroups = new Map<string, CongestionData[]>();

        filteredData.forEach(record => {
            const fecha = new Date(record.hora);
            const hora = fecha.getHours();

            // Determinar turno: 0-7 = turno 1, 8-15 = turno 2, 16-23 = turno 3
            const turnoDelDia = Math.floor(hora / 8) + 1;
            const dia = Math.floor((fecha.getTime() - new Date(fecha.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)) + 1;

            const key = `${dia}-${turnoDelDia}`;

            if (!turnoGroups.has(key)) {
                turnoGroups.set(key, []);
            }
            turnoGroups.get(key)!.push(record);
        });

        // Calcular métricas por turno
        turnoGroups.forEach((records, key) => {
            const [diaStr, turnoStr] = key.split('-');
            const dia = parseInt(diaStr);
            const turno = parseInt(turnoStr);

            const fechaInicio = new Date(records[0].hora);
            fechaInicio.setHours((turno - 1) * 8, 0, 0, 0);
            const fechaFin = new Date(fechaInicio);
            fechaFin.setHours(turno * 8 - 1, 59, 59, 999);

            // Sumar movimientos
            const gateEntrada = records.reduce((sum, r) => sum + r.gateEntradaContenedores, 0);
            const gateSalida = records.reduce((sum, r) => sum + r.gateSalidaContenedores, 0);
            const muelleEntrada = records.reduce((sum, r) => sum + r.muelleEntradaContenedores, 0);
            const muelleSalida = records.reduce((sum, r) => sum + r.muelleSalidaContenedores, 0);
            const remanejos = records.reduce((sum, r) => sum + r.remanejosContenedores, 0);
            const patioEntrada = records.reduce((sum, r) => sum + r.patioEntradaContenedores, 0);
            const patioSalida = records.reduce((sum, r) => sum + r.patioSalidaContenedores, 0);
            const terminalEntrada = records.reduce((sum, r) => sum + r.terminalEntradaContenedores, 0);
            const terminalSalida = records.reduce((sum, r) => sum + r.terminalSalidaContenedores, 0);

            // Inventarios
            const minimoContenedores = Math.min(...records.map(r => r.minimoContenedores));
            const maximoContenedores = Math.max(...records.map(r => r.maximoContenedores));
            const promedioContenedores = records.reduce((sum, r) => sum + r.promedioContenedores, 0) / records.length;

            // Métricas calculadas
            const movimientosProductivos = gateEntrada + gateSalida + muelleEntrada + muelleSalida;
            const movimientosNoProductivos = remanejos + patioEntrada + patioSalida + terminalEntrada + terminalSalida;
            const totalMovimientos = movimientosProductivos + movimientosNoProductivos;
            const tasaProductividad = totalMovimientos > 0 ? (movimientosProductivos / totalMovimientos) * 100 : 0;
            const flujoNeto = (gateEntrada + muelleEntrada) - (gateSalida + muelleSalida);

            // Score de congestión (0-100)
            const movimientosPorHora = totalMovimientos / 8;
            const congestionScore = Math.min(100, (movimientosPorHora / 50) * 100); // 50 mov/hora = 100% congestión

            turnoData.push({
                turno,
                dia,
                fechaInicio,
                fechaFin,
                gateEntrada,
                gateSalida,
                muelleEntrada,
                muelleSalida,
                remanejos,
                patioEntrada,
                patioSalida,
                terminalEntrada,
                terminalSalida,
                minimoContenedores,
                maximoContenedores,
                promedioContenedores,
                movimientosProductivos,
                movimientosNoProductivos,
                tasaProductividad,
                flujoNeto,
                congestionScore
            });
        });

        // 3. Agregación por DÍA
        const diaData: DiaData[] = [];
        const diaGroups = new Map<number, TurnoData[]>();

        turnoData.forEach(turno => {
            if (!diaGroups.has(turno.dia)) {
                diaGroups.set(turno.dia, []);
            }
            diaGroups.get(turno.dia)!.push(turno);
        });

        diaGroups.forEach((turnos, dia) => {
            const fecha = turnos[0].fechaInicio;
            const totalMovimientos = turnos.reduce((sum, t) => sum + (t.movimientosProductivos + t.movimientosNoProductivos), 0);
            const picoCongestion = Math.max(...turnos.map(t => t.congestionScore));
            const horasPico = turnos
                .filter(t => t.congestionScore > 70)
                .map(t => (t.turno - 1) * 8);

            const turnoMasCongestionado = turnos.reduce((max, t) =>
                t.congestionScore > max.congestionScore ? t : max
            ).turno;

            const promedioOcupacion = turnos.reduce((sum, t) => sum + t.promedioContenedores, 0) / turnos.length;
            const promedioFlujoGates = turnos.reduce((sum, t) => sum + t.gateEntrada + t.gateSalida, 0) / turnos.length / 8;
            const promedioRemanejos = turnos.reduce((sum, t) => sum + t.remanejos, 0) / turnos.length;

            // Determinar patrón de congestión
            let patronCongestion: 'normal' | 'pico-manana' | 'pico-tarde' | 'pico-noche' | 'sostenido' = 'normal';
            if (turnos.every(t => t.congestionScore > 60)) {
                patronCongestion = 'sostenido';
            } else if (turnos[0] && turnos[0].congestionScore === picoCongestion) {
                patronCongestion = 'pico-manana';
            } else if (turnos[1] && turnos[1].congestionScore === picoCongestion) {
                patronCongestion = 'pico-tarde';
            } else if (turnos[2] && turnos[2].congestionScore === picoCongestion) {
                patronCongestion = 'pico-noche';
            }

            diaData.push({
                dia,
                fecha,
                totalMovimientos,
                picoCongestion,
                horasPico,
                turnoMasCongestionado,
                promedioOcupacion,
                promedioFlujoGates,
                promedioRemanejos,
                patronCongestion
            });
        });

        // 4. Agregación por SEMANA
        const semanaData: SemanaData[] = [];
        const semanaGroups = new Map<number, DiaData[]>();

        diaData.forEach(dia => {
            const semana = Math.ceil(dia.dia / 7);
            if (!semanaGroups.has(semana)) {
                semanaGroups.set(semana, []);
            }
            semanaGroups.get(semana)!.push(dia);
        });

        semanaGroups.forEach((dias, semana) => {
            const fechaInicio = dias[0].fecha;
            const fechaFin = new Date(fechaInicio);
            fechaFin.setDate(fechaInicio.getDate() + 6);

            const totalMovimientosSemana = dias.reduce((sum, d) => sum + d.totalMovimientos, 0);
            const diasCriticos = dias
                .filter(d => d.picoCongestion > 80)
                .map(d => d.dia);

            // Calcular eficiencia operacional (% movimientos productivos)
            const turnosSemana = turnoData.filter(t => Math.ceil(t.dia / 7) === semana);
            const totalProductivos = turnosSemana.reduce((sum, t) => sum + t.movimientosProductivos, 0);
            const totalNoProductivos = turnosSemana.reduce((sum, t) => sum + t.movimientosNoProductivos, 0);
            const eficienciaOperacional = (totalProductivos / (totalProductivos + totalNoProductivos)) * 100;

            // Determinar patrón semanal
            let patronSemanal: 'estable' | 'creciente' | 'decreciente' | 'irregular' = 'estable';
            const movimientosDiarios = dias.map(d => d.totalMovimientos);
            const tendencia = movimientosDiarios[movimientosDiarios.length - 1] - movimientosDiarios[0];

            if (Math.abs(tendencia) < totalMovimientosSemana * 0.1) {
                patronSemanal = 'estable';
            } else if (tendencia > 0) {
                patronSemanal = 'creciente';
            } else if (tendencia < 0) {
                patronSemanal = 'decreciente';
            } else {
                patronSemanal = 'irregular';
            }

            // Generar recomendaciones
            const recomendaciones: string[] = [];
            if (diasCriticos.length > 2) {
                recomendaciones.push('Múltiples días críticos detectados. Considerar redistribución de carga.');
            }
            if (eficienciaOperacional < 60) {
                recomendaciones.push('Baja eficiencia operacional. Revisar procesos de remanejos.');
            }
            if (patronSemanal === 'creciente') {
                recomendaciones.push('Tendencia creciente de congestión. Preparar recursos adicionales.');
            }

            semanaData.push({
                semana,
                fechaInicio,
                fechaFin,
                totalMovimientosSemana,
                diasCriticos,
                eficienciaOperacional,
                patronSemanal,
                recomendaciones
            });
        });

        return {
            hora: horaData,
            turno: turnoData.sort((a, b) => a.dia - b.dia || a.turno - b.turno),
            dia: diaData.sort((a, b) => a.dia - b.dia),
            semana: semanaData.sort((a, b) => a.semana - b.semana)
        };
    }, [data, bloqueFilter, patioFilter]);

    return aggregatedData;
};