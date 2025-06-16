// src/hooks/usePortKPIs.ts
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Papa from 'papaparse';
import { useTimeContext } from '../contexts/TimeContext';
import type { TimeUnit } from '../types';
import type {
    CorePortKPIs,
    PortMovementData,
    NumericKPIs,
    KPIStatus,
    KPIThreshold
} from '../types/portKpis';

interface UsePortKPIsOptions {
    dataFilePath?: string;
    blockCapacities?: Record<string, number>;
    patioFilter?: string;
    bloqueFilter?: string;
}

interface UsePortKPIsReturn {
    currentKPIs: CorePortKPIs | null;
    historicalData: PortMovementData[];
    aggregatedData: any[];
    isLoading: boolean;
    error: string | null;
    getStatusForKPI: (kpi: NumericKPIs) => KPIStatus;
    formatKPIValue: (kpi: NumericKPIs) => string;
    refreshData: () => void;
}

// Importar configuraciones desde types
import {
    CAPACIDADES_BLOQUES as CAPACIDADES,
    CAPACIDAD_TOTAL_TERMINAL as CAPACIDAD_TERMINAL,
    PATIO_BLOCKS as PATIOS,
    CAPACIDAD_POR_PATIO as CAPACIDAD_PATIOS
} from '../types/portKpis';

// UMBRALES ACTUALIZADOS PARA LOS 6 KPIs PRINCIPALES
const KPI_THRESHOLDS: Record<string, KPIThreshold> = {
    utilizacionPorVolumen: {
        warning: 60,
        critical: 85,
        isHigherBetter: false
    },
    congestionVehicular: {
        warning: 50,
        critical: 100,
        isHigherBetter: false
    },
    balanceFlujo: {
        warning: 1.2,
        critical: 1.5,
        isHigherBetter: false,
        optimalMin: 0.8,
        optimalMax: 1.2
    },
    productividadOperacional: {
        warning: 100,
        critical: 50,
        isHigherBetter: true
    },
    indiceRemanejo: {
        warning: 3,
        critical: 5,
        isHigherBetter: false
    },
    saturacionOperacional: {
        warning: 70,
        critical: 90,
        isHigherBetter: false
    }
};

// Función helper para obtener KPIs por defecto - FUERA DEL COMPONENTE
const getDefaultCoreKPIs = (): CorePortKPIs => ({
    utilizacionPorVolumen: 0,
    congestionVehicular: 0,
    balanceFlujo: 1,
    productividadOperacional: 0,
    indiceRemanejo: 0,
    saturacionOperacional: 0,
    utilizacionPorBloque: {},
    utilizacionPorPatio: {},
    movimientosPorBloque: {},
    remanejosPorBloque: {},
    horasConActividad: 0,
    totalMovimientos: 0
});

export const usePortKPIs = ({
    dataFilePath = '/data/resultados_congestion_SAI_2022.csv',
    blockCapacities = CAPACIDADES,
    patioFilter,
    bloqueFilter
}: UsePortKPIsOptions = {}): UsePortKPIsReturn => {
    const [currentKPIs, setCurrentKPIs] = useState<CorePortKPIs | null>(null);
    const [historicalData, setHistoricalData] = useState<PortMovementData[]>([]);
    const [aggregatedData, setAggregatedData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Usar useRef para evitar recreación de funciones pesadas
    const processingRef = useRef(false);

    // USAR EL TIME CONTEXT
    const { timeState } = useTimeContext();
    const { unit, currentDate, dataSource } = timeState;

    // Función para obtener el rango de fechas según la unidad de tiempo
    const getDateRange = useCallback(() => {
        const startDate = new Date(currentDate);
        const endDate = new Date(currentDate);

        switch (unit) {
            case 'year':
                startDate.setMonth(0, 1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setMonth(11, 31);
                endDate.setHours(23, 59, 59, 999);
                break;

            case 'month':
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setMonth(endDate.getMonth() + 1, 0);
                endDate.setHours(23, 59, 59, 999);
                break;

            case 'week':
                const dayOfWeek = startDate.getDay();
                startDate.setDate(startDate.getDate() - dayOfWeek);
                startDate.setHours(0, 0, 0, 0);
                endDate.setDate(startDate.getDate() + 6);
                endDate.setHours(23, 59, 59, 999);
                break;

            case 'day':
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                break;

            case 'hour':
                startDate.setMinutes(0, 0, 0);
                endDate.setMinutes(59, 59, 999);
                break;

            case 'shift':
                const hour = startDate.getHours();
                if (hour >= 6 && hour < 14) {
                    startDate.setHours(6, 0, 0, 0);
                    endDate.setHours(13, 59, 59, 999);
                } else if (hour >= 14 && hour < 22) {
                    startDate.setHours(14, 0, 0, 0);
                    endDate.setHours(21, 59, 59, 999);
                } else {
                    startDate.setHours(22, 0, 0, 0);
                    endDate.setDate(endDate.getDate() + 1);
                    endDate.setHours(5, 59, 59, 999);
                }
                break;
        }

        return { startDate, endDate };
    }, [currentDate, unit]);

    // Parsear CSV
    const parsearCSV = (csvText: string) => {
        Papa.parse(csvText, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            delimiter: ';',
            complete: (results: Papa.ParseResult<any>) => {
                if (results.data.length === 0) {
                    setError('El archivo CSV no contiene datos');
                    return;
                }

                const processedData: PortMovementData[] = results.data
                    .filter((row: any) => row && row.Bloque)
                    .map((row: any) => {
                        let hora = String(row.Hora || row.Fecha || new Date().toISOString());

                        // Parsear formato de fecha si es necesario
                        let fechaTest = new Date(hora);
                        if (isNaN(fechaTest.getTime())) {
                            if (hora.match(/^\d{2}-\d{2}-\d{4}/)) {
                                const [fechaParte, horaParte = '00:00:00'] = hora.split(' ');
                                const [dia, mes, anio] = fechaParte.split('-');
                                hora = `${anio}-${mes}-${dia}T${horaParte}`;
                            }
                        }

                        return {
                            bloque: String(row.Bloque || '').trim(),
                            hora: hora,
                            gateEntradaContenedores: Number(row['Gate-Entrada-Contenedores']) || 0,
                            gateSalidaContenedores: Number(row['Gate-Salida-Contenedores']) || 0,
                            muelleEntradaContenedores: Number(row['Muelle-Entrada-Contenedores']) || 0,
                            muelleSalidaContenedores: Number(row['Muelle-Salida-Contenedores']) || 0,
                            remanejosContenedores: Number(row['Remanejos-Contenedores']) || 0,
                            promedioContenedores: Number(row['Promedio-Contenedores']) || 0,
                            maximoContenedores: Number(row['Máximo-Contenedores'] || row['Maximo-Contenedores']) || 0,
                            minimoContenedores: Number(row['Mínimo-Contenedores'] || row['Minimo-Contenedores']) || 0,
                            patioEntradaContenedores: Number(row['Patio-Entrada-Contenedores']) || 0,
                            patioSalidaContenedores: Number(row['Patio-Salida-Contenedores']) || 0,
                            terminalEntradaContenedores: Number(row['Terminal-Entrada-Contenedores']) || 0,
                            terminalSalidaContenedores: Number(row['Terminal-Salida-Contenedores']) || 0,
                            gateEntradaTeus: Number(row['Gate-Entrada-Teus']) || 0,
                            gateSalidaTeus: Number(row['Gate-Salida-Teus']) || 0,
                            muelleEntradaTeus: Number(row['Muelle-Entrada-Teus']) || 0,
                            muelleSalidaTeus: Number(row['Muelle-Salida-Teus']) || 0,
                            remanejosTeus: Number(row['Remanejos-Teus']) || 0,
                            patioSalidaTeus: Number(row['Patio-Salida-Teus']) || 0,
                            patioEntradaTeus: Number(row['Patio-Entrada-Teus']) || 0,
                            terminalSalidaTeus: Number(row['Terminal-Salida-Teus']) || 0,
                            terminalEntradaTeus: Number(row['Terminal-Entrada-Teus']) || 0,
                            minimoTeus: Number(row['Mínimo-Teus'] || row['Minimo-Teus']) || 0,
                            maximosTeus: Number(row['Máximos-Teus'] || row['Maximos-Teus']) || 0,
                            promedioTeus: Number(row['Promedio-Teus']) || 0
                        };
                    });

                setHistoricalData(processedData);
                console.log(`✅ CSV cargado: ${processedData.length} registros`);
            },
            error: (error: Papa.ParseError) => {
                console.error('Error parseando CSV:', error);
                setError(`Error al parsear CSV: ${error.message}`);
            }
        });
    };

    // FILTRAR DATOS CON USEMEMO
    const filteredData = useMemo(() => {
        if (!historicalData.length || dataSource !== 'historical') return [];

        const { startDate, endDate } = getDateRange();

        let filtered = historicalData.filter(item => {
            const itemDate = new Date(item.hora);
            return itemDate >= startDate && itemDate <= endDate;
        });

        // Aplicar filtros de patio y bloque si existen
        if (patioFilter && PATIOS[patioFilter as keyof typeof PATIOS]) {
            const blocksInPatio = PATIOS[patioFilter as keyof typeof PATIOS];
            filtered = filtered.filter(item =>
                blocksInPatio.includes(item.bloque)
            );
        }

        if (bloqueFilter) {
            filtered = filtered.filter(item =>
                item.bloque === bloqueFilter
            );
        }

        console.log(`📊 Datos filtrados: ${filtered.length} registros para ${unit} - ${currentDate.toLocaleDateString()}`);

        return filtered;
    }, [historicalData, patioFilter, bloqueFilter, currentDate, unit, dataSource, getDateRange]);

    // CALCULAR LOS 6 KPIs PRINCIPALES - OPTIMIZADO PARA GRANDES VOLÚMENES
    const calculateCoreKPIs = useCallback((data: PortMovementData[]): CorePortKPIs => {
        if (!data.length) {
            return getDefaultCoreKPIs();
        }

        try {
            // 1. UTILIZACIÓN POR VOLUMEN
            const ocupacionPorBloque: Record<string, number> = {};
            const utilizacionPorBloque: Record<string, number> = {};

            // Usar Map para mejor performance con grandes datasets
            const dataByBloque = new Map<string, PortMovementData[]>();
            
            // Procesar en chunks para evitar stack overflow
            const chunkSize = 1000;
            for (let i = 0; i < data.length; i += chunkSize) {
                const chunk = data.slice(i, Math.min(i + chunkSize, data.length));
                chunk.forEach(d => {
                    if (!dataByBloque.has(d.bloque)) {
                        dataByBloque.set(d.bloque, []);
                    }
                    dataByBloque.get(d.bloque)!.push(d);
                });
            }

            // Calcular ocupación promedio por bloque
            dataByBloque.forEach((registros, bloque) => {
                let sumaTeus = 0;
                for (let i = 0; i < registros.length; i++) {
                    sumaTeus += registros[i].promedioTeus;
                }
                const promedioTeus = sumaTeus / registros.length;
                ocupacionPorBloque[bloque] = promedioTeus;
                const capacidadBloque = blockCapacities[bloque] || 1008;
                utilizacionPorBloque[bloque] = (promedioTeus / capacidadBloque) * 100;
            });

            // Calcular utilización por patio
            const utilizacionPorPatio: Record<string, number> = {};
            Object.entries(PATIOS).forEach(([patio, bloques]) => {
                let ocupacionPatio = 0;
                bloques.forEach(bloque => {
                    ocupacionPatio += (ocupacionPorBloque[bloque] || 0);
                });
                const capacidadPatio = CAPACIDAD_PATIOS[patio as keyof typeof CAPACIDAD_PATIOS];
                utilizacionPorPatio[patio] = (ocupacionPatio / capacidadPatio) * 100;
            });

            // Utilización total del terminal
            let ocupacionTotal = 0;
            Object.values(ocupacionPorBloque).forEach(val => ocupacionTotal += val);
            const utilizacionPorVolumen = (ocupacionTotal / CAPACIDAD_TERMINAL) * 100;

            // 2. CONGESTIÓN VEHICULAR
            const movimientosGatePorHora: Record<string, number> = {};
            
            // Procesar en chunks
            for (let i = 0; i < data.length; i += chunkSize) {
                const chunk = data.slice(i, Math.min(i + chunkSize, data.length));
                chunk.forEach(d => {
                    const hora = d.hora.substring(11, 13);
                    if (!movimientosGatePorHora[hora]) movimientosGatePorHora[hora] = 0;
                    movimientosGatePorHora[hora] += d.gateEntradaContenedores + d.gateSalidaContenedores;
                });
            }

            const horasConMovimientos = Object.values(movimientosGatePorHora).filter(m => m > 0).length;
            let totalMovimientosGate = 0;
            Object.values(movimientosGatePorHora).forEach(m => totalMovimientosGate += m);
            const congestionVehicular = horasConMovimientos > 0 ?
                totalMovimientosGate / horasConMovimientos : 0;

            // 3. BALANCE DE FLUJO ENTRADA/SALIDA
            let totalEntradas = 0;
            let totalSalidas = 0;
            
            // Procesar en chunks
            for (let i = 0; i < data.length; i += chunkSize) {
                const chunk = data.slice(i, Math.min(i + chunkSize, data.length));
                chunk.forEach(d => {
                    totalEntradas += d.gateEntradaContenedores + d.muelleEntradaContenedores;
                    totalSalidas += d.gateSalidaContenedores + d.muelleSalidaContenedores;
                });
            }
            
            const balanceFlujo = totalSalidas > 0 ? totalEntradas / totalSalidas : 1;

            // 4. PRODUCTIVIDAD OPERACIONAL
            const totalMovimientosTerminal = totalEntradas + totalSalidas;
            const horasSet = new Set<string>();
            data.forEach(d => horasSet.add(d.hora));
            const horasUnicas = horasSet.size;
            const productividadOperacional = horasUnicas > 0 ?
                totalMovimientosTerminal / horasUnicas : 0;

            // 5. ÍNDICE DE REMANEJO
            let totalRemanejos = 0;
            
            // Procesar en chunks
            for (let i = 0; i < data.length; i += chunkSize) {
                const chunk = data.slice(i, Math.min(i + chunkSize, data.length));
                chunk.forEach(d => {
                    totalRemanejos += d.remanejosContenedores;
                });
            }
            
            const totalMovimientos = totalMovimientosTerminal + totalRemanejos;
            const indiceRemanejo = totalMovimientos > 0 ?
                (totalRemanejos / totalMovimientos) * 100 : 0;

            // 6. SATURACIÓN OPERACIONAL
            let maximoHistorico = 0;
            data.forEach(d => {
                const max = d.maximosTeus || d.promedioTeus;
                if (max > maximoHistorico) maximoHistorico = max;
            });
            
            const promedioActual = data.length > 0 ?
                data[data.length - 1].promedioTeus : 0;
            const saturacionOperacional = maximoHistorico > 0 ?
                (promedioActual / maximoHistorico) * 100 : 0;

            // Datos auxiliares
            const movimientosPorBloque: Record<string, number> = {};
            const remanejosPorBloque: Record<string, number> = {};

            dataByBloque.forEach((registros, bloque) => {
                let movimientos = 0;
                let remanejos = 0;
                
                registros.forEach(r => {
                    movimientos += r.gateEntradaContenedores + r.gateSalidaContenedores +
                        r.muelleEntradaContenedores + r.muelleSalidaContenedores;
                    remanejos += r.remanejosContenedores;
                });
                
                movimientosPorBloque[bloque] = movimientos;
                remanejosPorBloque[bloque] = remanejos;
            });

            // ANÁLISIS DE RELACIONES ENTRE KPIs
            const kpiRelations = {
                congestionProductividadStatus: (() => {
                    const ratio = productividadOperacional / (congestionVehicular || 1);
                    if (congestionVehicular > 100 && productividadOperacional < 50) return 'critical' as const;
                    if (congestionVehicular < 30 && productividadOperacional < 50) return 'warning' as const;
                    if (ratio > 2) return 'good' as const;
                    return 'normal' as const;
                })(),

                utilizacionRemanejosStatus: (() => {
                    if (utilizacionPorVolumen > 85 && indiceRemanejo > 5) return 'critical' as const;
                    if (utilizacionPorVolumen > 85 && indiceRemanejo < 3) return 'good' as const;
                    if (utilizacionPorVolumen < 60 && indiceRemanejo > 5) return 'warning' as const;
                    return 'normal' as const;
                })(),

                balanceUtilizacionStatus: (() => {
                    if (balanceFlujo > 1.2 && utilizacionPorVolumen > 85) return 'critical' as const;
                    if (balanceFlujo > 1.5 && utilizacionPorVolumen > 70) return 'warning' as const;
                    if (balanceFlujo >= 0.8 && balanceFlujo <= 1.2) return 'good' as const;
                    return 'normal' as const;
                })()
            };

            return {
                utilizacionPorVolumen,
                congestionVehicular,
                balanceFlujo,
                productividadOperacional,
                indiceRemanejo,
                saturacionOperacional,
                utilizacionPorBloque,
                utilizacionPorPatio,
                congestionPorHora: movimientosGatePorHora,
                movimientosPorBloque,
                remanejosPorBloque,
                horasConActividad: horasConMovimientos,
                totalMovimientos,
                kpiRelations
            };
        } catch (error) {
            console.error('Error calculando KPIs:', error);
            return getDefaultCoreKPIs();
        }
    }, [blockCapacities]);

    // Función para agregar datos por unidad de tiempo - OPTIMIZADA
    const aggregateDataByTimeUnit = useCallback((data: PortMovementData[], timeUnit: TimeUnit) => {
        const grouped = new Map<string, PortMovementData[]>();

        data.forEach(item => {
            const date = new Date(item.hora);
            let key: string;

            switch (timeUnit) {
                case 'year':
                    key = date.getFullYear().toString();
                    break;
                case 'month':
                    key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    break;
                case 'week':
                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay());
                    key = weekStart.toISOString().split('T')[0];
                    break;
                case 'day':
                    key = date.toISOString().split('T')[0];
                    break;
                case 'hour':
                    key = `${date.toISOString().split('T')[0]} ${date.getHours()}:00`;
                    break;
                case 'shift':
                    const hour = date.getHours();
                    const shiftName = hour >= 6 && hour < 14 ? 'Mañana' :
                        hour >= 14 && hour < 22 ? 'Tarde' : 'Noche';
                    key = `${date.toISOString().split('T')[0]} ${shiftName}`;
                    break;
                default:
                    key = date.toISOString();
            }

            if (!grouped.has(key)) {
                grouped.set(key, []);
            }
            grouped.get(key)!.push(item);
        });

        // Calcular KPIs para cada grupo
        const aggregated = Array.from(grouped.entries()).map(([timeUnit, data]) => ({
            timeUnit,
            data: calculateCoreKPIs(data),
            count: data.length
        }));

        return aggregated.sort((a, b) => a.timeUnit.localeCompare(b.timeUnit));
    }, [calculateCoreKPIs]);

    // Cargar datos cuando cambia el archivo
    useEffect(() => {
        if (dataSource !== 'historical') return;

        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(dataFilePath);
                if (!response.ok) {
                    throw new Error(`No se pudo cargar el archivo de datos`);
                }

                const csvText = await response.text();
                if (!csvText || csvText.length === 0) {
                    throw new Error('El archivo está vacío');
                }

                parsearCSV(csvText);

            } catch (err) {
                console.error('Error cargando CSV:', err);
                setError(err instanceof Error ? err.message : 'Error desconocido');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [dataFilePath, dataSource]);

    // EFECTO PRINCIPAL - PROCESAR DATOS DE FORMA SEGURA
    useEffect(() => {
        if (dataSource !== 'historical' || processingRef.current) {
            if (dataSource !== 'historical') {
                setCurrentKPIs(null);
                setAggregatedData([]);
            }
            return;
        }

        if (filteredData.length > 0) {
            // Marcar que estamos procesando
            processingRef.current = true;

            // Usar setTimeout para evitar bloquear el thread principal
            setTimeout(() => {
                try {
                    const kpis = calculateCoreKPIs(filteredData);
                    setCurrentKPIs(kpis);

                    console.log('✅ KPIs actualizados para:', {
                        unit,
                        fecha: currentDate.toLocaleDateString(),
                        registros: filteredData.length,
                        ocupacion: kpis.utilizacionPorVolumen?.toFixed(1) + '%'
                    });

                    // Solo agregar si no son demasiados datos
                    if (filteredData.length < 50000) {
                        const aggregated = aggregateDataByTimeUnit(filteredData, unit);
                        setAggregatedData(aggregated);
                    } else {
                        // Para datasets muy grandes, limitar la agregación
                        console.log('⚠️ Dataset muy grande, limitando agregación');
                        setAggregatedData([]);
                    }
                } catch (error) {
                    console.error('Error procesando KPIs:', error);
                    setCurrentKPIs(getDefaultCoreKPIs());
                    setAggregatedData([]);
                } finally {
                    processingRef.current = false;
                }
            }, 0);
        } else {
            console.log('⚠️ No hay datos para el período seleccionado');
            setCurrentKPIs(getDefaultCoreKPIs());
            setAggregatedData([]);
        }
    }, [filteredData, unit, currentDate, dataSource, calculateCoreKPIs, aggregateDataByTimeUnit]);

    // Obtener estado del KPI
    const getStatusForKPI = useCallback((kpi: NumericKPIs): KPIStatus => {
        if (!currentKPIs || typeof currentKPIs[kpi] !== 'number') {
            return 'normal';
        }

        const value = currentKPIs[kpi] as number;
        const threshold = KPI_THRESHOLDS[kpi];

        if (!threshold) return 'normal';

        // Para balance de flujo, tiene un rango óptimo
        if (kpi === 'balanceFlujo') {
            const { optimalMin, optimalMax, critical } = threshold as any;
            if (value >= optimalMin && value <= optimalMax) return 'good';
            if (value > critical || value < 0.8) return 'critical';
            return 'warning';
        }

        // Para otros KPIs
        if (threshold.isHigherBetter) {
            if (value >= threshold.warning) return 'good';
            if (value >= threshold.critical) return 'warning';
            return 'critical';
        } else {
            if (value >= threshold.critical) return 'critical';
            if (value >= threshold.warning) return 'warning';
            return 'good';
        }
    }, [currentKPIs]);

    // Formatear valor del KPI
    const formatKPIValue = useCallback((kpi: NumericKPIs): string => {
        if (!currentKPIs || typeof currentKPIs[kpi] !== 'number') {
            return 'N/A';
        }

        const value = currentKPIs[kpi] as number;

        switch (kpi) {
            case 'utilizacionPorVolumen':
            case 'indiceRemanejo':
            case 'saturacionOperacional':
                return `${value.toFixed(1)}%`;
            case 'congestionVehicular':
                return `${value.toFixed(0)} mov/h`;
            case 'balanceFlujo':
                return value.toFixed(2);
            case 'productividadOperacional':
                return `${value.toFixed(0)} cont/h`;
            default:
                return value.toFixed(2);
        }
    }, [currentKPIs]);

    return {
        currentKPIs,
        historicalData,
        aggregatedData,
        isLoading,
        error,
        getStatusForKPI,
        formatKPIValue,
        refreshData: () => { }
    };
};