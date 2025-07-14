// src/components/map/views/patio/PatioGrid.tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { BloqueComponent } from './BloqueComponent';
import { getCamilaDataForBlock, getMagdalenaDataForBlock } from './patioDataHelpers';
import type { PatioData } from '../../../../types';
import type { CamilaDashboardData } from '../../../../types/camila';
import type { OptimizationMetrics } from '../../../../types/optimization';
import type { BloqueDataExtended } from '../../../../types/patioView.types';

interface PatioGridProps {
    patio: PatioData;
    selectedBloque: string | null;
    isCamilaActive: boolean;
    isMagdalenaActive: boolean;
    currentPeriod: number;
    currentTurno: number;
    camilaData?: CamilaDashboardData | null;
    magdalenaMetrics?: OptimizationMetrics | null;
    timeState: any;
    getColorForOcupacion: (value: number) => string;
    onBloqueSelect: (bloqueId: string) => void;
}

export const PatioGrid: React.FC<PatioGridProps> = ({
    patio,
    selectedBloque,
    isCamilaActive,
    isMagdalenaActive,
    currentPeriod,
    currentTurno,
    camilaData,
    magdalenaMetrics,
    timeState,
    getColorForOcupacion,
    onBloqueSelect
}) => {
    return (
        <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-4">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
                Bloques del Patio
                {isCamilaActive && (
                    <span className="ml-2 text-sm font-normal text-teal-400">
                        (Asignación de grúas RTG - Período {currentPeriod})
                    </span>
                )}
                {isMagdalenaActive && (
                    <span className="ml-2 text-sm font-normal text-cyan-400">
                        (Optimización de espacios - Turno {currentTurno})
                    </span>
                )}
                {timeState?.dataSource === 'historical' && (
                    <span className="ml-2 text-sm font-normal text-blue-400">
                        (Datos del {timeState.currentDate.toLocaleDateString('es-CL')})
                    </span>
                )}
            </h3>

            {patio.bloques.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                    <AlertTriangle size={32} className="mx-auto mb-2" />
                    <p>No hay bloques con datos para este período</p>
                </div>
            )}

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {patio.bloques.map((bloque) => {
                    const bloqueExtended = bloque as BloqueDataExtended;
                    const camilaBlockData = isCamilaActive && camilaData ?
                        getCamilaDataForBlock(bloque.id, camilaData, currentPeriod) : undefined;
                    const magdalenaBlockData = isMagdalenaActive && magdalenaMetrics ?
                        getMagdalenaDataForBlock(bloque.id, magdalenaMetrics) : undefined;

                    return (
                        <BloqueComponent
                            key={bloque.id}
                            bloque={bloqueExtended}
                            isSelected={selectedBloque === bloque.id}
                            onClick={() => onBloqueSelect(bloque.id)}
                            getColorForOcupacion={getColorForOcupacion}
                            isMagdalenaActive={isMagdalenaActive}
                            isCamilaActive={isCamilaActive}
                            ocupacionTurno={bloque.ocupacion}
                            camilaData={camilaBlockData ?? undefined}
                            currentPeriod={currentPeriod}
                            dashboardData={camilaData ?? undefined}
                            magdalenaData={magdalenaBlockData ?? undefined}
                        />
                    );
                })}
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-700">
                <div className="flex items-center space-x-4 text-sm text-slate-300">
                    {isCamilaActive ? (
                        <>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                                <span>Baja utilización (&lt;50%)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                                <span>Media (50-80%)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                                <span>Alta (&gt;80%)</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                                <span>Bajo (&lt;70%)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                                <span>Medio (70-85%)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                                <span>Alto (&gt;85%)</span>
                            </div>
                        </>
                    )}
                </div>
                <div className="text-sm text-slate-400">
                    Clic en bloque para vista micro
                </div>
            </div>
        </div>
    );
};