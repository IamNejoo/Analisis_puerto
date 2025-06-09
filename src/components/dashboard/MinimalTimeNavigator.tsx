// src/components/dashboard/MinimalTimeNavigator.tsx
import React, { useState, useEffect } from 'react';
import {
    Calendar, ChevronLeft, ChevronRight,
    Play, Pause, RotateCcw
} from 'lucide-react';

export type TimeGranularity = 'year' | 'month' | 'week' | 'day' | 'hour';

interface MinimalTimeNavigatorProps {
    onTimeChange: (startDate: Date, endDate: Date, granularity: TimeGranularity) => void;
}

export const MinimalTimeNavigator: React.FC<MinimalTimeNavigatorProps> = ({
    onTimeChange
}) => {
    const [currentDate, setCurrentDate] = useState(new Date('2022-01-01T12:00:00'));
    const [granularity, setGranularity] = useState<TimeGranularity>('day');
    const [isPlaying, setIsPlaying] = useState(false);

    const minDate = new Date('2022-01-01T00:00:00');
    const maxDate = new Date('2022-12-31T23:59:59');

    // Función para obtener el rango de fechas según la granularidad
    const getDateRange = (date: Date, gran: TimeGranularity): [Date, Date] => {
        const start = new Date(date);
        const end = new Date(date);

        switch (gran) {
            case 'year':
                start.setMonth(0, 1);
                start.setHours(0, 0, 0, 0);
                end.setMonth(11, 31);
                end.setHours(23, 59, 59, 999);
                break;

            case 'month':
                start.setDate(1);
                start.setHours(0, 0, 0, 0);
                end.setMonth(date.getMonth() + 1, 0);
                end.setHours(23, 59, 59, 999);
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

    // Función para navegar
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

        if (newDate >= minDate && newDate <= maxDate) {
            setCurrentDate(newDate);
        }
    };

    // Formatear fecha
    const formatDate = (date: Date, gran: TimeGranularity): string => {
        switch (gran) {
            case 'year':
                return date.getFullYear().toString();
            case 'month':
                return date.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' });
            case 'week':
                const weekNum = Math.ceil(((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7);
                return `Sem ${weekNum}, ${date.getFullYear()}`;
            case 'day':
                return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
            case 'hour':
                return date.toLocaleString('es-CL', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                });
        }
    };

    // Efecto para notificar cambios
    useEffect(() => {
        const [start, end] = getDateRange(currentDate, granularity);
        onTimeChange(start, end, granularity);
    }, [currentDate, granularity]);

    // Auto-play
    useEffect(() => {
        if (isPlaying) {
            const interval = setInterval(() => {
                navigate('forward');
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isPlaying, currentDate, granularity]);

    // Calcular progreso
    const progress = ((currentDate.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100;

    return (
        <div className="bg-white border-b border-gray-200 px-4 py-2">
            <div className="flex items-center justify-between">
                {/* Lado izquierdo - Controles de tiempo */}
                <div className="flex items-center space-x-3">
                    {/* Botón anterior */}
                    <button
                        onClick={() => navigate('backward')}
                        disabled={currentDate <= minDate}
                        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Anterior"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {/* Display de fecha */}
                    <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <Calendar size={16} className="text-gray-500" />
                        <span className="font-medium text-sm min-w-[140px] text-center">
                            {formatDate(currentDate, granularity)}
                        </span>
                    </div>

                    {/* Botón siguiente */}
                    <button
                        onClick={() => navigate('forward')}
                        disabled={currentDate >= maxDate}
                        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Siguiente"
                    >
                        <ChevronRight size={16} />
                    </button>

                    {/* Separador */}
                    <div className="h-6 w-px bg-gray-300" />

                    {/* Play/Pause */}
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`p-1.5 rounded transition-colors ${isPlaying ? 'bg-red-100 hover:bg-red-200 text-red-600' : 'hover:bg-gray-100'
                            }`}
                        title={isPlaying ? 'Pausar' : 'Reproducir'}
                    >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>

                    {/* Reset */}
                    <button
                        onClick={() => setCurrentDate(new Date('2022-01-01T12:00:00'))}
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                        title="Reiniciar"
                    >
                        <RotateCcw size={16} />
                    </button>
                </div>

                {/* Centro - Selector de granularidad */}
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                    {(['hour', 'day', 'week', 'month', 'year'] as TimeGranularity[]).map((gran) => (
                        <button
                            key={gran}
                            onClick={() => setGranularity(gran)}
                            className={`px-3 py-1 rounded text-xs font-medium transition-all ${granularity === gran
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {gran === 'hour' ? 'Hora' :
                                gran === 'day' ? 'Día' :
                                    gran === 'week' ? 'Semana' :
                                        gran === 'month' ? 'Mes' : 'Año'}
                        </button>
                    ))}
                </div>

                {/* Lado derecho - Barra de progreso */}
                <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-500">2022</span>
                    <div className="w-32 bg-gray-200 rounded-full h-1.5">
                        <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
                </div>
            </div>
        </div>
    );
};