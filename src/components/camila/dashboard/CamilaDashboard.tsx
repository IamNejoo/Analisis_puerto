// components/camila/dashboard/CamilaDashboard.tsx

import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import type { CamilaConfig } from '../../../types/camila';
import { useCamilaDashboard } from '../../../hooks/useCamilaData';
import CamilaHeader from './CamilaHeader';
import CamilaStatusBar from './CamilaStatusBar';
import ModelConfigSelector from '../selectors/ModelConfigSelector';
import KPIOverview from '../analytics/KPIOverview';
import WorkloadDistribution from '../analytics/WorkloadDistribution';
import GrueUtilization from '../analytics/GrueUtilization';
import GrueAssignmentMatrix from '../operations/GrueAssignmentMatrix';
import TruckQuotasPanel from '../operations/TruckQuotasPanel';
import TimelineView from '../operations/TimelineView';
import RealDataComparison from '../comparison/RealDataComparison';
import FeasibilityAnalysis from '../comparison/FeasibilityAnalysis';
import InfeasibleShifts from '../alerts/InfeasibleShifts';
import LoadingState from '../shared/LoadingState';
import ErrorState from '../shared/ErrorState';
import EmptyState from '../shared/EmptyState';

export const CamilaDashboard: React.FC = () => {
    const [config, setConfig] = useState<CamilaConfig>({
        anio: 2022,
        semana: 1,
        turno: 1,
        participacion: 68,
        dispersion: 'K'
    });

    const [activeView, setActiveView] = useState<'analytics' | 'operations' | 'comparison'>('analytics');
    const { data, loading, error } = useCamilaDashboard(config);

    if (loading) return <LoadingState message="Cargando datos de Camila..." />;
    if (error) return <ErrorState error={error} onRetry={() => window.location.reload()} />;
    if (!data) return <EmptyState message="No hay datos disponibles para la configuración seleccionada" />;

    const hasSolution = data.resultado.total_movimientos_modelo > 0;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Header */}
                <CamilaHeader
                    config={config}
                    resultado={data.resultado}
                    onViewChange={setActiveView}
                    activeView={activeView}
                />

                {/* Status Bar */}
                <CamilaStatusBar
                    hasSolution={hasSolution}
                    estadoResultado={data.resultado.estado}
                    totalMovimientos={data.resultado.total_movimientos_modelo}
                />

                {/* Selector de configuración */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <ModelConfigSelector
                        config={config}
                        onChange={setConfig}
                    />
                </div>

                {/* Alerta si no hay solución */}
                {!hasSolution && (
                    <InfeasibleShifts
                        turno={data.resultado.turno}
                        semana={data.resultado.semana}
                        mensaje="Camila no encontró una solución factible para este turno"
                    />
                )}

                {/* Vista Analytics */}
                {activeView === 'analytics' && (
                    <div className="space-y-6">
                        <KPIOverview data={data} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <WorkloadDistribution data={data} />
                            <GrueUtilization metricas={data.metricas_gruas} />
                        </div>
                    </div>
                )}

                {/* Vista Operations */}
                {activeView === 'operations' && (
                    <div className="space-y-6">
                        <GrueAssignmentMatrix asignaciones={data.asignaciones} />
                        <TruckQuotasPanel cuotas={data.cuotas_camiones} />
                        <TimelineView data={data} />
                    </div>
                )}

                {/* Vista Comparison */}
                {activeView === 'comparison' && (
                    <div className="space-y-6">
                        {data.comparaciones_real && data.comparaciones_real.length > 0 ? (
                            <>
                                <RealDataComparison comparaciones={data.comparaciones_real} />
                                <FeasibilityAnalysis data={data} />
                            </>
                        ) : (
                            <EmptyState
                                message="No hay datos reales disponibles para comparar"
                                icon={<Activity className="text-slate-400" size={48} />}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CamilaDashboard;