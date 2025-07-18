// src/components/map/MapKPIOverlay.tsx
import React from 'react';
import { usePortKPIs } from '../../hooks/usePortKPIs';
import { useViewNavigation } from '../../contexts/ViewNavigationContext';
import {
    Package, Truck, RefreshCw, Activity, Shuffle, Clock,
    Timer, Anchor, Warehouse
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
    const bloqueFilter = viewState.level === 'bloque' ? viewState.selectedBloque : undefined;

    const {
        currentKPIs,
        isLoading,
        formatKPIValue,
        getStatusForKPI,
        error
    } = usePortKPIs({
        patioFilter,
        bloqueFilter
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
        // Debug para Balance
        if (kpi === 'balanceFlujo') {
            console.log('Balance status:', status, 'Value:', currentKPIs?.balanceFlujo);
        }
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

    // Función para obtener el estado de los KPIs de movimientos
    const getMovementStatus = (type: 'gate' | 'patio' | 'muelle') => {
        let value = 0;
        let thresholds = { good: 0, warning: 0, critical: 0 };

        switch (type) {
            case 'gate':
                value = currentKPIs.movimientosGateHora || 0;
                thresholds = { good: 50, warning: 30, critical: 20 };
                break;
            case 'patio':
                value = currentKPIs.movimientosPatioHora || 0;
                // Para patio, menos es mejor (menos movimientos internos)
                thresholds = { good: 30, warning: 50, critical: 70 };
                break;
            case 'muelle':
                value = currentKPIs.movimientosMuelleHora || 0;
                thresholds = { good: 50, warning: 30, critical: 20 };
                break;
        }

        // Lógica invertida para patio (menos es mejor)
        if (type === 'patio') {
            if (value <= thresholds.good) return 'good';
            if (value <= thresholds.warning) return 'warning';
            return 'critical';
        }

        // Lógica normal para gate y muelle (más es mejor)
        if (value >= thresholds.good) return 'good';
        if (value >= thresholds.warning) return 'warning';
        return 'critical';
    };

    const getMovementStatusBg = (type: 'gate' | 'patio' | 'muelle') => {
        const status = getMovementStatus(type);
        switch (status) {
            case 'good': return 'bg-green-500/10 border-green-500/30';
            case 'warning': return 'bg-yellow-500/10 border-yellow-500/30';
            case 'critical': return 'bg-red-500/10 border-red-500/30';
            default: return 'bg-gray-700/50 border-gray-600/30';
        }
    };

    const getMovementStatusColor = (type: 'gate' | 'patio' | 'muelle') => {
        const status = getMovementStatus(type);
        switch (status) {
            case 'good': return 'text-green-400';
            case 'warning': return 'text-yellow-400';
            case 'critical': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    // Función para obtener el ícono apropiado según el contexto y tipo de movimiento
    const getMovementIcon = (index: number) => {
        const context = currentKPIs.vistaContexto || 'terminal';

        if (index === 1) { // Siempre Gate
            return <Truck className="w-4 h-4 text-cyan-400 mb-1" />;
        } else if (index === 2) { // Variable según contexto
            if (context === 'terminal') return <Warehouse className="w-4 h-4 text-purple-400 mb-1" />;
            if (context === 'patio') return <Activity className="w-4 h-4 text-purple-400 mb-1" />;
            return <Shuffle className="w-4 h-4 text-purple-400 mb-1" />; // bloque - remanejos
        } else { // index === 3
            if (context === 'terminal') return <Anchor className="w-4 h-4 text-blue-400 mb-1" />;
            if (context === 'patio') return <RefreshCw className="w-4 h-4 text-orange-400 mb-1" />;
            return <Activity className="w-4 h-4 text-teal-400 mb-1" />; // bloque - otros bloques
        }
    };

    // Función para formatear los KPIs de movimientos
    const formatMovementKPI = (value: number | undefined, showTotal: boolean = true) => {
        if (value === undefined || value === null || isNaN(value)) {
            return '0 mov';
        }
        return showTotal ? `${value.toLocaleString()} mov` : `${Math.round(value)} mov/h`;
    };

    // Función para obtener descripción contextual mejorada
    const getKPIContext = (kpiName: string) => {
        switch (kpiName) {
            case 'movimientosGate':
                const gate = currentKPIs.movimientosGateHora || 0;
                if (gate < 20) return "Flujo crítico";
                if (gate < 30) return "Flujo bajo";
                if (gate < 50) return "Flujo moderado";
                return "Alta actividad";

            case 'movimientosPatio':
            case 'movimientosInternos':
            case 'remanejos':
                const patio = currentKPIs.movimientosPatioHora || 0;
                if (patio < 30) return "Operación eficiente";
                if (patio < 50) return "Actividad normal";
                if (patio < 70) return "Alta actividad interna";
                return "Exceso de movimientos";

            case 'movimientosMuelle':
            case 'movimientosInterPatios':
            case 'movimientosOtrosBloques':
                const muelle = currentKPIs.movimientosMuelleHora || 0;
                if (muelle < 20) return "Baja operación";
                if (muelle < 30) return "Actividad reducida";
                if (muelle < 50) return "Actividad normal";
                return "Operación intensa";

            case 'utilizacionPorVolumen':
                const util = currentKPIs.utilizacionPorVolumen;
                if (util < 50) return "Mucha capacidad libre";
                if (util < 70) return "Operación normal";
                if (util < 85) return "Cerca del límite";
                return "Terminal saturado";

            case 'variabilidadOperacional':
                const var_ = currentKPIs.variabilidadOperacional;
                if (var_ < 20) return "Muy estable";
                if (var_ < 40) return "Variabilidad normal";
                if (var_ < 60) return "Operación inestable";
                return "Alta volatilidad";

            case 'balanceFlujo':
                const balance = currentKPIs.balanceFlujo;
                if (balance < 0.9) return "Más salidas";
                if (balance <= 1.1) return "Equilibrado";
                if (balance <= 1.3) return "Acumulación moderada";
                return "Acumulación crítica";

            case 'indiceRemanejo':
                const rem = currentKPIs.indiceRemanejo;
                if (rem < 3) return "Excelente";
                if (rem < 5) return "Aceptable";
                if (rem < 8) return "Requiere mejora";
                return "Crítico";

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

    // Obtener etiquetas dinámicas o usar defaults
    const movLabel1 = currentKPIs.labelMovimientos1 || "Movimientos Gate";
    const movLabel2 = currentKPIs.labelMovimientos2 || "Movimientos Patio";
    const movLabel3 = currentKPIs.labelMovimientos3 || "Movimientos Muelle";

    // Determinar título según contexto
    const getOverlayTitle = () => {
        if (viewState.level === 'bloque') {
            return `KPIs Bloque ${viewState.selectedBloque}`;
        } else if (viewState.level === 'patio') {
            return `KPIs Patio ${viewState.selectedPatio?.charAt(0).toUpperCase()}${viewState.selectedPatio?.slice(1)}`;
        }
        return "KPIs de la Terminal";
    };

    return (
        <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm p-4 rounded-lg shadow-xl z-20 border border-slate-700/50">
            <div className="min-w-[400px] max-w-[450px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700/50">
                    <h3 className="text-sm font-bold text-slate-100">
                        {getOverlayTitle()}
                    </h3>
                </div>

                {/* Grid 3x3 con los 9 KPIs reorganizados */}
                <div className="grid grid-cols-3 gap-2">

                    {/* 1. Movimientos Gate - CON ESTADO */}
                    <div className={`rounded-lg p-2 border ${getMovementStatusBg('gate')} hover:scale-105 transition-transform cursor-help`}>
                        <div className="flex flex-col">
                            {getMovementIcon(1)}
                            <span className="text-xs text-gray-300 truncate">{movLabel1}</span>
                            <div className={`text-sm font-bold ${getMovementStatusColor('gate')}`}>
                                {formatMovementKPI(currentKPIs.totalMovimientosGate)}
                            </div>
                            <div className="mt-1">
                                <div className="text-[10px] text-gray-400">
                                    {currentKPIs.movimientosGateHora?.toFixed(0)} mov/h promedio
                                </div>
                                <div className="text-[9px] text-gray-500">
                                    {getKPIContext('movimientosGate')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Movimientos Patio - CON ESTADO */}
                    <div className={`rounded-lg p-2 border ${getMovementStatusBg('patio')} hover:scale-105 transition-transform cursor-help`}>
                        <div className="flex flex-col">
                            {getMovementIcon(2)}
                            <span className="text-xs text-gray-300 truncate">{movLabel2}</span>
                            <div className={`text-sm font-bold ${getMovementStatusColor('patio')}`}>
                                {formatMovementKPI(currentKPIs.totalMovimientosPatio)}
                            </div>
                            <div className="mt-1">
                                <div className="text-[10px] text-gray-400">
                                    {currentKPIs.movimientosPatioHora?.toFixed(0)} mov/h promedio
                                </div>
                                <div className="text-[9px] text-gray-500">
                                    {getKPIContext('movimientosPatio')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Movimientos Muelle - CON ESTADO */}
                    <div className={`rounded-lg p-2 border ${getMovementStatusBg('muelle')} hover:scale-105 transition-transform cursor-help`}>
                        <div className="flex flex-col">
                            {getMovementIcon(3)}
                            <span className="text-xs text-gray-300 truncate">{movLabel3}</span>
                            <div className={`text-sm font-bold ${getMovementStatusColor('muelle')}`}>
                                {formatMovementKPI(currentKPIs.totalMovimientosMuelle)}
                            </div>
                            <div className="mt-1">
                                <div className="text-[10px] text-gray-400">
                                    {currentKPIs.movimientosMuelleHora?.toFixed(0)} mov/h promedio
                                </div>
                                <div className="text-[9px] text-gray-500">
                                    {getKPIContext('movimientosMuelle')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FILA 2: CAPACIDAD/INVENTARIO */}
                    {/* 4. % Utilización */}
                    <div className={`rounded-lg p-2 border ${getStatusBg('utilizacionPorVolumen')} hover:scale-105 transition-transform cursor-help`}>
                        <div className="flex flex-col">
                            <Package className="w-4 h-4 text-green-400 mb-1" />
                            <span className="text-xs text-gray-300">% Utilización</span>
                            <div className={`text-sm font-bold ${getStatusColor('utilizacionPorVolumen')}`}>
                                {formatKPIValue('utilizacionPorVolumen')}
                            </div>
                            <div className="mt-1">
                                <div className="text-[10px] text-gray-400">
                                    {currentKPIs.promedioTeus?.toFixed(0)}/{currentKPIs.capacidadTotal}
                                </div>
                                <div className="text-[9px] text-gray-500">
                                    {getKPIContext('utilizacionPorVolumen')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 5. Variabilidad */}
                    <div className={`rounded-lg p-2 border ${getStatusBg('variabilidadOperacional')} hover:scale-105 transition-transform cursor-help`}>
                        <div className="flex flex-col">
                            <Activity className="w-4 h-4 text-indigo-400 mb-1" />
                            <span className="text-xs text-gray-300">Variabilidad</span>
                            <div className={`text-sm font-bold ${getStatusColor('variabilidadOperacional')}`}>
                                {formatKPIValue('variabilidadOperacional')}
                            </div>
                            <div className="mt-1">
                                <div className="text-[10px] text-gray-400">
                                    Rango: {currentKPIs.rangoOperativo} TEUs
                                </div>
                                <div className="text-[9px] text-gray-500">
                                    {getKPIContext('variabilidadOperacional')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 6. Balance - CORREGIDO */}
                    <div className={`rounded-lg p-2 border ${getStatusBg('balanceFlujo')} hover:scale-105 transition-transform cursor-help`}>
                        <div className="flex flex-col">
                            <RefreshCw className="w-4 h-4 text-yellow-400 mb-1" />
                            <span className="text-xs text-gray-300">Balance</span>
                            <div className={`text-sm font-bold ${getStatusColor('balanceFlujo')}`}>
                                {formatKPIValue('balanceFlujo')}
                            </div>
                            <div className="mt-1">
                                <div className="text-[10px] text-gray-400">
                                    E:{currentKPIs.totalEntradas} / S:{currentKPIs.totalSalidas}
                                </div>
                                <div className="text-[9px] text-gray-500">
                                    {getKPIContext('balanceFlujo')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FILA 3: EFICIENCIA/TIEMPOS */}
                    {/* 7. % Remanejos */}
                    <div className={`rounded-lg p-2 border ${getStatusBg('indiceRemanejo')} hover:scale-105 transition-transform cursor-help`}>
                        <div className="flex flex-col">
                            <Shuffle className="w-4 h-4 text-orange-400 mb-1" />
                            <span className="text-xs text-gray-300">% Remanejos</span>
                            <div className={`text-sm font-bold ${getStatusColor('indiceRemanejo')}`}>
                                {formatKPIValue('indiceRemanejo')}
                            </div>
                            <div className="mt-1">
                                <div className="text-[10px] text-gray-400">
                                    {currentKPIs.totalRemanejos} movimientos
                                </div>
                                <div className="text-[9px] text-gray-500">
                                    {getKPIContext('indiceRemanejo')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 8. CDT */}
                    <div className={`rounded-lg p-2 border ${getStatusBg('tiempoPermanencia')} hover:scale-105 transition-transform cursor-help`}>
                        <div className="flex flex-col">
                            <Clock className="w-4 h-4 text-amber-400 mb-1" />
                            <span className="text-xs text-gray-300">CDT</span>
                            <div className={`text-sm font-bold ${getStatusColor('tiempoPermanencia')}`}>
                                {formatKPIValue('tiempoPermanencia')}
                            </div>
                            <div className="mt-1">
                                <div className="text-[10px] text-gray-400">
                                    {currentKPIs.tiempoPermanencia?.totalContenedores} cont
                                </div>
                                <div className="text-[9px] text-gray-500">
                                    {getKPIContext('tiempoPermanencia')}
                                </div>
                                {currentKPIs.tiempoPermanencia?.criticos > 50 && (
                                    <div className="text-[9px] text-red-400 font-medium">
                                        ⚠️ {currentKPIs.tiempoPermanencia.criticos} críticos
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 9. TTT */}
                    <div className={`rounded-lg p-2 border ${getStatusBg('tiempoCamiones')} hover:scale-105 transition-transform cursor-help`}>
                        <div className="flex flex-col">
                            <Timer className="w-4 h-4 text-teal-400 mb-1" />
                            <span className="text-xs text-gray-300">TTT</span>
                            <div className={`text-sm font-bold ${getStatusColor('tiempoCamiones')}`}>
                                {formatKPIValue('tiempoCamiones')}
                            </div>
                            <div className="mt-1">
                                <div className="text-[10px] text-gray-400">
                                    {currentKPIs.tiempoCamiones?.totalCamiones} camiones
                                </div>
                                <div className="text-[9px] text-gray-500">
                                    {getKPIContext('tiempoCamiones')}
                                </div>
                                {currentKPIs.tiempoCamiones?.promedio > 90 && (
                                    <div className="text-[9px] text-red-400 font-medium">
                                        ⚠️ P90: {currentKPIs.tiempoCamiones.p90}min
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer con información contextual */}
                <div className="mt-3 pt-2 border-t border-slate-700/50">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            Vista: {currentKPIs.vistaContexto || viewState.level}
                        </span>
                        <span className="text-xs text-gray-500">
                            {new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};