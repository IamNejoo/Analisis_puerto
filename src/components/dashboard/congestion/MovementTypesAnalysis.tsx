// src/components/dashboard/congestion/MovementTypesAnalysis.tsx
import React, { useState, useMemo } from 'react';
import {
    TrendingUp, Clock, Package, Filter, Play, Info
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, LineChart, Line,
    ComposedChart, Bar, BarChart
} from 'recharts';
import { useTimeContext } from '../../../contexts/TimeContext';

interface MovementTypesAnalysisProps {
    temporalGranularity: 'hora' | 'turno' | 'dia' | 'semana';
    currentLevel: 'terminal' | 'patio' | 'bloque';
    currentBloque?: string;
    movementTypeAnalysis: any[];
    temporalData: any;
    historicalData: any[];
    currentKPIs: any;
}

export const MovementTypesAnalysis: React.FC<MovementTypesAnalysisProps> = ({
    temporalGranularity,
    currentLevel,
    currentBloque,
    movementTypeAnalysis,
    temporalData,
    historicalData,
    currentKPIs
}) => {
    const { timeState } = useTimeContext();
    const [filterProductivos, setFilterProductivos] = useState({
        entradaGate: true,
        salidaGate: true,
        cargaBuque: true,
        descargaBuque: true
    });

    const [filterNoProductivos, setFilterNoProductivos] = useState({
        remanejosBloque: true,
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

        switch (timeState.unit) {
            case 'week':
                // Para vista semanal, mostrar los 7 días de la semana
                if (historicalData && historicalData.length > 0) {
                    // Obtener el inicio de la semana actual
                    const weekStart = new Date(timeState.currentDate);
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Domingo
                    weekStart.setHours(0, 0, 0, 0);

                    // Agrupar datos por día de la semana
                    const dailyAggregates = new Map();
                    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

                    // Inicializar todos los días con 0
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

                    historicalData.forEach(record => {
                        const date = new Date(record.hora);
                        const dayOfWeek = date.getDay(); // 0 = Domingo, 6 = Sábado

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

                    // Convertir a array ordenado por día
                    data = Array.from(dailyAggregates.entries())
                        .sort((a, b) => a[0] - b[0])
                        .map(([day, values]) => ({
                            label: dayNames[day],
                            ...values
                        }));
                }
                break;

            case 'day':
                // Para vista diaria, mostrar las 24 horas
                if (historicalData && historicalData.length > 0) {
                    // Filtrar solo el día actual
                    const currentDayStart = new Date(timeState.currentDate);
                    currentDayStart.setHours(0, 0, 0, 0);
                    const currentDayEnd = new Date(timeState.currentDate);
                    currentDayEnd.setHours(23, 59, 59, 999);

                    const dayData = historicalData.filter(record => {
                        const recordDate = new Date(record.hora);
                        return recordDate >= currentDayStart && recordDate <= currentDayEnd;
                    });

                    // Agrupar por hora
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

                    // Agregar puntos de corte para evitar interpolación incorrecta
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

            case 'shift':
                // Mostrar las 8 horas del turno actual
                const currentHour = timeState.currentDate.getHours();
                const shiftStart = Math.floor(currentHour / 8) * 8;

                if (historicalData && historicalData.length > 0) {
                    const shiftData = historicalData.filter(record => {
                        const hour = new Date(record.hora).getHours();
                        return hour >= shiftStart && hour < shiftStart + 8;
                    });

                    // Agrupar por hora del turno
                    const hourlyData = new Map();
                    for (let h = shiftStart; h < shiftStart + 8; h++) {
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
                }
                break;

            case 'hour':
                // Mostrar datos de la hora específica
                const targetHour = timeState.currentDate.getHours();
                const targetDate = new Date(timeState.currentDate);
                targetDate.setMinutes(0, 0, 0);

                if (historicalData && historicalData.length > 0) {
                    const hourData = historicalData.filter(record => {
                        const recordDate = new Date(record.hora);
                        return recordDate.getTime() === targetDate.getTime();
                    });

                    if (hourData.length > 0) {
                        // Sumar todos los movimientos de esa hora específica
                        const totals = hourData.reduce((acc, record) => ({
                            entradaGate: acc.entradaGate + (record.gateEntradaContenedores || 0),
                            salidaGate: acc.salidaGate + (record.gateSalidaContenedores || 0),
                            cargaBuque: acc.cargaBuque + (record.muelleSalidaContenedores || 0),
                            descargaBuque: acc.descargaBuque + (record.muelleEntradaContenedores || 0),
                            reacomodosBloque: acc.reacomodosBloque + (record.remanejosContenedores || 0),
                            entreBloques: acc.entreBloques + ((record.patioEntradaContenedores || 0) + (record.patioSalidaContenedores || 0)),
                            entrePatios: acc.entrePatios + ((record.terminalEntradaContenedores || 0) + (record.terminalSalidaContenedores || 0))
                        }), {
                            entradaGate: 0,
                            salidaGate: 0,
                            cargaBuque: 0,
                            descargaBuque: 0,
                            reacomodosBloque: 0,
                            entreBloques: 0,
                            entrePatios: 0
                        });

                        data = [{
                            label: `${targetHour}:00`,
                            ...totals
                        }];
                    }
                }
                break;
        }

        return data;
    }, [timeState.unit, timeState.currentDate, historicalData]);

    // Filtrar datos según checkboxes
    const filteredData = useMemo(() => {
        return processedData.map(item => {
            const filtered: any = {
                label: item.label,
                hour: item.hour // Preservar hora original si existe
            };

            // Aplicar filtro por tipo de movimiento
            if (filterTipoMovimiento === 'productivos') {
                // Solo mostrar movimientos productivos
                filtered.entradaGate = item.entradaGate || 0;
                filtered.salidaGate = item.salidaGate || 0;
                filtered.cargaBuque = item.cargaBuque || 0;
                filtered.descargaBuque = item.descargaBuque || 0;
                // No incluir movimientos no productivos
            } else if (filterTipoMovimiento === 'no-productivos') {
                // Solo mostrar movimientos no productivos
                filtered.reacomodosBloque = item.reacomodosBloque || 0;
                filtered.entreBloques = item.entreBloques || 0;
                filtered.entrePatios = item.entrePatios || 0;
                // No incluir movimientos productivos
            } else {
                // Mostrar todos según los checkboxes
                // Movimientos productivos
                if (filterProductivos.entradaGate) {
                    filtered.entradaGate = item.entradaGate || 0;
                }
                if (filterProductivos.salidaGate) {
                    filtered.salidaGate = item.salidaGate || 0;
                }
                if (filterProductivos.cargaBuque) {
                    filtered.cargaBuque = item.cargaBuque || 0;
                }
                if (filterProductivos.descargaBuque) {
                    filtered.descargaBuque = item.descargaBuque || 0;
                }

                // Movimientos no productivos
                if (filterNoProductivos.remanejosBloque) {
                    filtered.reacomodosBloque = item.reacomodosBloque || 0;
                }
                if (filterNoProductivos.entreBloques) {
                    filtered.entreBloques = item.entreBloques || 0;
                }
                if (filterNoProductivos.entrePatios) {
                    filtered.entrePatios = item.entrePatios || 0;
                }
            }

            // Calcular totales
            filtered.totalProductivos = (filtered.entradaGate || 0) + (filtered.salidaGate || 0) +
                (filtered.cargaBuque || 0) + (filtered.descargaBuque || 0);
            filtered.totalNoProductivos = (filtered.reacomodosBloque || 0) +
                (filtered.entreBloques || 0) + (filtered.entrePatios || 0);
            filtered.total = filtered.totalProductivos + filtered.totalNoProductivos;

            return filtered;
        });
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
            if (hour >= 6 && hour < 14) {
                turno = 'turno1';
            } else if (hour >= 14 && hour < 22) {
                turno = 'turno2';
            } else {
                turno = 'turno3';
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

    const getTimeUnitLabel = () => {
        switch (timeState.unit) {
            case 'week': return 'Vista Semanal - Totales por Día';
            case 'day': return 'Vista Diaria - Totales por Hora';
            case 'shift': return `Turno ${Math.floor(timeState.currentDate.getHours() / 8) + 1} - Totales por Hora`;
            case 'hour': return `Hora ${timeState.currentDate.getHours()}:00 - Total`;
            default: return 'Período';
        }
    };

    // Si no hay datos para mostrar
    if (filteredData.length === 0) {
        return (
            <div className="bg-slate-700 rounded-lg p-8 text-center">
                <p className="text-slate-400">No hay datos disponibles para el período seleccionado</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
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
                                    checked={filterNoProductivos.remanejosBloque}
                                    onChange={(e) => setFilterNoProductivos({ ...filterNoProductivos, remanejosBloque: e.target.checked })}
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
                    {currentLevel === 'bloque' && timeState.unit === 'hour' && (
                        <span className="text-xs font-normal text-slate-400 ml-2">
                            - Valores únicos para bloque {currentBloque}
                        </span>
                    )}
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

                                {/* Movimientos Productivos - CAMBIO: type="linear" */}
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
                                {filterNoProductivos.remanejosBloque && (
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
                                {filterNoProductivos.remanejosBloque && (
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

            {/* Nueva visualización de evolución por turnos con 3 curvas */}
            {showEvolucionTurnos && timeState.unit === 'week' && evolucionPorTurnosData.length > 0 && (
                <div className="space-y-4">
                    <div className="bg-slate-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-slate-200">
                                Comparación de Movimientos por Turno - Semana Completa
                            </h4>
                            <div className="text-xs text-gray-400">
                                Turnos: T1 (8-16h) | T2 (16-00h) | T3 (00-8h)
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
                                        name="Turno 1 (8:00-16:00)"
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
                                        name="Turno 3 (00:00-8:00)"
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
    );
};