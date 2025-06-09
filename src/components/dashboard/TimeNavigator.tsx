// src/components/dashboard/TimeNavigator.tsx
import React, { useState, useEffect } from 'react';
import {
    Calendar, Clock, ChevronLeft, ChevronRight,
    Play, Pause, RotateCcw, CalendarDays,
    Timer, CalendarRange
} from 'lucide-react';

export type TimeGranularity = 'year' | 'month' | 'week' | 'day' | 'hour';

interface TimeNavigatorProps {
    onTimeChange: (startDate: Date, endDate: Date, granularity: TimeGranularity) => void;
    minDate?: Date;
    maxDate?: Date;
}

export const TimeNavigator: React.FC<TimeNavigatorProps> = ({
    onTimeChange,
    minDate = new Date('2022-01-01T00:00:00'),
    maxDate = new Date('2022-12-31T23:59:59')
}) => {
    const [currentDate, setCurrentDate] = useState(new Date('2022-01-01T00:00:00'));
    const [granularity, setGranularity] = useState<TimeGranularity>('day');
    const [isPlaying, setIsPlaying] = useState(false);
    const [playSpeed, setPlaySpeed] = useState(1000); // ms entre pasos

    // Función para obtener el rango de fechas según la granularidad
    const getDateRange = (date: Date, gran: TimeGranularity): [Date, Date] => {
        const start = new Date(date);
        const end = new Date(date);

        switch (gran) {
            case 'year':
                start.setMonth(0, 1);
                start.setHours(0, 0, 0, 0);
                end.setFullYear(date.getFullYear() + 1);
                end.setMonth(0, 1);
                end.setHours(0, 0, 0, -1);
                break;

            case 'month':
                start.setDate(1);
                start.setHours(0, 0, 0, 0);
                end.setMonth(date.getMonth() + 1, 1);
                end.setHours(0, 0, 0, -1);
                break;

            case 'week':
                const dayOfWeek = date.getDay();
                const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                start.setDate(diff);
                start.setHours(0, 0, 0, 0);
                end.setDate(start.getDate() + 6);
                end.setHours(23, 59, 59, 999);
                break;

            case 'day':
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                break;

            case 'hour':
                start.setMinutes(0, 0, 0);
                end.setMinutes(59, 59, 999);
                break;
        }

        return [start, end];
    };

    // Función para navegar en el tiempo
    const navigate = (direction: 'forward' | 'backward') => {
        const newDate = new Date(currentDate);

        switch (granularity) {
            case 'year':
                newDate.setFullYear(newDate.getFullYear() + (direction === 'forward' ? 1 : -1));
                break;
            case 'month':
                newDate.setMonth(newDate.getMonth() + (direction === 'forward' ? 1 : -1));
                break;
            case 'week':
                newDate.setDate(newDate.getDate() + (direction === 'forward' ? 7 : -7));
                break;
            case 'day':
                newDate.setDate(newDate.getDate() + (direction === 'forward' ? 1 : -1));
                break;
            case 'hour':
                newDate.setHours(newDate.getHours() + (direction === 'forward' ? 1 : -1));
                break;
        }

        // Validar límites
        if (newDate >= minDate && newDate <= maxDate) {
            setCurrentDate(newDate);
        }
    };

    // Efecto para notificar cambios
    useEffect(() => {
        const [start, end] = getDateRange(currentDate, granularity);
        onTimeChange(start, end, granularity);
    }, [currentDate, granularity]);

    // Efecto para auto-play
    useEffect(() => {
        if (isPlaying) {
            const interval = setInterval(() => {
                navigate('forward');
            }, playSpeed);
            return () => clearInterval(interval);
        }
    }, [isPlaying, playSpeed, currentDate, granularity]);

    // Formatear fecha según granularidad
    const formatDate = (date: Date, gran: TimeGranularity): string => {
        switch (gran) {
            case 'year':
                return date.getFullYear().toString();
            case 'month':
                return date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
            case 'week':
                const weekStart = new Date(date);
                const weekEnd = new Date(date);
                const dayOfWeek = date.getDay();
                const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                weekStart.setDate(diff);
                weekEnd.setDate(weekStart.getDate() + 6);
                return `Semana ${getWeekNumber(date)} (${weekStart.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })} - ${weekEnd.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })})`;
            case 'day':
                return date.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            case 'hour':
                return date.toLocaleString('es-CL', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                });
        }
    };

    // Obtener número de semana
    const getWeekNumber = (date: Date): number => {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    };

    // Función para ir a una fecha específica
    const goToDate = (date: string) => {
        const newDate = new Date(date);
        if (newDate >= minDate && newDate <= maxDate) {
            setCurrentDate(newDate);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    <Clock className="mr-2" size={20} />
                    Navegador Temporal
                </h3>
                <div className="text-sm text-gray-500">
                    Datos del año 2022
                </div>
            </div>

            {/* Selector de granularidad */}
            <div className="mb-4">
                <div className="grid grid-cols-5 gap-2">
                    {[
                        { value: 'year', label: 'Año', icon: Calendar },
                        { value: 'month', label: 'Mes', icon: CalendarDays },
                        { value: 'week', label: 'Semana', icon: CalendarRange },
                        { value: 'day', label: 'Día', icon: CalendarDays },
                        { value: 'hour', label: 'Hora', icon: Timer }
                    ].map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            onClick={() => setGranularity(value as TimeGranularity)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex flex-col items-center justify-center ${granularity === value
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Icon size={16} className="mb-1" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Display de fecha actual */}
            <div className="mb-4 text-center bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-gray-800">
                    {formatDate(currentDate, granularity)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                    {(() => {
                        const [start, end] = getDateRange(currentDate, granularity);
                        return `${start.toLocaleString('es-CL')} - ${end.toLocaleString('es-CL')}`;
                    })()}
                </div>
            </div>

            {/* Controles de navegación */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => navigate('backward')}
                    disabled={currentDate <= minDate}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`p-2 rounded-lg transition-colors ${isPlaying ? 'bg-red-100 hover:bg-red-200' : 'bg-green-100 hover:bg-green-200'
                            }`}
                    >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>

                    <button
                        onClick={() => setCurrentDate(new Date('2022-01-01T00:00:00'))}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        title="Reiniciar al inicio"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>

                <button
                    onClick={() => navigate('forward')}
                    disabled={currentDate >= maxDate}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Selector de fecha directa */}
            <div className="mb-4">
                <input
                    type="datetime-local"
                    value={currentDate.toISOString().slice(0, 16)}
                    onChange={(e) => goToDate(e.target.value)}
                    min="2022-01-01T00:00"
                    max="2022-12-31T23:59"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Velocidad de reproducción */}
            {isPlaying && (
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Velocidad:</span>
                    <select
                        value={playSpeed}
                        onChange={(e) => setPlaySpeed(Number(e.target.value))}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                        <option value={2000}>0.5x</option>
                        <option value={1000}>1x</option>
                        <option value={500}>2x</option>
                        <option value={250}>4x</option>
                        <option value={100}>10x</option>
                    </select>
                </div>
            )}

            {/* Indicadores de progreso */}
            <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Ene 2022</span>
                    <span>{Math.round(((currentDate.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100)}%</span>
                    <span>Dic 2022</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                            width: `${((currentDate.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100}%`
                        }}
                    />
                </div>
            </div>
        </div>
    );
};