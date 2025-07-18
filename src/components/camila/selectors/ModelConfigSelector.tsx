// components/camila/selectors/ModelConfigSelector.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, Clock, Percent, Shuffle, Filter, RefreshCw, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';
import type { CamilaConfig } from '../../../types/camila';
import { useResultadosDisponibles } from '../../../hooks/useCamilaData';

interface ModelConfigSelectorProps {
    config: CamilaConfig;
    onChange: (config: CamilaConfig) => void;
    availableResults?: any[];
}

type GroupByType = 'none' | 'semana' | 'turno' | 'hora' | 'dia';

export const ModelConfigSelector: React.FC<ModelConfigSelectorProps> = ({
    config,
    onChange,
    availableResults
}) => {
    const { data: resultadosList, loading, error } = useResultadosDisponibles();
    const [groupBy, setGroupBy] = useState<GroupByType>('none');
    const [showOnlyWithData, setShowOnlyWithData] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

    const results = availableResults || resultadosList?.resultados || [];

    // Estados para opciones disponibles
    const [availableOptions, setAvailableOptions] = useState({
        years: [] as number[],
        weeks: [] as number[],
        turnos: [] as number[],
        participations: [] as number[],
        dispersions: [] as string[]
    });

    // Procesar datos disponibles
    useEffect(() => {
        if (results.length === 0) {
            setAvailableOptions({
                years: [2022, 2023],
                weeks: Array.from({ length: 52 }, (_, i) => i + 1),
                turnos: Array.from({ length: 21 }, (_, i) => i + 1),
                participations: [60, 65, 68, 70, 75, 80],
                dispersions: ['K', 'N']
            });
            return;
        }

        const years = [...new Set(results.map(r => r.anio))].sort();
        const weeks = [...new Set(results.map(r => r.semana))].sort((a, b) => a - b);
        const turnos = [...new Set(results.map(r => r.turno))].sort((a, b) => a - b);
        const participations = [...new Set(results.map(r => r.participacion))].sort((a, b) => a - b);
        const dispersions = [...new Set(results.map(r => r.dispersion))];

        setAvailableOptions({
            years: years.length > 0 ? years : [config.anio],
            weeks: weeks.length > 0 ? weeks : [config.semana],
            turnos: turnos.length > 0 ? turnos : [config.turno],
            participations: participations.length > 0 ? participations : [config.participacion],
            dispersions: dispersions.length > 0 ? dispersions : ['K', 'N']
        });
    }, [results, config]);

    // Filtrar opciones según el contexto actual
    const filteredOptions = useMemo(() => {
        if (!showOnlyWithData || results.length === 0) {
            return availableOptions;
        }

        const yearResults = results.filter(r => r.anio === config.anio);
        const weeks = [...new Set(yearResults.map(r => r.semana))].sort((a, b) => a - b);

        const weekResults = yearResults.filter(r => r.semana === config.semana);
        const turnos = [...new Set(weekResults.map(r => r.turno))].sort((a, b) => a - b);

        const turnoResults = weekResults.filter(r => r.turno === config.turno);
        const participations = [...new Set(turnoResults.map(r => r.participacion))].sort((a, b) => a - b);

        return {
            ...availableOptions,
            weeks: weeks.length > 0 ? weeks : [config.semana],
            turnos: turnos.length > 0 ? turnos : [config.turno],
            participations: participations.length > 0 ? participations : [config.participacion]
        };
    }, [availableOptions, results, config, showOnlyWithData]);

    // Agrupar resultados según el criterio seleccionado
    const groupedResults = useMemo(() => {
        if (results.length === 0 || groupBy === 'none') {
            return null;
        }

        const yearResults = results.filter(r => r.anio === config.anio);
        const grouped = new Map<string, typeof yearResults>();

        yearResults.forEach(result => {
            let key = '';
            switch (groupBy) {
                case 'semana':
                    key = `S${result.semana}`;
                    break;
                case 'turno':
                    const turnoDelDia = ((result.turno - 1) % 3) + 1;
                    const tipoTurno = ['Mañana', 'Tarde', 'Noche'][turnoDelDia - 1];
                    key = tipoTurno;
                    break;
                case 'hora':
                    const hora = getHoraFromTurno(result.turno);
                    key = `${hora.toString().padStart(2, '0')}:00`;
                    break;
                case 'dia':
                    const dia = Math.ceil(result.turno / 3);
                    const nombreDia = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][dia - 1];
                    key = nombreDia || `Día ${dia}`;
                    break;
            }

            if (!grouped.has(key)) {
                grouped.set(key, []);
            }
            grouped.get(key)!.push(result);
        });

        return grouped;
    }, [results, config.anio, groupBy]);

    // Manejar selección de grupo
    const handleGroupSelection = (groupKey: string) => {
        if (!groupedResults) return;

        const groupResults = groupedResults.get(groupKey);
        if (!groupResults || groupResults.length === 0) return;

        // Seleccionar el mejor resultado del grupo (mayor accuracy o más reciente)
        const bestResult = groupResults.sort((a, b) => {
            if (a.accuracy !== b.accuracy) {
                return (b.accuracy || 0) - (a.accuracy || 0);
            }
            return b.turno - a.turno;
        })[0];

        // Cambiar la configuración al mejor resultado del grupo
        onChange({
            anio: bestResult.anio,
            semana: bestResult.semana,
            turno: bestResult.turno,
            participacion: bestResult.participacion,
            dispersion: bestResult.dispersion as 'K' | 'N'
        });

        setSelectedGroup(groupKey);
    };

    // Verificar si existe data para la configuración actual
    const hasDataForCurrentConfig = useMemo(() => {
        return results.some(r =>
            r.anio === config.anio &&
            r.semana === config.semana &&
            r.turno === config.turno &&
            r.participacion === config.participacion &&
            r.dispersion === config.dispersion
        );
    }, [results, config]);

    // Calcular info del turno
    const turnoInfo = useMemo(() => {
        const dia = Math.ceil(config.turno / 3);
        const turnoDelDia = ((config.turno - 1) % 3) + 1;
        const hora = getHoraFromTurno(config.turno);
        const nombreDia = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][dia - 1];

        return {
            dia,
            nombreDia: nombreDia || `Día ${dia}`,
            turnoDelDia,
            tipoTurno: ['Mañana', 'Tarde', 'Noche'][turnoDelDia - 1],
            hora,
            horario: `${hora.toString().padStart(2, '0')}:00 - ${((hora + 8) % 24).toString().padStart(2, '0')}:00`
        };
    }, [config.turno]);

    // Función auxiliar para obtener hora desde turno
    function getHoraFromTurno(turno: number): number {
        const turnoDelDia = ((turno - 1) % 3) + 1;
        return turnoDelDia === 1 ? 8 : turnoDelDia === 2 ? 16 : 0;
    }

    // Resetear grupo seleccionado cuando cambia la agrupación
    useEffect(() => {
        setSelectedGroup(null);
    }, [groupBy]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <RefreshCw className="animate-spin text-teal-400 mr-2" size={20} />
                <span className="text-slate-300">Cargando configuraciones...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">Configuración del Modelo</h3>

                {/* Controles de agrupación */}
                <div className="flex items-center space-x-4">
                    <label className="flex items-center text-sm text-slate-300">
                        <input
                            type="checkbox"
                            checked={showOnlyWithData}
                            onChange={(e) => setShowOnlyWithData(e.target.checked)}
                            className="mr-2 rounded bg-slate-700 border-slate-600"
                        />
                        Solo con datos
                    </label>

                    <div className="flex items-center space-x-2">
                        <Filter size={16} className="text-slate-400" />
                        <select
                            value={groupBy}
                            onChange={(e) => setGroupBy(e.target.value as GroupByType)}
                            className="bg-slate-700 border-slate-600 text-slate-100 rounded px-3 py-1 text-sm"
                        >
                            <option value="none">Sin agrupar</option>
                            <option value="semana">Por Semana</option>
                            <option value="turno">Por Turno del Día</option>
                            <option value="hora">Por Hora</option>
                            <option value="dia">Por Día</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Vista agrupada si está activa */}
            {groupBy !== 'none' && groupedResults && groupedResults.size > 0 && (
                <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center">
                        <BarChart3 size={16} className="mr-2" />
                        Seleccionar {groupBy === 'semana' ? 'Semana' :
                            groupBy === 'turno' ? 'Turno del Día' :
                                groupBy === 'hora' ? 'Hora' : 'Día'}
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                        {Array.from(groupedResults.entries()).map(([key, results]) => {
                            const avgAccuracy = results.reduce((sum, r) => sum + (r.accuracy || 0), 0) / results.length;
                            const isSelected = selectedGroup === key;
                            const hasCurrentConfig = results.some(r =>
                                r.anio === config.anio &&
                                r.semana === config.semana &&
                                r.turno === config.turno &&
                                r.participacion === config.participacion &&
                                r.dispersion === config.dispersion
                            );

                            return (
                                <button
                                    key={key}
                                    onClick={() => handleGroupSelection(key)}
                                    className={`
                                        p-3 rounded-lg border transition-all text-left
                                        ${isSelected || hasCurrentConfig
                                            ? 'bg-teal-700 border-teal-600 text-white'
                                            : 'bg-slate-800 border-slate-600 hover:bg-slate-700 text-slate-100'
                                        }
                                    `}
                                >
                                    <div className="font-medium text-sm">{key}</div>
                                    <div className="text-xs mt-1 opacity-80">
                                        {results.length} turno{results.length !== 1 ? 's' : ''}
                                    </div>
                                    {avgAccuracy > 0 && (
                                        <div className="text-xs mt-1">
                                            <span className={`font-medium ${avgAccuracy >= 80 ? 'text-green-300' :
                                                avgAccuracy >= 60 ? 'text-yellow-300' :
                                                    'text-red-300'
                                                }`}>
                                                {avgAccuracy.toFixed(0)}% acc
                                            </span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Año */}
                <div>
                    <label className="flex items-center text-xs font-medium text-slate-400 mb-1">
                        <Calendar size={14} className="mr-1" />
                        Año
                    </label>
                    <select
                        value={config.anio}
                        onChange={(e) => onChange({ ...config, anio: +e.target.value, turno: 1 })}
                        className="w-full bg-slate-700 border-slate-600 text-slate-100 rounded px-3 py-2 text-sm"
                    >
                        {filteredOptions.years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                {/* Semana */}
                <div>
                    <label className="flex items-center text-xs font-medium text-slate-400 mb-1">
                        <Calendar size={14} className="mr-1" />
                        Semana
                    </label>
                    <select
                        value={config.semana}
                        onChange={(e) => onChange({ ...config, semana: +e.target.value, turno: 1 })}
                        className="w-full bg-slate-700 border-slate-600 text-slate-100 rounded px-3 py-2 text-sm"
                        disabled={groupBy === 'semana'}
                    >
                        {filteredOptions.weeks.map(week => {
                            const count = results.filter(r =>
                                r.anio === config.anio && r.semana === week
                            ).length;

                            return (
                                <option key={week} value={week}>
                                    S{week} {count > 0 && `(${count})`}
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* Turno */}
                <div>
                    <label className="flex items-center text-xs font-medium text-slate-400 mb-1">
                        <Clock size={14} className="mr-1" />
                        Turno
                    </label>
                    <select
                        value={config.turno}
                        onChange={(e) => onChange({ ...config, turno: +e.target.value })}
                        className="w-full bg-slate-700 border-slate-600 text-slate-100 rounded px-3 py-2 text-sm"
                        disabled={groupBy === 'turno' || groupBy === 'hora' || groupBy === 'dia'}
                    >
                        {filteredOptions.turnos.map(turno => {
                            const hasData = results.some(r =>
                                r.anio === config.anio &&
                                r.semana === config.semana &&
                                r.turno === turno
                            );

                            return (
                                <option key={turno} value={turno}>
                                    T{turno} {hasData && '✓'}
                                </option>
                            );
                        })}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                        {turnoInfo.nombreDia}, {turnoInfo.tipoTurno} ({turnoInfo.horario})
                    </p>
                </div>

                {/* Participación */}
                <div>
                    <label className="flex items-center text-xs font-medium text-slate-400 mb-1">
                        <Percent size={14} className="mr-1" />
                        Participación
                    </label>
                    <select
                        value={config.participacion}
                        onChange={(e) => onChange({ ...config, participacion: +e.target.value })}
                        className="w-full bg-slate-700 border-slate-600 text-slate-100 rounded px-3 py-2 text-sm"
                    >
                        {filteredOptions.participations.map(p => (
                            <option key={p} value={p}>{p}%</option>
                        ))}
                    </select>
                </div>

                {/* Dispersión */}
                <div>
                    <label className="flex items-center text-xs font-medium text-slate-400 mb-1">
                        <Shuffle size={14} className="mr-1" />
                        Dispersión
                    </label>
                    <div className="flex space-x-2">
                        <button
                            type="button"
                            onClick={() => onChange({ ...config, dispersion: 'K' })}
                            className={`flex-1 py-2 px-3 rounded text-sm transition-colors ${config.dispersion === 'K'
                                ? 'bg-teal-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                        >
                            Con
                        </button>
                    </div>
                </div>
            </div>

            {/* Estado de disponibilidad */}
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded">
                <div className="flex items-center">
                    {hasDataForCurrentConfig ? (
                        <>
                            <CheckCircle className="text-green-400 mr-2" size={16} />
                            <span className="text-sm text-green-400">Datos disponibles</span>
                        </>
                    ) : (
                        <>
                            <AlertCircle className="text-slate-400 mr-2" size={16} />
                            <span className="text-sm text-slate-400">Sin datos para esta configuración</span>
                        </>
                    )}
                </div>

                {resultadosList && (
                    <span className="text-xs text-slate-500">
                        {resultadosList.total || results.length} resultados totales
                    </span>
                )}
            </div>
        </div>
    );
};

export default ModelConfigSelector;