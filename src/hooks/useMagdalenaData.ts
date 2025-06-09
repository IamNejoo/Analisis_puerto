import { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import type { MagdalenaMetrics, RealDataMetrics, ComparisonMetrics } from '../types';

export interface MagdalenaDataResult {
    magdalenaMetrics: MagdalenaMetrics | null;
    realMetrics: RealDataMetrics | null;
    comparison: ComparisonMetrics | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
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

    // Función para leer datos reales usando fetch
    const loadRealData = async (): Promise<RealDataMetrics> => {
        try {
            console.log('📊 Cargando datos reales...');

            // Rutas a probar
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
                throw new Error('No se pudo cargar analisis_flujos_w3_ci.xlsx desde ninguna ruta. Verifica que el archivo existe en public/data/semanas/');
            }

            // Verificar que existe la hoja necesaria
            if (!workbook.Sheets['FlujosAll_sbt']) {
                console.log('Hojas disponibles:', Object.keys(workbook.Sheets));
                throw new Error('No se encontró la hoja "FlujosAll_sbt" en el archivo Excel');
            }

            // Procesar hoja principal FlujosAll_sbt
            const flujosData = XLSX.utils.sheet_to_json(workbook.Sheets['FlujosAll_sbt']) as any[];
            console.log(`📋 Procesando ${flujosData.length} registros de flujos`);

            let totalMovimientos = 0;
            let reubicaciones = 0;
            const movimientosPorTipo = { DLVR: 0, DSCH: 0, LOAD: 0, RECV: 0, OTHR: 0 };
            const bloquesSet = new Set<string>();
            const turnosSet = new Set<number>();
            const carriersSet = new Set<string>();

            flujosData.forEach((row: any) => {
                // Contar movimientos por tipo
                (['DLVR', 'DSCH', 'LOAD', 'RECV', 'OTHR'] as const).forEach(tipo => {
                    const valor = Number(row[tipo]) || 0;
                    movimientosPorTipo[tipo] += valor;
                    totalMovimientos += valor;
                });

                // Contar reubicaciones
                if (row.YARD) {
                    reubicaciones += Number(row.YARD) || 0;
                }

                // Elementos únicos
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

    // Función para leer datos de Magdalena usando fetch
    const loadMagdalenaData = async (): Promise<MagdalenaMetrics> => {
        try {
            console.log('🔮 Cargando datos Magdalena...');

            // Rutas a probar
            const possiblePaths = [
                '/data/magdalena/resultado_3_69_K.xlsx',
                'data/magdalena/resultado_3_69_K.xlsx',
                '/resultado_3_69_K.xlsx',
                'resultado_3_69_K.xlsx'
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
                throw new Error('No se pudo cargar resultado_3_69_K.xlsx desde ninguna ruta. Verifica que el archivo existe en public/data/magdalena/');
            }

            // Verificar hojas disponibles
            console.log('📋 Hojas disponibles en Magdalena:', Object.keys(workbook.Sheets));

            // Procesar hojas de Magdalena con verificación
            const requiredSheets = ['General', 'Ocupación Bloques', 'Workload bloques', 'Total bloques', 'Variación Carga de trabajo'];
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
                const volumen = Number(row['Volumen bloques (TEUs)'] || row['Volumen']) || 0;
                const capacidad = Number(row['Capacidad Bloque'] || row['Capacidad']) || 0;
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

            // Convertir a array para gráficos
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

            // Calcular balance (desviación estándar de promedios por bloque)
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

            const magdalenaMetrics: MagdalenaMetrics = {
                // Datos base - se llenarán después con datos reales
                totalMovimientos: 0,
                reubicaciones: 0,
                eficienciaReal: 0,

                // Optimización Magdalena
                totalMovimientosOptimizados,
                reubicacionesEliminadas: 0, // Se calculará después
                eficienciaGanada: 0, // Se calculará después

                // Segregaciones
                segregacionesActivas: segregacionesData.length,
                bloquesAsignados: bloquesSet.size,
                distribucionSegregaciones,

                // Carga de trabajo
                cargaTrabajoTotal,
                variacionCarga,
                balanceWorkload,

                // Ocupación
                ocupacionPromedio: capacidadTotal > 0 ? (ocupacionTotal / capacidadTotal) * 100 : 0,
                utilizacionEspacio: capacidadTotal > 0 ? (ocupacionTotal / capacidadTotal) * 100 : 0,

                // Movimientos - inicializados vacíos
                movimientosReales: {
                    DLVR: 0, DSCH: 0, LOAD: 0, RECV: 0, OTHR: 0, YARD: 0
                },

                movimientosOptimizadosDetalle,

                // Datos temporales
                periodos: periodosSet.size,
                bloquesUnicos: Array.from(bloquesSet).sort(),

                // Datos para gráficos
                ocupacionPorPeriodo: ocupacionPorPeriodo.sort((a, b) => a.periodo - b.periodo),
                workloadPorBloque,
                segregacionesPorBloque
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
            balanceCargaMejorado: magdalena.balanceWorkload < 50, // Threshold arbitrario
            eficienciaTotal: 100 - real.porcentajeReubicaciones + mejoraPorcentual
        };
    };

    // Efecto para cargar datos
    useEffect(() => {
        const loadAllData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                console.log(`🔄 Cargando datos para semana ${semana}, participación ${participacion}%, ${conDispersion ? 'con dispersión' : 'centralizada'}`);

                // Cargar datos en paralelo
                const [realData, magdalenaData] = await Promise.all([
                    loadRealData(),
                    loadMagdalenaData()
                ]);

                // Completar datos de Magdalena con datos reales
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

                setRealMetrics(realData);
                setMagdalenaMetrics(completeMagdalenaData);
                setLastUpdated(new Date());

                console.log('✅ Todos los datos cargados exitosamente');

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
                console.error('❌ Error cargando datos:', errorMessage);
                setError(errorMessage);
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
        lastUpdated
    };
};

export default useMagdalenaData;