// components/camila/analytics/KPIOverview.tsx
import React from 'react';
import { Activity, TrendingUp, BarChart3, Truck, Target, AlertTriangle } from 'lucide-react';
import type { CamilaDashboardData } from '../../../types/camila';

interface KPIOverviewProps {
    data: CamilaDashboardData;
}

export const KPIOverview: React.FC<KPIOverviewProps> = ({ data }) => {
    const { resultado } = data;

    const kpis = [
        {
            title: 'Movimientos',
            value: resultado.total_movimientos_modelo,
            icon: <Activity className="text-blue-400" />,
            subtitle: resultado.total_movimientos_real
                ? `Real: ${resultado.total_movimientos_real}`
                : 'Solo modelo',
            status: 'normal'
        },
        {
            title: 'Utilización',
            value: `${resultado.utilizacion_modelo}%`,
            icon: <TrendingUp className="text-green-400" />,
            subtitle: 'Capacidad usada',
            status: resultado.utilizacion_modelo > 70 ? 'good' : resultado.utilizacion_modelo > 50 ? 'normal' : 'low'
        },
        {
            title: 'Balance',
            value: `${resultado.coeficiente_variacion}%`,
            icon: <BarChart3 className="text-amber-400" />,
            subtitle: 'CV entre grúas',
            status: resultado.coeficiente_variacion < 30 ? 'good' : resultado.coeficiente_variacion < 50 ? 'warning' : 'critical'
        },
        {
            title: 'Grúas',
            value: `${resultado.total_gruas_utilizadas}/12`,
            icon: <Truck className="text-purple-400" />,
            subtitle: 'En operación',
            status: 'normal'
        }
    ];

    // Agregar accuracy si existe
    if (resultado.accuracy_global > 0) {
        kpis.push({
            title: 'Accuracy',
            value: `${resultado.accuracy_global}%`,
            icon: <Target className="text-teal-400" />,
            subtitle: 'Modelo vs Real',
            status: resultado.accuracy_global > 80 ? 'good' : resultado.accuracy_global > 60 ? 'normal' : 'critical'
        });
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'good': return 'border-green-600';
            case 'warning': return 'border-amber-600';
            case 'critical': return 'border-red-600';
            case 'low': return 'border-slate-600';
            default: return 'border-slate-700';
        }
    };

    return (
        <div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {kpis.map((kpi, index) => (
                    <div
                        key={index}
                        className={`bg-slate-800 rounded-lg p-4 border ${getStatusColor(kpi.status)}`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-400">{kpi.title}</span>
                            {kpi.icon}
                        </div>
                        <div className="text-2xl font-bold text-slate-100">{kpi.value}</div>
                        <div className="text-xs text-slate-500 mt-1">{kpi.subtitle}</div>
                    </div>
                ))}
            </div>

            {/* Alerta si hay problemas */}
            {resultado.coeficiente_variacion > 50 && (
                <div className="mt-4 bg-amber-950/30 border border-amber-700 rounded-lg p-3">
                    <div className="flex items-center">
                        <AlertTriangle className="text-amber-400 mr-2" size={16} />
                        <p className="text-sm text-amber-300">
                            Desbalance significativo detectado (CV: {resultado.coeficiente_variacion}%).
                            Considere redistribuir las asignaciones.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KPIOverview;