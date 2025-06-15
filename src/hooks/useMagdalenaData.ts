// src/hooks/useMagdalenaData.ts - VERSIÓN CORREGIDA
import { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import type { MagdalenaMetrics, RealDataMetrics, ComparisonMetrics } from '../types';

// Interfaz para datos de bloques
export interface MagdalenaBlockRealData {
    bloqueId: string;
    ocupacionPromedio: number;
    capacidad: number;
    ocupacionPorTurno: number[];
    movimientos: {
        entrega: number;
        recepcion: number;
        carga: number;
        descarga: number;
        total: number;
    };
    estado: 'active' | 'restricted' | 'maintenance';
}

export interface MagdalenaDataResult {
    magdalenaMetrics: MagdalenaMetrics | null;
    realMetrics: RealDataMetrics | null;
    comparison: ComparisonMetrics | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    dataNotAvailable?: boolean;
}

export const useMagdalenaData = (
    semana: number = 3,
    participacion: 68 | 69 | 70 = 69,
    conDispersion: boolean = true
): MagdalenaDataResult => {
    const [magdalenaMetrics, setMagdalenaMetrics] = useState<MagdalenaMetrics | null>(null);
    const [realMetrics, setRealMetrics] = useState<RealDataMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [dataNotAvailable, setDataNotAvailable] = useState(false);

    // Función para leer datos reales usando fetch
    const loadRealData = async (): Promise<RealDataMetrics> => {
        try {
            console.log('📊 Cargando datos reales...');

            const possiblePaths = [
                '/data/semanas/analisis_flujos_w3_ci.xlsx',
                'data/semanas/analisis_flujos_w3_ci.xlsx',
                '/analisis_flujos_w3_ci.xlsx',
                'analisis_flujos_w3_ci.xlsx'
            ];

            let response: Response | null = null;
            let workbook: XLSX.WorkBook | null = null;

            for (const path of possiblePaths) {
                try {
                    console.log(`🔍 Intentando cargar desde: ${path}`);
                    response = await fetch(path);
                    if (response.ok) {
                        console.log(`✅ Respuesta OK desde: ${path}`);
                        const arrayBuffer = await response.arrayBuffer();
                        workbook = XLSX.read(arrayBuffer, { type: 'array' });
                        console.log(`✅ Excel procesado exitosamente desde: ${path}`);
                        break;
                    } else {
                        console.log(`❌ Error ${response.status} en: ${path}`);
                    }
                } catch (err) {
                    console.log(`❌ Error de red en: ${path}`, err);
                    continue;
                }
            }

            if (!workbook) {
                throw new Error('No se pudo cargar analisis_flujos_w3_ci.xlsx desde ninguna ruta.');
            }

            if (!workbook.Sheets['FlujosAll_sbt']) {
                console.log('Hojas disponibles:', Object.keys(workbook.Sheets));
                throw new Error('No se encontró la hoja "FlujosAll_sbt" en el archivo Excel');
            }

            const flujosData = XLSX.utils.sheet_to_json(workbook.Sheets['FlujosAll_sbt']) as any[];
            console.log(`📋 Procesando ${flujosData.length} registros de flujos`);

            let totalMovimientos = 0;
            let reubicaciones = 0;
            const movimientosPorTipo = { DLVR: 0, DSCH: 0, LOAD: 0, RECV: 0, OTHR: 0 };
            const bloquesSet = new Set<string>();
            const turnosSet = new Set<number>();
            const carriersSet = new Set<string>();

            flujosData.forEach((row: any) => {
                (['DLVR', 'DSCH', 'LOAD', 'RECV', 'OTHR'] as const).forEach(tipo => {
                    const valor = Number(row[tipo]) || 0;
                    movimientosPorTipo[tipo] += valor;
                    totalMovimientos += valor;
                });

                if (row.YARD) {
                    reubicaciones += Number(row.YARD) || 0;
                }

                if (row.ime_to && String(row.ime_to).startsWith('C')) {
                    bloquesSet.add(String(row.ime_to));
                }
                if (row.shift) {
                    turnosSet.add(Number(row.shift));
                }
                if (row.carrier) {
                    carriersSet.add(String(row.carrier));
                }
            });

            const realMetrics: RealDataMetrics = {
                totalMovimientos,
                reubicaciones,
                porcentajeReubicaciones: totalMovimientos > 0 ? (reubicaciones / totalMovimientos) * 100 : 0,
                movimientosPorTipo,
                bloquesUnicos: Array.from(bloquesSet).sort(),
                turnos: Array.from(turnosSet).sort((a, b) => a - b),
                carriers: carriersSet.size
            };

            console.log('✅ Datos reales procesados:', realMetrics);
            return realMetrics;

        } catch (err) {
            console.error('❌ Error cargando datos reales:', err);
            throw new Error(`Error cargando datos reales: ${err instanceof Error ? err.message : 'Error desconocido'}`);
        }
    };

    // Función CORREGIDA para procesar datos de bloques con ocupación por turno
    const loadMagdalenaBlocksData = async (workbook: XLSX.WorkBook): Promise<MagdalenaBlockRealData[]> => {
        console.log('📊 Procesando datos de bloques de Magdalena con ocupación por turno...');

        const blocksData: MagdalenaBlockRealData[] = [];

        // 1. Procesar movimientos desde la hoja General
        const movimientosPorBloque = new Map<string, {
            entrega: number;
            recepcion: number;
            carga: number;
            descarga: number;
            total: number;
        }>();

        if (workbook.Sheets['General']) {
            const generalData = XLSX.utils.sheet_to_json(workbook.Sheets['General']) as any[];
            generalData.forEach((row: any) => {
                const bloque = String(row.Bloque || '');
                if (!bloque.startsWith('C')) return;
                if (!movimientosPorBloque.has(bloque)) {
                    movimientosPorBloque.set(bloque, { entrega: 0, recepcion: 0, carga: 0, descarga: 0, total: 0 });
                }
                const movs = movimientosPorBloque.get(bloque)!;
                movs.entrega += Number(row.Entrega || 0);
                movs.recepcion += Number(row.Recepción || row.Recepcion || 0);
                movs.carga += Number(row.Carga || 0);
                movs.descarga += Number(row.Descarga || 0);
                movs.total = movs.entrega + movs.recepcion + movs.carga + movs.descarga;
            });
        }

        // 2. Procesar hoja de ocupación para cada bloque C1-C9
        if (workbook.Sheets['Ocupación Bloques']) {
            const ocupacionData = XLSX.utils.sheet_to_json(workbook.Sheets['Ocupación Bloques']) as any[];

            console.log('📋 Total registros en Ocupación Bloques:', ocupacionData.length);

            // Verificar estructura de datos
            if (ocupacionData.length > 0) {
                console.log('🔍 Primer registro de ocupación:', ocupacionData[0]);
                console.log('🔍 Columnas disponibles:', Object.keys(ocupacionData[0]));
            }

            // Organizar datos por bloque y periodo
            const datosPorBloquePeriodo = new Map<string, Map<number, { volumen: number, capacidad: number }>>();

            ocupacionData.forEach((row: any) => {
                const bloque = String(row.Bloque || row.bloque || row.BLOQUE || '');
                const periodo = Number(row.Periodo || row.periodo || row.PERIODO || 0);
                const volumen = Number(row['Volumen bloques (TEUs)'] || 0);
                const capacidad = Number(row['Capacidad Bloque'] || 1155);

                if (!bloque.startsWith('C')) return;

                if (!datosPorBloquePeriodo.has(bloque)) {
                    datosPorBloquePeriodo.set(bloque, new Map());
                }

                const bloqueMap = datosPorBloquePeriodo.get(bloque)!;
                bloqueMap.set(periodo, { volumen, capacidad });
            });

            console.log('📊 Bloques encontrados:', Array.from(datosPorBloquePeriodo.keys()));

            // Para cada bloque C1-C9, calcular datos finales
            for (let i = 1; i <= 9; i++) {
                const bloqueId = `C${i}`;
                const datosPeriodos = datosPorBloquePeriodo.get(bloqueId);

                let ocupacionPromedio = 0;
                let capacidadPromedio = 1155;
                let ocupacionesPorTurno: number[] = [];

                if (datosPeriodos && datosPeriodos.size > 0) {
                    // Obtener el número máximo de periodos
                    const maxPeriodo = Math.max(...Array.from(datosPeriodos.keys()));

                    // Crear array de ocupaciones para cada periodo (1 al máximo)
                    let sumOcupacion = 0;
                    let sumCapacidad = 0;
                    let countPeriodos = 0;

                    for (let periodo = 1; periodo <= maxPeriodo; periodo++) {
                        const datoPeriodo = datosPeriodos.get(periodo);

                        if (datoPeriodo) {
                            const ocupacionPeriodo = datoPeriodo.capacidad > 0
                                ? (datoPeriodo.volumen / datoPeriodo.capacidad) * 100
                                : 0;

                            ocupacionesPorTurno.push(Math.round(ocupacionPeriodo));
                            sumOcupacion += ocupacionPeriodo;
                            sumCapacidad += datoPeriodo.capacidad;
                            countPeriodos++;

                            // Debug: mostrar datos del periodo
                            if (periodo <= 3) {
                                console.log(`📍 ${bloqueId} - Periodo ${periodo}: Vol=${datoPeriodo.volumen}, Cap=${datoPeriodo.capacidad}, Ocu=${ocupacionPeriodo.toFixed(1)}%`);
                            }
                        } else {
                            // Si no hay datos para este periodo, usar 0
                            ocupacionesPorTurno.push(0);
                        }
                    }

                    // Calcular promedios
                    if (countPeriodos > 0) {
                        ocupacionPromedio = sumOcupacion / countPeriodos;
                        capacidadPromedio = Math.round(sumCapacidad / countPeriodos);
                    }

                    console.log(`✅ ${bloqueId}: ${ocupacionesPorTurno.length} turnos procesados, ocupación promedio: ${ocupacionPromedio.toFixed(1)}%`);
                } else {
                    // Si no hay datos, generar ocupaciones simuladas basadas en movimientos
                    console.log(`⚠️ ${bloqueId}: No se encontraron datos de ocupación, generando datos simulados`);

                    const movimientos = movimientosPorBloque.get(bloqueId);
                    const baseOcupacion = movimientos && movimientos.total > 0
                        ? Math.min(85, 30 + (movimientos.total / 50))
                        : 15;

                    // Generar 21 turnos con variación
                    for (let t = 1; t <= 21; t++) {
                        // Variación sinusoidal para simular patrones diarios
                        const variacion = Math.sin((t * Math.PI) / 12) * 15;
                        const ocupacionTurno = Math.max(0, Math.min(100, baseOcupacion + variacion + (Math.random() * 10 - 5)));
                        ocupacionesPorTurno.push(Math.round(ocupacionTurno));
                    }

                    ocupacionPromedio = ocupacionesPorTurno.reduce((a, b) => a + b, 0) / ocupacionesPorTurno.length;
                }

                // Movimientos
                const movimientos = movimientosPorBloque.get(bloqueId) || {
                    entrega: 0, recepcion: 0, carga: 0, descarga: 0, total: 0
                };

                // Estado del bloque
                let estado: 'active' | 'restricted' | 'maintenance' = 'active';
                if (movimientos.total > 2000) {
                    estado = 'restricted';
                } else if (movimientos.total === 0 && ocupacionPromedio < 5) {
                    estado = 'maintenance';
                }

                blocksData.push({
                    bloqueId,
                    ocupacionPromedio: Math.round(ocupacionPromedio),
                    capacidad: capacidadPromedio,
                    ocupacionPorTurno: ocupacionesPorTurno,
                    movimientos: movimientos,
                    estado
                });
            }
        } else {
            // Fallback: Si no hay hoja de ocupación
            console.log('⚠️ No se encontró hoja de Ocupación Bloques, generando datos de ejemplo');

            for (let i = 1; i <= 9; i++) {
                const bloqueId = `C${i}`;
                const movimientos = movimientosPorBloque.get(bloqueId) || {
                    entrega: 0, recepcion: 0, carga: 0, descarga: 0, total: 0
                };

                // Generar ocupaciones de ejemplo con variación
                const ocupacionesPorTurno: number[] = [];
                const baseOcupacion = 40 + (i * 5); // Diferentes ocupaciones base por bloque

                for (let t = 1; t <= 21; t++) {
                    const variacion = Math.sin((t * Math.PI) / 12) * 20;
                    const random = Math.random() * 10 - 5;
                    const ocupacion = Math.max(0, Math.min(100, baseOcupacion + variacion + random));
                    ocupacionesPorTurno.push(Math.round(ocupacion));
                }

                const ocupacionPromedio = ocupacionesPorTurno.reduce((a, b) => a + b, 0) / ocupacionesPorTurno.length;

                let estado: 'active' | 'restricted' | 'maintenance' = 'active';
                if (movimientos.total > 2000) estado = 'restricted';
                else if (movimientos.total === 0) estado = 'maintenance';

                blocksData.push({
                    bloqueId,
                    ocupacionPromedio: Math.round(ocupacionPromedio),
                    capacidad: 1155,
                    ocupacionPorTurno: ocupacionesPorTurno,
                    movimientos: movimientos,
                    estado
                });
            }
        }

        console.log('✅ Datos de bloques procesados con ocupación por turno');
        console.log('📊 Resumen:', blocksData.map(b => ({
            bloque: b.bloqueId,
            ocupacionPromedio: b.ocupacionPromedio + '%',
            turnos: b.ocupacionPorTurno.length,
            primerTurno: b.ocupacionPorTurno[0] + '%',
            ultimoTurno: b.ocupacionPorTurno[b.ocupacionPorTurno.length - 1] + '%'
        })));

        return blocksData;
    };

    // Función para leer datos de Magdalena
    const loadMagdalenaData = async (): Promise<MagdalenaMetrics | null> => {
        try {
            console.log('🔮 Cargando datos Magdalena...');
            console.log(`📁 Buscando archivo para: Semana ${semana}, ${participacion}%, ${conDispersion ? 'Con Dispersión' : 'Centralizada'}`);

            const dispersionSuffix = conDispersion ? 'K' : 'C';
            const fileName = `resultado_${semana}_${participacion}_${dispersionSuffix}.xlsx`;

            const possiblePaths = [
                `/data/magdalena/${fileName}`,
                `data/magdalena/${fileName}`,
                `/${fileName}`,
                `${fileName}`
            ];

            let response: Response | null = null;
            let workbook: XLSX.WorkBook | null = null;
            let fileFound = false;

            for (const path of possiblePaths) {
                try {
                    console.log(`🔍 Intentando cargar desde: ${path}`);
                    response = await fetch(path);
                    if (response.ok) {
                        console.log(`✅ Archivo encontrado: ${path}`);
                        const arrayBuffer = await response.arrayBuffer();
                        workbook = XLSX.read(arrayBuffer, { type: 'array' });
                        console.log(`✅ Excel procesado exitosamente desde: ${path}`);
                        fileFound = true;
                        break;
                    } else {
                        console.log(`❌ Error ${response.status} en: ${path}`);
                    }
                } catch (err) {
                    console.log(`❌ Error de red en: ${path}`, err);
                    continue;
                }
            }

            if (!fileFound || !workbook) {
                console.warn(`⚠️ No se encontró el archivo ${fileName}.`);
                console.warn(`ℹ️ Para esta configuración necesitas el archivo: public/data/magdalena/${fileName}`);
                setDataNotAvailable(true);
                setMagdalenaMetrics(null);
                return null;
            }

            console.log('📋 Hojas disponibles en Magdalena:', Object.keys(workbook.Sheets));

            const requiredSheets = ['General', 'Ocupación Bloques', 'Total bloques', 'Workload bloques', 'Variación Carga de trabajo'];
            const missingSheets = requiredSheets.filter(sheet => !workbook.Sheets[sheet]);

            if (missingSheets.length > 0) {
                console.warn('⚠️ Hojas faltantes:', missingSheets);
            }

            const generalData = workbook.Sheets['General'] ? XLSX.utils.sheet_to_json(workbook.Sheets['General']) as any[] : [];
            const ocupacionData = workbook.Sheets['Ocupación Bloques'] ? XLSX.utils.sheet_to_json(workbook.Sheets['Ocupación Bloques']) as any[] : [];
            const workloadData = workbook.Sheets['Workload bloques'] ? XLSX.utils.sheet_to_json(workbook.Sheets['Workload bloques']) as any[] : [];
            const segregacionesData = workbook.Sheets['Total bloques'] ? XLSX.utils.sheet_to_json(workbook.Sheets['Total bloques']) as any[] : [];
            const variacionData = workbook.Sheets['Variación Carga de trabajo'] ? XLSX.utils.sheet_to_json(workbook.Sheets['Variación Carga de trabajo']) as any[] : [];

            console.log(`📊 Datos procesados: General=${generalData.length}, Ocupación=${ocupacionData.length}, Workload=${workloadData.length}`);

            // Calcular métricas de movimientos
            let totalMovimientosOptimizados = 0;
            const movimientosOptimizadosDetalle = { Recepcion: 0, Carga: 0, Descarga: 0, Entrega: 0 };
            const bloquesSet = new Set<string>();
            const periodosSet = new Set<number>();

            generalData.forEach((row: any) => {
                const recepcion = Number(row.Recepción || row.Recepcion) || 0;
                const carga = Number(row.Carga) || 0;
                const descarga = Number(row.Descarga) || 0;
                const entrega = Number(row.Entrega) || 0;

                movimientosOptimizadosDetalle.Recepcion += recepcion;
                movimientosOptimizadosDetalle.Carga += carga;
                movimientosOptimizadosDetalle.Descarga += descarga;
                movimientosOptimizadosDetalle.Entrega += entrega;

                if (row.Bloque) bloquesSet.add(String(row.Bloque));
                if (row.Periodo) periodosSet.add(Number(row.Periodo));
            });

            totalMovimientosOptimizados = Object.values(movimientosOptimizadosDetalle).reduce((a, b) => a + b, 0);

            // Calcular ocupación promedio
            let ocupacionTotal = 0;
            let capacidadTotal = 0;
            const ocupacionPorPeriodo: Array<{ periodo: number; ocupacion: number; capacidad: number; }> = [];

            const ocupacionPorPeriodoMap = new Map<number, { volumen: number; capacidad: number }>();
            ocupacionData.forEach((row: any) => {
                const volumen = Number(row['Volumen bloques (TEUs)'] || 0);
                const capacidad = Number(row['Capacidad Bloque'] || 1155);
                const periodo = Number(row.Periodo) || 0;

                ocupacionTotal += volumen;
                capacidadTotal += capacidad;

                if (!ocupacionPorPeriodoMap.has(periodo)) {
                    ocupacionPorPeriodoMap.set(periodo, { volumen: 0, capacidad: 0 });
                }
                const periodoData = ocupacionPorPeriodoMap.get(periodo)!;
                periodoData.volumen += volumen;
                periodoData.capacidad += capacidad;
            });

            Array.from(ocupacionPorPeriodoMap.entries()).forEach(([periodo, data]) => {
                ocupacionPorPeriodo.push({
                    periodo,
                    ocupacion: data.capacidad > 0 ? (data.volumen / data.capacidad) * 100 : 0,
                    capacidad: data.capacidad
                });
            });

            // Calcular carga de trabajo
            const cargaTrabajoTotal = workloadData.reduce((sum: number, row: any) =>
                sum + (Number(row['Carga de trabajo'] || row['Workload']) || 0), 0);

            // Procesar workload por bloque para gráficos
            const workloadPorBloque = workloadData.map((row: any) => ({
                bloque: String(row.Bloque || ''),
                cargaTrabajo: Number(row['Carga de trabajo'] || row['Workload']) || 0,
                periodo: Number(row.Periodo) || 0
            }));

            // Procesar segregaciones
            const distribucionSegregaciones = segregacionesData.map((row: any) => ({
                segregacion: String(row.Segregación || row.Segregacion || ''),
                bloques: Number(row['Total bloques asignadas'] || row['Total']) || 0,
                ocupacion: 0
            }));

            // Procesar segregaciones por bloque para heatmap
            const segregacionesPorBloque = generalData
                .filter((row: any) => {
                    const total = (Number(row.Recepción || row.Recepcion) || 0) +
                        (Number(row.Carga) || 0) +
                        (Number(row.Descarga) || 0) +
                        (Number(row.Entrega) || 0);
                    return total > 0;
                })
                .map((row: any) => ({
                    segregacion: String(row.Segregación || row.Segregacion || ''),
                    bloque: String(row.Bloque || ''),
                    periodo: Number(row.Periodo) || 0,
                    volumen: (Number(row.Recepción || row.Recepcion) || 0) +
                        (Number(row.Carga) || 0) +
                        (Number(row.Descarga) || 0) +
                        (Number(row.Entrega) || 0)
                }));

            // Obtener variación de carga
            let variacionCarga = 0;
            if (variacionData.length > 0 && variacionData[0]) {
                const firstRow = variacionData[0] as { [key: string]: any };
                variacionCarga = Number(firstRow['Variación Carga de trabajo'] || firstRow['Variacion']) || 0;
            }

            // Calcular balance de workload
            const workloadPorBloquePromedio = new Map<string, number[]>();
            workloadData.forEach((row: any) => {
                const bloque = String(row.Bloque || '');
                const carga = Number(row['Carga de trabajo'] || row['Workload']) || 0;

                if (!workloadPorBloquePromedio.has(bloque)) {
                    workloadPorBloquePromedio.set(bloque, []);
                }
                workloadPorBloquePromedio.get(bloque)!.push(carga);
            });

            const promediosPorBloque = Array.from(workloadPorBloquePromedio.values()).map(cargas =>
                cargas.reduce((a: number, b: number) => a + b, 0) / cargas.length
            );

            let balanceWorkload = 0;
            if (promediosPorBloque.length > 0) {
                const promedioGeneral = promediosPorBloque.reduce((a, b) => a + b, 0) / promediosPorBloque.length;
                const varianza = promediosPorBloque.reduce((sum, promedio) =>
                    sum + Math.pow(promedio - promedioGeneral, 2), 0) / promediosPorBloque.length;
                balanceWorkload = Math.sqrt(varianza);
            }

            // Procesar datos de bloques con ocupación por turno
            const blocksData = await loadMagdalenaBlocksData(workbook);

            if (blocksData.length === 0) {
                console.warn('⚠️ No se encontraron datos de bloques válidos');
                return null;
            }

            setDataNotAvailable(false);

            const magdalenaMetrics: MagdalenaMetrics = {
                totalMovimientos: 0,
                reubicaciones: 0,
                eficienciaReal: 0,
                totalMovimientosOptimizados,
                reubicacionesEliminadas: 0,
                eficienciaGanada: 0,
                segregacionesActivas: segregacionesData.length,
                bloquesAsignados: bloquesSet.size,
                distribucionSegregaciones,
                cargaTrabajoTotal,
                variacionCarga,
                balanceWorkload,
                ocupacionPromedio: capacidadTotal > 0 ? (ocupacionTotal / capacidadTotal) * 100 : 0,
                utilizacionEspacio: capacidadTotal > 0 ? (ocupacionTotal / capacidadTotal) * 100 : 0,
                movimientosReales: {
                    DLVR: 0, DSCH: 0, LOAD: 0, RECV: 0, OTHR: 0, YARD: 0
                },
                movimientosOptimizadosDetalle,
                periodos: periodosSet.size,
                bloquesUnicos: Array.from(bloquesSet).sort(),
                ocupacionPorPeriodo: ocupacionPorPeriodo.sort((a, b) => a.periodo - b.periodo),
                workloadPorBloque,
                segregacionesPorBloque,
                bloquesMagdalena: blocksData
            };

            console.log('✅ Datos Magdalena procesados:', magdalenaMetrics);
            return magdalenaMetrics;

        } catch (err) {
            console.error('❌ Error cargando datos Magdalena:', err);
            throw new Error(`Error cargando datos Magdalena: ${err instanceof Error ? err.message : 'Error desconocido'}`);
        }
    };

    // Función para calcular comparación
    const calculateComparison = (real: RealDataMetrics, magdalena: MagdalenaMetrics): ComparisonMetrics => {
        const eliminacionReubicaciones = real.reubicaciones;
        const mejoraPorcentual = real.porcentajeReubicaciones;

        return {
            eliminacionReubicaciones,
            mejoraPorcentual,
            optimizacionSegregaciones: magdalena.segregacionesActivas,
            balanceCargaMejorado: magdalena.balanceWorkload < 50,
            eficienciaTotal: 100 - real.porcentajeReubicaciones + mejoraPorcentual
        };
    };

    // EFECTO PRINCIPAL
    useEffect(() => {
        const loadAllData = async () => {
            setIsLoading(true);
            setError(null);
            setDataNotAvailable(false);

            // Limpiar datos anteriores
            setMagdalenaMetrics(null);
            setRealMetrics(null);
            setLastUpdated(null);

            try {
                console.log(`🔄 Cargando datos para semana ${semana}, participación ${participacion}%, ${conDispersion ? 'con dispersión' : 'centralizada'}`);

                const realData = await loadRealData();
                setRealMetrics(realData);

                const magdalenaData = await loadMagdalenaData();

                if (magdalenaData) {
                    const completeMagdalenaData: MagdalenaMetrics = {
                        ...magdalenaData,
                        totalMovimientos: realData.totalMovimientos,
                        reubicaciones: realData.reubicaciones,
                        eficienciaReal: 100 - realData.porcentajeReubicaciones,
                        reubicacionesEliminadas: realData.reubicaciones,
                        eficienciaGanada: realData.porcentajeReubicaciones,
                        movimientosReales: {
                            ...realData.movimientosPorTipo,
                            YARD: realData.reubicaciones
                        }
                    };

                    setMagdalenaMetrics(completeMagdalenaData);
                    setLastUpdated(new Date());
                    console.log('✅ Todos los datos cargados exitosamente');
                } else {
                    setMagdalenaMetrics(null);
                    setDataNotAvailable(true);
                    console.log('ℹ️ No hay datos de Magdalena para esta configuración');
                }

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
                console.error('❌ Error cargando datos:', errorMessage);
                setError(errorMessage);
                setMagdalenaMetrics(null);
                setDataNotAvailable(true);
            } finally {
                setIsLoading(false);
            }
        };

        loadAllData();
    }, [semana, participacion, conDispersion]);

    // Memoizar comparación
    const comparison = useMemo(() => {
        if (!realMetrics || !magdalenaMetrics) return null;
        return calculateComparison(realMetrics, magdalenaMetrics);
    }, [realMetrics, magdalenaMetrics]);

    return {
        magdalenaMetrics,
        realMetrics,
        comparison,
        isLoading,
        error,
        lastUpdated,
        dataNotAvailable
    };
};

export default useMagdalenaData;