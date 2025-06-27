// src/components/map/MapKPIOverlay.tsx
import React from 'react';
import { usePortKPIs } from '../../hooks/usePortKPIs';
import { useViewNavigation } from '../../contexts/ViewNavigationContext';
import {
    Package, Car, RefreshCw, Zap, Shuffle, Activity, Clock, Truck
} from 'lucide-react';

interface MapKPIOverlayProps {
    dataFilePath?: string;
    blockCapacities?: Record<string, number>;
}

export const MapKPIOverlay: React.FC<MapKPIOverlayProps> = ({
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
        patioFilter
    });

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

    // Función para obtener descripción contextual de cada KPI
    const getKPIContext = (kpiName: string) => {
        switch (kpiName) {
            case 'utilizacionPorVolumen':
                const util = currentKPIs.utilizacionPorVolumen;
                if (util < 50) return "Terminal con mucha capacidad libre";
                if (util < 70) return "Operación normal con margen";
                if (util < 85) return "Acercándose al límite operativo";
                return "Terminal cerca de saturación";

            case 'flujoPromedioGates':
                const flujo = currentKPIs.flujoPromedioGates;
                if (flujo < 30) return "Flujo muy bajo, posible inactividad";
                if (flujo < 50) return "Flujo moderado";
                if (flujo < 70) return "Flujo activo";
                return "Alta actividad en gates";

            case 'balanceFlujo':
                const balance = currentKPIs.balanceFlujo;
                if (balance < 0.9) return "Más salidas que entradas";
                if (balance <= 1.1) return "Flujo equilibrado";
                if (balance <= 1.3) return "Acumulación moderada";
                return "Acumulación crítica";

            case 'productividadOperacional':
                const prod = currentKPIs.productividadOperacional;
                if (prod < 50) return "Baja eficiencia operativa";
                if (prod < 80) return "Productividad aceptable";
                if (prod < 100) return "Buena productividad";
                return "Excelente rendimiento";

            case 'indiceRemanejo':
                const rem = currentKPIs.indiceRemanejo;
                if (rem < 3) return "Excelente organización";
                if (rem < 5) return "Nivel aceptable";
                if (rem < 8) return "Requiere optimización";
                return "Urgente reorganizar";

            case 'variabilidadOperacional':
                const var_ = currentKPIs.variabilidadOperacional;
                if (var_ < 30) return "Operación muy estable";
                if (var_ < 50) return "Variabilidad normal";
                if (var_ < 70) return "Operación inestable";
                return "Alta volatilidad";

            case 'tiempoPermanencia':
                const cdt = currentKPIs.tiempoPermanencia?.promedioDias || 0;
                if (cdt < 3) return "Rotación rápida";
                if (cdt < 5) return "Tiempo normal";
                if (cdt < 7) return "Permanencia elevada";
                return "Contenedores estancados";

            case 'tiempoCamiones':
                const ttt = currentKPIs.tiempoCamiones?.promedio || 0;
                if (ttt < 60) return "Proceso ágil";
                if (ttt < 90) return "Tiempo aceptable";
                if (ttt < 120) return "Demoras moderadas";
                return "Colas significativas";

            default:
                return "";
        }
    };

    // Función para determinar si hay alguna alerta crítica
    const hasCriticalAlert = () => {
        return currentKPIs?.kpiRelations?.congestionProductividadStatus === 'critical' ||
            currentKPIs?.kpiRelations?.utilizacionRemanejosStatus === 'critical' ||
            currentKPIs?.kpiRelations?.balanceUtilizacionStatus === 'critical' ||
            currentKPIs?.kpiRelations?.tiempoServicioUtilizacionStatus === 'critical' ||
            currentKPIs?.kpiRelations?.tiempoServicioFlujoStatus === 'critical';
    };

    // Verificar si los tiempos de servicio están en estado crítico
    const hasTimeCriticalAlert = () => {
        return getStatusForKPI('tiempoPermanencia') === 'critical' ||
            getStatusForKPI('tiempoCamiones') === 'critical';
    };

    return (
        <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm p-4 rounded-lg shadow-xl z-20 border border-slate-700/50">
            <div className="min-w-[380px] max-w-[420px]">
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

                {/* Grid 4x2 con los 8 KPIs principales - MÁS DETALLADO */}
                <div className="grid grid-cols-4 gap-2">
                    {/* 1. Utilización */}
                    <div className={`rounded-lg p-2 border ${getStatusBg('utilizacionPorVolumen')} hover:scale-105 transition-transform cursor-help`}>
                        <div className="flex flex-col">
                            <Package className="w-4 h-4 text-blue-400 mb-1" />
                            <span className="text-xs text-gray-300">Utilización</span>
                            <div className={`text-sm font-bold ${getStatusColor('utilizacionPorVolumen')}`}>
                                {formatKPIValue('utilizacionPorVolumen')}
                            </div>
                            <div className="mt-1">
                                <div className="text-[10px] text-gray-400">
                                    {currentKPIs.promedioTeus?.toFixed(0)} de {currentKPIs.capacidadTotal} TEUs
                                </div>
                                <div className="text-[9px] text-gray-500 mt-0.5">
                                    {getKPIContext('utilizacionPorVolumen')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Flujo en Gates */}
                    <div className={`rounded-lg p-2 border ${getStatusBg('flujoPromedioGates')} hover:scale-105 transition-transform cursor-help`}>
                        <div className="flex flex-col">
                            <Car className="w-4 h-4 text-cyan-400 mb-1" />
                            <span className="text-xs text-gray-300">Flujo Gates</span>
                            <div className={`text-sm font-bold ${getStatusColor('flujoPromedioGates')}`}>
                                {formatKPIValue('flujoPromedioGates')}
                            </div>
                            <div className="mt-1">
                                <div className="text-[10px] text-gray-400">
                                    en {currentKPIs.horasConActividad} hrs activas
                                </div>
                                <div className="text-[9px] text-gray-500 mt-0.5">
                                    {getKPIContext('flujoPromedioGates')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Balance */}
                    <div className={`rounded-lg p-2 border ${getStatusBg('balanceFlujo')} hover:scale-105 transition-transform cursor-help`}>
                        <div className="flex flex-col">
                            <RefreshCw className="w-4 h-4 text-purple-400 mb-1" />
                            <span className="text-xs text-gray-300">Balance</span>
                            <div className={`text-sm font-bold ${getStatusColor('balanceFlujo')}`}>
                                {formatKPIValue('balanceFlujo')}
                            </div>
                            <div className="mt-1">
                                <div className="text-[10px] text-gray-400">
                                    E:{currentKPIs.totalEntradas} / S:{currentKPIs.totalSalidas}
                                </div>
                                <div className="text-[9px] text-gray-500 mt-0.5">
                                    {getKPIContext('balanceFlujo')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Productividad */}
                    <div className={`rounded-lg p-2 border ${getStatusBg('productividadOperacional')} hover:scale-105 transition-transform cursor-help`}>
                        <div className="flex flex-col">
                            <Zap className="w-4 h-4 text-green-400 mb-1" />
                            <span className="text-xs text-gray-300">Product.</span>
                            <div className={`text-sm font-bold ${getStatusColor('productividadOperacional')}`}>
                                {formatKPIValue('productividadOperacional')}
                            </div>
                            <div className="mt-1">
                                <div className="text-[10px] text-gray-400">
                                    {currentKPIs.totalMovimientos} mov total
                                </div>
                                <div className="text-[9px] text-gray-500 mt-0.5">
                                    {getKPIContext('productividadOperacional')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 5. Remanejos */}
                    <div className={`rounded-lg p-2 border ${getStatusBg('indiceRemanejo')} hover:scale-105 transition-transform cursor-help`}>
                        <div className="flex flex-col">
                            <Shuffle className="w-4 h-4 text-orange-400 mb-1" />
                            <span className="text-xs text-gray-300">Remanejos</span>
                            <div className={`text-sm font-bold ${getStatusColor('indiceRemanejo')}`}>
                                {formatKPIValue('indiceRemanejo')}
                            </div>
                            <div className="mt-1">
                                <div className="text-[10px] text-gray-400">
                                    {currentKPIs.totalRemanejos} movimientos
                                </div>
                                <div className="text-[9px] text-gray-500 mt-0.5">
                                    {getKPIContext('indiceRemanejo')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 6. Variabilidad */}
                    <div className={`rounded-lg p-2 border ${getStatusBg('variabilidadOperacional')} hover:scale-105 transition-transform cursor-help`}>
                        <div className="flex flex-col">
                            <Activity className="w-4 h-4 text-indigo-400 mb-1" />
                            <span className="text-xs text-gray-300">Variabilidad</span>
                            <div className={`text-sm font-bold ${getStatusColor('variabilidadOperacional')}`}>
                                {formatKPIValue('variabilidadOperacional')}
                            </div>
                            <div className="mt-1">
                                <div className="text-[10px] text-gray-400">
                                    {currentKPIs.minimoTeus}-{currentKPIs.maximoTeus} TEUs
                                </div>
                                <div className="text-[9px] text-gray-500 mt-0.5">
                                    {getKPIContext('variabilidadOperacional')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 7. Tiempo Permanencia (CDT) */}
                    <div className={`rounded-lg p-2 border ${getStatusBg('tiempoPermanencia')} hover:scale-105 transition-transform cursor-help`}>
                        <div className="flex flex-col">
                            <Clock className="w-4 h-4 text-amber-400 mb-1" />
                            <span className="text-xs text-gray-300">CDT</span>
                            <div className={`text-sm font-bold ${getStatusColor('tiempoPermanencia')}`}>
                                {formatKPIValue('tiempoPermanencia')}
                            </div>
                            <div className="mt-1">
                                <div className="text-[10px] text-gray-400">
                                    {currentKPIs.tiempoPermanencia?.totalContenedores} contenedores
                                </div>
                                <div className="text-[9px] text-gray-500 mt-0.5">
                                    {getKPIContext('tiempoPermanencia')}
                                </div>
                                {currentKPIs.tiempoPermanencia?.criticos > 100 && (
                                    <div className="text-[9px] text-red-400 font-medium">
                                        ⚠️ {currentKPIs.tiempoPermanencia.criticos} críticos
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 8. Tiempo Camiones (TTT) */}
                    <div className={`rounded-lg p-2 border ${getStatusBg('tiempoCamiones')} hover:scale-105 transition-transform cursor-help`}>
                        <div className="flex flex-col">
                            <Truck className="w-4 h-4 text-teal-400 mb-1" />
                            <span className="text-xs text-gray-300">TTT</span>
                            <div className={`text-sm font-bold ${getStatusColor('tiempoCamiones')}`}>
                                {formatKPIValue('tiempoCamiones')}
                            </div>
                            <div className="mt-1">
                                <div className="text-[10px] text-gray-400">
                                    {currentKPIs.tiempoCamiones?.totalCamiones} camiones
                                </div>
                                <div className="text-[9px] text-gray-500 mt-0.5">
                                    {getKPIContext('tiempoCamiones')}
                                </div>
                                {currentKPIs.tiempoCamiones?.promedio > 120 && (
                                    <div className="text-[9px] text-red-400 font-medium">
                                        ⚠️ P90: {currentKPIs.tiempoCamiones.p90}min
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Separador visual para tiempos de servicio */}
                {hasTimeCriticalAlert() && (
                    <div className="mt-2 p-2 bg-red-900/20 rounded border border-red-700/30">
                        <div className="text-[11px] text-red-300 font-medium">
                            ⏱️ Tiempos de servicio críticos detectados
                        </div>
                    </div>
                )}

                {/* Alertas críticas resumidas */}
                {hasCriticalAlert() && (
                    <div className="mt-2 pt-2 border-t border-slate-700/50">
                        {currentKPIs?.kpiRelations?.congestionProductividadStatus === 'critical' && (
                            <div className="text-[10px] text-red-400 mb-1">
                                ⚠️ Cuello de botella: bajo flujo, baja productividad
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
                        {currentKPIs?.kpiRelations?.tiempoServicioUtilizacionStatus === 'critical' && (
                            <div className="text-[10px] text-red-400 mb-1">
                                ⚠️ Alta permanencia + alta utilización
                            </div>
                        )}
                        {currentKPIs?.kpiRelations?.tiempoServicioFlujoStatus === 'critical' && (
                            <div className="text-[10px] text-red-400 mb-1">
                                ⚠️ Demora en gates afectando flujo
                            </div>
                        )}
                    </div>
                )}

                {/* Footer con información adicional */}
                <div className="mt-3 pt-2 border-t border-slate-700/50">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">
                            Vista completa del terminal
                        </span>
                        <span className="text-xs text-gray-500">
                            {new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    {/* Indicador de capacidad total */}
                    <div className="text-[10px] text-gray-600">
                        Capacidad: {currentKPIs.capacidadTotal} TEUs |
                        Promedio: {currentKPIs.promedioTeus?.toFixed(0)} TEUs
                    </div>
                </div>
            </div>
        </div>
    );
};