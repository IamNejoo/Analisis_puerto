// src/components/shared/KPIRelationsPanel.tsx
import React from 'react';
import {
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Activity,
    Shuffle,
    BarChart3,
    Clock,
    Truck
} from 'lucide-react';

interface KPIRelation {
    congestionProductividadStatus: 'good' | 'normal' | 'warning' | 'critical';
    utilizacionRemanejosStatus: 'good' | 'normal' | 'warning' | 'critical';
    balanceUtilizacionStatus: 'good' | 'normal' | 'warning' | 'critical';
    tiempoServicioUtilizacionStatus?: 'good' | 'normal' | 'warning' | 'critical';
    tiempoServicioFlujoStatus?: 'good' | 'normal' | 'warning' | 'critical';
}

interface KPIRelationsPanelProps {
    relations: KPIRelation;
}

export const KPIRelationsPanel: React.FC<KPIRelationsPanelProps> = ({ relations }) => {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'good':
                return {
                    bg: 'bg-gradient-to-br from-green-900/30 to-emerald-900/30',
                    border: 'border-green-600',
                    icon: <CheckCircle className="w-5 h-5 text-green-400" />,
                    text: 'text-green-300',
                    label: 'Óptimo',
                    description: 'Relación eficiente'
                };
            case 'normal':
                return {
                    bg: 'bg-gradient-to-br from-blue-900/30 to-sky-900/30',
                    // src/components/shared/KPIRelationsPanel.tsx (continuación)
                    border: 'border-blue-600',
                    icon: <Activity className="w-5 h-5 text-blue-400" />,
                    text: 'text-blue-300',
                    label: 'Normal',
                    description: 'Dentro de parámetros'
                };
            case 'warning':
                return {
                    bg: 'bg-gradient-to-br from-yellow-900/30 to-amber-900/30',
                    border: 'border-yellow-600',
                    icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
                    text: 'text-yellow-300',
                    label: 'Alerta',
                    description: 'Requiere atención'
                };
            case 'critical':
                return {
                    bg: 'bg-gradient-to-br from-red-900/30 to-rose-900/30',
                    border: 'border-red-600',
                    icon: <XCircle className="w-5 h-5 text-red-400" />,
                    text: 'text-red-300',
                    label: 'Crítico',
                    description: 'Acción inmediata'
                };
            default:
                return getStatusConfig('normal');
        }
    };

    const relationConfigs = [
        {
            title: 'Flujo vs Productividad',
            status: relations.congestionProductividadStatus,
            icon: <TrendingUp className="w-6 h-6" />,
            description: 'Evalúa el balance entre flujo vehicular y rendimiento operacional'
        },
        {
            title: 'Utilización vs Remanejos',
            status: relations.utilizacionRemanejosStatus,
            icon: <Shuffle className="w-6 h-6" />,
            description: 'Analiza la eficiencia del uso del espacio versus movimientos adicionales'
        },
        {
            title: 'Balance vs Utilización',
            status: relations.balanceUtilizacionStatus,
            icon: <BarChart3 className="w-6 h-6" />,
            description: 'Monitorea el equilibrio entrada/salida contra capacidad del terminal'
        },
        // Nuevas relaciones con tiempos de servicio
        {
            title: 'Tiempo Permanencia vs Utilización',
            status: relations.tiempoServicioUtilizacionStatus || 'normal',
            icon: <Clock className="w-6 h-6" />,
            description: 'Relaciona el CDT con el nivel de ocupación del terminal'
        },
        {
            title: 'Tiempo Camiones vs Flujo',
            status: relations.tiempoServicioFlujoStatus || 'normal',
            icon: <Truck className="w-6 h-6" />,
            description: 'Evalúa la eficiencia de gates según TTT y throughput'
        }
    ];

    return (
        <div className="mt-6">
            <h4 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-400" />
                Análisis de Relaciones entre KPIs
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {relationConfigs.map((relation, index) => {
                    const config = getStatusConfig(relation.status);

                    return (
                        <div
                            key={index}
                            className={`
                                relative overflow-hidden rounded-xl p-4 border-2 
                                ${config.bg} ${config.border}
                                transform transition-all duration-300 hover:scale-105 hover:shadow-lg
                            `}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className={`p-2 rounded-lg shadow-sm ${config.text}`}>
                                    {relation.icon}
                                </div>
                                {config.icon}
                            </div>

                            <h5 className={`font-semibold text-sm mb-1 ${config.text}`}>
                                {relation.title}
                            </h5>

                            <p className="text-xs text-slate-400 mb-3">
                                {relation.description}
                            </p>

                            <div className="flex items-center justify-between">
                                <span className={`
                                    px-3 py-1 rounded-full text-xs font-bold
                                    bg-opacity-80 ${config.text}
                                `}>
                                    {config.label}
                                </span>
                                <span className="text-xs text-slate-500 ml-1">
                                    {config.description}
                                </span>
                            </div>

                            {/* Elemento decorativo */}
                            <div className={`
                                absolute -right-8 -bottom-8 w-24 h-24 rounded-full
                                ${config.bg} opacity-20
                            `} />
                        </div>
                    );
                })}
            </div>

            {/* Leyenda explicativa para las nuevas relaciones */}
            <div className="mt-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                <p className="text-xs text-slate-400">
                    <strong className="text-slate-300">Nuevas métricas:</strong> El análisis ahora incluye
                    relaciones con tiempos de servicio (CDT y TTT) para identificar cuellos de botella
                    operacionales y evaluar la eficiencia integral del terminal.
                </p>
            </div>
        </div>
    );
};

export default KPIRelationsPanel;