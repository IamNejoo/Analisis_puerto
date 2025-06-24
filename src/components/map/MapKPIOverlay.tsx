import React from 'react';
import { usePortKPIs } from '../../hooks/usePortKPIs';
import { useViewNavigation } from '../../contexts/ViewNavigationContext';
import {
    Package, Car, RefreshCw, Zap, Shuffle, Gauge
} from 'lucide-react';

interface MapKPIOverlayProps {
    dataFilePath?: string;
    blockCapacities?: Record<string, number>;
}

export const MapKPIOverlay: React.FC<MapKPIOverlayProps> = ({
    dataFilePath = '/data/resultados_congestion_SAI_2022.csv',
    blockCapacities
}) => {
    const { viewState } = useViewNavigation();
    const patioFilter = viewState.level === 'patio' ? viewState.selectedPatio : undefined;

    const {
        currentKPIs,
        isLoading,
        formatKPIValue,
        getStatusForKPI,
        error
    } = usePortKPIs({
        dataFilePath,
        blockCapacities,
        patioFilter
    });
    console.log('MapKPIOverlay - viewState:', viewState.level, 'currentKPIs:', currentKPIs, 'isLoading:', isLoading);


    // SOLO mostrar en vista terminal
    if (viewState.level !== 'terminal') {
        return null;
    }

    if (isLoading || !currentKPIs) return null;

    if (error) {
        return (
            <div className="absolute top-4 right-4 bg-red-900/90 backdrop-blur-sm p-4 rounded-lg shadow-xl z-20 border border-red-600/50">
                <div className="text-red-100">
                    <h3 className="font-bold">Error cargando KPIs</h3>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    const getStatusColor = (kpi: any) => {
        const status = getStatusForKPI(kpi);
        switch (status) {
            case 'good': return 'text-green-400';
            case 'warning': return 'text-yellow-400';
            case 'critical': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getStatusBg = (kpi: any) => {
        const status = getStatusForKPI(kpi);
        switch (status) {
            case 'good': return 'bg-green-500/10 border-green-500/30';
            case 'warning': return 'bg-yellow-500/10 border-yellow-500/30';
            case 'critical': return 'bg-red-500/10 border-red-500/30';
            default: return 'bg-gray-700/50 border-gray-600/30';
        }
    };

    // Función para determinar si hay alguna alerta crítica
    const hasCriticalAlert = () => {
        return currentKPIs?.kpiRelations?.congestionProductividadStatus === 'critical' ||
            currentKPIs?.kpiRelations?.utilizacionRemanejosStatus === 'critical' ||
            currentKPIs?.kpiRelations?.balanceUtilizacionStatus === 'critical';
    };

    return (
        <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm p-4 rounded-lg shadow-xl z-20 border border-slate-700/50">
            <div className="min-w-[280px] max-w-[320px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700/50">
                    <h3 className="text-sm font-bold text-slate-100">
                        KPIs del Terminal
                    </h3>
                    <div className="flex items-center space-x-1">
                        {hasCriticalAlert() ? (
                            <>
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-red-400">Alerta</span>
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-gray-400">Normal</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Grid 3x2 con los 6 KPIs principales */}
                <div className="grid grid-cols-3 gap-2">
                    {/* 1. Utilización */}
                    <div className={`rounded-lg p-2 border ${getStatusBg('utilizacionPorVolumen')}`}>
                        <div className="flex flex-col">
                            <Package className="w-4 h-4 text-blue-400 mb-1" />
                            <span className="text-xs text-gray-300">Utilización</span>
                            <div className={`text-base font-bold ${getStatusColor('utilizacionPorVolumen')}`}>
                                {formatKPIValue('utilizacionPorVolumen')}
                            </div>
                            {currentKPIs.indiceRemanejo > 5 && (
                                <span className="text-[10px] text-yellow-400">⚠️ +remanejos</span>
                            )}
                        </div>
                    </div>

                    {/* 2. Congestión */}
                    <div className={`rounded-lg p-2 border ${getStatusBg('congestionVehicular')}`}>
                        <div className="flex flex-col">
                            <Car className="w-4 h-4 text-red-400 mb-1" />
                            <span className="text-xs text-gray-300">Congestión</span>

                            <div className={`text-base font-bold ${getStatusColor('congestionVehicular')}`}>
                                {formatKPIValue('congestionVehicular')}
                            </div>
                            {currentKPIs.productividadOperacional < 50 && (
                                <span className="text-[10px] text-yellow-400">⚠️ baja prod.</span>
                            )}
                        </div>
                    </div>

                    {/* 3. Balance */}
                    <div className={`rounded-lg p-2 border ${getStatusBg('balanceFlujo')}`}>
                        <div className="flex flex-col">
                            <RefreshCw className="w-4 h-4 text-purple-400 mb-1" />
                            <span className="text-xs text-gray-300">Balance</span>
                            <div className={`text-base font-bold ${getStatusColor('balanceFlujo')}`}>
                                {formatKPIValue('balanceFlujo')}
                            </div>
                            {currentKPIs.balanceFlujo > 1.2 && currentKPIs.utilizacionPorVolumen > 85 && (
                                <span className="text-[10px] text-red-400">⚠️ saturación</span>
                            )}
                        </div>
                    </div>

                    {/* 4. Productividad */}
                    <div className={`rounded-lg p-2 border ${getStatusBg('productividadOperacional')}`}>
                        <div className="flex flex-col">
                            <Zap className="w-4 h-4 text-green-400 mb-1" />
                            <span className="text-xs text-gray-300">Product.</span>
                            <div className={`text-base font-bold ${getStatusColor('productividadOperacional')}`}>
                                {formatKPIValue('productividadOperacional')}
                            </div>
                        </div>
                    </div>

                    {/* 5. Remanejos */}
                    <div className={`rounded-lg p-2 border ${getStatusBg('indiceRemanejo')}`}>
                        <div className="flex flex-col">
                            <Shuffle className="w-4 h-4 text-orange-400 mb-1" />
                            <span className="text-xs text-gray-300">Remanejos</span>
                            <div className={`text-base font-bold ${getStatusColor('indiceRemanejo')}`}>
                                {formatKPIValue('indiceRemanejo')}
                            </div>
                        </div>
                    </div>

                    {/* 6. Saturación */}
                    <div className={`rounded-lg p-2 border ${getStatusBg('saturacionOperacional')}`}>
                        <div className="flex flex-col">
                            <Gauge className="w-4 h-4 text-indigo-400 mb-1" />
                            <span className="text-xs text-gray-300">Saturación</span>
                            <div className={`text-base font-bold ${getStatusColor('saturacionOperacional')}`}>
                                {formatKPIValue('saturacionOperacional')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alertas críticas resumidas */}
                {hasCriticalAlert() && (
                    <div className="mt-2 pt-2 border-t border-slate-700/50">
                        {currentKPIs?.kpiRelations?.congestionProductividadStatus === 'critical' && (
                            <div className="text-[10px] text-red-400 mb-1">
                                ⚠️ Cuello de botella: alta congestión, baja productividad
                            </div>
                        )}
                        {currentKPIs?.kpiRelations?.utilizacionRemanejosStatus === 'critical' && (
                            <div className="text-[10px] text-red-400 mb-1">
                                ⚠️ Terminal saturado con muchos remanejos
                            </div>
                        )}
                        {currentKPIs?.kpiRelations?.balanceUtilizacionStatus === 'critical' && (
                            <div className="text-[10px] text-red-400 mb-1">
                                ⚠️ Riesgo de saturación: más entradas que salidas
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                        Vista completa del terminal
                    </span>
                    <span className="text-xs text-gray-500">
                        {new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        </div>
    );
};