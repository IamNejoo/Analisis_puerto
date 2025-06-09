import React from 'react';
import { useMagdalenaData } from '../../hooks/useMagdalenaData';
import { useTimeContext } from '../../contexts/TimeContext';
import {
    TrendingUp,
    TrendingDown,
    Target,
    BarChart3,
    Layers,
    Activity,
    CheckCircle,
    AlertCircle,
    Clock,
    Package
} from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon: React.ReactNode;
    color: 'green' | 'blue' | 'purple' | 'orange' | 'red';
    isLoading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    subtitle,
    trend,
    icon,
    color,
    isLoading = false
}) => {
    const colorClasses = {
        green: 'bg-green-50 border-green-200 text-green-800',
        blue: 'bg-blue-50 border-blue-200 text-blue-800',
        purple: 'bg-purple-50 border-purple-200 text-purple-800',
        orange: 'bg-orange-50 border-orange-200 text-orange-800',
        red: 'bg-red-50 border-red-200 text-red-800'
    };

    const iconColorClasses = {
        green: 'text-green-600',
        blue: 'text-blue-600',
        purple: 'text-purple-600',
        orange: 'text-orange-600',
        red: 'text-red-600'
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="animate-pulse">
                    <div className="flex items-center justify-between mb-2">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-5 w-5 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">{title}</h3>
                <div className={iconColorClasses[color]}>
                    {icon}
                </div>
            </div>

            <div className="flex items-baseline space-x-2">
                <p className="text-2xl font-bold">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
                {trend && (
                    <div className={`flex items-center ${trend === 'up' ? 'text-green-600' :
                            trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                        {trend === 'up' ? <TrendingUp size={16} /> :
                            trend === 'down' ? <TrendingDown size={16} /> : null}
                    </div>
                )}
            </div>

            {subtitle && (
                <p className="text-xs mt-1 opacity-75">{subtitle}</p>
            )}
        </div>
    );
};

export const MagdalenaKPIPanel: React.FC = () => {
    const { timeState } = useTimeContext();
    const { magdalenaMetrics, realMetrics, comparison, isLoading, error } = useMagdalenaData(
        timeState.magdalenaConfig?.semana || 3,
        timeState.magdalenaConfig?.participacion || 69,
        timeState.magdalenaConfig?.conDispersion ?? true
    );

    if (error) {
        return (
            <div className="bg-white rounded-lg border border-red-200 p-6">
                <div className="flex items-center text-red-600 mb-2">
                    <AlertCircle size={20} className="mr-2" />
                    <h3 className="font-semibold">Error al cargar datos</h3>
                </div>
                <p className="text-sm text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">KPIs Modelo Magdalena</h2>
                    <p className="text-sm text-gray-600">
                        Semana {timeState.magdalenaConfig?.semana || 3} •
                        Participación {timeState.magdalenaConfig?.participacion || 69}% •
                        {timeState.magdalenaConfig?.conDispersion ? 'Con Dispersión' : 'Centralizada'}
                    </p>
                </div>
                {isLoading && (
                    <div className="flex items-center text-purple-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                        <span className="text-sm">Cargando...</span>
                    </div>
                )}
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Reubicaciones Eliminadas */}
                <KPICard
                    title="Reubicaciones Eliminadas"
                    value={magdalenaMetrics?.reubicacionesEliminadas || 0}
                    subtitle="100% eliminación"
                    trend="down"
                    icon={<CheckCircle size={20} />}
                    color="green"
                    isLoading={isLoading}
                />

                {/* Eficiencia Ganada */}
                <KPICard
                    title="Eficiencia Ganada"
                    value={`${magdalenaMetrics?.eficienciaGanada.toFixed(2) || 0}%`}
                    subtitle="Vs situación real"
                    trend="up"
                    icon={<TrendingUp size={20} />}
                    color="blue"
                    isLoading={isLoading}
                />

                {/* Segregaciones Activas */}
                <KPICard
                    title="Segregaciones"
                    value={magdalenaMetrics?.segregacionesActivas || 0}
                    subtitle={`${magdalenaMetrics?.bloquesAsignados || 0} bloques`}
                    icon={<Layers size={20} />}
                    color="purple"
                    isLoading={isLoading}
                />

                {/* Balance de Carga */}
                <KPICard
                    title="Balance Carga"
                    value={magdalenaMetrics?.balanceWorkload.toFixed(1) || '0.0'}
                    subtitle="Desviación estándar"
                    trend={magdalenaMetrics?.balanceWorkload && magdalenaMetrics.balanceWorkload < 50 ? 'down' : 'up'}
                    icon={<BarChart3 size={20} />}
                    color={magdalenaMetrics?.balanceWorkload && magdalenaMetrics.balanceWorkload < 50 ? 'green' : 'orange'}
                    isLoading={isLoading}
                />

                {/* Ocupación Optimizada */}
                <KPICard
                    title="Ocupación Promedio"
                    value={`${magdalenaMetrics?.ocupacionPromedio.toFixed(1) || 0}%`}
                    subtitle="Utilización optimizada"
                    icon={<Package size={20} />}
                    color="blue"
                    isLoading={isLoading}
                />

                {/* Carga de Trabajo Total */}
                <KPICard
                    title="Carga Trabajo Total"
                    value={magdalenaMetrics?.cargaTrabajoTotal || 0}
                    subtitle={`${magdalenaMetrics?.periodos || 0} períodos`}
                    icon={<Activity size={20} />}
                    color="purple"
                    isLoading={isLoading}
                />

                {/* Movimientos Optimizados */}
                <KPICard
                    title="Movimientos Opt."
                    value={magdalenaMetrics?.totalMovimientosOptimizados || 0}
                    subtitle={`vs ${realMetrics?.totalMovimientos.toLocaleString() || 0} reales`}
                    icon={<Target size={20} />}
                    color="green"
                    isLoading={isLoading}
                />

                {/* Variación de Carga */}
                <KPICard
                    title="Variación Carga"
                    value={magdalenaMetrics?.variacionCarga || 0}
                    subtitle="Dispersión optimizada"
                    icon={<Clock size={20} />}
                    color="orange"
                    isLoading={isLoading}
                />
            </div>

            {/* Detalles de Movimientos */}
            {magdalenaMetrics && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-medium text-gray-800 mb-3">Distribución de Movimientos Optimizados</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">
                                {magdalenaMetrics.movimientosOptimizadosDetalle.Recepcion.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">Recepción</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                                {magdalenaMetrics.movimientosOptimizadosDetalle.Carga.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">Carga</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-orange-600">
                                {magdalenaMetrics.movimientosOptimizadosDetalle.Descarga.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">Descarga</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">
                                {magdalenaMetrics.movimientosOptimizadosDetalle.Entrega.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">Entrega</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MagdalenaKPIPanel;