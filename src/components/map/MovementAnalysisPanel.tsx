// src/components/map/MovementAnalysisPanel.tsx
import React, { useState, useMemo } from 'react';
import {
    TrendingUp, Clock, Package, Filter, Play, ChevronLeft, BarChart3, Building, Info
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, LineChart, Line,
    ComposedChart, Bar, BarChart
} from 'recharts';
import { useTimeContext } from '../../contexts/TimeContext';
import { usePortKPIs } from '../../hooks/usePortKPIs';
import { useViewNavigation } from '../../contexts/ViewNavigationContext';
import { useTemporalAggregation } from '../../hooks/useTemporalAggregation';

export const MovementAnalysisPanel: React.FC = () => {
    const { viewState } = useViewNavigation();
    const { timeState } = useTimeContext();
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedPatio, setSelectedPatio] = useState<'all' | 'costanera' | 'tebas' | 'ohiggins'>('all');

    // Obtener datos según el patio seleccionado
    const patioFilter = selectedPatio === 'all' ? undefined : selectedPatio;
    const { currentKPIs, historicalData, isLoading } = usePortKPIs({ patioFilter });
    console.log('DEBUG MovementAnalysisPanel:', {
        isLoading,
        historicalDataLength: historicalData.length,
        currentKPIs: currentKPIs,
        timeUnit: timeState.unit,
        currentDate: timeState.currentDate
    });
    // Hook para agregaciones temporales
    const temporalData = useTemporalAggregation(historicalData);

    // Estados para filtros
    const [filterProductivos, setFilterProductivos] = useState({
        entradaGate: true,
        salidaGate: true,
        cargaBuque: true,
        descargaBuque: true
    });

    const [filterNoProductivos, setFilterNoProductivos] = useState({
        reacomodosBloque: true,
        entreBloques: true,
        entrePatios: true
    });

    const [filterTipoMovimiento, setFilterTipoMovimiento] = useState<'todos' | 'productivos' | 'no-productivos'>('todos');
    const [showEvolucionTurnos, setShowEvolucionTurnos] = useState(false);
    const [chartType, setChartType] = useState<'area' | 'bar'>('area');

    // Ajustar etiquetas para mostrar hora
    const adjustTimeForDisplay = (hour: number): string => {
        return `${hour}:00`;
    };

    // Procesar datos según el unit temporal global
    const processedData = useMemo(() => {
        let data: any[] = [];
        console.log('DEBUG processedData:', {
            dataLength: data.length,
            timeUnit: timeState.unit,
            historicalDataLength: historicalData?.length,
            firstItems: data.slice(0, 3)
        });
        switch (timeState.unit) {
            case 'week':
                // Para vista semanal, mostrar los 7 días de la semana
                if (historicalData && historicalData.length > 0) {
                    console.log('DEBUG WEEK - historicalData sample:', historicalData.slice(0, 3));

                    const weekStart = new Date(timeState.currentDate);
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                    weekStart.setHours(0, 0, 0, 0);

                    console.log('DEBUG WEEK - weekStart:', weekStart);

                    const dailyAggregates = new Map();
                    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

                    for (let i = 0; i < 7; i++) {
                        dailyAggregates.set(i, {
                            entradaGate: 0,
                            salidaGate: 0,
                            cargaBuque: 0,
                            descargaBuque: 0,
                            reacomodosBloque: 0,
                            entreBloques: 0,
                            entrePatios: 0
                        });
                    }

                    let recordsProcessed = 0;
                    historicalData.forEach(record => {
                        const date = new Date(record.hora);
                        const dayOfWeek = date.getDay();

                        if (recordsProcessed < 5) {
                            console.log('DEBUG WEEK - processing record:', {
                                hora: record.hora,
                                date: date,
                                dayOfWeek: dayOfWeek
                            });
                        }
                        recordsProcessed++;

                        const agg = dailyAggregates.get(dayOfWeek);
                        if (agg) {
                            agg.entradaGate += (record.gateEntradaContenedores || 0);
                            agg.salidaGate += (record.gateSalidaContenedores || 0);
                            agg.cargaBuque += (record.muelleSalidaContenedores || 0);
                            agg.descargaBuque += (record.muelleEntradaContenedores || 0);
                            agg.reacomodosBloque += (record.remanejosContenedores || 0);
                            agg.entreBloques += ((record.patioEntradaContenedores || 0) + (record.patioSalidaContenedores || 0));
                            agg.entrePatios += ((record.terminalEntradaContenedores || 0) + (record.terminalSalidaContenedores || 0));
                        }
                    });

                    data = Array.from(dailyAggregates.entries())
                        .sort((a, b) => a[0] - b[0])
                        .map(([day, values]) => ({
                            label: dayNames[day],
                            ...values
                        }));

                    console.log('DEBUG WEEK - final data:', data);
                }
                break;

            case 'day':
                if (historicalData && historicalData.length > 0) {
                    const currentDayStart = new Date(timeState.currentDate);
                    currentDayStart.setHours(0, 0, 0, 0);
                    const currentDayEnd = new Date(timeState.currentDate);
                    currentDayEnd.setHours(23, 59, 59, 999);

                    const dayData = historicalData.filter(record => {
                        const recordDate = new Date(record.hora);
                        return recordDate >= currentDayStart && recordDate <= currentDayEnd;
                    });

                    const hourlyData = new Map();
                    for (let h = 0; h < 24; h++) {
                        hourlyData.set(h, {
                            entradaGate: 0,
                            salidaGate: 0,
                            cargaBuque: 0,
                            descargaBuque: 0,
                            reacomodosBloque: 0,
                            entreBloques: 0,
                            entrePatios: 0
                        });
                    }

                    dayData.forEach(record => {
                        const hour = new Date(record.hora).getHours();
                        const hourData = hourlyData.get(hour);
                        if (hourData) {
                            hourData.entradaGate += (record.gateEntradaContenedores || 0);
                            hourData.salidaGate += (record.gateSalidaContenedores || 0);
                            hourData.cargaBuque += (record.muelleSalidaContenedores || 0);
                            hourData.descargaBuque += (record.muelleEntradaContenedores || 0);
                            hourData.reacomodosBloque += (record.remanejosContenedores || 0);
                            hourData.entreBloques += ((record.patioEntradaContenedores || 0) + (record.patioSalidaContenedores || 0));
                            hourData.entrePatios += ((record.terminalEntradaContenedores || 0) + (record.terminalSalidaContenedores || 0));
                        }
                    });

                    // Ajustar etiquetas para mostrar punto medio de la hora
                    data = Array.from(hourlyData.entries())
                        .map(([hour, values]) => ({
                            label: adjustTimeForDisplay(hour),
                            hour: hour, // Mantener hora original para cálculos
                            ...values
                        }));

                    // CAMBIO: Agregar puntos de corte para evitar interpolación incorrecta
                    // Agregar punto antes del inicio del turno 1 (6am) con valores en 0
                    if (data.length > 0 && data[5].hour === 5) {
                        // Si hay datos a las 5am y no hay actividad, asegurar que sea 0
                        const fiveAmData = data.find(d => d.hour === 5);
                        if (fiveAmData) {
                            Object.keys(fiveAmData).forEach(key => {
                                if (key !== 'label' && key !== 'hour') {
                                    fiveAmData[key] = 0;
                                }
                            });
                        }
                    }

                    // Asegurar que no haya actividad entre turnos (22-6)
                    for (let h = 22; h <= 23; h++) {
                        const hourData = data.find(d => d.hour === h);
                        if (hourData) {
                            const hasActivity = Object.keys(hourData).some(key =>
                                key !== 'label' && key !== 'hour' && hourData[key] > 0
                            );
                            if (!hasActivity) {
                                Object.keys(hourData).forEach(key => {
                                    if (key !== 'label' && key !== 'hour') {
                                        hourData[key] = 0;
                                    }
                                });
                            }
                        }
                    }
                }
                break;
            case 'hour':
                // AGREGAR ESTE CASO
                if (historicalData && historicalData.length > 0) {
                    // Para vista por hora, mostrar solo los datos de la hora actual
                    const currentHour = new Date(timeState.currentDate).getHours();

                    // Agrupar todos los datos de la hora seleccionada
                    const hourData = {
                        entradaGate: 0,
                        salidaGate: 0,
                        cargaBuque: 0,
                        descargaBuque: 0,
                        reacomodosBloque: 0,
                        entreBloques: 0,
                        entrePatios: 0
                    };

                    historicalData.forEach(record => {
                        const recordHour = new Date(record.hora).getHours();
                        // Solo procesar registros de la hora actual
                        if (recordHour === currentHour) {
                            hourData.entradaGate += (record.gateEntradaContenedores || 0);
                            hourData.salidaGate += (record.gateSalidaContenedores || 0);
                            hourData.cargaBuque += (record.muelleSalidaContenedores || 0);
                            hourData.descargaBuque += (record.muelleEntradaContenedores || 0);
                            hourData.reacomodosBloque += (record.remanejosContenedores || 0);
                            hourData.entreBloques += ((record.patioEntradaContenedores || 0) + (record.patioSalidaContenedores || 0));
                            hourData.entrePatios += ((record.terminalEntradaContenedores || 0) + (record.terminalSalidaContenedores || 0));
                        }
                    });

                    // Crear un único punto de datos para la hora
                    data = [{
                        label: adjustTimeForDisplay(currentHour),
                        hour: currentHour,
                        ...hourData
                    }];
                }
                break;
            case 'shift':
                const currentHour = timeState.currentDate.getHours();
                let shiftStart, shiftEnd;

                // Determinar el turno actual y sus límites
                if (currentHour >= 8 && currentHour < 16) {
                    shiftStart = 8;
                    shiftEnd = 16;
                } else if (currentHour >= 16 && currentHour < 24) {
                    shiftStart = 16;
                    shiftEnd = 24;
                } else {
                    // Turno 3: 00:00 a 08:00
                    shiftStart = 0;
                    shiftEnd = 8;
                }

                if (historicalData && historicalData.length > 0) {
                    const currentDate = new Date(timeState.currentDate);
                    const currentDayStart = new Date(currentDate);
                    currentDayStart.setHours(0, 0, 0, 0);
                    const currentDayEnd = new Date(currentDate);
                    currentDayEnd.setHours(23, 59, 59, 999);

                    console.log('DEBUG SHIFT:', {
                        turno: shiftStart === 0 ? 3 : (shiftStart === 8 ? 1 : 2),
                        shiftStart,
                        shiftEnd,
                        currentHour,
                        currentDate: currentDate.toString()
                    });

                    // Debug: Ver las primeras 5 fechas en historicalData
                    console.log('DEBUG SHIFT - sample historical data:',
                        historicalData.slice(0, 5).map(r => ({
                            hora: r.hora,
                            parsedDate: new Date(r.hora).toString(),
                            hour: new Date(r.hora).getHours(),
                            movements: r.gateEntradaContenedores + r.gateSalidaContenedores
                        }))
                    );

                    // Ver el rango de fechas en los datos
                    const dates = historicalData.map(r => new Date(r.hora));
                    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
                    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

                    console.log('DEBUG SHIFT - data date range:', {
                        minDate: minDate.toString(),
                        maxDate: maxDate.toString(),
                        currentDayStart: currentDayStart.toString(),
                        currentDayEnd: currentDayEnd.toString()
                    });

                    // Contar registros por hora
                    const hourCounts = new Map();
                    historicalData.forEach(record => {
                        const hour = new Date(record.hora).getHours();
                        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
                    });

                    console.log('DEBUG SHIFT - records by hour:',
                        Array.from(hourCounts.entries()).sort((a, b) => a[0] - b[0])
                    );

                    const shiftData = historicalData.filter(record => {
                        const recordDate = new Date(record.hora);
                        const hour = recordDate.getHours();

                        // Verificar que esté en el rango del turno
                        if (shiftStart === 0) {
                            // Turno 3: horas 0-7
                            return hour >= 0 && hour < 8;
                        } else {
                            // Otros turnos
                            return hour >= shiftStart && hour < shiftEnd;
                        }
                    });

                    console.log('DEBUG SHIFT - filtered records:', {
                        totalRecords: historicalData.length,
                        shiftRecords: shiftData.length,
                        sampleShiftRecords: shiftData.slice(0, 3).map(r => ({
                            hora: r.hora,
                            hour: new Date(r.hora).getHours(),
                            movements: r.gateEntradaContenedores + r.gateSalidaContenedores
                        }))
                    });
                    const hourlyData = new Map();

                    // Inicializar todas las horas del turno
                    if (shiftStart === 0) {
                        // Turno 3: 0-7
                        for (let h = 0; h < 8; h++) {
                            hourlyData.set(h, {
                                entradaGate: 0,
                                salidaGate: 0,
                                cargaBuque: 0,
                                descargaBuque: 0,
                                reacomodosBloque: 0,
                                entreBloques: 0,
                                entrePatios: 0
                            });
                        }
                    } else {
                        // Otros turnos
                        for (let h = shiftStart; h < shiftEnd; h++) {
                            hourlyData.set(h, {
                                entradaGate: 0,
                                salidaGate: 0,
                                cargaBuque: 0,
                                descargaBuque: 0,
                                reacomodosBloque: 0,
                                entreBloques: 0,
                                entrePatios: 0
                            });
                        }
                    }

                    shiftData.forEach(record => {
                        const hour = new Date(record.hora).getHours();
                        const hourData = hourlyData.get(hour);
                        if (hourData) {
                            hourData.entradaGate += (record.gateEntradaContenedores || 0);
                            hourData.salidaGate += (record.gateSalidaContenedores || 0);
                            hourData.cargaBuque += (record.muelleSalidaContenedores || 0);
                            hourData.descargaBuque += (record.muelleEntradaContenedores || 0);
                            hourData.reacomodosBloque += (record.remanejosContenedores || 0);
                            hourData.entreBloques += ((record.patioEntradaContenedores || 0) + (record.patioSalidaContenedores || 0));
                            hourData.entrePatios += ((record.terminalEntradaContenedores || 0) + (record.terminalSalidaContenedores || 0));
                        }
                    });

                    data = Array.from(hourlyData.entries())
                        .sort((a, b) => a[0] - b[0])
                        .map(([hour, values]) => ({
                            label: adjustTimeForDisplay(hour),
                            hour: hour,
                            ...values
                        }));

                    console.log('DEBUG SHIFT - final data:', {
                        dataLength: data.length,
                        totalMovements: data.reduce((sum, d) => sum + (d.entradaGate || 0) + (d.salidaGate || 0), 0)
                    });
                }
                break;
        }

        return data;
    }, [timeState.unit, timeState.currentDate, historicalData]);

    // Filtrar datos según checkboxes
    const filteredData = useMemo(() => {
        // Verificar que processedData sea un array válido
        if (!Array.isArray(processedData)) {
            console.error('processedData is not an array:', processedData);
            return [];
        }

        // Mapear los datos procesados
        const filtered = processedData.map(item => {
            const filtered: any = {
                label: item.label,
                hour: item.hour // Preservar hora original
            };

            if (filterTipoMovimiento === 'productivos') {
                filtered.entradaGate = item.entradaGate || 0;
                filtered.salidaGate = item.salidaGate || 0;
                filtered.cargaBuque = item.cargaBuque || 0;
                filtered.descargaBuque = item.descargaBuque || 0;
            } else if (filterTipoMovimiento === 'no-productivos') {
                filtered.reacomodosBloque = item.reacomodosBloque || 0;
                filtered.entreBloques = item.entreBloques || 0;
                filtered.entrePatios = item.entrePatios || 0;
            } else {
                if (filterProductivos.entradaGate) filtered.entradaGate = item.entradaGate || 0;
                if (filterProductivos.salidaGate) filtered.salidaGate = item.salidaGate || 0;
                if (filterProductivos.cargaBuque) filtered.cargaBuque = item.cargaBuque || 0;
                if (filterProductivos.descargaBuque) filtered.descargaBuque = item.descargaBuque || 0;
                if (filterNoProductivos.reacomodosBloque) filtered.reacomodosBloque = item.reacomodosBloque || 0;
                if (filterNoProductivos.entreBloques) filtered.entreBloques = item.entreBloques || 0;
                if (filterNoProductivos.entrePatios) filtered.entrePatios = item.entrePatios || 0;
            }

            filtered.totalProductivos = (filtered.entradaGate || 0) + (filtered.salidaGate || 0) +
                (filtered.cargaBuque || 0) + (filtered.descargaBuque || 0);
            filtered.totalNoProductivos = (filtered.reacomodosBloque || 0) +
                (filtered.entreBloques || 0) + (filtered.entrePatios || 0);
            filtered.total = filtered.totalProductivos + filtered.totalNoProductivos;

            return filtered;
        });

        // Log de debug DESPUÉS del map, no dentro
        console.log('DEBUG filteredData:', {
            length: filtered.length,
            firstItems: filtered.slice(0, 3)
        });

        return filtered;
    }, [processedData, filterProductivos, filterNoProductivos, filterTipoMovimiento]);
    // Nueva lógica para evolución por turnos con 3 curvas
    const evolucionPorTurnosData = useMemo(() => {
        if (timeState.unit !== 'week' || !historicalData || historicalData.length === 0) return [];

        // Agrupar por día y turno
        const dataByDayAndShift = new Map();
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

        // Inicializar estructura
        for (let day = 0; day < 7; day++) {
            dataByDayAndShift.set(day, {
                dia: dayNames[day],
                turno1: 0, // 6:00 - 14:00
                turno2: 0, // 14:00 - 22:00
                turno3: 0  // 22:00 - 6:00
            });
        }

        // Procesar datos históricos
        historicalData.forEach(record => {
            const date = new Date(record.hora);
            const dayOfWeek = date.getDay();
            const hour = date.getHours();

            // Determinar turno (ajustado a horarios reales)
            let turno;
            if (hour >= 8 && hour < 16) {
                turno = 'turno1';  // 08:00 - 16:00
            } else if (hour >= 16 && hour < 24) {
                turno = 'turno2';  // 16:00 - 00:00
            } else {
                turno = 'turno3';  // 00:00 - 08:00
            }

            const dayData = dataByDayAndShift.get(dayOfWeek);
            if (dayData) {
                const totalMovimientos =
                    (record.gateEntradaContenedores || 0) +
                    (record.gateSalidaContenedores || 0) +
                    (record.muelleEntradaContenedores || 0) +
                    (record.muelleSalidaContenedores || 0) +
                    (record.remanejosContenedores || 0);

                dayData[turno] += totalMovimientos;
            }
        });

        // Convertir a array ordenado
        return Array.from(dataByDayAndShift.values());
    }, [historicalData, timeState.unit]);

    // Para el cálculo de hora punta (cambio de terminología)
    const movementTypeAnalysis = useMemo(() => {
        if (!historicalData || historicalData.length === 0) return [];

        const hourlyData = new Map();
        for (let hour = 0; hour < 24; hour++) {
            hourlyData.set(hour, {
                hora: adjustTimeForDisplay(hour),
                total: 0
            });
        }

        historicalData.forEach(data => {
            const hour = new Date(data.hora).getHours();
            const hourData = hourlyData.get(hour);
            if (!hourData) return;

            const total = (data.gateEntradaContenedores || 0) +
                (data.gateSalidaContenedores || 0) +
                (data.muelleEntradaContenedores || 0) +
                (data.muelleSalidaContenedores || 0) +
                (data.remanejosContenedores || 0);

            hourData.total += total;
        });

        return Array.from(hourlyData.values());
    }, [historicalData]);

    const getTimeUnitLabel = () => {
        switch (timeState.unit) {
            case 'week': return 'Vista Semanal - Totales por Día';
            case 'day': return 'Vista Diaria - Totales por Hora';
            case 'shift': {
                const hour = timeState.currentDate.getHours();
                let turnoNum;
                if (hour >= 8 && hour < 16) turnoNum = 1;
                else if (hour >= 16 && hour < 24) turnoNum = 2;
                else turnoNum = 3;
                return `Turno ${turnoNum} - Totales por Hora`;
            }
            case 'hour': return `Hora ${timeState.currentDate.getHours()}:00 - Total`;
            default: return 'Período';
        }
    };

    // Solo mostrar en vista terminal
    if (viewState.level !== 'terminal') {
        return null;
    }

    if (isLoading) {
        return (
            <button
                disabled
                className="bg-slate-900/90 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-slate-700/50 opacity-50"
                title="Cargando..."
            >
                <BarChart3 className="w-5 h-5 text-cyan-400 animate-pulse" />
            </button>
        );
    }

    // Vista colapsada - solo botón
    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="bg-slate-900/90 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-slate-700/50 hover:bg-slate-800 transition-colors"
                title="Ver análisis de movimientos"
            >
                <BarChart3 className="w-5 h-5 text-cyan-400" />
            </button>
        );
    }

    // Si no hay datos para mostrar
    if (filteredData.length === 0) {
        return (
            <div className="bg-slate-900/90 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-100">Análisis de Movimientos</h3>
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="text-gray-400 hover:text-gray-200"
                    >
                        <ChevronLeft size={16} />
                    </button>
                </div>
                <p className="text-slate-400 text-center py-8">No hay datos disponibles para el período seleccionado</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/90 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-slate-700/50 max-h-[600px] overflow-y-auto">




            <div className="min-w-[800px] max-w-[1000px] space-y-6">
                {/* Header con selector de patio */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                    <div className="flex items-center space-x-4">
                        <h3 className="text-sm font-bold text-slate-100 flex items-center">
                            <BarChart3 className="mr-2 text-cyan-400" size={16} />
                            Análisis de Movimientos
                        </h3>

                        {/* Selector de Patio */}
                        <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4 text-slate-400" />
                            <select
                                value={selectedPatio}
                                onChange={(e) => setSelectedPatio(e.target.value as any)}
                                className="px-3 py-1 bg-slate-800 text-slate-200 rounded text-sm border border-slate-600"
                            >
                                <option value="all">Terminal Completo</option>
                                <option value="costanera">Costanera (C1-C9)</option>
                                <option value="tebas">Tebas (T1-T4)</option>
                                <option value="ohiggins">O'Higgins (H1-H5)</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsExpanded(false)}
                        className="text-gray-400 hover:text-gray-200 transition-colors"
                        title="Minimizar"
                    >
                        <ChevronLeft size={16} />
                    </button>
                </div>

                {/* Controles de filtro */}
                <div className="bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-200 flex items-center">
                            <Filter className="mr-2" size={16} />
                            Filtros de Movimientos
                        </h3>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setChartType(chartType === 'area' ? 'bar' : 'area')}
                                className="px-3 py-1 bg-slate-600 text-slate-200 rounded text-sm hover:bg-slate-500"
                            >
                                {chartType === 'area' ? 'Ver Barras' : 'Ver Áreas'}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Filtros Productivos */}
                        <div>
                            <h4 className="text-xs font-medium text-green-400 mb-2">Movimientos Productivos</h4>
                            <div className="space-y-1">
                                <label className="flex items-center text-sm text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={filterProductivos.entradaGate}
                                        onChange={(e) => setFilterProductivos({ ...filterProductivos, entradaGate: e.target.checked })}
                                        className="mr-2"
                                    />
                                    Entrada Gate
                                </label>
                                <label className="flex items-center text-sm text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={filterProductivos.salidaGate}
                                        onChange={(e) => setFilterProductivos({ ...filterProductivos, salidaGate: e.target.checked })}
                                        className="mr-2"
                                    />
                                    Salida Gate
                                </label>
                                <label className="flex items-center text-sm text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={filterProductivos.cargaBuque}
                                        onChange={(e) => setFilterProductivos({ ...filterProductivos, cargaBuque: e.target.checked })}
                                        className="mr-2"
                                    />
                                    Carga al Buque
                                </label>
                                <label className="flex items-center text-sm text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={filterProductivos.descargaBuque}
                                        onChange={(e) => setFilterProductivos({ ...filterProductivos, descargaBuque: e.target.checked })}
                                        className="mr-2"
                                    />
                                    Descarga del Buque
                                </label>
                            </div>
                        </div>

                        {/* Filtros No Productivos */}
                        <div>
                            <h4 className="text-xs font-medium text-orange-400 mb-2">Movimientos No Productivos (Reacomodos)</h4>
                            <div className="space-y-1">
                                <label className="flex items-center text-sm text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={filterNoProductivos.reacomodosBloque}
                                        onChange={(e) => setFilterNoProductivos({ ...filterNoProductivos, reacomodosBloque: e.target.checked })}
                                        className="mr-2"
                                    />
                                    Reacomodos dentro del bloque
                                </label>
                                <label className="flex items-center text-sm text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={filterNoProductivos.entreBloques}
                                        onChange={(e) => setFilterNoProductivos({ ...filterNoProductivos, entreBloques: e.target.checked })}
                                        className="mr-2"
                                    />
                                    Movimientos entre bloques
                                </label>
                                <label className="flex items-center text-sm text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={filterNoProductivos.entrePatios}
                                        onChange={(e) => setFilterNoProductivos({ ...filterNoProductivos, entrePatios: e.target.checked })}
                                        className="mr-2"
                                    />
                                    Movimientos entre patios
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gráfico principal */}
                <div className="bg-slate-700 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-slate-200 mb-3">
                        Distribución de Movimientos - {getTimeUnitLabel()}
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'area' ? (
                                <AreaChart
                                    data={filteredData}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                    <XAxis
                                        dataKey="label"
                                        stroke="#94a3b8"
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: '1px solid #475569',
                                            borderRadius: '4px'
                                        }}
                                    />
                                    <Legend />

                                    {/* Movimientos Productivos - CAMBIO: type="linear" para evitar suavizado */}
                                    {filterProductivos.entradaGate && (
                                        <Area type="linear" dataKey="entradaGate" stackId="1"
                                            stroke="#10b981" fill="#10b981" fillOpacity={0.8} name="Entrada Gate"
                                            connectNulls={false} />
                                    )}
                                    {filterProductivos.salidaGate && (
                                        <Area type="linear" dataKey="salidaGate" stackId="1"
                                            stroke="#34d399" fill="#34d399" fillOpacity={0.8} name="Salida Gate"
                                            connectNulls={false} />
                                    )}
                                    {filterProductivos.descargaBuque && (
                                        <Area type="linear" dataKey="descargaBuque" stackId="1"
                                            stroke="#6ee7b7" fill="#6ee7b7" fillOpacity={0.8} name="Descarga Buque"
                                            connectNulls={false} />
                                    )}
                                    {filterProductivos.cargaBuque && (
                                        <Area type="linear" dataKey="cargaBuque" stackId="1"
                                            stroke="#a7f3d0" fill="#a7f3d0" fillOpacity={0.8} name="Carga Buque"
                                            connectNulls={false} />
                                    )}

                                    {/* Movimientos No Productivos - CAMBIO: type="linear" */}
                                    {filterNoProductivos.reacomodosBloque && (
                                        <Area type="linear" dataKey="reacomodosBloque" stackId="1"
                                            stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.8} name="Reacomodos en bloque"
                                            connectNulls={false} />
                                    )}
                                    {filterNoProductivos.entreBloques && (
                                        <Area type="linear" dataKey="entreBloques" stackId="1"
                                            stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.8} name="Entre bloques"
                                            connectNulls={false} />
                                    )}
                                    {filterNoProductivos.entrePatios && (
                                        <Area type="linear" dataKey="entrePatios" stackId="1"
                                            stroke="#ef4444" fill="#ef4444" fillOpacity={0.8} name="Entre patios"
                                            connectNulls={false} />
                                    )}
                                </AreaChart>
                            ) : (
                                <BarChart
                                    data={filteredData}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                    <XAxis dataKey="label" stroke="#94a3b8" interval="preserveStartEnd" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: '1px solid #475569',
                                            borderRadius: '4px'
                                        }}
                                    />
                                    <Legend />

                                    {/* Movimientos Productivos */}
                                    {filterProductivos.entradaGate && (
                                        <Bar dataKey="entradaGate" stackId="1" fill="#10b981" name="Entrada Gate" />
                                    )}
                                    {filterProductivos.salidaGate && (
                                        <Bar dataKey="salidaGate" stackId="1" fill="#34d399" name="Salida Gate" />
                                    )}
                                    {filterProductivos.descargaBuque && (
                                        <Bar dataKey="descargaBuque" stackId="1" fill="#6ee7b7" name="Descarga Buque" />
                                    )}
                                    {filterProductivos.cargaBuque && (
                                        <Bar dataKey="cargaBuque" stackId="1" fill="#a7f3d0" name="Carga Buque" />
                                    )}

                                    {/* Movimientos No Productivos */}
                                    {filterNoProductivos.reacomodosBloque && (
                                        <Bar dataKey="reacomodosBloque" stackId="1" fill="#f59e0b" name="Reacomodos en bloque" />
                                    )}
                                    {filterNoProductivos.entreBloques && (
                                        <Bar dataKey="entreBloques" stackId="1" fill="#3b82f6" name="Entre bloques" />
                                    )}
                                    {filterNoProductivos.entrePatios && (
                                        <Bar dataKey="entrePatios" stackId="1" fill="#ef4444" name="Entre patios" />
                                    )}
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 text-center">
                        <Info className="inline w-3 h-3 mr-1" />
                        Cada barra representa el total de movimientos durante esa hora
                    </div>
                </div>

                {/* Botón para mostrar evolución de turnos - SOLO EN VISTA SEMANAL */}
                {timeState.unit === 'week' && (
                    <div className="flex justify-center">
                        <button
                            onClick={() => setShowEvolucionTurnos(!showEvolucionTurnos)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                        >
                            <Play size={16} />
                            <span>{showEvolucionTurnos ? 'Ocultar' : 'Mostrar'} Evolución por Turnos</span>
                        </button>
                    </div>
                )}

                {/* Nueva visualización de evolución por turnos - CAMBIO: type="linear" */}
                {showEvolucionTurnos && timeState.unit === 'week' && evolucionPorTurnosData.length > 0 && (
                    <div className="space-y-4">
                        <div className="bg-slate-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-slate-200">
                                    Comparación de Movimientos por Turno - Semana Completa
                                </h4>
                                <div className="text-xs text-gray-400">
                                    Turnos: T1 (08:00-16:00) | T2 (16:00-00:00) | T3 (00:00-08:00)
                                </div>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={evolucionPorTurnosData}
                                        margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                        <XAxis
                                            dataKey="dia"
                                            stroke="#94a3b8"
                                            label={{ value: 'Día de la Semana', position: 'insideBottom', offset: -5 }}
                                        />
                                        <YAxis
                                            stroke="#94a3b8"
                                            label={{ value: 'Total Movimientos', angle: -90, position: 'insideLeft' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                border: '1px solid #475569'
                                            }}
                                            formatter={(value: any) => `${value} movimientos`}
                                        />
                                        <Legend />
                                        {/* CAMBIO: type="linear" para evitar suavizado excesivo */}
                                        <Line
                                            type="linear"
                                            dataKey="turno1"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            name="Turno 1 (08:00-16:00)"
                                            dot={{ fill: '#10b981' }}
                                            connectNulls={false}
                                        />
                                        <Line
                                            type="linear"
                                            dataKey="turno2"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            name="Turno 2 (16:00-00:00)"
                                            dot={{ fill: '#3b82f6' }}
                                            connectNulls={false}
                                        />
                                        <Line
                                            type="linear"
                                            dataKey="turno3"
                                            stroke="#f59e0b"
                                            strokeWidth={2}
                                            name="Turno 3 (00:00-08:00)"
                                            dot={{ fill: '#f59e0b' }}
                                            connectNulls={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Análisis de patrones por turno */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-700 rounded-lg p-3">
                                <div className="text-xs text-green-400 font-medium">Turno 1 (Mañana)</div>
                                <div className="text-xl font-bold text-slate-100 mt-1">
                                    {evolucionPorTurnosData.reduce((sum, d) => sum + d.turno1, 0).toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    Total movimientos semana
                                </div>
                            </div>
                            <div className="bg-slate-700 rounded-lg p-3">
                                <div className="text-xs text-blue-400 font-medium">Turno 2 (Tarde)</div>
                                <div className="text-xl font-bold text-slate-100 mt-1">
                                    {evolucionPorTurnosData.reduce((sum, d) => sum + d.turno2, 0).toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    Total movimientos semana
                                </div>
                            </div>
                            <div className="bg-slate-700 rounded-lg p-3">
                                <div className="text-xs text-orange-400 font-medium">Turno 3 (Noche)</div>
                                <div className="text-xl font-bold text-slate-100 mt-1">
                                    {evolucionPorTurnosData.reduce((sum, d) => sum + d.turno3, 0).toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    Total movimientos semana
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};