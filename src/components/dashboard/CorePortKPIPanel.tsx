// src/components/dashboard/CorePortKPIPanel.tsx
import React, { useState, useEffect } from 'react';
import { usePortKPIs } from '../../hooks/usePortKPIs';
import { useTimeContext } from '../../contexts/TimeContext';
import { useViewNavigation } from '../../contexts/ViewNavigationContext';
import { KPICard } from './KPICard';
import {
    Package, Car, RefreshCw, Zap, Shuffle, Gauge,
    AlertCircle, Info, AlertTriangle
} from 'lucide-react';
import { KPI_DESCRIPTIONS, KPI_NOTES } from '../../types/portKpis';
import { StatusBadge } from '../shared/StatusBadge';
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
    console.log('CorePortKPIPanel - currentKPIs:', currentKPIs);
    console.log('CorePortKPIPanel - kpiRelations:', currentKPIs?.kpiRelations);
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

    // Función para determinar qué KPIs mostrar según el nivel
    const getKPIsForLevel = () => {
        switch (viewState.level) {
            case 'terminal':
                // Vista terminal: Los 6 KPIs principales con contexto de relaciones
                return (
                    <>
                        <KPICard
                            title="1. Utilización por Volumen"
                            value={formatKPIValue('utilizacionPorVolumen')}
                            icon={<Package size={20} />}
                            status={getStatusForKPI('utilizacionPorVolumen')}
                            description={`${KPI_DESCRIPTIONS.utilizacionPorVolumen}${currentKPIs.indiceRemanejo > 5
                                ? ` (⚠️ ${formatKPIValue('indiceRemanejo')} en remanejos)`
                                : ''
                                }`}
                            tooltip={`Capacidad total: 18,144 TEUs. ${KPI_NOTES.utilizacionPorVolumen}. 
                                Con ${formatKPIValue('indiceRemanejo')} de remanejos.
                                Alta utilización + altos remanejos = desorganización.`}
                        />

                        <KPICard
                            title="2. Congestión Vehicular"
                            value={formatKPIValue('congestionVehicular')}
                            icon={<Car size={20} />}
                            status={getStatusForKPI('congestionVehicular')}
                            description={`${KPI_DESCRIPTIONS.congestionVehicular}${currentKPIs.productividadOperacional < 50
                                ? ' (⚠️ Baja productividad)'
                                : ''
                                }`}
                            tooltip={`${KPI_NOTES.congestionVehicular}. 
                                Compara con Productividad: si congestión > productividad × 2, hay ineficiencia.`}
                            note="⚠️ Limitación: No incluye cantidad de vehículos"
                        />

                        <KPICard
                            title="3. Balance de Flujo E/S"
                            value={formatKPIValue('balanceFlujo')}
                            icon={<RefreshCw size={20} />}
                            status={getStatusForKPI('balanceFlujo')}
                            description={KPI_DESCRIPTIONS.balanceFlujo}
                            tooltip={`Ideal: 0.8-1.2. ${KPI_NOTES.balanceFlujo}. 
                                Terminal al ${currentKPIs?.utilizacionPorVolumen?.toFixed(1)}% de capacidad. 
                                Balance alto + alta utilización = riesgo crítico.`}
                        />

                        <KPICard
                            title="4. Productividad Operacional"
                            value={formatKPIValue('productividadOperacional')}
                            icon={<Zap size={20} />}
                            status={getStatusForKPI('productividadOperacional')}
                            description={`${KPI_DESCRIPTIONS.productividadOperacional}${currentKPIs.indiceRemanejo > 5
                                ? ` (⚠️ ${formatKPIValue('indiceRemanejo')} en remanejos)`
                                : ''
                                }`}
                            tooltip={KPI_NOTES.productividadOperacional}
                        />

                        <KPICard
                            title="5. Índice de Remanejo"
                            value={formatKPIValue('indiceRemanejo')}
                            icon={<Shuffle size={20} />}
                            status={getStatusForKPI('indiceRemanejo')}
                            description={KPI_DESCRIPTIONS.indiceRemanejo}
                            tooltip={KPI_NOTES.indiceRemanejo}
                            isInverseDelta={true}
                        />

                        <KPICard
                            title="6. Saturación Operacional"
                            value={formatKPIValue('saturacionOperacional')}
                            icon={<Gauge size={20} />}
                            status={getStatusForKPI('saturacionOperacional')}
                            description={KPI_DESCRIPTIONS.saturacionOperacional}
                            tooltip={KPI_NOTES.saturacionOperacional}
                        />
                    </>
                );

            case 'patio':
                // Vista patio: KPIs filtrados para el patio específico
                const utilizacionPatio = currentKPIs.utilizacionPorVolumen || 0;
                return (
                    <>
                        <KPICard
                            title={`Utilización del Patio ${patioFilter}`}
                            value={`${utilizacionPatio.toFixed(1)}%`}
                            icon={<Package size={20} />}
                            status={
                                utilizacionPatio > 85 ? 'critical' :
                                    utilizacionPatio > 60 ? 'warning' : 'good'
                            }
                            description={`Ocupación específica del patio ${patioFilter}`}
                        />

                        <KPICard
                            title="Congestión del Patio"
                            value={formatKPIValue('congestionVehicular')}
                            icon={<Car size={20} />}
                            status={getStatusForKPI('congestionVehicular')}
                            description="Movimientos en gates del patio"
                        />

                        <KPICard
                            title="Balance E/S del Patio"
                            value={formatKPIValue('balanceFlujo')}
                            icon={<RefreshCw size={20} />}
                            status={getStatusForKPI('balanceFlujo')}
                            description="Equilibrio del patio"
                        />

                        <KPICard
                            title="Productividad del Patio"
                            value={formatKPIValue('productividadOperacional')}
                            icon={<Zap size={20} />}
                            status={getStatusForKPI('productividadOperacional')}
                            description="Contenedores/hora en el patio"
                        />

                        <KPICard
                            title="Remanejos del Patio"
                            value={formatKPIValue('indiceRemanejo')}
                            icon={<Shuffle size={20} />}
                            status={getStatusForKPI('indiceRemanejo')}
                            description="% movimientos improductivos"
                            isInverseDelta={true}
                        />

                        <KPICard
                            title="Saturación del Patio"
                            value={formatKPIValue('saturacionOperacional')}
                            icon={<Gauge size={20} />}
                            status={getStatusForKPI('saturacionOperacional')}
                            description="Vs máximo histórico del patio"
                        />
                    </>
                );

            case 'bloque':
                // Vista bloque: KPIs muy específicos del bloque
                const utilizacionBloque = currentKPIs.utilizacionPorBloque?.[bloqueFilter || ''] || 0;
                const movimientosBloque = currentKPIs.movimientosPorBloque?.[bloqueFilter || ''] || 0;
                const remanejosBloque = currentKPIs.remanejosPorBloque?.[bloqueFilter || ''] || 0;
                const indiceRemanejoBloque = movimientosBloque > 0 ?
                    (remanejosBloque / movimientosBloque) * 100 : 0;

                return (
                    <>
                        <KPICard
                            title={`Ocupación del Bloque ${bloqueFilter}`}
                            value={`${utilizacionBloque.toFixed(1)}%`}
                            icon={<Package size={20} />}
                            status={
                                utilizacionBloque > 95 ? 'critical' :
                                    utilizacionBloque > 85 ? 'warning' : 'good'
                            }
                            description={`Capacidad: 1,008 TEUs`}
                            tooltip="Basado en promedio de TEUs del período"
                        />

                        <KPICard
                            title="Movimientos del Bloque"
                            value={`${movimientosBloque}`}
                            icon={<Car size={20} />}
                            status="normal"
                            description="Total en el período"
                        />

                        <KPICard
                            title="Productividad Local"
                            value={`${(movimientosBloque / (historicalData.filter(d => d.bloque === bloqueFilter).length || 1)).toFixed(1)} mov/h`}
                            icon={<Zap size={20} />}
                            status="normal"
                            description="Promedio por hora"
                        />

                        <KPICard
                            title="Remanejos del Bloque"
                            value={`${remanejosBloque}`}
                            icon={<Shuffle size={20} />}
                            status={indiceRemanejoBloque > 5 ? 'critical' : indiceRemanejoBloque > 3 ? 'warning' : 'good'}
                            description={`${indiceRemanejoBloque.toFixed(1)}% del total`}
                        />

                        <KPICard
                            title="Balance del Bloque"
                            value={formatKPIValue('balanceFlujo')}
                            icon={<RefreshCw size={20} />}
                            status={getStatusForKPI('balanceFlujo')}
                            description="Entrada vs Salida"
                        />

                        <KPICard
                            title="Saturación del Bloque"
                            value={formatKPIValue('saturacionOperacional')}
                            icon={<Gauge size={20} />}
                            status={getStatusForKPI('saturacionOperacional')}
                            description="Histórico del bloque"
                        />
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-100">
                        KPIs de Congestión del Terminal
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        {viewState.level === 'terminal' && 'Vista general - 6 KPIs principales'}
                        {viewState.level === 'patio' && `KPIs del patio ${patioFilter}`}
                        {viewState.level === 'bloque' && `KPIs del bloque ${bloqueFilter}`}
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
                        <p>• <strong>Verde:</strong> Operación óptima</p>
                        <p>• <strong>Amarillo:</strong> Requiere atención</p>
                        <p>• <strong>Rojo:</strong> Situación crítica</p>
                        <p className="mt-2">Los KPIs se complementan entre sí para dar una visión completa.</p>
                    </div>
                </div>
            )}
            {/* AGREGAR AQUÍ - Panel de relaciones KPI */}
            {currentKPIs?.kpiRelations ? (
                <div className="mb-6">
                    <KPIRelationsPanel relations={currentKPIs.kpiRelations} />
                </div>
            ) : (
                <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                    <p className="text-yellow-300">No hay datos de relaciones KPI disponibles</p>
                    <pre className="text-xs mt-2">{JSON.stringify(currentKPIs, null, 2)}</pre>
                </div>
            )}
            {/* Grid de KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getKPIsForLevel()}
            </div>

            {/* ALERTAS DE RELACIONES ENTRE KPIs */}
            {viewState.level === 'terminal' && (
                <div className="mt-4 space-y-2">
                    {/* Alerta Congestión-Productividad */}
                    {currentKPIs?.kpiRelations?.congestionProductividadStatus === 'critical' && (
                        <div className="p-3 bg-red-950/30 border border-red-700 rounded-lg">
                            <div className="flex items-start">
                                <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-semibold text-red-300">Cuello de botella detectado</p>
                                    <p className="text-red-200">Alta congestión vehicular ({formatKPIValue('congestionVehicular')})
                                        pero baja productividad ({formatKPIValue('productividadOperacional')}).
                                        Posible problema en gates o procesamiento.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentKPIs?.kpiRelations?.congestionProductividadStatus === 'warning' &&
                        currentKPIs.congestionVehicular < 30 && (
                            <div className="p-3 bg-yellow-950/30 border border-yellow-700 rounded-lg">
                                <div className="flex items-start">
                                    <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-semibold text-yellow-300">Posible falta de recursos</p>
                                        <p className="text-yellow-200">Baja congestión y productividad pueden indicar
                                            insuficiencia de camiones o personal operativo.</p>
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
                                    <p className="text-red-200">Alta utilización ({formatKPIValue('utilizacionPorVolumen')})
                                        con muchos remanejos ({formatKPIValue('indiceRemanejo')}).
                                        Urgente reorganizar para evitar colapso operativo.</p>
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
                                    <p className="text-red-200">Entran muchos más contenedores de los que salen
                                        (balance: {formatKPIValue('balanceFlujo')}) y el terminal ya está muy lleno
                                        ({formatKPIValue('utilizacionPorVolumen')}). Acelerar salidas urgentemente.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};