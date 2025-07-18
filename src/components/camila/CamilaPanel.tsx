// components/camila/CamilaPanel.tsx
import React, { useState, useEffect } from 'react';
import { Activity, BarChart3, Settings, GitCompare, Download, AlertCircle } from 'lucide-react';
import { useCamilaDashboard, useResultadosDisponibles } from '../../hooks/useCamilaData';
import { Tabs } from '../shared/Tabs';
import ModelConfigSelector from './selectors/ModelConfigSelector';
import { camilaService } from '../../services/camilaApi';
import type { CamilaConfig } from '../../types/camila';

// Importar componentes esenciales
import KPIOverview from './analytics/KPIOverview';
import WorkloadDistribution from './analytics/WorkloadDistribution';
import GrueUtilization from './analytics/GrueUtilization';
import GrueAssignmentMatrix from './operations/GrueAssignmentMatrix';
import TimelineView from './operations/TimelineView';
import RealDataComparison from './comparison/RealDataComparison';

export const CamilaPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState('analytics');
    const [config, setConfig] = useState<CamilaConfig | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Primero cargar los resultados disponibles
    const { data: resultadosList, loading: loadingResults } = useResultadosDisponibles();

    // Cargar dashboard solo cuando tengamos una configuración válida
    const { data, loading: loadingDashboard, error } = useCamilaDashboard(config);

    // Inicializar con la primera configuración disponible
    useEffect(() => {
        if (!isInitialized && resultadosList?.resultados && resultadosList.resultados.length > 0) {
            // Buscar el primer resultado disponible con datos
            const primerResultado = resultadosList.resultados
                .sort((a, b) => {
                    // Priorizar resultados con accuracy
                    if (a.accuracy && !b.accuracy) return -1;
                    if (!a.accuracy && b.accuracy) return 1;
                    // Luego por año y semana más recientes
                    if (a.anio !== b.anio) return b.anio - a.anio;
                    if (a.semana !== b.semana) return b.semana - a.semana;
                    return a.turno - b.turno;
                })[0];

            if (primerResultado) {
                setConfig({
                    anio: primerResultado.anio,
                    semana: primerResultado.semana,
                    turno: primerResultado.turno,
                    participacion: primerResultado.participacion,
                    dispersion: primerResultado.dispersion as 'K' | 'N'
                });
                setIsInitialized(true);
                console.log('✅ Configuración inicial establecida:', primerResultado);
            }
        }
    }, [resultadosList, isInitialized]);

    const tabs = [
        { id: 'analytics', label: 'Análisis', icon: <BarChart3 size={16} /> },
        { id: 'operations', label: 'Operaciones', icon: <Settings size={16} /> },
        { id: 'comparison', label: 'Comparación', icon: <GitCompare size={16} /> }
    ];

    const handleExport = async () => {
        if (!config) return;
        try {
            await camilaService.exportarResultados(config, 'excel');
        } catch (error) {
            console.error('Error al exportar:', error);
        }
    };

    // Estado de carga inicial
    if (loadingResults || !isInitialized) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
                    <p className="mt-4 text-slate-600">
                        {loadingResults ? 'Cargando configuraciones disponibles...' : 'Inicializando...'}
                    </p>
                </div>
            </div>
        );
    }

    // Si no hay resultados disponibles en absoluto
    if (!resultadosList?.resultados || resultadosList.resultados.length === 0) {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                <AlertCircle className="mx-auto text-amber-500 mb-2" size={48} />
                <p className="text-amber-800 font-medium">No hay resultados de Camila disponibles</p>
                <p className="text-amber-600 text-sm mt-2">
                    Primero debe cargar datos del modelo Camila para poder visualizarlos.
                </p>
            </div>
        );
    }

    // Estado de carga del dashboard
    if (loadingDashboard) {
        return (
            <div className="space-y-6">
                {/* Selector siempre visible */}
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <ModelConfigSelector
                        config={config!}
                        onChange={setConfig}
                        availableResults={resultadosList.resultados}
                    />
                </div>

                <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
                        <p className="mt-4 text-slate-600">Cargando datos del modelo...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error o sin datos
    if (error || !data) {
        return (
            <div className="space-y-6">
                {/* Selector siempre visible */}
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <ModelConfigSelector
                        config={config!}
                        onChange={setConfig}
                        availableResults={resultadosList.resultados}
                    />
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-2" size={48} />
                    <p className="text-red-800">{error || 'No hay datos disponibles para esta configuración'}</p>
                    <p className="text-red-600 text-sm mt-2">
                        Intente seleccionar otra configuración disponible.
                    </p>
                </div>
            </div>
        );
    }

    // Vista normal con datos
    const hasSolution = data.resultado.total_movimientos_modelo > 0;

    return (
        <div className="space-y-6">
            {/* Header simplificado */}
            <div className="bg-gradient-to-r from-teal-950/30 to-blue-950/30 rounded-lg p-4 border border-teal-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100 flex items-center">
                            <Activity className="mr-2 text-teal-400" size={24} />
                            Modelo Camila - S{config!.semana}/{config!.anio} T{config!.turno}
                        </h2>
                        <p className="text-sm text-slate-300 mt-1">
                            {data.resultado.total_movimientos_modelo} movimientos •
                            {data.resultado.accuracy_global ? ` ${data.resultado.accuracy_global}% accuracy` : ' Sin comparación real'} •
                            P{config!.participacion}% • {config!.dispersion === 'K' ? 'Con' : 'Sin'} dispersión
                        </p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="bg-white/20 hover:bg-white/30 rounded px-4 py-2 text-sm flex items-center transition-colors"
                    >
                        <Download size={16} className="mr-1" />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Alerta si no hay solución */}
            {!hasSolution && (
                <div className="bg-amber-950/30 border border-amber-700 rounded-lg p-4">
                    <div className="flex items-center">
                        <AlertCircle className="text-amber-400 mr-2" size={20} />
                        <p className="text-amber-300">
                            No se encontró solución factible para este turno
                        </p>
                    </div>
                </div>
            )}

            {/* Selector de configuración */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <ModelConfigSelector
                    config={config!}
                    onChange={setConfig}
                    availableResults={resultadosList.resultados}
                />
            </div>

            {/* Tabs */}
            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Contenido */}
            <div className="min-h-0">
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <KPIOverview data={data} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <WorkloadDistribution data={data} />
                            <GrueUtilization metricas={data.metricas_gruas} />
                        </div>
                    </div>
                )}

                {activeTab === 'operations' && (
                    <div className="space-y-6">
                        <GrueAssignmentMatrix asignaciones={data.asignaciones} />
                        <TimelineView data={data} />
                    </div>
                )}

                {activeTab === 'comparison' && (
                    <div className="space-y-6">
                        {data.comparaciones_real.length > 0 ? (
                            <RealDataComparison comparaciones={data.comparaciones_real} />
                        ) : (
                            <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
                                <GitCompare className="mx-auto text-slate-500 mb-3" size={48} />
                                <p className="text-slate-400">No hay datos reales para comparar</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CamilaPanel;