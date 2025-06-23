// src/hooks/useMagdalenaData.ts
import { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import type { MagdalenaMetrics, RealDataMetrics, ComparisonMetrics } from '../types';

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

// Función helper para asignar colores a segregaciones
const getSegregationColor = (segregationId: string): string => {
    const colors = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
        '#06B6D4', '#A855F7', '#DC2626', '#059669', '#7C3AED',
        '#2563EB', '#EA580C', '#0891B2', '#9333EA', '#16A34A'
    ];
    const index = parseInt(segregationId.replace('S', '')) % colors.length;
    return colors[index];
};

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

    // Función para leer datos reales
    const loadRealData = async (): Promise<RealDataMetrics> => {
        try {
            console.log('📊 Cargando datos reales...');
            const fileBase = `analisis_flujos_w${semana}_ci.xlsx`;
            const possiblePaths = [
                `/data/semanas/Semana ${semana}/${fileBase}`,
                `data/semanas/Semana ${semana}/${fileBase}`,
                `/data/semanas/${fileBase}`,
                `/${fileBase}`,
                fileBase,
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
                    }
                } catch (err) {
                    continue;
                }
            }

            if (!workbook) {
                console.warn(`⚠️ No se pudo cargar el archivo ${fileBase}`);
                setDataNotAvailable(true);
                return {
                    totalMovimientos: 0,
                    reubicaciones: 0,
                    porcentajeReubicaciones: 0,
                    movimientosPorTipo: { DLVR: 0, DSCH: 0, LOAD: 0, RECV: 0, OTHR: 0 },
                    bloquesUnicos: [],
                    turnos: [],
                    carriers: 0
                };
            }

            if (!workbook.Sheets['FlujosAll_sbt']) {
                throw new Error('No se encontró la hoja "FlujosAll_sbt"');
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

    // Función para cargar datos de Magdalena
    const loadMagdalenaData = async (): Promise<MagdalenaMetrics | null> => {
        try {
            console.log('🔮 Cargando datos Magdalena...');
            const dispersionSuffix = conDispersion ? 'K' : 'C';
            const resultFileName = `resultado_${semana}_${participacion}_${dispersionSuffix}.xlsx`;
            const instanceFileName = `Instancia_${semana}_${participacion}_${dispersionSuffix}.xlsx`;

            // Cargar archivo de resultados
            const resultPaths = [
                `/data/magdalena/${resultFileName}`,
                `data/magdalena/${resultFileName}`,
                `/${resultFileName}`,
                resultFileName
            ];

            let resultResponse: Response | null = null;
            let resultWorkbook: XLSX.WorkBook | null = null;

            for (const path of resultPaths) {
                try {
                    console.log(`🔍 Intentando cargar resultado desde: ${path}`);
                    resultResponse = await fetch(path);
                    if (resultResponse.ok) {
                        const arrayBuffer = await resultResponse.arrayBuffer();
                        resultWorkbook = XLSX.read(arrayBuffer, { type: 'array' });
                        console.log(`✅ Resultado cargado desde: ${path}`);
                        break;
                    }
                } catch (err) {
                    continue;
                }
            }

            if (!resultWorkbook) {
                console.warn(`⚠️ No se encontró el archivo ${resultFileName}`);
                setDataNotAvailable(true);
                return null;
            }

            // Cargar archivo de instancia para datos adicionales
            let instanceWorkbook: XLSX.WorkBook | null = null;
            const instancePaths = [
                `/data/magdalena/${instanceFileName}`,
                `data/magdalena/${instanceFileName}`,
                `/${instanceFileName}`,
                instanceFileName
            ];

            for (const path of instancePaths) {
                try {
                    console.log(`🔍 Intentando cargar instancia desde: ${path}`);
                    const response = await fetch(path);
                    if (response.ok) {
                        const arrayBuffer = await response.arrayBuffer();
                        instanceWorkbook = XLSX.read(arrayBuffer, { type: 'array' });
                        console.log(`✅ Instancia cargada desde: ${path}`);
                        break;
                    }
                } catch (err) {
                    continue;
                }
            }

            // Procesar datos de la instancia
            let capacidadesPorBloque: { [key: string]: number } = {};
            let teusPorSegregacion: { [key: string]: number } = {};
            let segregacionesInfo: { [key: string]: any } = {};

            if (instanceWorkbook) {
                // Capacidades de bloques
                if (instanceWorkbook.Sheets['VS_b']) {
                    const vsData = XLSX.utils.sheet_to_json(instanceWorkbook.Sheets['VS_b']) as any[];
                    vsData.forEach(row => {
                        capacidadesPorBloque[String(row.B || '')] = Number(row.VS) || 35;
                    });
                    console.log('✅ Capacidades por bloque:', capacidadesPorBloque);
                }

                // TEUs por segregación
                if (instanceWorkbook.Sheets['TEU_s']) {
                    const teuData = XLSX.utils.sheet_to_json(instanceWorkbook.Sheets['TEU_s']) as any[];
                    teuData.forEach(row => {
                        teusPorSegregacion[String(row.S || '')] = Number(row.TEU) || 1;
                    });
                    console.log('✅ TEUs por segregación:', Object.keys(teusPorSegregacion).length);
                }

                // Información de segregaciones
                if (instanceWorkbook.Sheets['S']) {
                    const segData = XLSX.utils.sheet_to_json(instanceWorkbook.Sheets['S']) as any[];
                    segData.forEach(row => {
                        segregacionesInfo[String(row.S || '')] = {
                            id: row.S,
                            nombre: row.Segregacion,
                            teu: teusPorSegregacion[row.S] || 1
                        };
                    });
                    console.log('✅ Información de segregaciones:', Object.keys(segregacionesInfo).length);
                }
            }

            // Verificar nombres de hojas disponibles
            console.log('📋 Hojas disponibles en el resultado:', Object.keys(resultWorkbook.Sheets));

            // Procesar datos del resultado
            const generalData = resultWorkbook.Sheets['General'] ? 
                XLSX.utils.sheet_to_json(resultWorkbook.Sheets['General']) as any[] : [];
            const ocupacionData = resultWorkbook.Sheets['Ocupación Bloques'] ? 
                XLSX.utils.sheet_to_json(resultWorkbook.Sheets['Ocupación Bloques']) as any[] : [];
            const workloadData = resultWorkbook.Sheets['Workload bloques'] ? 
                XLSX.utils.sheet_to_json(resultWorkbook.Sheets['Workload bloques']) as any[] : [];
            const segregacionesData = resultWorkbook.Sheets['Total bloques'] ? 
                XLSX.utils.sheet_to_json(resultWorkbook.Sheets['Total bloques']) as any[] : [];

            console.log(`📊 Datos procesados: General=${generalData.length}, Ocupación=${ocupacionData.length}`);

            // Calcular métricas
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

            // Procesar ocupación
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

            // Procesar carga de trabajo
            const cargaTrabajoTotal = workloadData.reduce((sum: number, row: any) =>
                sum + (Number(row['Carga de trabajo'] || row['Workload']) || 0), 0);

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

            // Procesar segregaciones por bloque
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

            // SECCIÓN CORREGIDA: Procesar bahías por bloque
            console.log('\n🔄 PROCESANDO BAHÍAS POR BLOQUE...');
            const bahiasPorBloqueDetallado: { [key: string]: any } = {};

            if (resultWorkbook.Sheets['Bahías por bloques']) {
                console.log(`📊 Procesando hoja de bahías: Bahías por bloques`);
                const bahiasSheet = XLSX.utils.sheet_to_json(resultWorkbook.Sheets['Bahías por bloques']) as any[];
                console.log(`📊 Total registros de bahías: ${bahiasSheet.length}`);
                
                // DEBUG: Ver estructura de las primeras filas
                if (bahiasSheet.length > 0) {
                    console.log('📊 Estructura de datos (primeras 3 filas):');
                    bahiasSheet.slice(0, 3).forEach((row, i) => {
                        console.log(`  Fila ${i + 1}:`, row);
                    });
                }
                
                let countConBahias = 0;
                bahiasSheet.forEach((row: any) => {
                    const segregacion = String(row.Segregación || row.Segregacion || '');
                    const bloque = String(row.Bloque || row.bloque || '');
                    const periodo = Number(row.Periodo || row.periodo || 0);
                    const bahiasOcupadas = Number(row['Bahías ocupadas'] || 0);
                    
                    if (!segregacion || !bloque || periodo === 0) return;
                    
                    const key = `${bloque}-${periodo}`;
                    
                    if (!bahiasPorBloqueDetallado[key]) {
                        bahiasPorBloqueDetallado[key] = {};
                    }
                    
                    // Agregar todas las segregaciones, incluso con 0 bahías
                    bahiasPorBloqueDetallado[key][segregacion] = bahiasOcupadas;
                    
                    if (bahiasOcupadas > 0) {
                        countConBahias++;
                        // DEBUG: Mostrar primeros registros con bahías ocupadas
                        if (countConBahias <= 10) {
                            console.log(`  ✅ ${key} -> ${segregacion}: ${bahiasOcupadas} bahías`);
                        }
                    }
                });
                
                console.log(`📊 Registros con bahías ocupadas: ${countConBahias}`);
                console.log('📊 Total de claves únicas (bloque-periodo):', Object.keys(bahiasPorBloqueDetallado).length);
            } else {
                console.error('❌ No se encontró la hoja "Bahías por bloques"');
            }

            // SECCIÓN CORREGIDA: Procesar volumen por bloque
            console.log('\n🔄 PROCESANDO VOLUMEN POR BLOQUE...');
            const volumenPorBloqueDetallado: { [key: string]: any } = {};

            if (resultWorkbook.Sheets['Volumen bloques (TEUs)']) {
                console.log(`📊 Procesando hoja de volumen: Volumen bloques (TEUs)`);
                const volumenSheet = XLSX.utils.sheet_to_json(resultWorkbook.Sheets['Volumen bloques (TEUs)']) as any[];
                console.log(`📊 Total registros de volumen: ${volumenSheet.length}`);
                
                // DEBUG: Ver estructura
                if (volumenSheet.length > 0) {
                    console.log('📊 Estructura de volumen (primera fila):', volumenSheet[0]);
                }
                
                let countConVolumen = 0;
                volumenSheet.forEach((row: any) => {
                    const segregacion = String(row.Segregación || row.Segregacion || '');
                    const bloque = String(row.Bloque || row.bloque || '');
                    const periodo = Number(row.Periodo || row.periodo || 0);
                    const volumen = Number(row.Volumen || 0);
                    
                    if (!segregacion || !bloque || periodo === 0) return;
                    
                    const key = `${bloque}-${periodo}`;
                    
                    if (!volumenPorBloqueDetallado[key]) {
                        volumenPorBloqueDetallado[key] = {};
                    }
                    
                    volumenPorBloqueDetallado[key][segregacion] = volumen;
                    
                    if (volumen > 0) {
                        countConVolumen++;
                        // DEBUG: Mostrar primeros registros con volumen
                        if (countConVolumen <= 10) {
                            console.log(`  ✅ ${key} -> ${segregacion}: ${volumen} TEUs`);
                        }
                    }
                });
                
                console.log(`📊 Registros con volumen > 0: ${countConVolumen}`);
                console.log('📊 Total de claves únicas de volumen:', Object.keys(volumenPorBloqueDetallado).length);
            } else {
                console.error('❌ No se encontró la hoja "Volumen bloques (TEUs)"');
            }

            // DEBUG: Verificar datos para bloques específicos
            console.log('\n🔍 VERIFICANDO DATOS PROCESADOS:');
            console.log('=====================================');
            
            // Verificar datos para C1 en diferentes periodos
            const periodosDebug = [1, 2, 15, 16, 17];
            console.log('\n📍 Bloque C1:');
            periodosDebug.forEach(periodo => {
                const key = `C1-${periodo}`;
                if (bahiasPorBloqueDetallado[key]) {
                    const bahias = bahiasPorBloqueDetallado[key];
                    const volumen = volumenPorBloqueDetallado[key] || {};
                    console.log(`\nPeriodo ${periodo}:`);
                    Object.keys(bahias).forEach(seg => {
                        if (bahias[seg] > 0) {
                            console.log(`  ${seg}: ${bahias[seg]} bahías, ${volumen[seg] || 0} TEUs`);
                        }
                    });
                }
            });
            
            // Verificar otros bloques con datos
            console.log('\n📍 Resumen otros bloques:');
            ['C2', 'C3', 'C4', 'C5'].forEach(bloque => {
                let countPeriodosConDatos = 0;
                for (let periodo = 1; periodo <= 21; periodo++) {
                    const key = `${bloque}-${periodo}`;
                    if (bahiasPorBloqueDetallado[key]) {
                        const bahias = Object.values(bahiasPorBloqueDetallado[key]).some((v: any) => v > 0);
                        if (bahias) countPeriodosConDatos++;
                    }
                }
                if (countPeriodosConDatos > 0) {
                    console.log(`  ${bloque}: ${countPeriodosConDatos} periodos con datos`);
                }
            });

            // Calcular variación y balance
            let variacionCarga = 0;
            let balanceWorkload = 0;

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

            if (promediosPorBloque.length > 0) {
                const promedioGeneral = promediosPorBloque.reduce((a, b) => a + b, 0) / promediosPorBloque.length;
                const varianza = promediosPorBloque.reduce((sum, promedio) =>
                    sum + Math.pow(promedio - promedioGeneral, 2), 0) / promediosPorBloque.length;
                balanceWorkload = Math.sqrt(varianza);
            }

            // Procesar bloques con ocupación por turno
            const bloquesMagdalena = await loadMagdalenaBlocksData(resultWorkbook, capacidadesPorBloque);

            // Información de colores para segregaciones
            const segregacionesColores: { [key: string]: string } = {};
            Object.keys(segregacionesInfo).forEach(seg => {
                segregacionesColores[seg] = getSegregationColor(seg);
            });

            // Agregar segregaciones encontradas en bahías a los colores
            Object.values(bahiasPorBloqueDetallado).forEach((turnoData: any) => {
                Object.keys(turnoData).forEach(seg => {
                    if (seg.match(/^S\d+$/) && !segregacionesColores[seg]) {
                        segregacionesColores[seg] = getSegregationColor(seg);
                    }
                });
            });

            console.log('\n🎨 Colores asignados a segregaciones:', Object.keys(segregacionesColores).length);

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
                bloquesMagdalena,
                capacidadesPorBloque,
                teusPorSegregacion,
                segregacionesInfo,
                bahiasPorBloque: bahiasPorBloqueDetallado,
                volumenPorBloque: volumenPorBloqueDetallado,
                segregacionesColores
            };

            console.log('\n✅ Datos Magdalena procesados exitosamente');
            console.log('=====================================\n');
            return magdalenaMetrics;

        } catch (err) {
            console.error('❌ Error cargando datos Magdalena:', err);
            throw new Error(`Error cargando datos Magdalena: ${err instanceof Error ? err.message : 'Error desconocido'}`);
        }
    };

    // Función para procesar datos de bloques
    const loadMagdalenaBlocksData = async (workbook: XLSX.WorkBook, capacidadesPorBloque: { [key: string]: number }): Promise<MagdalenaBlockRealData[]> => {
        console.log('📊 Procesando datos de bloques de Magdalena...');

        const blocksData: MagdalenaBlockRealData[] = [];
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

        if (workbook.Sheets['Ocupación Bloques']) {
            const ocupacionData = XLSX.utils.sheet_to_json(workbook.Sheets['Ocupación Bloques']) as any[];
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

            for (let i = 1; i <= 9; i++) {
                const bloqueId = `C${i}`;
                const datosPeriodos = datosPorBloquePeriodo.get(bloqueId);
                const capacidadReal = capacidadesPorBloque[bloqueId] || 35;

                let ocupacionPromedio = 0;
                let ocupacionesPorTurno: number[] = [];

                if (datosPeriodos && datosPeriodos.size > 0) {
                    const maxPeriodo = Math.max(...Array.from(datosPeriodos.keys()));
                    let sumOcupacion = 0;
                    let countPeriodos = 0;

                    for (let periodo = 1; periodo <= maxPeriodo; periodo++) {
                        const datoPeriodo = datosPeriodos.get(periodo);

                        if (datoPeriodo) {
                            const ocupacionPeriodo = datoPeriodo.capacidad > 0
                                ? (datoPeriodo.volumen / datoPeriodo.capacidad) * 100
                                : 0;

                            ocupacionesPorTurno.push(Math.round(ocupacionPeriodo));
                            sumOcupacion += ocupacionPeriodo;
                            countPeriodos++;
                        } else {
                            ocupacionesPorTurno.push(0);
                        }
                    }

                    if (countPeriodos > 0) {
                        ocupacionPromedio = sumOcupacion / countPeriodos;
                    }
                } else {
                    // Generar datos de ejemplo si no hay datos
                    for (let t = 1; t <= 21; t++) {
                        ocupacionesPorTurno.push(Math.round(40 + Math.random() * 40));
                    }
                    ocupacionPromedio = ocupacionesPorTurno.reduce((a, b) => a + b, 0) / ocupacionesPorTurno.length;
                }

                const movimientos = movimientosPorBloque.get(bloqueId) || {
                    entrega: 0, recepcion: 0, carga: 0, descarga: 0, total: 0
                };

                let estado: 'active' | 'restricted' | 'maintenance' = 'active';
                if (movimientos.total > 2000) {
                    estado = 'restricted';
                } else if (movimientos.total === 0 && ocupacionPromedio < 5) {
                    estado = 'maintenance';
                }

                blocksData.push({
                    bloqueId,
                    ocupacionPromedio: Math.round(ocupacionPromedio),
                    capacidad: capacidadReal * 35, // Convertir a TEUs
                    ocupacionPorTurno: ocupacionesPorTurno,
                    movimientos: movimientos,
                    estado
                });
            }
        }

        console.log('✅ Datos de bloques procesados');
        return blocksData;
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