// src/components/map/views/patio/PatioHeader.tsx - MODIFICADO PARA CAMILA
import React from 'react';
import { Database, RefreshCw } from 'lucide-react';
import type { PatioData } from '../../../../types';
import type { CamilaDashboardData } from '../../../../types/camila';

interface PatioHeaderProps {
    patio: PatioData;
    isCamilaActive: boolean;
    isMagdalenaActive: boolean;
    timeState: any;
    currentPeriod: number;
    currentTurno: number;
    camilaData?: CamilaDashboardData | null;
    onRefresh: () => void;
}

export const PatioHeader: React.FC<PatioHeaderProps> = ({
    patio,
    isCamilaActive,
    isMagdalenaActive,
    timeState,
    currentPeriod,
    currentTurno,
    camilaData,
    onRefresh
}) => {
    return (
        <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h2 className="text-2xl font-bold text-slate-100 flex items-center">
                        {patio.name}
                        {isCamilaActive && (
                            <span className="ml-3 px-3 py-1 bg-teal-950/30 text-teal-300 rounded-full text-sm font-medium border border-teal-800">
                                ⚡ Camila - Período {currentPeriod}
                            </span>
                        )}
                        {isMagdalenaActive && (
                            <span className="ml-3 px-3 py-1 bg-cyan-950/30 text-cyan-300 rounded-full text-sm font-medium border border-cyan-800">
                                🔮 Magdalena - Turno {currentTurno}
                            </span>
                        )}
                        {timeState?.dataSource === 'historical' && (
                            <span className="ml-3 px-3 py-1 bg-blue-950/30 text-blue-300 rounded-full text-sm font-medium border border-blue-800 flex items-center">
                                <Database size={14} className="mr-1" />
                                Datos Históricos
                            </span>
                        )}
                    </h2>
                    <p className="text-slate-400">{patio.description}</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-blue-400">
                        {isCamilaActive && camilaData?.resultado ?
                            `${camilaData.resultado.utilizacion_modelo.toFixed(1)}%` :
                            `${patio.ocupacionTotal}%`}
                    </div>
                    <div className="text-sm text-slate-500">
                        {isCamilaActive ? 'Utilización Modelo' :
                            isMagdalenaActive ? `Ocupación Turno ${currentTurno}` :
                                'Ocupación Total'}
                    </div>
                </div>
            </div>

            {timeState?.dataSource === 'historical' && (
                <div className="flex justify-end mb-2">
                    <button
                        onClick={onRefresh}
                        className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors flex items-center text-sm"
                    >
                        <RefreshCw size={14} className="mr-1" />
                        Actualizar
                    </button>
                </div>
            )}
        </div>
    );
};