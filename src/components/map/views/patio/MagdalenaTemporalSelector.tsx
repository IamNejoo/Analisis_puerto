// src/components/map/views/patio/MagdalenaTemporalSelector.tsx
import React from 'react';
import { Clock, Calendar, ChevronLeft, ChevronRight, SkipBack, SkipForward, BarChart3 } from 'lucide-react';

interface TemporalSelectorProps {
    currentTurno: number;
    totalTurnos: number;
    onTurnoChange: (turno: number | 'semana') => void;
    vistaActual: 'semana' | 'turno';
    onVistaChange: (vista: 'semana' | 'turno') => void;
}

export const MagdalenaTemporalSelector: React.FC<TemporalSelectorProps> = ({
    currentTurno,
    totalTurnos,
    onTurnoChange,
    vistaActual,
    onVistaChange
}) => {
    const getTurnoInfo = (turno: number) => {
        const dia = Math.floor((turno - 1) / 3) + 1;
        const turnoDelDia = ((turno - 1) % 3) + 1;
        const nombresTurnos = ['Mañana (8-16h)', 'Tarde (16-24h)', 'Noche (0-8h)'];
        const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

        return {
            dia: diasSemana[dia - 1],
            turno: nombresTurnos[turnoDelDia - 1],
            descripcion: `${diasSemana[dia - 1]} - ${nombresTurnos[turnoDelDia - 1]}`
        };
    };

    const handleVistaChange = (nuevaVista: 'semana' | 'turno') => {
        onVistaChange(nuevaVista);
        if (nuevaVista === 'semana') {
            onTurnoChange('semana');
        } else {
            onTurnoChange(currentTurno === 0 ? 1 : currentTurno);
        }
    };

    const turnoInfo = vistaActual === 'turno' && currentTurno > 0 ? getTurnoInfo(currentTurno) : null;

    return (
        <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-100 flex items-center">
                    <Clock className="mr-2 text-cyan-400" size={20} />
                    Vista Temporal - Magdalena
                </h3>
                <div className="text-sm text-slate-400">
                    {vistaActual === 'semana' ? 'Agregado semanal' : `Período ${currentTurno} de ${totalTurnos}`}
                </div>
            </div>

            {/* Selector de Vista */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                    onClick={() => handleVistaChange('semana')}
                    className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all ${vistaActual === 'semana'
                            ? 'bg-cyan-600 text-white shadow-md'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                >
                    <Calendar size={24} className="mb-1" />
                    <span className="text-sm font-medium">Vista Semana</span>
                    <span className="text-xs opacity-75 mt-1">Agregado total</span>
                </button>

                <button
                    onClick={() => handleVistaChange('turno')}
                    className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all ${vistaActual === 'turno'
                            ? 'bg-cyan-600 text-white shadow-md'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                >
                    <Clock size={24} className="mb-1" />
                    <span className="text-sm font-medium">Vista por Turno</span>
                    <span className="text-xs opacity-75 mt-1">Turno específico</span>
                </button>
            </div>

            {/* Vista Semana - Información agregada */}
            {vistaActual === 'semana' && (
                <div>
                    <div className="bg-gradient-to-r from-cyan-950/30 to-blue-950/30 rounded-lg p-4 border border-cyan-800/50">
                        <div className="flex items-center mb-3">
                            <BarChart3 size={20} className="text-cyan-400 mr-2" />
                            <h4 className="text-sm font-semibold text-cyan-300">Vista Agregada Semanal</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-slate-800/50 rounded p-2">
                                <div className="text-xs text-slate-400">Período</div>
                                <div className="font-medium text-slate-200">Semana completa</div>
                            </div>
                            <div className="bg-slate-800/50 rounded p-2">
                                <div className="text-xs text-slate-400">Turnos incluidos</div>
                                <div className="font-medium text-slate-200">21 turnos</div>
                            </div>
                            <div className="bg-slate-800/50 rounded p-2">
                                <div className="text-xs text-slate-400">Días</div>
                                <div className="font-medium text-slate-200">Lun - Dom</div>
                            </div>
                            <div className="bg-slate-800/50 rounded p-2">
                                <div className="text-xs text-slate-400">Tipo de vista</div>
                                <div className="font-medium text-slate-200">Promedio</div>
                            </div>
                        </div>

                        <div className="mt-3 text-xs text-cyan-400/80">
                            <p>📊 Los valores mostrados representan el promedio de ocupación y métricas consolidadas de todos los turnos de la semana.</p>
                        </div>
                    </div>

                    {/* Opción para ir a vista por turno */}
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => handleVistaChange('turno')}
                            className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                        >
                            Ver turnos individuales →
                        </button>
                    </div>
                </div>
            )}

            {/* Vista Turno - Navegación individual */}
            {vistaActual === 'turno' && (
                <div>
                    {/* Info del turno actual */}
                    <div className="bg-cyan-950/20 rounded-lg p-4 mb-4 text-center border border-cyan-800">
                        <div className="text-sm text-cyan-400">Período Específico</div>
                        <div className="text-3xl font-bold text-cyan-300 my-2">
                            {currentTurno} / {totalTurnos}
                        </div>
                        <div className="text-base text-cyan-300">
                            {turnoInfo?.descripcion}
                        </div>
                    </div>

                    {/* Controles de navegación */}
                    <div className="flex items-center justify-center space-x-2">
                        <button
                            onClick={() => onTurnoChange(1)}
                            disabled={currentTurno === 1}
                            className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Ir al inicio"
                        >
                            <SkipBack size={18} />
                        </button>

                        <button
                            onClick={() => onTurnoChange(Math.max(1, currentTurno - 1))}
                            disabled={currentTurno === 1}
                            className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Turno anterior"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="px-4 py-2 bg-slate-700 rounded-lg min-w-[200px] text-center">
                            <span className="text-xs text-slate-400 block">Navegando por</span>
                            <span className="text-sm font-medium text-slate-200">Turno {currentTurno}</span>
                        </div>

                        <button
                            onClick={() => onTurnoChange(Math.min(totalTurnos, currentTurno + 1))}
                            disabled={currentTurno === totalTurnos}
                            className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Siguiente turno"
                        >
                            <ChevronRight size={18} />
                        </button>

                        <button
                            onClick={() => onTurnoChange(totalTurnos)}
                            disabled={currentTurno === totalTurnos}
                            className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Ir al final"
                        >
                            <SkipForward size={18} />
                        </button>
                    </div>

                    {/* Barra de progreso */}
                    <div className="mt-4">
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

                    {/* Opción para ver agregado semanal */}
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => handleVistaChange('semana')}
                            className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                        >
                            ← Ver agregado semanal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};