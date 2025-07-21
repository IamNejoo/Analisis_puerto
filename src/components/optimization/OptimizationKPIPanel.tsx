// src/components/optimization/OptimizationKPIPanel.tsx
import React, { useEffect, useState } from 'react';
import { useOptimizationData, useOptimizationComparison } from '../../hooks/useOptimizationData';
import { useMagdalenaContext } from '../../contexts/MagdalenaContext';
import {
    TrendingUp,
    TrendingDown,
    Target,
    BarChart3,
    Layers,
    Activity,
    CheckCircle,
    AlertCircle,
    Navigation,
    Package,
    Truck,
    ArrowRightLeft,
    Calendar,
    Info
} from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon: React.ReactNode;
    color: 'green' | 'blue' | 'cyan' | 'orange' | 'red' | 'teal' | 'purple' | 'amber';
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
        green: 'bg-green-950/30 border-green-700 text-green-300',
        blue: 'bg-blue-950/30 border-blue-700 text-blue-300',
        cyan: 'bg-cyan-950/30 border-cyan-700 text-cyan-300',
        teal: 'bg-teal-950/30 border-teal-700 text-teal-300',
        orange: 'bg-orange-950/30 border-orange-700 text-orange-300',
        red: 'bg-red-950/30 border-red-700 text-red-300',
        purple: 'bg-purple-950/30 border-purple-700 text-purple-300',
        amber: 'bg-amber-950/30 border-amber-700 text-amber-300'
    };

    const iconColorClasses = {
        green: 'text-green-400',
        blue: 'text-blue-400',
        cyan: 'text-cyan-400',
        teal: 'text-teal-400',
        orange: 'text-orange-400',
        red: 'text-red-400',
        purple: 'text-purple-400',
        amber: 'text-amber-400'
    };

    if (isLoading) {
        return (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <div className="animate-pulse">
                    <div className="flex items-center justify-between mb-2">
                        <div className="h-4 bg-slate-700 rounded w-20"></div>
                        <div className="h-5 w-5 bg-slate-700 rounded"></div>
                    </div>
                    <div className="h-8 bg-slate-700 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-slate-700 rounded w-24"></div>
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
                    <div className={`flex items-center ${trend === 'up' ? 'text-green-400' :
                        trend === 'down' ? 'text-red-400' : 'text-slate-400'
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

export const OptimizationKPIPanel: React.FC = () => {
    const { config } = useMagdalenaContext();
    const { metrics, isLoading: metricsLoading, error: metricsError } = useOptimizationData(config);
    const { data: comparisonData, isLoading: comparisonLoading, error: comparisonError } = useOptimizationComparison(config);

    const isLoading = metricsLoading || comparisonLoading;
    const error = metricsError || comparisonError;

    // Usar datos filtrados cuando estén disponibles
    const movimientosReales = comparisonData?.movimientos_por_tipo?.real_filtrado || metrics?.movimientos.porTipo || {};
    const totalMovimientosReales = Object.values(movimientosReales).reduce((sum: number, val: any) => sum + (val || 0), 0);
    const yardEliminados = movimientosReales.YARD || metrics?.movimientos.yardEliminados || 0;

    // Calcular reducción real con datos filtrados
    const movimientosOptimizados = metrics?.movimientos.optimizados || 0;
    const reduccionReal = totalMovimientosReales - movimientosOptimizados;
    const reduccionPorcentaje = totalMovimientosReales > 0 ? (reduccionReal / totalMovimientosReales * 100) : 0;

    if (error) {
        return (
            <div className="bg-slate-800 rounded-lg border border-red-700 p-6">
                <div className="flex items-center text-red-400 mb-2">
                    <AlertCircle size={20} className="mr-2" />
                    <h3 className="font-semibold">Error al cargar datos</h3>
                </div>
                <p className="text-sm text-red-300">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header mejorado */}
            <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-lg p-4 border border-cyan-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100 flex items-center">
                            <BarChart3 size={24} className="mr-2 text-cyan-400" />
                            KPIs de Optimización
                        </h2>
                        <p className="text-sm text-slate-300 mt-1 flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {config.anio} • Semana {config.semana} •
                            Participación {config.participacion}%
                        </p>
                    </div>
                    {isLoading && (
                        <div className="flex items-center text-cyan-400">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400 mr-2"></div>
                            <span className="text-sm">Actualizando...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Alerta de cobertura */}
            {comparisonData?.cobertura_optimizacion && (
                <div className="bg-amber-950/30 rounded-lg p-3 border border-amber-700">
                    <div className="flex items-center text-amber-300 text-sm">
                        <Info size={16} className="mr-2 flex-shrink-0" />
                        <span>
                            Optimizando {comparisonData.cobertura_optimizacion.segregaciones_optimizadas} segregaciones
                            ({comparisonData.cobertura_optimizacion.porcentaje_cobertura.toFixed(1)}% del total del sistema)
                        </span>
                    </div>
                </div>
            )}

            {/* KPIs de Eficiencia y Movimientos - CORREGIDOS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Eficiencia Ganada */}
                <KPICard
                    title="Eficiencia Ganada"
                    value={`${metrics?.eficiencia.ganancia.toFixed(2) || 0}%`}
                    subtitle={`${metrics?.eficiencia.real.toFixed(1)}% → ${metrics?.eficiencia.optimizada.toFixed(1)}%`}
                    trend="up"
                    icon={<TrendingUp size={20} />}
                    color="green"
                    isLoading={isLoading}
                />

                {/* YARD Eliminados - USAR DATOS FILTRADOS */}
                <KPICard
                    title="YARD Eliminados"
                    value={yardEliminados}
                    subtitle="100% eliminación"
                    trend="down"
                    icon={<CheckCircle size={20} />}
                    color="blue"
                    isLoading={isLoading}
                />

                {/* Reducción Movimientos - CORREGIDO */}
                <KPICard
                    title="Reducción Movimientos"
                    value={`${reduccionPorcentaje.toFixed(1)}%`}
                    subtitle={`${reduccionReal} menos`}
                    trend="down"
                    icon={<ArrowRightLeft size={20} />}
                    color="cyan"
                    isLoading={isLoading}
                />

                {/* Distancia Ahorrada */}
                <KPICard
                    title="Distancia Ahorrada"
                    value={metrics?.distancias.distanciaAhorrada ?
                        `${(metrics.distancias.distanciaAhorrada / 1000).toFixed(1)} km` : '0 km'
                    }
                    subtitle={`${metrics?.distancias.distanciaAhorrada?.toLocaleString() || 0} metros`}
                    trend="down"
                    icon={<Navigation size={20} />}
                    color="purple"
                    isLoading={isLoading}
                />
            </div>

            {/* KPIs de Segregaciones y Ocupación */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Segregaciones Optimizadas */}
                <KPICard
                    title="Segregaciones"
                    value={metrics?.segregaciones.optimizadas || 0}
                    subtitle={`${comparisonData?.cobertura_optimizacion?.porcentaje_cobertura.toFixed(1) || metrics?.segregaciones.porcentaje.toFixed(1)}% del total`}
                    icon={<Layers size={20} />}
                    color="teal"
                    isLoading={isLoading}
                />

                {/* Balance de Carga */}
                <KPICard
                    title="Balance Carga"
                    value={metrics?.cargaTrabajo.balance.toFixed(1) || '0.0'}
                    subtitle="Desviación estándar"
                    trend={metrics?.cargaTrabajo.balance && metrics.cargaTrabajo.balance < 50 ? 'down' : 'up'}
                    icon={<BarChart3 size={20} />}
                    color={metrics?.cargaTrabajo.balance && metrics.cargaTrabajo.balance < 50 ? 'green' : 'orange'}
                    isLoading={isLoading}
                />

                {/* Ocupación Promedio */}
                <KPICard
                    title="Ocupación Promedio"
                    value={`${metrics?.ocupacion.promedio.toFixed(1) || 0}%`}
                    subtitle={`Capacidad: ${(metrics?.ocupacion.capacidadTotal || 0).toLocaleString()} TEUs`}
                    icon={<Package size={20} />}
                    color="blue"
                    isLoading={isLoading}
                />

                {/* Movimientos Totales - CORREGIDO */}
                <KPICard
                    title="Movimientos Totales"
                    value={metrics?.movimientos.optimizados || 0}
                    subtitle={`vs ${totalMovimientosReales.toLocaleString()} reales`}
                    icon={<Target size={20} />}
                    color="amber"
                    isLoading={isLoading}
                />
            </div>

            {/* Resumen detallado - CORREGIDO CON DATOS FILTRADOS */}
            {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Movimientos por tipo */}
                    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                        <h3 className="font-medium text-slate-100 mb-3 flex items-center">
                            <Truck size={16} className="mr-2 text-blue-400" />
                            Movimientos por Tipo
                            {comparisonData && (
                                <span className="ml-2 text-xs text-amber-400">(Filtrados)</span>
                            )}
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">DLVR (Entrega)</span>
                                <div>
                                    <span className="text-red-400">{(movimientosReales.DLVR || 0).toLocaleString()}</span>
                                    <span className="text-slate-500 mx-2">→</span>
                                    <span className="text-green-400">{metrics.movimientos.optimizadosPorTipo.entrega.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">RECV (Recepción)</span>
                                <div>
                                    <span className="text-red-400">{(movimientosReales.RECV || 0).toLocaleString()}</span>
                                    <span className="text-slate-500 mx-2">→</span>
                                    <span className="text-green-400">{metrics.movimientos.optimizadosPorTipo.recepcion.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">LOAD (Carga)</span>
                                <div>
                                    <span className="text-red-400">{(movimientosReales.LOAD || 0).toLocaleString()}</span>
                                    <span className="text-slate-500 mx-2">→</span>
                                    <span className="text-green-400">{metrics.movimientos.optimizadosPorTipo.carga.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">DSCH (Descarga)</span>
                                <div>
                                    <span className="text-red-400">{(movimientosReales.DSCH || 0).toLocaleString()}</span>
                                    <span className="text-slate-500 mx-2">→</span>
                                    <span className="text-green-400">{metrics.movimientos.optimizadosPorTipo.descarga.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-sm pt-2 border-t border-slate-700">
                                <span className="text-slate-400">YARD (Reubicaciones)</span>
                                <div>
                                    <span className="text-red-400">{yardEliminados.toLocaleString()}</span>
                                    <span className="text-slate-500 mx-2">→</span>
                                    <span className="text-green-400 font-bold">0</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Impacto en distancias */}
                    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                        <h3 className="font-medium text-slate-100 mb-3 flex items-center">
                            <Navigation size={16} className="mr-2 text-purple-400" />
                            Impacto en Distancias
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-400">Distancia Total Real</span>
                                    <span className="text-slate-200">{metrics.distancias.totalReal.toLocaleString()}m</span>
                                </div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-400">Distancia Optimizada</span>
                                    <span className="text-green-400">{metrics.distancias.totalModelo.toLocaleString()}m</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                                    <div
                                        className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-300"
                                        style={{ width: `${100 - metrics.distancias.reduccionPorcentaje}%` }}
                                    />
                                </div>
                            </div>

                            {/* Desglose por tipo */}
                            <div className="pt-2 border-t border-slate-700">
                                <div className="text-xs text-slate-400 mb-2">Desglose de distancias:</div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">LOAD</span>
                                        <span className="text-slate-400">{metrics.distancias.porTipo?.LOAD?.toLocaleString() || 0}m</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">DLVR</span>
                                        <span className="text-slate-400">{metrics.distancias.porTipo?.DLVR?.toLocaleString() || 0}m</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">YARD (eliminada)</span>
                                        <span className="text-green-400 font-semibold">{metrics.distancias.yardEliminada.toLocaleString()}m</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center pt-2 border-t border-slate-700">
                                <div className="text-2xl font-bold text-purple-400">
                                    {metrics.distancias.distanciaAhorrada.toLocaleString()}m
                                </div>
                                <div className="text-xs text-slate-400">
                                    Distancia total ahorrada
                                </div>
                                <div className="text-xs text-purple-300 mt-1">
                                    Equivalente a {(metrics.distancias.distanciaAhorrada / 1000).toFixed(1)} km
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OptimizationKPIPanel;