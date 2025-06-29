// src/components/map/MovementAnalysisPanel.tsx
import React, { useState, useMemo } from 'react';
import {
    TrendingUp, Clock, Package, Filter, Play, ChevronLeft, BarChart3, Building
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

    // Hook para agregaciones temporales
    const temporalData = useTemporalAggregation(historicalData);

    // Estados copiados exactamente del componente original
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
    const [numeroTurnos, setNumeroTurnos] = useState(21);
    const [chartType, setChartType] = useState<'area' | 'bar'>('area');

    // Procesar datos según el unit temporal global - COPIADO EXACTAMENTE DEL ORIGINAL
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
                // Para vista diaria, mostrar las 24 horas (como está actualmente)
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

                    data = Array.from(hourlyData.entries())
                        .map(([hour, values]) => ({
                            label: `${hour}:00`,
                            ...values
                        }));
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
                            label: `${hour}:00`,
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

    // Filtrar datos según checkboxes - COPIADO EXACTAMENTE DEL ORIGINAL
    const filteredData = useMemo(() => {
        return processedData.map(item => {
            const filtered: any = {
                label: item.label
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

    // Datos para evolución de turnos - COPIADO EXACTAMENTE DEL ORIGINAL
    const evolucionTurnosData = useMemo(() => {
        if (!temporalData.turno || temporalData.turno.length === 0) return [];

        return temporalData.turno.slice(0, numeroTurnos).map((t: any, index: number) => ({
            turno: `T${index + 1}`,
            movimientosProductivos: t.movimientosProductivos || 0,
            movimientosNoProductivos: t.movimientosNoProductivos || 0,
            congestionScore: t.congestionScore || 0,
            flujoNeto: t.flujoNeto || 0
        }));
    }, [temporalData.turno, numeroTurnos]);

    // Para el cálculo de hora pico
    const movementTypeAnalysis = useMemo(() => {
        if (!historicalData || historicalData.length === 0) return [];

        const hourlyData = new Map();
        for (let hour = 0; hour < 24; hour++) {
            hourlyData.set(hour, {
                hora: `${hour}:00`,
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
            case 'shift': return `Turno ${Math.floor(timeState.currentDate.getHours() / 8) + 1} - Totales por Hora`;
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

    // TODO EL RETURN DEL COMPONENTE ORIGINAL CON SELECTOR DE PATIO AGREGADO
    return (
        <div className="bg-slate-900/90 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-slate-700/50 max-h-[90vh] overflow-y-auto">
            <div className="min-w-[800px] max-w-[1000px] space-y-6">
                {/* Header con selector de patio */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                    <div className="flex items-center space-x-4">
                        <h3 className="text-sm font-bold text-slate-100 flex items-center">
                            <BarChart3 className="mr-2 text-cyan-400" size={16} />
                            Análisis de Movimientos
                        </h3>

                        {/* Selector de Patio AGREGADO */}
                        <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4 text-slate-400" />
                            <select
                                value={selectedPatio}
                                onChange={(e) => setSelectedPatio(e.target.value as any)}
                                className="px-3 py-1 bg-slate-800 text-slate-200 rounded text-sm border border-slate-600"
                            >
                                <option value="all">Terminal Completo</option>
                                <option value="costanera">Costanera (C1-C9)</option>
                                <option value="tebas">tebas (T1-T4)</option>
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

                {/* TODO EL CONTENIDO COPIADO EXACTAMENTE DEL ORIGINAL */}
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
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'area' ? (
                                <AreaChart
                                    data={filteredData}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                    <XAxis dataKey="label" stroke="#94a3b8" />
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
                                        <Area type="monotone" dataKey="entradaGate" stackId="1"
                                            stroke="#10b981" fill="#10b981" fillOpacity={0.8} name="Entrada Gate" />
                                    )}
                                    {filterProductivos.salidaGate && (
                                        <Area type="monotone" dataKey="salidaGate" stackId="1"
                                            stroke="#34d399" fill="#34d399" fillOpacity={0.8} name="Salida Gate" />
                                    )}
                                    {filterProductivos.descargaBuque && (
                                        <Area type="monotone" dataKey="descargaBuque" stackId="1"
                                            stroke="#6ee7b7" fill="#6ee7b7" fillOpacity={0.8} name="Descarga Buque" />
                                    )}
                                    {filterProductivos.cargaBuque && (
                                        <Area type="monotone" dataKey="cargaBuque" stackId="1"
                                            stroke="#a7f3d0" fill="#a7f3d0" fillOpacity={0.8} name="Carga Buque" />
                                    )}

                                    {/* Movimientos No Productivos */}
                                    {filterNoProductivos.remanejosBloque && (
                                        <Area type="monotone" dataKey="reacomodosBloque" stackId="1"
                                            stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.8} name="Reacomodos en bloque" />
                                    )}
                                    {filterNoProductivos.entreBloques && (
                                        <Area type="monotone" dataKey="entreBloques" stackId="1"
                                            stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.8} name="Entre bloques" />
                                    )}
                                    {filterNoProductivos.entrePatios && (
                                        <Area type="monotone" dataKey="entrePatios" stackId="1"
                                            stroke="#ef4444" fill="#ef4444" fillOpacity={0.8} name="Entre patios" />
                                    )}
                                </AreaChart>
                            ) : (
                                <BarChart
                                    data={filteredData}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                    <XAxis dataKey="label" stroke="#94a3b8" />
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
                </div>

                {/* Botón para mostrar evolución de turnos */}
                <div className="flex justify-center">
                    <button
                        onClick={() => setShowEvolucionTurnos(!showEvolucionTurnos)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                    >
                        <Play size={16} />
                        <span>{showEvolucionTurnos ? 'Ocultar' : 'Mostrar'} Evolución de Turnos</span>
                    </button>
                </div>

                {/* Evolución de Turnos */}
                {showEvolucionTurnos && evolucionTurnosData.length > 0 && (
                    <div className="space-y-4">
                        <div className="bg-slate-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-slate-200">
                                    Evolución de Movimientos por Turno
                                </h4>
                                <div className="flex items-center space-x-2">
                                    <label className="text-sm text-slate-400">Número de turnos:</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={numeroTurnos}
                                        onChange={(e) => setNumeroTurnos(Number(e.target.value))}
                                        className="w-16 px-2 py-1 bg-slate-600 text-white rounded text-sm"
                                    />
                                </div>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={evolucionTurnosData}
                                        margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                        <XAxis
                                            dataKey="turno"
                                            stroke="#94a3b8"
                                            label={{ value: 'Turno', position: 'insideBottom', offset: -5 }}
                                        />
                                        <YAxis stroke="#94a3b8" />
                                        <YAxis yAxisId="right" orientation="right" stroke="#ef4444" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                border: '1px solid #475569'
                                            }}
                                            formatter={(value: any) => `${value} cont`}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="movimientosProductivos"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            name="Movimientos Productivos"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="movimientosNoProductivos"
                                            stroke="#f59e0b"
                                            strokeWidth={2}
                                            name="Movimientos No Productivos"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="congestionScore"
                                            stroke="#ef4444"
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            name="Score Congestión"
                                            yAxisId="right"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Métricas resumen */}
                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-slate-700 rounded-lg p-3">
                                <div className="text-xs text-slate-400">Promedio Productividad</div>
                                <div className="text-xl font-bold text-green-400">
                                    {(() => {
                                        const totalProd = evolucionTurnosData.reduce((sum: number, t: { movimientosProductivos: number }) => sum + t.movimientosProductivos, 0);
                                        const totalNoProd = evolucionTurnosData.reduce((sum: number, t: { movimientosNoProductivos: number }) => sum + t.movimientosNoProductivos, 0);
                                        const total = totalProd + totalNoProd;
                                        return total > 0 ? `${((totalProd / total) * 100).toFixed(1)}%` : '0%';
                                    })()}
                                </div>
                            </div>
                            <div className="bg-slate-700 rounded-lg p-3">
                                <div className="text-xs text-slate-400">Turno Más Congestionado</div>
                                <div className="text-xl font-bold text-red-400">
                                    {evolucionTurnosData.reduce(
                                        (max: { congestionScore: number; turno: string }, t: { congestionScore: number; turno: string }) =>
                                            t.congestionScore > max.congestionScore ? t : max,
                                        evolucionTurnosData[0]
                                    ).turno}
                                </div>
                            </div>
                            <div className="bg-slate-700 rounded-lg p-3">
                                <div className="text-xs text-slate-400">Total Movimientos</div>
                                <div className="text-xl font-bold text-blue-400">
                                    {evolucionTurnosData.reduce(
                                        (sum: number, t: { movimientosProductivos: number; movimientosNoProductivos: number }) =>
                                            sum + t.movimientosProductivos + t.movimientosNoProductivos,
                                        0
                                    ).toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-slate-700 rounded-lg p-3">
                                <div className="text-xs text-slate-400">Flujo Neto Promedio</div>
                                <div className="text-xl font-bold text-cyan-400">
                                    {(evolucionTurnosData.reduce((sum: number, t: { flujoNeto: number }) => sum + t.flujoNeto, 0) /
                                        evolucionTurnosData.length).toFixed(0)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Desglose detallado de movimientos */}
                <div className="bg-slate-700 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-slate-200 mb-3">
                        Desglose Detallado de Movimientos
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Productivos */}
                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-green-400 font-medium mb-2">Movimientos Productivos</div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-300">Entrada Gate:</span>
                                    <span className="text-sm font-medium text-green-400">
                                        {historicalData.reduce((sum, d) => sum + (d.gateEntradaContenedores || 0), 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-300">Salida Gate:</span>
                                    <span className="text-sm font-medium text-green-400">
                                        {historicalData.reduce((sum, d) => sum + (d.gateSalidaContenedores || 0), 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-300">Descarga Buque:</span>
                                    <span className="text-sm font-medium text-green-400">
                                        {historicalData.reduce((sum, d) => sum + (d.muelleEntradaContenedores || 0), 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-300">Carga Buque:</span>
                                    <span className="text-sm font-medium text-green-400">
                                        {historicalData.reduce((sum, d) => sum + (d.muelleSalidaContenedores || 0), 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="border-t border-slate-700 mt-2 pt-2">
                                    <div className="flex justify-between font-medium">
                                        <span className="text-sm text-green-300">Total Productivos:</span>
                                        <span className="text-sm text-green-300">
                                            {historicalData.reduce((sum, d) =>
                                                sum + (d.gateEntradaContenedores || 0) + (d.gateSalidaContenedores || 0) +
                                                (d.muelleEntradaContenedores || 0) + (d.muelleSalidaContenedores || 0), 0
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* No Productivos */}
                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-orange-400 font-medium mb-2">Movimientos No Productivos (Reacomodos)</div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-300">Dentro del bloque:</span>
                                    <span className="text-sm font-medium text-orange-400">
                                        {historicalData.reduce((sum, d) => sum + (d.remanejosContenedores || 0), 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-300">Entre bloques:</span>
                                    <span className="text-sm font-medium text-orange-400">
                                        {historicalData.reduce((sum, d) => sum + (d.patioEntradaContenedores || 0) + (d.patioSalidaContenedores || 0), 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-300">Entre patios:</span>
                                    <span className="text-sm font-medium text-orange-400">
                                        {historicalData.reduce((sum, d) => sum + (d.terminalEntradaContenedores || 0) + (d.terminalSalidaContenedores || 0), 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="border-t border-slate-700 mt-2 pt-2">
                                    <div className="flex justify-between font-medium">
                                        <span className="text-sm text-orange-300">Total No Productivos:</span>
                                        <span className="text-sm text-orange-300">
                                            {historicalData.reduce((sum, d) =>
                                                sum + (d.remanejosContenedores || 0) + (d.patioEntradaContenedores || 0) +
                                                (d.patioSalidaContenedores || 0) + (d.terminalEntradaContenedores || 0) +
                                                (d.terminalSalidaContenedores || 0), 0
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Indicador de umbral 70% */}
                {currentKPIs?.utilizacionPorVolumen && currentKPIs.utilizacionPorVolumen > 70 && (
                    <div className="bg-yellow-950/20 rounded-lg p-4 border border-yellow-700">
                        <p className="text-sm text-yellow-300">
                            ⚠️ Con ocupación al {currentKPIs.utilizacionPorVolumen.toFixed(1)}%,
                            los reacomodos aumentan significativamente (umbral San Antonio: 70%)
                        </p>
                    </div>
                )}

                {/* Métricas de eficiencia general */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-400">Ratio Productivo</span>
                            <TrendingUp className="text-green-400" size={20} />
                        </div>
                        <div className="text-2xl font-bold text-slate-100">
                            {(() => {
                                const totalProd = historicalData.reduce((sum, d) =>
                                    sum + (d.gateEntradaContenedores || 0) + (d.gateSalidaContenedores || 0) +
                                    (d.muelleEntradaContenedores || 0) + (d.muelleSalidaContenedores || 0), 0
                                );
                                const totalNoProd = historicalData.reduce((sum, d) =>
                                    sum + (d.remanejosContenedores || 0) + (d.patioEntradaContenedores || 0) +
                                    (d.patioSalidaContenedores || 0) + (d.terminalEntradaContenedores || 0) +
                                    (d.terminalSalidaContenedores || 0), 0
                                );
                                const total = totalProd + totalNoProd;
                                return total > 0 ? `${((totalProd / total) * 100).toFixed(1)}%` : '0%';
                            })()}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Movimientos que agregan valor
                        </p>
                    </div>

                    <div className="bg-slate-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-400">Hora Pico</span>
                            <Clock className="text-yellow-400" size={20} />
                        </div>
                        <div className="text-2xl font-bold text-slate-100">
                            {(() => {
                                // Buscar la hora con más movimientos en movementTypeAnalysis
                                const horaPico = movementTypeAnalysis.reduce((max, h) =>
                                    h.total > (max.total || 0) ? h : max,
                                    movementTypeAnalysis[0]
                                );
                                return horaPico?.hora || 'N/A';
                            })()}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Mayor actividad del período
                        </p>
                    </div>

                    <div className="bg-slate-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-400">Reacomodos/Hora</span>
                            <Package className="text-red-400" size={20} />
                        </div>
                        <div className="text-2xl font-bold text-slate-100">
                            {historicalData.length > 0 ?
                                (historicalData.reduce((sum, d) => sum + (d.remanejosContenedores || 0), 0) /
                                    historicalData.length).toFixed(1) : '0'
                            }
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Promedio de movimientos dentro del bloque
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};