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
import {
    Activity,
    BarChart3,
    GitCompare,
    Truck,
    Clock,
    AlertCircle
} from 'lucide-react';

export const CamilaIntegratedPanel: React.FC = () => {
    const { timeState, setHourRange } = useTimeContext();
    const { camilaResults, realData, comparison, isLoading, error } = useCamilaData(
        timeState.camilaConfig ?? null
    );

    const [activeTab, setActiveTab] = useState('kpis');

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

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
                <span className="mt-4 text-slate-400">Cargando modelo Camila...</span>
            </div>
        );
    }

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

    const renderTabContent = () => {
        switch (activeTab) {
            case 'kpis':
                return <CamilaKPIPanel results={camilaResults} comparison={comparison} />;
            case 'gruas':
                return <GrueDetailPanel results={camilaResults} hourRange={timeState.hourRange} />;
            case 'comparison':
                return <CamilaComparisonPanel />;
            case 'cuotas':
                return <CuotasRecomendadasPanel />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header con información del modelo */}
            <div className="bg-gradient-to-r from-teal-950/30 to-blue-950/30 rounded-lg p-4 border border-teal-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100 flex items-center">
                            <Activity className="mr-2 text-teal-400" size={24} />
                            Modelo Camila - Optimización de Carga de Trabajo
                        </h2>
                        <p className="text-sm text-slate-300 mt-1">
                            Semana {camilaResults.week} • {camilaResults.day} • Turno {camilaResults.shift} •
                            Modelo {camilaResults.modelType === 'minmax' ? 'MinMax (Conservador)' : 'MaxMin (Máxima Utilización)'}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Clock className="text-teal-400" size={20} />
                        <span className="text-sm font-medium text-slate-300">
                            {timeState.hourRange.start}:00 - {timeState.hourRange.end}:00
                        </span>
                    </div>
                </div>
            </div>

            {/* Selector de rango de horas */}
            <HourRangeSelector
                startHour={timeState.hourRange.start}
                endHour={timeState.hourRange.end}
                onRangeChange={(start, end) => setHourRange({ start, end })}
                minHour={0}
                maxHour={23}
                hoursPerView={8}
            />

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

            {/* Información adicional según la pestaña */}
            {activeTab === 'gruas' && (
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
    );
};

export default CamilaIntegratedPanel;