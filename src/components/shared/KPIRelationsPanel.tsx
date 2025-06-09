// src/components/shared/KPIRelationsPanel.tsx
import React from 'react';
import {
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Activity,
    Shuffle,
    BarChart3
} from 'lucide-react';

interface KPIRelation {
    congestionProductividadStatus: 'good' | 'normal' | 'warning' | 'critical';
    utilizacionRemanejosStatus: 'good' | 'normal' | 'warning' | 'critical';
    balanceUtilizacionStatus: 'good' | 'normal' | 'warning' | 'critical';
}

interface KPIRelationsPanelProps {
    relations: KPIRelation;
}

export const KPIRelationsPanel: React.FC<KPIRelationsPanelProps> = ({ relations }) => {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'good':
                return {
                    bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
                    border: 'border-green-200',
                    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
                    text: 'text-green-700',
                    label: 'Óptimo',
                    description: 'Relación eficiente'
                };
            case 'normal':
                return {
                    bg: 'bg-gradient-to-br from-blue-50 to-sky-50',
                    border: 'border-blue-200',
                    icon: <Activity className="w-5 h-5 text-blue-600" />,
                    text: 'text-blue-700',
                    label: 'Normal',
                    description: 'Dentro de parámetros'
                };
            case 'warning':
                return {
                    bg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
                    border: 'border-yellow-200',
                    icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
                    text: 'text-yellow-700',
                    label: 'Alerta',
                    description: 'Requiere atención'
                };
            case 'critical':
                return {
                    bg: 'bg-gradient-to-br from-red-50 to-rose-50',
                    border: 'border-red-200',
                    icon: <XCircle className="w-5 h-5 text-red-600" />,
                    text: 'text-red-700',
                    label: 'Crítico',
                    description: 'Acción inmediata'
                };
            default:
                return getStatusConfig('normal');
        }
    };

    const relationConfigs = [
        {
            title: 'Congestión vs Productividad',
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
        }
    ];

    return (
        <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                Análisis de Relaciones entre KPIs
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                <div className={`p-2 rounded-lg bg-white shadow-sm ${config.text}`}>
                                    {relation.icon}
                                </div>
                                {config.icon}
                            </div>

                            <h5 className={`font-semibold text-sm mb-1 ${config.text}`}>
                                {relation.title}
                            </h5>

                            <p className="text-xs text-gray-600 mb-3">
                                {relation.description}
                            </p>

                            <div className="flex items-center justify-between">
                                <span className={`
                  px-3 py-1 rounded-full text-xs font-bold
                  bg-white bg-opacity-80 ${config.text}
                `}>
                                    {config.label}
                                </span>
                                <span className="text-xs text-gray-500">
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
        </div>
    );
};

export default KPIRelationsPanel;