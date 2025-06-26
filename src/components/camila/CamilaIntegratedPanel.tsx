// components/camila/CamilaIntegratedPanel.tsx

import React, { useState } from 'react';
import { useCamilaData } from '../../hooks/useCamilaData';
import { useTimeContext } from '../../contexts/TimeContext';
import { Tabs } from '../shared/Tabs';
import CamilaKPIPanel from './CamilaKPIPanel';
import CamilaComparisonPanel from './CamilaComparisonPanel';
import HeatmapGruasPanel from './HeatmapGruasPanel';
import CuotasRecomendadasPanel from './CuotasRecomendadasPanel';
import GrueDetailPanel from './GrueDetailPanel';
import HourRangeSelector from './HourRangeSelector';
import CamilaFiltersComponent from './CamilaFilters';
import {
    Activity,
    BarChart3,
    GitCompare,
    Truck,
    Clock,
    AlertCircle,
    Filter,
    ChevronRight,
    Package
} from 'lucide-react';

export const CamilaIntegratedPanel: React.FC = () => {
    const { timeState, setHourRange } = useTimeContext();
    const {
        camilaResults,
        realData,
        comparison,
        filteredData,
        isLoading,
        error,
        filters,
        setFilters
    } = useCamilaData(timeState.camilaConfig ?? null);

    const [activeTab, setActiveTab] = useState('kpis');
    const [showFilters, setShowFilters] = useState(false);

    const tabs = [
        {
            id: 'kpis',
            label: 'KPIs Generales',
            icon: <BarChart3 size={16} />
        },
        {
            id: 'gruas',
            label: 'Detalle de Grúas',
            icon: <Activity size={16} />
        },
        {
            id: 'comparison',
            label: 'Comparación Real vs Optimizado',
            icon: <GitCompare size={16} />
        },
        {
            id: 'cuotas',
            label: 'Cuotas Recomendadas',
            icon: <Truck size={16} />
        }
    ];

    // Función para contar filtros activos
    const countActiveFilters = (): number => {
        let count = 0;
        if (filters.hourRange.start !== 8 || filters.hourRange.end !== 16) count++;
        if (filters.selectedGruas.length > 0) count += filters.selectedGruas.length;
        if (filters.selectedBlocks.length > 0) count += filters.selectedBlocks.length;
        if (filters.selectedSegregations.length > 0) count += filters.selectedSegregations.length;
        if (filters.congestionLevels.length > 0) count += filters.congestionLevels.length;
        if (filters.compareModels) count++;
        if (filters.showPeakHours) count++;
        if (filters.showPatterns) count++;
        return count;
    };

    // Función para obtener resumen de filtros activos
    const getActiveFiltersDescription = (): string[] => {
        const descriptions: string[] = [];

        if (filters.hourRange.start !== 8 || filters.hourRange.end !== 16) {
            descriptions.push(`Horas: ${filters.hourRange.start}:00 - ${filters.hourRange.end}:00`);
        }
        if (filters.selectedGruas.length > 0) {
            descriptions.push(`${filters.selectedGruas.length} grúa${filters.selectedGruas.length > 1 ? 's' : ''}`);
        }
        if (filters.selectedBlocks.length > 0) {
            descriptions.push(`${filters.selectedBlocks.length} bloque${filters.selectedBlocks.length > 1 ? 's' : ''}`);
        }
        if (filters.selectedSegregations.length > 0) {
            descriptions.push(`${filters.selectedSegregations.length} segregación${filters.selectedSegregations.length > 1 ? 'es' : ''}`);
        }

        return descriptions;
    };

    // Renderizado para cuando no hay configuración
    if (!timeState.camilaConfig) {
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

    // Renderizado para estado de carga
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
                <span className="mt-4 text-slate-400">Cargando modelo Camila...</span>
            </div>
        );
    }

    // Renderizado para errores
    if (error) {
        return (
            <div className="bg-red-950/30 border border-red-700 rounded-lg p-6">
                <div className="flex items-start">
                    <AlertCircle className="text-red-400 mr-3 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="text-lg font-medium text-red-300 mb-2">
                            Error al cargar el modelo
                        </h3>
                        <p className="text-red-200">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!camilaResults) {
        return null;
    }

    // Función para renderizar el contenido de las pestañas
    const renderTabContent = () => {
        switch (activeTab) {
            case 'kpis':
                return (
                    <CamilaKPIPanel
                        results={camilaResults}
                        comparison={comparison}
                        filteredData={filteredData}
                        filters={filters}
                    />
                );
            case 'gruas':
                return (
                    <GrueDetailPanel
                        results={camilaResults}
                        hourRange={filters.hourRange}
                        selectedGruas={filters.selectedGruas}
                        selectedBlocks={filters.selectedBlocks}
                    />
                );
            case 'comparison':
                return (
                    <CamilaComparisonPanel
                        filteredData={filteredData}
                        showModelComparison={filters.compareModels}
                    />
                );
            case 'cuotas':
                return (
                    <CuotasRecomendadasPanel
                        filters={filters}
                        selectedBlocks={filters.selectedBlocks}
                        hourRange={filters.hourRange}
                    />
                );
            default:
                return null;
        }
    };

    // Renderizado principal con layout mejorado
    return (
        <div className="flex h-full">
            {/* Sidebar de filtros - Ahora empuja el contenido en lugar de superponerlo */}
            <div
                className={`
                    bg-slate-800 transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0
                    ${showFilters ? 'w-80' : 'w-0'}
                `}
            >
                {showFilters && (
                    <div className="h-full">
                        <CamilaFiltersComponent
                            filters={filters}
                            onFiltersChange={setFilters}
                            config={timeState.camilaConfig}
                            onClose={() => setShowFilters(false)}
                        />
                    </div>
                )}
            </div>

            {/* Contenido principal */}
            <div className="flex-1 overflow-auto">
                <div className="p-6 space-y-6">
                    {/* Header con información del modelo */}
                    <div className="bg-gradient-to-r from-teal-950/30 to-blue-950/30 rounded-lg p-4 border border-teal-700">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-slate-100 flex items-center">
                                    <Activity className="mr-2 text-teal-400" size={24} />
                                    Modelo Camila - Optimización de Carga de Trabajo
                                </h2>
                                <p className="text-sm text-slate-300 mt-1">
                                    Semana {camilaResults.week} • {camilaResults.day} • Turno {camilaResults.shift} •
                                    Modelo {camilaResults.modelType === 'minmax' ? 'MinMax (Conservador)' : 'MaxMin (Máxima Utilización)'}
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                {/* Botón para mostrar/ocultar filtros */}
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`
                                        flex items-center space-x-2 px-4 py-2 rounded-lg transition-all
                                        ${showFilters
                                            ? 'bg-teal-600 text-white shadow-lg'
                                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        }
                                    `}
                                >
                                    <Filter size={16} />
                                    <span>{showFilters ? 'Ocultar' : 'Mostrar'} Filtros</span>
                                    {countActiveFilters() > 0 && (
                                        <span className="bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">
                                            {countActiveFilters()}
                                        </span>
                                    )}
                                </button>
                                <div className="flex items-center space-x-2 text-slate-300">
                                    <Clock className="text-teal-400" size={20} />
                                    <span className="text-sm font-medium">
                                        {filters.hourRange.start}:00 - {filters.hourRange.end}:00
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Mostrar filtros activos */}
                        {countActiveFilters() > 0 && (
                            <div className="mt-3 flex items-center space-x-2">
                                <span className="text-xs text-slate-400">Filtros activos:</span>
                                <div className="flex flex-wrap gap-2">
                                    {getActiveFiltersDescription().map((desc, idx) => (
                                        <span
                                            key={idx}
                                            className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full"
                                        >
                                            {desc}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Selector de rango de horas */}
                    <HourRangeSelector
                        startHour={filters.hourRange.start}
                        endHour={filters.hourRange.end}
                        onRangeChange={(start, end) => setFilters({
                            ...filters,
                            hourRange: { start, end }
                        })}
                        minHour={0}
                        maxHour={23}
                        hoursPerView={8}
                    />

                    {/* Indicadores rápidos cuando hay filtros activos */}
                    {(filters.showPeakHours || filters.showPatterns || filters.compareModels) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {filters.showPeakHours && filteredData?.peakPatterns && (
                                <div className="bg-orange-950/30 border border-orange-700 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-orange-300 mb-2 flex items-center">
                                        <Clock size={16} className="mr-2" />
                                        Horas Pico Detectadas
                                    </h4>
                                    <p className="text-2xl font-bold text-orange-400">
                                        {filteredData.peakPatterns.peakHours?.join(', ') || 'N/A'}
                                    </p>
                                    <p className="text-xs text-orange-300 mt-1">
                                        Mayor congestión del turno
                                    </p>
                                </div>
                            )}

                            {filters.compareModels && filteredData?.modelComparison && (
                                <div className="bg-purple-950/30 border border-purple-700 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-purple-300 mb-2 flex items-center">
                                        <GitCompare size={16} className="mr-2" />
                                        MinMax vs MaxMin
                                    </h4>
                                    <p className="text-2xl font-bold text-purple-400">
                                        {filteredData.modelComparison.differencePercentage?.toFixed(1) || 0}%
                                    </p>
                                    <p className="text-xs text-purple-300 mt-1">
                                        Diferencia en utilización
                                    </p>
                                </div>
                            )}

                            {filters.selectedSegregations.length > 0 && (
                                <div className="bg-blue-950/30 border border-blue-700 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-blue-300 mb-2 flex items-center">
                                        <Package size={16} className="mr-2" />
                                        Segregaciones Filtradas
                                    </h4>
                                    <p className="text-2xl font-bold text-blue-400">
                                        {filters.selectedSegregations.length}
                                    </p>
                                    <p className="text-xs text-blue-300 mt-1">
                                        De {filters.topSegregationsCount} principales
                                    </p>
                                </div>
                            )}
                        </div>
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

                    {/* Información adicional según la pestaña y filtros */}
                    {activeTab === 'gruas' && filters.selectedGruas.length > 0 && (
                        <div className="bg-purple-950/30 border border-purple-700 rounded-lg p-4">
                            <h3 className="font-medium text-purple-300 mb-2 flex items-center">
                                <Filter size={16} className="mr-2" />
                                Filtro de Grúas Aplicado
                            </h3>
                            <p className="text-sm text-purple-200">
                                Mostrando únicamente las grúas: {filters.selectedGruas.map((g: number) => `G${g}`).join(', ')}
                            </p>
                        </div>
                    )}

                    {activeTab === 'cuotas' && filters.selectedBlocks.length > 0 && (
                        <div className="bg-blue-950/30 border border-blue-700 rounded-lg p-4">
                            <h3 className="font-medium text-blue-300 mb-2 flex items-center">
                                <Filter size={16} className="mr-2" />
                                Filtro de Bloques Aplicado
                            </h3>
                            <p className="text-sm text-blue-200">
                                Mostrando cuotas para bloques: {filters.selectedBlocks.join(', ')}
                            </p>
                        </div>
                    )}

                    {/* Panel de información estándar para grúas */}
                    {activeTab === 'gruas' && filters.selectedGruas.length === 0 && (
                        <div className="bg-blue-950/30 border border-blue-700 rounded-lg p-4">
                            <h3 className="font-medium text-blue-300 mb-2 flex items-center">
                                <AlertCircle size={16} className="mr-2" />
                                Información sobre la Asignación de Grúas
                            </h3>
                            <ul className="space-y-1 text-sm text-blue-200">
                                <li>• Cada grúa puede operar en múltiples bloques durante una hora</li>
                                <li>• La productividad estándar es de 20 movimientos/hora por grúa</li>
                                <li>• El modelo optimiza la distribución para minimizar congestión</li>
                                <li>• Los colores indican el nivel de utilización de cada grúa</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Función helper para iconos según tipo de filtro (no se usa en este componente pero la mantengo por si la necesitas)
const getFilterIcon = (filterType: string) => {
    switch (filterType) {
        case 'gruas': return <Truck size={14} />;
        case 'blocks': return <Activity size={14} />;
        case 'time': return <Clock size={14} />;
        case 'segregations': return <Package size={14} />;
        default: return <ChevronRight size={14} />;
    }
};

export default CamilaIntegratedPanel;