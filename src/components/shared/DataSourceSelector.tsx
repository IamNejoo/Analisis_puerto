import React from 'react';
import { useTimeContext } from '../../contexts/TimeContext';
import { Database, BarChart3, Activity } from 'lucide-react';
import { ModelSelector } from '../magdalena/ModelSelector';
import { CamilaModelSelector } from '../camila/CamilaModelSelector';

export const DataSourceSelector: React.FC = () => {
    const { timeState, setDataSource, setCamilaConfig, isLoadingData } = useTimeContext();

    const dataSources = [
        {
            id: 'historical' as const,
            name: 'Datos Históricos',
            icon: <Database size={16} />,
            description: 'Información real del puerto',
            color: 'blue'
        },
        {
            id: 'modelMagdalena' as const,
            name: 'Modelo Magdalena',
            icon: <BarChart3 size={16} />,
            description: 'Optimización de espacios',
            color: 'green'
        },
        {
            id: 'modelCamila' as const,
            name: 'Modelo Camila',
            icon: <Activity size={16} />,
            description: 'Optimización de carga de trabajo',
            color: 'purple'
        }
    ];

    const getButtonClass = (sourceId: string, color: string) => {
        const isActive = timeState?.dataSource === sourceId;
        const baseClass = 'w-full text-left p-2 rounded-lg transition-all duration-200 border';

        if (isActive) {
            return `${baseClass} bg-${color}-100 border-${color}-300 text-${color}-800`;
        }
        return `${baseClass} bg-white border-gray-200 text-gray-700 hover:bg-gray-50`;
    };

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="text-sm font-medium text-gray-800">
                Fuente de Datos
            </div>

            {/* Selector de fuentes */}
            <div className="space-y-2">
                {dataSources.map((source) => (
                    <button
                        key={source.id}
                        onClick={() => setDataSource(source.id)}
                        disabled={isLoadingData}
                        className={getButtonClass(source.id, source.color)}
                    >
                        <div className="flex items-center space-x-2">
                            <div className="flex-shrink-0">
                                {source.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                    {source.name}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                    {source.description}
                                </div>
                            </div>
                            {timeState?.dataSource === source.id && (
                                <div className={`w-2 h-2 bg-${source.color}-500 rounded-full`}></div>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Configuración del modelo Magdalena */}
            {timeState?.dataSource === 'modelMagdalena' && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                    <ModelSelector />
                </div>
            )}

            {/* Configuración del modelo Camila */}
            {timeState?.dataSource === 'modelCamila' && timeState.camilaConfig && setCamilaConfig && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                    <CamilaModelSelector
                        config={timeState.camilaConfig}
                        onChange={setCamilaConfig}
                    />
                </div>
            )}

            {/* Indicador de estado */}
            <div className="text-xs text-gray-500 text-center pt-2">
                {isLoadingData ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-2">
                        </div>
                        Cargando...
                    </div>
                ) : (
                    <span>
                        Fuente activa: <strong>{dataSources.find(s => s.id === timeState?.dataSource)?.name}</strong>
                    </span>
                )}
            </div>
        </div>
    );
};