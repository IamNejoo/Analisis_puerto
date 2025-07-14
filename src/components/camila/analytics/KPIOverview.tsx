// components/camila/analytics/KPIOverview.tsx

import React from 'react';
import {
    Activity,
    TrendingUp,
    Percent,
    BarChart3,
    Truck,
    Package,
    Clock,
    AlertTriangle
} from 'lucide-react';
import type { CamilaDashboardData } from '../../../types/camila';
import MetricCard from '../shared/MetricCard';

interface KPIOverviewProps {
    data: CamilaDashboardData;
}

export const KPIOverview: React.FC<KPIOverviewProps> = ({ data }) => {
    const { resultado, metricas_gruas, asignaciones } = data;

    // Calcular métricas
    const gruasActivas = metricas_gruas.filter(g => g.utilizacion_pct > 0).length;
    const utilizacionPromedio = resultado.utilizacion_promedio || 0;
    const coeficienteVariacion = resultado.coeficiente_variacion || 0;

    // Estado de balance
    const balanceStatus = coeficienteVariacion < 30 ? 'good' :
        coeficienteVariacion < 50 ? 'warning' : 'critical';

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
                Indicadores Clave de Desempeño
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Movimientos Totales"
                    value={resultado.total_movimientos.toLocaleString()}
                    subtitle="Asignados en el turno"
                    icon={<Package />}
                    trend={resultado.total_movimientos > 0 ? 'up' : 'neutral'}
                    trendValue={resultado.total_movimientos > 0 ? '+100%' : '0%'}
                />

                <MetricCard
                    title="Utilización Promedio"
                    value={`${utilizacionPromedio.toFixed(1)}%`}
                    subtitle="De capacidad de grúas"
                    icon={<TrendingUp />}
                    trend={utilizacionPromedio > 70 ? 'up' : utilizacionPromedio > 50 ? 'neutral' : 'down'}
                    status={utilizacionPromedio > 70 ? 'success' : utilizacionPromedio > 50 ? 'warning' : 'error'}
                />

                <MetricCard
                    title="Balance de Carga"
                    value={`${(100 - coeficienteVariacion).toFixed(1)}%`}
                    subtitle="Uniformidad entre grúas"
                    icon={<BarChart3 />}
                    status={balanceStatus === 'good' ? 'success' : balanceStatus === 'warning' ? 'warning' : 'error'}
                />

                <MetricCard
                    title="Grúas Activas"
                    value={`${gruasActivas}/12`}
                    subtitle="En operación"
                    icon={<Truck />}
                    trend="neutral"
                />
            </div>

            {/* Métricas secundarias */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Bloques Visitados</span>
                        <Activity size={16} className="text-gray-400" />
                    </div>
                    <div className="text-xl font-semibold text-gray-900">
                        {resultado.total_bloques_visitados}
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Segregaciones</span>
                        <Activity size={16} className="text-gray-400" />
                    </div>
                    <div className="text-xl font-semibold text-gray-900">
                        {resultado.total_segregaciones}
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Frecuencias</span>
                        <Clock size={16} className="text-gray-400" />
                    </div>
                    <div className="text-xl font-semibold text-gray-900">
                        {resultado.total_frecuencias}
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">CV%</span>
                        <AlertTriangle size={16} className="text-gray-400" />
                    </div>
                    <div className="text-xl font-semibold text-gray-900">
                        {coeficienteVariacion.toFixed(1)}%
                    </div>
                </div>
            </div>

            {/* Alerta si hay problemas */}
            {coeficienteVariacion > 50 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <AlertTriangle className="text-amber-600 mt-0.5 mr-3" size={20} />
                        <div>
                            <h4 className="font-medium text-amber-900">
                                Desbalance significativo detectado
                            </h4>
                            <p className="text-sm text-amber-700 mt-1">
                                El coeficiente de variación ({coeficienteVariacion.toFixed(1)}%) indica una distribución
                                desigual de la carga entre grúas. Considere redistribuir las asignaciones.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KPIOverview;