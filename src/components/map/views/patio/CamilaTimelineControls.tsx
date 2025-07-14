// src/components/map/views/patio/CamilaTimelineControls.tsx
import React from 'react';
import { Clock, Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight } from 'lucide-react';

interface CamilaTimelineControlsProps {
    currentPeriod: number;
    totalPeriods: number;
    onPeriodChange: (period: number) => void;
    isPlaying: boolean;
    onPlayPause: () => void;
    turno: number;
    turnoDelDia: number;
}

export const CamilaTimelineControls: React.FC<CamilaTimelineControlsProps> = ({
    currentPeriod,
    totalPeriods,
    onPeriodChange,
    isPlaying,
    onPlayPause,
    turno,
    turnoDelDia
}) => {
    const getHourForPeriod = (period: number) => {
        let baseHour = 0;
        switch (turnoDelDia) {
            case 1: baseHour = 8; break;
            case 2: baseHour = 16; break;
            case 3: baseHour = 0; break;
        }

        const hour = baseHour + period - 1;
        const displayHour = hour >= 24 ? hour - 24 : hour;
        return `${displayHour < 10 ? '0' : ''}${displayHour}:00`;
    };

    return (
        <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-100 flex items-center">
                    <Clock className="mr-2 text-teal-400" size={20} />
                    Timeline de Operaciones - Turno {turno}
                </h3>
                <div className="text-sm text-slate-400">
                    {totalPeriods} períodos • Turno {turnoDelDia} del día
                </div>
            </div>

            <div className="bg-teal-950/20 rounded-lg p-3 mb-4 text-center border border-teal-800">
                <div className="text-sm text-teal-400">Período Actual</div>
                <div className="text-2xl font-bold text-teal-300">
                    Período {currentPeriod}
                </div>
                <div className="text-sm text-teal-300 mt-1">
                    {getHourForPeriod(currentPeriod)} - {getHourForPeriod(currentPeriod + 1)}
                </div>
            </div>

            <div className="flex items-center justify-center space-x-4 mb-4">
                <button
                    onClick={() => onPeriodChange(1)}
                    className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300"
                    title="Ir al inicio"
                >
                    <SkipBack size={20} />
                </button>

                <button
                    onClick={() => onPeriodChange(Math.max(1, currentPeriod - 1))}
                    className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 disabled:opacity-50"
                    disabled={currentPeriod === 1}
                >
                    <ChevronLeft size={20} />
                </button>

                <button
                    onClick={onPlayPause}
                    className="p-3 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors"
                >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>

                <button
                    onClick={() => onPeriodChange(Math.min(totalPeriods, currentPeriod + 1))}
                    className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 disabled:opacity-50"
                    disabled={currentPeriod === totalPeriods}
                >
                    <ChevronRight size={20} />
                </button>

                <button
                    onClick={() => onPeriodChange(totalPeriods)}
                    className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300"
                    title="Ir al final"
                >
                    <SkipForward size={20} />
                </button>
            </div>

            <div className="relative">
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-teal-500 transition-all duration-300"
                        style={{ width: `${(currentPeriod / totalPeriods) * 100}%` }}
                    />
                </div>
            </div>

            <div className="mt-4 grid grid-cols-8 gap-1">
                {Array.from({ length: totalPeriods }, (_, i) => i + 1).map(period => (
                    <button
                        key={period}
                        onClick={() => onPeriodChange(period)}
                        className={`
              p-2 text-xs rounded transition-all
              ${period === currentPeriod
                                ? 'bg-teal-500 text-white shadow-md scale-105'
                                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                            }
            `}
                        title={`${getHourForPeriod(period)} - ${getHourForPeriod(period + 1)}`}
                    >
                        P{period}
                    </button>
                ))}
            </div>
        </div>
    );
};