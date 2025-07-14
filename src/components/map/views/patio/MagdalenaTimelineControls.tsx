// src/components/map/views/patio/MagdalenaTimelineControls.tsx
import React from 'react';
import { Clock, Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight } from 'lucide-react';

interface TimelineControlsProps {
    currentTurno: number;
    totalTurnos: number;
    onTurnoChange: (turno: number) => void;
    isPlaying: boolean;
    onPlayPause: () => void;
}

export const MagdalenaTimelineControls: React.FC<TimelineControlsProps> = ({
    currentTurno,
    totalTurnos,
    onTurnoChange,
    isPlaying,
    onPlayPause
}) => {
    const getTurnoInfo = (turno: number) => {
        const dia = Math.floor((turno - 1) / 3) + 1;
        const turnoDelDia = ((turno - 1) % 3) + 1;
        const nombresTurnos = ['Mañana', 'Tarde', 'Noche'];
        const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

        return {
            dia: diasSemana[dia - 1] || `Día ${dia}`,
            turno: nombresTurnos[turnoDelDia - 1] || `Turno ${turnoDelDia}`,
            descripcion: `${diasSemana[dia - 1] || `Día ${dia}`} - ${nombresTurnos[turnoDelDia - 1] || `Turno ${turnoDelDia}`}`
        };
    };

    const turnoInfo = getTurnoInfo(currentTurno);

    return (
        <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-100 flex items-center">
                    <Clock className="mr-2 text-cyan-400" size={20} />
                    Timeline de Turnos
                </h3>
                <div className="text-sm text-slate-400">
                    Semana completa: {totalTurnos} turnos
                </div>
            </div>

            <div className="bg-cyan-950/20 rounded-lg p-3 mb-4 text-center border border-cyan-800">
                <div className="text-sm text-cyan-400">Turno Actual</div>
                <div className="text-2xl font-bold text-cyan-300">
                    {currentTurno} / {totalTurnos}
                </div>
                <div className="text-sm text-cyan-300 mt-1">
                    {turnoInfo.descripcion}
                </div>
            </div>

            <div className="flex items-center justify-center space-x-4 mb-4">
                <button
                    onClick={() => onTurnoChange(1)}
                    className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300"
                    title="Ir al inicio"
                >
                    <SkipBack size={20} />
                </button>

                <button
                    onClick={() => onTurnoChange(Math.max(1, currentTurno - 1))}
                    className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 disabled:opacity-50"
                    disabled={currentTurno === 1}
                >
                    <ChevronLeft size={20} />
                </button>

                <button
                    onClick={onPlayPause}
                    className="p-3 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-colors"
                >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>

                <button
                    onClick={() => onTurnoChange(Math.min(totalTurnos, currentTurno + 1))}
                    className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 disabled:opacity-50"
                    disabled={currentTurno === totalTurnos}
                >
                    <ChevronRight size={20} />
                </button>

                <button
                    onClick={() => onTurnoChange(totalTurnos)}
                    className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300"
                    title="Ir al final"
                >
                    <SkipForward size={20} />
                </button>
            </div>

            <div className="relative">
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-cyan-500 transition-all duration-300"
                        style={{ width: `${(currentTurno / totalTurnos) * 100}%` }}
                    />
                </div>

                <div className="flex justify-between mt-2">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((dia, index) => (
                        <div
                            key={index}
                            className={`text-xs font-medium ${Math.floor((currentTurno - 1) / 3) === index
                                    ? 'text-cyan-400'
                                    : 'text-slate-500'
                                }`}
                        >
                            {dia}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1">
                {Array.from({ length: totalTurnos }, (_, i) => i + 1).map(turno => {
                    const info = getTurnoInfo(turno);
                    const isCurrentTurno = turno === currentTurno;

                    return (
                        <button
                            key={turno}
                            onClick={() => onTurnoChange(turno)}
                            className={`
                p-2 text-xs rounded transition-all
                ${isCurrentTurno
                                    ? 'bg-cyan-500 text-white shadow-md scale-105'
                                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                                }
              `}
                            title={info.descripcion}
                        >
                            {turno}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};