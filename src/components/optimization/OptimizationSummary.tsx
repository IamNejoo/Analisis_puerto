// src/components/optimization/OptimizationSummary.tsx
import React from 'react';
import { useOptimizationData } from '../../hooks/useOptimizationData';
import { useMagdalenaContext } from '../../contexts/MagdalenaContext';
import { Navigation, TrendingDown, Target, Package } from 'lucide-react';

export const OptimizationSummary: React.FC = () => {
    const { config } = useMagdalenaContext();
    const { metrics, isLoading } = useOptimizationData(config);

    if (isLoading || !metrics) return null;

    const mainKPIs = [
        {
            icon: <TrendingDown className="text-green-400" size={32} />,
            value: metrics.movimientos.yardEliminados.toLocaleString(),
            label: 'YARD Eliminados',
            sublabel: '100% de eliminación'
        },
        {
            icon: <Target className="text-blue-400" size={32} />,
            value: `${metrics.eficiencia.ganancia.toFixed(1)}%`,
            label: 'Eficiencia Ganada',
            sublabel: 'Mejora operacional'
        },
        {
            icon: <Navigation className="text-purple-400" size={32} />,
            value: `${(metrics.distancias.distanciaAhorrada / 1000).toFixed(1)} km`,
            label: 'Distancia Ahorrada',
            sublabel: `${metrics.distancias.distanciaAhorrada.toLocaleString()} metros`
        },
        {
            icon: <Package className="text-cyan-400" size={32} />,
            value: `${metrics.movimientos.reduccionPorcentaje.toFixed(1)}%`,
            label: 'Reducción Movimientos',
            sublabel: `${(metrics.movimientos.totalReal - metrics.movimientos.optimizados).toLocaleString()} menos`
        }
    ];

    return (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-slate-50 mb-6 text-center">
                Resumen de Optimización - Semana {config.semana}
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {mainKPIs.map((kpi, index) => (
                    <div key={index} className="text-center">
                        <div className="flex justify-center mb-2">
                            {kpi.icon}
                        </div>
                        <div className="text-2xl font-bold text-slate-50">
                            {kpi.value}
                        </div>
                        <div className="text-sm text-slate-300 mt-1">
                            {kpi.label}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                            {kpi.sublabel}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OptimizationSummary;