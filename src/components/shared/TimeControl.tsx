// src/components/shared/TimeControl.tsx
import React, { useMemo } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Calendar,
    Clock,
    BarChart3,
    CalendarDays,
    Timer
} from 'lucide-react';
import { useTimeContext } from '../../contexts/TimeContext';
import type { TimeUnit } from '../../types';
import { getISOWeekNumber, getISOYear, getISOWeekDateRange } from '../../utils/isoWeekUtils';
interface TimeControlProps {
    className?: string;
}

export const TimeControl: React.FC<TimeControlProps> = ({ className = '' }) => {
    const {
        timeState,
        setTimeUnit,
        setCurrentDate, // Ahora está disponible
        goToPreviousPeriod,
        goToNextPeriod,
        resetToNow,
        getDisplayFormat
    } = useTimeContext();

    // Solo mostrar para datos históricos
    if (timeState.dataSource !== 'historical') {
        return null;
    }

    // Actualizar las opciones de granularidad
    const timeUnits: { value: TimeUnit; label: string; icon: React.ReactNode }[] = [
        { value: 'week', label: 'Semana', icon: <Calendar size={16} /> },
        { value: 'day', label: 'Día', icon: <CalendarDays size={16} /> },
        { value: 'shift', label: 'Turno', icon: <Clock size={16} /> },
        { value: 'hour', label: 'Hora', icon: <Timer size={16} /> }
    ];

    // Formatear la fecha actual según la unidad
    const formatCurrentPeriod = useMemo(() => {
        const date = new Date(timeState.currentDate);

        switch (timeState.unit) {
            case 'week': {
                const weekNumber = getISOWeekNumber(date);
                const year = getISOYear(date);
                const { startDate, endDate } = getISOWeekDateRange(weekNumber, year);

                return `${startDate.toLocaleDateString('es-CL', {
                    day: 'numeric',
                    month: 'short'
                })} - ${endDate.toLocaleDateString('es-CL', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                })}`;
            }

            case 'day':
                return date.toLocaleDateString('es-CL', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });

            case 'shift': {
                const hour = date.getHours();
                let turno = '';
                let horario = '';

                if (hour >= 8 && hour < 16) {
                    turno = 'Turno 1';
                    horario = '08:00 - 16:00';
                } else if (hour >= 16 && hour < 24) {
                    turno = 'Turno 2';
                    horario = '16:00 - 00:00';
                } else {
                    turno = 'Turno 3';
                    horario = '00:00 - 08:00';
                }

                return `${date.toLocaleDateString('es-CL', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                })} - ${turno} (${horario})`;
            }

            case 'hour':
                return date.toLocaleDateString('es-CL', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

            default:
                return date.toLocaleDateString('es-CL');
        }
    }, [timeState.currentDate, timeState.unit]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        if (newDate) {
            setCurrentDate(newDate); // Ahora funciona correctamente
        }
    };

    const getDateInputValue = () => {
        const date = new Date(timeState.currentDate);
        if (timeState.unit === 'hour') {
            // Para hora, usar datetime-local
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        } else {
            // Para otros, usar date
            return date.toISOString().split('T')[0];
        }
    };

    const getGranularityDescription = () => {
        switch (timeState.unit) {
            case 'week':
                return 'Mostrando resumen semanal de datos';
            case 'day':
                return 'Mostrando datos agregados por día';
            case 'shift':
                return 'Mostrando datos del turno actual';
            case 'hour':
                return 'Mostrando datos detallados por hora';
            default:
                return 'Mostrando datos';
        }
    };

    return (
        <div className={`bg-slate-700 rounded-lg shadow-sm border border-slate-600 ${className}`}>
            <div className="p-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Selector de granularidad temporal */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Timer className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-300">Granularidad:</span>
                        </div>
                        <div className="flex gap-1">
                            {timeUnits.map((tu) => (
                                <button
                                    key={tu.value}
                                    onClick={() => setTimeUnit(tu.value)}
                                    className={`
                    flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium 
                    transition-all duration-200
                    ${timeState.unit === tu.value
                                            ? 'bg-cyan-600 text-white shadow-sm'
                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-600 border border-slate-600'
                                        }
                  `}
                                >
                                    {tu.icon}
                                    <span className="hidden lg:inline">{tu.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Controles de navegación temporal */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={goToPreviousPeriod}
                            className="p-1.5 rounded-md hover:bg-slate-600 transition-colors"
                            title={`${timeState.unit === 'hour' ? 'Hora' :
                                timeState.unit === 'day' ? 'Día' :
                                    timeState.unit === 'week' ? 'Semana' :
                                        'Año'} anterior`}
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-300" />
                        </button>

                        <div className="flex items-center gap-2 min-w-[280px] justify-center 
                          bg-slate-800 px-3 py-1.5 rounded-md border border-slate-600">
                            <span className="text-sm font-medium text-slate-100">
                                {formatCurrentPeriod}
                            </span>
                            <input
                                type={timeState.unit === 'hour' ? 'datetime-local' : 'date'}
                                value={getDateInputValue()}
                                onChange={handleDateChange}
                                className="sr-only"
                                id="date-picker"
                            />
                            <label
                                htmlFor="date-picker"
                                className="cursor-pointer p-1 hover:bg-slate-700 rounded transition-colors"
                                title="Seleccionar fecha"
                            >
                                <Calendar className="w-4 h-4 text-slate-400" />
                            </label>
                        </div>

                        <button
                            onClick={goToNextPeriod}
                            className="p-1.5 rounded-md hover:bg-slate-600 transition-colors"
                            title={`${timeState.unit === 'hour' ? 'Hora' :
                                timeState.unit === 'day' ? 'Día' :
                                    timeState.unit === 'week' ? 'Semana' :
                                        'Año'} siguiente`}
                        >
                            <ChevronRight className="w-5 h-5 text-slate-300" />
                        </button>

                        <div className="border-l border-slate-600 pl-2 ml-1">
                            <button
                                onClick={resetToNow}
                                className="px-3 py-1.5 text-sm font-medium text-slate-300 
                         bg-slate-800 rounded-md hover:bg-slate-600 transition-colors border border-slate-600"
                                title="Volver al período actual"
                            >
                                Hoy
                            </button>
                        </div>
                    </div>
                </div>

                {/* Indicador de estado */}
                <div className="mt-3 pt-2 border-t border-slate-600">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                            {getGranularityDescription()}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            {/* Aquí podrías agregar indicadores adicionales si es necesario */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};