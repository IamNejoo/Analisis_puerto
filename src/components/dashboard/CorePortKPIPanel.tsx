// src/components/dashboard/CorePortKPIPanel.tsx
import React, { useState, useEffect } from 'react';
import { usePortKPIs } from '../../hooks/usePortKPIs';
import { useTimeContext } from '../../contexts/TimeContext';
import { useViewNavigation } from '../../contexts/ViewNavigationContext';
import { KPICard } from './KPICard';
import {
    Package, Car, RefreshCw, Zap, Shuffle, Activity,
    AlertCircle, Info, AlertTriangle, Clock, Truck, TrendingUp
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
                // Vista terminal: 8 KPIs principales (6 originales + 2 nuevos)
                return (
                    <>
                        {/* Primera fila - KPIs de capacidad y flujo */}
                        <KPICard
                            title="1. Utilización por Volumen"
                            value={formatKPIValue('utilizacionPorVolumen')}
                            icon={<Package size={20} />}
                            status={getStatusForKPI('utilizacionPorVolumen')}
                            description={KPI_DESCRIPTIONS.utilizacionPorVolumen}
                            subtitle={`${currentKPIs.promedioTeus.toFixed(0)} TEUs promedio de ${currentKPIs.capacidadTotal}`}
                            tooltip={`${KPI_NOTES.utilizacionPorVolumen}. 
                                Rango operativo: ${currentKPIs.rangoOperativo.toFixed(0)} TEUs.
                                Horas críticas (>85%): ${currentKPIs.horasCriticas}`}
                            showInfoIcon={true}
                        />

                        <KPICard
                            title="2. Flujo Promedio en Gates"
                            value={formatKPIValue('flujoPromedioGates')}
                            icon={<Car size={20} />}
                            status={getStatusForKPI('flujoPromedioGates')}
                            description={KPI_DESCRIPTIONS.flujoPromedioGates}
                            tooltip={KPI_NOTES.flujoPromedioGates}
                        />

                        <KPICard
                            title="3. Balance de Flujo E/S"
                            value={formatKPIValue('balanceFlujo')}
                            icon={<RefreshCw size={20} />}
                            status={getStatusForKPI('balanceFlujo')}
                            description={KPI_DESCRIPTIONS.balanceFlujo}
                            subtitle={`E: ${currentKPIs.totalEntradas} | S: ${currentKPIs.totalSalidas}`}
                            tooltip={`${KPI_NOTES.balanceFlujo}. 
                                Terminal al ${currentKPIs?.utilizacionPorVolumen?.toFixed(1)}% de capacidad.`}
                        />

                        {/* Segunda fila - KPIs de eficiencia */}
                        <KPICard
                            title="4. Productividad Operacional"
                            value={formatKPIValue('productividadOperacional')}
                            icon={<Zap size={20} />}
                            status={getStatusForKPI('productividadOperacional')}
                            description={KPI_DESCRIPTIONS.productividadOperacional}
                            subtitle={`Total: ${currentKPIs.totalMovimientos} movimientos`}
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
                            title="6. Variabilidad Operacional"
                            value={formatKPIValue('variabilidadOperacional')}
                            icon={<Activity size={20} />}
                            status={getStatusForKPI('variabilidadOperacional')}
                            description={KPI_DESCRIPTIONS.variabilidadOperacional}
                            subtitle={`Min: ${currentKPIs.minimoTeus} | Max: ${currentKPIs.maximoTeus} TEUs`}
                            tooltip={KPI_NOTES.variabilidadOperacional}
                            isInverseDelta={true}
                        />

                        {/* Tercera fila - Nuevos KPIs de tiempo */}
                        <KPICard
                            title="7. Tiempo de Permanencia"
                            value={formatKPIValue('tiempoPermanencia')}
                            icon={<Clock size={20} />}
                            status={getStatusForKPI('tiempoPermanencia')}
                            description={KPI_DESCRIPTIONS.tiempoPermanencia}
                            subtitle={`${currentKPIs.tiempoPermanencia?.totalContenedores} contenedores | ${currentKPIs.tiempoPermanencia?.criticos} críticos`}
                            tooltip={`${KPI_NOTES.tiempoPermanencia}. 
                                Mediana: ${currentKPIs.tiempoPermanencia?.mediana.toFixed(1)} días.
                                P90: ${currentKPIs.tiempoPermanencia?.p90.toFixed(1)} días`}
                            note={currentKPIs.tiempoPermanencia?.criticos > 100 ?
                                `⚠️ ${currentKPIs.tiempoPermanencia.criticos} contenedores > 7 días` : undefined}
                            isInverseDelta={true}
                        />

                        <KPICard
                            title="8. Tiempo de Camiones"
                            value={formatKPIValue('tiempoCamiones')}
                            icon={<Truck size={20} />}
                            status={getStatusForKPI('tiempoCamiones')}
                            description={KPI_DESCRIPTIONS.tiempoCamiones}
                            subtitle={`${currentKPIs.tiempoCamiones?.totalCamiones} camiones procesados`}
                            tooltip={`${KPI_NOTES.tiempoCamiones}. 
                                Mediana: ${currentKPIs.tiempoCamiones?.mediana} min.
                                P90: ${currentKPIs.tiempoCamiones?.p90} min`}
                            isInverseDelta={true}
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
                                    utilizacionPatio > 70 ? 'warning' : 'good'
                            }
                            description={`Ocupación específica del patio ${patioFilter}`}
                        />

                        <KPICard
                            title="Flujo en Gates del Patio"
                            value={formatKPIValue('flujoPromedioGates')}
                            icon={<Car size={20} />}
                            status={getStatusForKPI('flujoPromedioGates')}
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
                            description="Movimientos/hora en el patio"
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
                            title="Variabilidad del Patio"
                            value={formatKPIValue('variabilidadOperacional')}
                            icon={<Activity size={20} />}
                            status={getStatusForKPI('variabilidadOperacional')}
                            description="Estabilidad operacional"
                            isInverseDelta={true}
                        />
                    </>
                );

            case 'bloque':
                // 🔥 USAR DIRECTAMENTE LOS CAMPOS DE currentKPIs QUE VIENEN DEL BACKEND
                // Recuerda: los nombres exactos deben coincidir con el JSON de tu backend
                const utilizacionBloque = currentKPIs.utilizacionPorVolumen ?? 0;
                const capacidadBloque = currentKPIs.capacidadTotal ?? blockCapacities?.[bloqueFilter || ''] ?? 'N/A';
                const movimientosBloque = currentKPIs.totalMovimientos ?? 0;
                const productividadBloque = currentKPIs.productividadOperacional ?? 0;
                const remanejosBloque = currentKPIs.indiceRemanejo ?? 0;
                const balanceBloque = currentKPIs.balanceFlujo ?? 0;
                const variabilidadBloque = currentKPIs.variabilidadOperacional ?? 0;

                return (
                    <>
                        <KPICard
                            title={`Ocupación del Bloque ${bloqueFilter}`}
                            value={`${utilizacionBloque.toFixed(1)}%`}
                            icon={<Package size={20} />}
                            status={utilizacionBloque > 95 ? 'critical' :
                                utilizacionBloque > 85 ? 'warning' : 'good'}
                            description={`Capacidad: ${capacidadBloque} TEUs`}
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
                            value={`${productividadBloque.toFixed(1)} mov/h`}
                            icon={<Zap size={20} />}
                            status="normal"
                            description="Promedio por hora"
                        />

                        <KPICard
                            title="Remanejos del Bloque"
                            value={`${remanejosBloque}`}
                            icon={<Shuffle size={20} />}
                            status={remanejosBloque > 5 ? 'critical' : remanejosBloque > 3 ? 'warning' : 'good'}
                            description={`% del total`}
                        />

                        <KPICard
                            title="Balance del Bloque"
                            value={balanceBloque.toFixed(2)}
                            icon={<RefreshCw size={20} />}
                            status={getStatusForKPI('balanceFlujo')}
                            description="Entrada vs Salida"
                        />

                        <KPICard
                            title="Variabilidad del Bloque"
                            value={`${variabilidadBloque.toFixed(1)}%`}
                            icon={<Activity size={20} />}
                            status={getStatusForKPI('variabilidadOperacional')}
                            description="Coeficiente de variación"
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
                        {viewState.level === 'terminal' && 'Vista general - 8 KPIs principales con tiempos de servicio'}
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
                        <p className="mt-2">Los KPIs incluyen ahora tiempos de servicio (CDT y TTT) para una visión completa.</p>
                    </div>
                </div>
            )}

            {/* Panel de relaciones KPI */}
            {currentKPIs?.kpiRelations && viewState.level === 'terminal' && (
                <KPIRelationsPanel relations={currentKPIs.kpiRelations} />
            )}

            {/* Grid de KPIs */}
            <div className={`grid gap-4 ${viewState.level === 'terminal'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`}>
                {getKPIsForLevel()}
            </div>

            {/* ALERTAS DE RELACIONES ENTRE KPIs */}
            {viewState.level === 'terminal' && (
                <div className="mt-4 space-y-2">
                    {/* Alerta Flujo-Productividad */}
                    {currentKPIs?.kpiRelations?.congestionProductividadStatus === 'critical' && (
                        <div className="p-3 bg-red-950/30 border border-red-700 rounded-lg">
                            <div className="flex items-start">
                                <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-semibold text-red-300">Cuello de botella detectado</p>
                                    <p className="text-red-200">Flujo en gates bajo ({formatKPIValue('flujoPromedioGates')})
                                        pero baja productividad ({formatKPIValue('productividadOperacional')}).
                                        Posible problema en gates o procesamiento.</p>
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

                    {/* Nueva alerta: Tiempo de Servicio vs Utilización */}
                    {currentKPIs?.kpiRelations?.tiempoServicioUtilizacionStatus === 'critical' && (
                        <div className="p-3 bg-red-950/30 border border-red-700 rounded-lg">
                            <div className="flex items-start">
                                <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-semibold text-red-300">Tiempos de permanencia críticos</p>
                                    <p className="text-red-200">Alta utilización ({formatKPIValue('utilizacionPorVolumen')})
                                        con tiempo de permanencia elevado ({formatKPIValue('tiempoPermanencia')}).
                                        Los contenedores no están saliendo lo suficientemente rápido.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Nueva alerta: Tiempo de Camiones vs Flujo */}
                    {currentKPIs?.kpiRelations?.tiempoServicioFlujoStatus === 'warning' && (
                        <div className="p-3 bg-yellow-950/30 border border-yellow-700 rounded-lg">
                            <div className="flex items-start">
                                <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-semibold text-yellow-300">Ineficiencia en gates</p>
                                    <p className="text-yellow-200">Tiempo de camiones elevado ({formatKPIValue('tiempoCamiones')})
                                        con flujo moderado. Revisar procesos en gates y documentación.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};