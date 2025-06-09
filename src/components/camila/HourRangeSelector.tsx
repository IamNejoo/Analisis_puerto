import React from 'react';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface HourRangeSelectorProps {
    startHour: number;
    endHour: number;
    onRangeChange: (start: number, end: number) => void;
    minHour?: number;
    maxHour?: number;
    hoursPerView?: number;
}

export const HourRangeSelector: React.FC<HourRangeSelectorProps> = ({
    startHour,
    endHour,
    onRangeChange,
    minHour = 0,
    maxHour = 23,
    hoursPerView = 8
}) => {
    const handlePrevious = () => {
        const newStart = Math.max(minHour, startHour - hoursPerView);
        const newEnd = newStart + hoursPerView;
        onRangeChange(newStart, newEnd);
    };

    const handleNext = () => {
        const newStart = Math.min(maxHour - hoursPerView + 1, startHour + hoursPerView);
        const newEnd = newStart + hoursPerView;
        onRangeChange(newStart, newEnd);
    };

    const handleHourClick = (hour: number) => {
        const newStart = Math.max(minHour, Math.min(maxHour - hoursPerView + 1, hour));
        const newEnd = newStart + hoursPerView;
        onRangeChange(newStart, newEnd);
    };

    const canGoPrevious = startHour > minHour;
    const canGoNext = endHour < maxHour;

    // Generar todas las horas disponibles
    const allHours = Array.from({ length: maxHour - minHour + 1 }, (_, i) => minHour + i);

    return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                    <Clock size={16} className="mr-2" />
                    Rango de Horas
                </h3>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handlePrevious}
                        disabled={!canGoPrevious}
                        className={`p-1 rounded transition-colors ${canGoPrevious
                                ? 'hover:bg-gray-100 text-gray-700'
                                : 'text-gray-300 cursor-not-allowed'
                            }`}
                        title="Horas anteriores"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-medium text-gray-900 min-w-[120px] text-center">
                        {startHour}:00 - {endHour}:00
                    </span>
                    <button
                        onClick={handleNext}
                        disabled={!canGoNext}
                        className={`p-1 rounded transition-colors ${canGoNext
                                ? 'hover:bg-gray-100 text-gray-700'
                                : 'text-gray-300 cursor-not-allowed'
                            }`}
                        title="Horas siguientes"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Timeline visual */}
            <div className="relative">
                <div className="flex space-x-1 overflow-x-auto pb-2">
                    {allHours.map(hour => {
                        const isInRange = hour >= startHour && hour < endHour;
                        const isStart = hour === startHour;
                        const isEnd = hour === endHour - 1;

                        return (
                            <button
                                key={hour}
                                onClick={() => handleHourClick(hour)}
                                className={`
                                    flex-shrink-0 w-10 h-10 rounded text-xs font-medium
                                    transition-all transform hover:scale-105
                                    ${isInRange
                                        ? 'bg-purple-600 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }
                                    ${isStart ? 'rounded-l-lg' : ''}
                                    ${isEnd ? 'rounded-r-lg' : ''}
                                `}
                                title={`${hour}:00 - ${hour + 1}:00`}
                            >
                                {hour}
                            </button>
                        );
                    })}
                </div>

                {/* Indicador de rango actual */}
                <div className="mt-2 flex items-center justify-center text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-600 rounded"></div>
                        <span>Rango actual</span>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-200 rounded"></div>
                        <span>Horas disponibles</span>
                    </div>
                </div>
            </div>

            {/* Atajos rápidos */}
            <div className="mt-4 flex flex-wrap gap-2">
                <button
                    onClick={() => onRangeChange(0, 8)}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                    Turno 3 (00:00-08:00)
                </button>
                <button
                    onClick={() => onRangeChange(8, 16)}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                    Turno 1 (08:00-16:00)
                </button>
                <button
                    onClick={() => onRangeChange(16, 24)}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                    Turno 2 (16:00-24:00)
                </button>
            </div>
        </div>
    );
};

export default HourRangeSelector;