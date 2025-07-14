// components/camila/CamilaIntegratedPanel.tsx - VERSIÓN CORREGIDA

import React, { useState, useMemo } from 'react';
import { useCamilaDashboard } from '../../hooks/useCamilaData';
import { useTimeContext } from '../../contexts/TimeContext';
import { Tabs } from '../shared/Tabs';
import KPIOverview from './analytics/KPIOverview';
import WorkloadDistribution from './analytics/WorkloadDistribution';
import GrueUtilization from './analytics/GrueUtilization';
import GrueAssignmentMatrix from './operations/GrueAssignmentMatrix';
import TruckQuotasPanel from './operations/TruckQuotasPanel';
import TimelineView from './operations/TimelineView';
import RealDataComparison from './comparison/RealDataComparison';
import FeasibilityAnalysis from './comparison/FeasibilityAnalysis';
import InfeasibleShifts from './alerts/InfeasibleShifts';
import LoadingState from './shared/LoadingState';
import ErrorState from './shared/ErrorState';
import EmptyState from './shared/EmptyState';
import {
    Activity,
    BarChart3,
    Truck,
    Clock,
    AlertCircle,
    Settings,
    GitCompare,
    Download,
    Calendar
} from 'lucide-react';
import type { CamilaConfig } from '../../types/camila';
import { camilaService } from '../../services/camilaApi';

export const CamilaIntegratedPanel: React.FC = () => {
    const { timeState } = useTimeContext();
    const [activeTab, setActiveTab] = useState('kpis');

    // Convertir la configuración del timeState al formato de CamilaConfig
    const camilaConfig = useMemo<CamilaConfig | null>(() => {
        if (!timeState?.camilaConfig) return null;

        return {
            anio: 2022, // Año por defecto o desde configuración
            semana: timeState.camilaConfig.week,
            turno: timeState.camilaConfig.shift,
            participacion: 68, // Participación por defecto o desde configuración
            dispersion: timeState.camilaConfig.withSegregations ? 'K' : 'N'
        };
    }, [timeState?.camilaConfig]);

    // Usar el hook con la nueva estructura
    const { data, loading: isLoading, error } = useCamilaDashboard(camilaConfig);

    const tabs = [
        {
            id: 'kpis',
            label: 'Análisis',
            icon: <BarChart3 size={16} />
        },
        {
            id: 'operations',
            label: 'Operaciones',
            icon: <Settings size={16} />
        },
        {
            id: 'comparison',
            label: 'Comparación',
            icon: <GitCompare size={16} />
        }
    ];

    const handleExport = async () => {
        if (!camilaConfig) return;

        try {
            await camilaService.exportarResultados(camilaConfig, 'excel');
        } catch (error) {
            console.error('Error al exportar:', error);
        }
    };

    // Renderizado para cuando no hay configuración
    if (!camilaConfig) {
        return (
            <div className="bg-yellow-950/30 border border-yellow-700 rounded-lg p-6 text-center">
                <AlertCircle className="mx-auto text-yellow-400 mb-3" size={48} />
                <h3 className="text-lg font-medium text-yellow-300 mb-2">
                    Modelo Camila No Configurado
                </h3>
                <p className="text-yellow-200">
                    Selecciona "Modelo Camila" en el selector de fuente de datos para ver el análisis.
                </p>
            </div>
        );
    }

    // Estados de carga y error
    if (isLoading) return <LoadingState message="Cargando datos de Camila..." />;
    if (error) return <ErrorState error={error} onRetry={() => window.location.reload()} />;
    if (!data) return <EmptyState message="No hay datos disponibles para la configuración seleccionada" />;

    // VALIDACIÓN IMPORTANTE: Verificar que data.resultado existe
    if (!data.resultado) {
        return (
            <EmptyState
                message="Los datos están incompletos. No se encontró información del resultado."
                icon={<AlertCircle className="text-yellow-400" size={48} />}
            />
        );
    }

    const hasSolution = data.resultado.total_movimientos > 0;

    // Función para renderizar el contenido de las pestañas
    const renderTabContent = () => {
        switch (activeTab) {
            case 'kpis':
                return (
                    <div className="space-y-6">
                        <KPIOverview data={data} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <WorkloadDistribution data={data} />
                            <GrueUtilization
                                metricas={
                                    (data.metricas_gruas || []).map(m => ({
                                        ...m,
                                        tiempo_trabajado: m.tiempo_productivo_hrs ?? 0,
                                        tiempo_idle: m.tiempo_improductivo_hrs ?? 0
                                    }))
                                }
                            />
                        </div>
                    </div>
                );
            case 'operations':
                return (
                    <div className="space-y-6">
                        <GrueAssignmentMatrix asignaciones={data.asignaciones || []} />
                        <TruckQuotasPanel cuotas={data.cuotas_camiones || []} />
                        <TimelineView data={data} />
                    </div>
                );
            case 'comparison':
                return (
                    <div className="space-y-6">
                        {data.comparaciones && data.comparaciones.length > 0 ? (
                            <>
                                <RealDataComparison comparaciones={data.comparaciones} />
                                <FeasibilityAnalysis data={data} />
                            </>
                        ) : (
                            <EmptyState
                                message="No hay datos de comparación disponibles"
                                icon={<GitCompare className="text-slate-400" size={48} />}
                            />
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header con información del modelo */}
            <div className="bg-gradient-to-r from-teal-950/30 to-blue-950/30 rounded-lg p-4 border border-teal-700">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-slate-100 flex items-center">
                            <Activity className="mr-2 text-teal-400" size={24} />
                            Modelo Camila - Optimización de Grúas RTG
                        </h2>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-slate-300">
                            <span className="flex items-center">
                                <Calendar size={16} className="mr-1 text-teal-400" />
                                Semana {data.resultado.semana || 'N/A'} • {data.resultado.anio || 2022}
                            </span>
                            <span className="flex items-center">
                                <Clock size={16} className="mr-1 text-teal-400" />
                                Turno {data.resultado.turno || 'N/A'}
                                {data.resultado.turno_del_dia && ` (Turno ${data.resultado.turno_del_dia} del día)`}
                            </span>
                            <span className="bg-teal-700/50 px-2 py-1 rounded text-xs">
                                P{data.resultado.participacion || 68}% •
                                {data.resultado.con_dispersion ? ' Con Dispersión' : ' Sin Dispersión'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleExport}
                        className="bg-white/20 hover:bg-white/30 transition-colors rounded-lg px-4 py-2 flex items-center space-x-2"
                    >
                        <Download size={18} />
                        <span>Exportar</span>
                    </button>
                </div>
            </div>

            {/* Alerta si no hay solución */}
            {!hasSolution && (
                <InfeasibleShifts
                    turno={data.resultado.turno || 0}
                    semana={data.resultado.semana || 0}
                    mensaje="Camila no encontró una solución factible para este turno"
                />
            )}

            {/* Tabs de navegación */}
            <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Contenido de la pestaña activa */}
            <div className="min-h-0">
                {renderTabContent()}
            </div>

            {/* Panel de información */}
            <div className="bg-blue-950/30 border border-blue-700 rounded-lg p-4">
                <h3 className="font-medium text-blue-300 mb-2 flex items-center">
                    <AlertCircle size={16} className="mr-2" />
                    Información sobre el Modelo Camila
                </h3>
                <ul className="space-y-1 text-sm text-blue-200">
                    <li>• Optimiza la asignación de grúas RTG a bloques del patio</li>
                    <li>• Balancea la carga de trabajo entre recursos disponibles</li>
                    <li>• Minimiza la congestión en períodos de alta demanda</li>
                    <li>• Genera cuotas de camiones basadas en capacidad real</li>
                    <li>• Gestiona {data.resultado.total_segregaciones || 0} segregaciones simultáneamente</li>
                </ul>
            </div>
        </div>
    );
};

export default CamilaIntegratedPanel;