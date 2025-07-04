// src/components/dashboard/CorePortKPIPanel.tsx
import React, { useState, useEffect } from 'react';
import { usePortKPIs } from '../../hooks/usePortKPIs';
import { useTimeContext } from '../../contexts/TimeContext';
import { useViewNavigation } from '../../contexts/ViewNavigationContext';
import { KPICard } from './KPICard';
import {
    Package, Truck, RefreshCw, Activity, Shuffle, Clock,
    AlertCircle, Info, AlertTriangle, Timer, Anchor, Warehouse
} from 'lucide-react';
import { KPIRelationsPanel } from '../shared/KPIRelationsPanel';

interface CorePortKPIPanelProps {
    dataFilePath?: string;
    blockCapacities?: Record<string, number>;
}

export const CorePortKPIPanel: React.FC<CorePortKPIPanelProps> = ({
    blockCapacities,
}) => {
    const { timeState, isLoadingData } = useTimeContext();
    const { viewState } = useViewNavigation();
    const [showInfo, setShowInfo] = useState(false);

    const patioFilter = viewState.level === 'patio' || viewState.level === 'bloque'
        ? viewState.selectedPatio : undefined;
    const bloqueFilter = viewState.level === 'bloque'
        ? viewState.selectedBloque : undefined;

    const {
        currentKPIs,
        historicalData,
        aggregatedData,
        isLoading: isLoadingKPIs,
        error,
        getStatusForKPI,
        formatKPIValue,
        refreshData
    } = usePortKPIs({
        patioFilter,
        bloqueFilter,
    });

    const isLoading = isLoadingKPIs || isLoadingData;

    if (isLoading) {
        return (
            <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700">
                <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                    <span className="text-slate-400">Cargando KPIs del terminal...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700">
                <div className="flex items-center text-red-400 mb-3">
                    <AlertCircle size={20} className="mr-2" />
                    <h3 className="font-semibold">Error al cargar datos</h3>
                </div>
                <p className="text-sm text-slate-400">{error}</p>
                <button
                    onClick={refreshData}
                    className="mt-3 px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    if (!currentKPIs) {
        return (
            <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700">
                <p className="text-slate-500 text-center">No hay datos disponibles</p>
            </div>
        );
    }

    // Función helper para formatear movimientos totales
    const formatMovementKPI = (value: number | undefined, showTotal: boolean = true) => {
        if (value === undefined || value === null || isNaN(value)) {
            return '0 mov';
        }
        return showTotal ? `${value.toLocaleString()} mov` : `${Math.round(value)} mov/h`;
    };

    // Función para obtener el ícono apropiado según el contexto
    const getMovementIcon = (index: number) => {
        const context = currentKPIs.vistaContexto || 'terminal';

        if (index === 1) { // Siempre Gate
            return <Truck size={20} />;
        } else if (index === 2) { // Variable según contexto
            if (context === 'terminal') return <Warehouse size={20} />;
            if (context === 'patio') return <Activity size={20} />;
            return <Shuffle size={20} />; // bloque - remanejos
        } else { // index === 3
            if (context === 'terminal') return <Anchor size={20} />;
            if (context === 'patio') return <RefreshCw size={20} />;
            return <Activity size={20} />; // bloque - otros bloques
        }
    };

    // Función para obtener descripción contextual
    const getKPIContext = (kpiName: string) => {
        switch (kpiName) {
            case 'movimientosGate':
                const gate = currentKPIs.movimientosGateHora || 0;
                if (gate < 30) return "Flujo muy bajo";
                if (gate < 50) return "Flujo moderado";
                if (gate < 70) return "Flujo activo";
                return "Alta actividad";

            case 'movimientosPatio':
            case 'movimientosInternos':
            case 'remanejos':
                const patio = currentKPIs.movimientosPatioHora || 0;
                if (patio < 20) return "Operación eficiente";
                if (patio < 40) return "Actividad normal";
                if (patio < 60) return "Alta actividad interna";
                return "Exceso de movimientos";

            case 'movimientosMuelle':
            case 'movimientosInterPatios':
            case 'movimientosOtrosBloques':
                const muelle = currentKPIs.movimientosMuelleHora || 0;
                if (muelle < 30) return "Baja actividad";
                if (muelle < 50) return "Actividad normal";
                if (muelle < 70) return "Alta operación";
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

    // Obtener etiquetas dinámicas
    const movLabel1 = currentKPIs.labelMovimientos1 || "Movimientos Gate";
    const movLabel2 = currentKPIs.labelMovimientos2 || "Movimientos Patio";
    const movLabel3 = currentKPIs.labelMovimientos3 || "Movimientos Muelle";

    // Determinar título según contexto
    const getPanelTitle = () => {
        switch (viewState.level) {
            case 'terminal':
                return "KPIs del Terminal - Vista Completa";
            case 'patio':
                return `KPIs del Patio ${patioFilter?.charAt(0).toUpperCase()}${patioFilter?.slice(1)}`;
            case 'bloque':
                return `KPIs del Bloque ${bloqueFilter}`;
            default:
                return "KPIs de Congestión";
        }
    };

    // AHORA TODOS LOS NIVELES USAN EL MISMO GRID 3x3
    const getKPIsGrid = () => (
        <>
            {/* FILA 1: MOVIMIENTOS */}
            <KPICard
                title={movLabel1}
                value={formatMovementKPI(currentKPIs.totalMovimientosGate)}
                icon={getMovementIcon(1)}
                status={getStatusForKPI('flujoPromedioGates')}
                description={`${currentKPIs.movimientosGateHora?.toFixed(0)} mov/h promedio`}
                tooltip={getKPIContext('movimientosGate')}
            />

            <KPICard
                title={movLabel2}
                value={formatMovementKPI(currentKPIs.movimientosPatioHora, false)}
                icon={getMovementIcon(2)}
                status='normal'
                description={getKPIContext(movLabel2.toLowerCase().replace(' ', ''))}
            />

            <KPICard
                title={movLabel3}
                value={formatMovementKPI(currentKPIs.movimientosMuelleHora, false)}
                icon={getMovementIcon(3)}
                status='normal'
                description={getKPIContext(movLabel3.toLowerCase().replace(' ', ''))}
            />

            {/* FILA 2: CAPACIDAD/INVENTARIO */}
            <KPICard
                title="% Utilización"
                value={formatKPIValue('utilizacionPorVolumen')}
                icon={<Package size={20} />}
                status={getStatusForKPI('utilizacionPorVolumen')}
                description={`${currentKPIs.promedioTeus?.toFixed(0)}/${currentKPIs.capacidadTotal} TEUs`}
                subtitle={getKPIContext('utilizacionPorVolumen')}
                tooltip={`Rango: ${currentKPIs.rangoOperativo} TEUs`}
            />

            <KPICard
                title="Variabilidad"
                value={formatKPIValue('variabilidadOperacional')}
                icon={<Activity size={20} />}
                status={getStatusForKPI('variabilidadOperacional')}
                description={`Rango: ${currentKPIs.rangoOperativo} TEUs`}
                subtitle={getKPIContext('variabilidadOperacional')}
                isInverseDelta={true}
            />

            <KPICard
                title="Balance"
                value={formatKPIValue('balanceFlujo')}
                icon={<RefreshCw size={20} />}
                status={getStatusForKPI('balanceFlujo')}
                description={`E:${currentKPIs.totalEntradas} / S:${currentKPIs.totalSalidas}`}
                subtitle={getKPIContext('balanceFlujo')}
            />

            {/* FILA 3: EFICIENCIA/TIEMPOS */}
            <KPICard
                title="% Remanejos"
                value={formatKPIValue('indiceRemanejo')}
                icon={<Shuffle size={20} />}
                status={getStatusForKPI('indiceRemanejo')}
                description={`${currentKPIs.totalRemanejos} movimientos`}
                subtitle={getKPIContext('indiceRemanejo')}
                isInverseDelta={true}
            />

            <KPICard
                title="CDT"
                value={formatKPIValue('tiempoPermanencia')}
                icon={<Clock size={20} />}
                status={getStatusForKPI('tiempoPermanencia')}
                description={`${currentKPIs.tiempoPermanencia?.totalContenedores} cont`}
                subtitle={getKPIContext('tiempoPermanencia')}
                tooltip={currentKPIs.tiempoPermanencia?.criticos > 50 ?
                    `⚠️ ${currentKPIs.tiempoPermanencia.criticos} críticos` : undefined}
                isInverseDelta={true}
            />

            <KPICard
                title="TTT"
                value={formatKPIValue('tiempoCamiones')}
                icon={<Timer size={20} />}
                status={getStatusForKPI('tiempoCamiones')}
                description={`${currentKPIs.tiempoCamiones?.totalCamiones} camiones`}
                subtitle={getKPIContext('tiempoCamiones')}
                tooltip={currentKPIs.tiempoCamiones?.promedio > 90 ?
                    `⚠️ P90: ${currentKPIs.tiempoCamiones.p90}min` : undefined}
                isInverseDelta={true}
            />
        </>
    );

    return (
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-100">
                        {getPanelTitle()}
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Vista: {currentKPIs.vistaContexto || viewState.level}
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Información sobre KPIs"
                    >
                        <Info size={18} className="text-slate-400" />
                    </button>

                    <button
                        onClick={refreshData}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Recargar datos"
                    >
                        <RefreshCw size={18} className="text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Panel de información */}
            {showInfo && (
                <div className="mb-6 p-4 bg-blue-950/30 rounded-lg border border-blue-700">
                    <h3 className="font-semibold text-blue-300 mb-2">Información sobre los KPIs</h3>
                    <div className="text-sm text-blue-200 space-y-1">
                        <p>• <strong>Movimientos:</strong> Totales o promedio por hora según contexto</p>
                        <p>• <strong>Verde:</strong> Operación óptima</p>
                        <p>• <strong>Amarillo:</strong> Requiere atención</p>
                        <p>• <strong>Rojo:</strong> Situación crítica</p>
                        <p className="mt-2">Las etiquetas se adaptan según el contexto (terminal/patio/bloque).</p>
                    </div>
                </div>
            )}



            {/* Grid 3x3 de KPIs - SIEMPRE EL MISMO PARA TODOS LOS NIVELES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getKPIsGrid()}
            </div>

            {/* ALERTAS DE RELACIONES ENTRE KPIs */}
            <div className="mt-4 space-y-2">
                {/* Alerta Flujo-Productividad */}
                {currentKPIs?.kpiRelations?.congestionProductividadStatus === 'critical' && (
                    <div className="p-3 bg-red-950/30 border border-red-700 rounded-lg">
                        <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-semibold text-red-300">Cuello de botella detectado</p>
                                <p className="text-red-200">Bajo flujo en gates con baja productividad general.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Alerta Utilización-Remanejos */}
                {currentKPIs?.kpiRelations?.utilizacionRemanejosStatus === 'critical' && (
                    <div className="p-3 bg-red-950/30 border border-red-700 rounded-lg">
                        <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-semibold text-red-300">Terminal saturado y desorganizado</p>
                                <p className="text-red-200">Alta utilización con muchos remanejos.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Alerta Balance-Utilización */}
                {currentKPIs?.kpiRelations?.balanceUtilizacionStatus === 'critical' && (
                    <div className="p-3 bg-red-950/30 border border-red-700 rounded-lg">
                        <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-semibold text-red-300">Riesgo crítico de saturación</p>
                                <p className="text-red-200">Desequilibrio crítico de flujos</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Alerta TTT vs Congestión */}
                {/* 
                {currentKPIs?.kpiRelations?.tttCongestionStatus === 'critical' && (
                    <div className="p-3 bg-red-950/30 border border-red-700 rounded-lg">
                        <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-semibold text-red-300">⚠️ Cuellos de botella detectados en gates</p>
                            </div>
                        </div>
                    </div>
                )}
                */}
            </div>
        </div>
    );
};