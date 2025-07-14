
// components/camila/operations/TruckQuotasPanel.tsx - VERSIÓN CORREGIDA

import React, { useMemo, useState } from 'react';
import { Truck, AlertCircle, ChevronDown, ChevronUp, Package } from 'lucide-react';

interface CuotaCamiones {
    bloque_codigo: string;
    periodo: number;
    cuota_camiones: number;
    capacidad_maxima: number;
    utilizacion_pct: number;
}

interface TruckQuotasPanelProps {
    cuotas: CuotaCamiones[];
}

export const TruckQuotasPanel: React.FC<TruckQuotasPanelProps> = ({ cuotas }) => {
    const [expandedPeriod, setExpandedPeriod] = useState<number | null>(null);

    // Validar y limpiar cuotas
    const cuotasLimpias = useMemo(() => {
        if (!cuotas || !Array.isArray(cuotas)) return [];

        return cuotas.map(c => ({
            bloque_codigo: c.bloque_codigo || '',
            periodo: c.periodo || 0,
            cuota_camiones: c.cuota_camiones || 0,
            capacidad_maxima: c.capacidad_maxima || 0,
            utilizacion_pct: c.utilizacion_pct || 0
        }));
    }, [cuotas]);

    // Agrupar por período
    const cuotasPorPeriodo = useMemo(() => {
        const grouped = new Map<number, CuotaCamiones[]>();

        cuotasLimpias.forEach(cuota => {
            const periodo = cuota.periodo;
            if (!grouped.has(periodo)) {
                grouped.set(periodo, []);
            }
            grouped.get(periodo)!.push(cuota);
        });

        return Array.from(grouped.entries())
            .sort(([a], [b]) => a - b)
            .map(([periodo, cuotasPeriodo]) => ({
                periodo,
                cuotas: cuotasPeriodo.sort((a, b) =>
                    a.bloque_codigo.localeCompare(b.bloque_codigo)
                ),
                totalCuota: cuotasPeriodo.reduce((sum, c) => sum + c.cuota_camiones, 0),
                totalCapacidad: cuotasPeriodo.reduce((sum, c) => sum + c.capacidad_maxima, 0),
                promedioUtilizacion: cuotasPeriodo.length > 0
                    ? cuotasPeriodo.reduce((sum, c) => sum + c.utilizacion_pct, 0) / cuotasPeriodo.length
                    : 0
            }));
    }, [cuotasLimpias]);

    // Si no hay datos
    if (cuotasLimpias.length === 0) {
        return (
            <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">
                    Cuotas de Camiones por Período
                </h3>
                <div className="flex items-center justify-center h-32 text-slate-400">
                    <div className="text-center">
                        <AlertCircle size={48} className="mx-auto mb-2" />
                        <p>No hay cuotas de camiones disponibles</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
                <Truck className="mr-2 text-blue-400" size={20} />
                Cuotas de Camiones por Período
            </h3>

            <div className="space-y-3">
                {cuotasPorPeriodo.map(({ periodo, cuotas, totalCuota, totalCapacidad, promedioUtilizacion }) => {
                    const isExpanded = expandedPeriod === periodo;

                    return (
                        <div key={periodo} className="border border-slate-700 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setExpandedPeriod(isExpanded ? null : periodo)}
                                className="w-full px-4 py-3 bg-slate-700/50 hover:bg-slate-700 transition-colors flex items-center justify-between"
                            >
                                <div className="flex items-center space-x-4">
                                    <span className="font-medium text-slate-100">
                                        Período {periodo}
                                    </span>
                                    <div className="flex items-center space-x-3 text-sm">
                                        <span className="text-slate-400">
                                            Total: <span className="text-slate-200 font-medium">
                                                {totalCuota || 0} camiones
                                            </span>
                                        </span>
                                        <span className="text-slate-400">
                                            Capacidad: <span className="text-slate-200 font-medium">
                                                {totalCapacidad || 0}
                                            </span>
                                        </span>
                                        <span className="text-slate-400">
                                            Utilización: <span className="text-blue-400 font-medium">
                                                {isNaN(promedioUtilizacion) ? '0.0' : promedioUtilizacion.toFixed(1)}%
                                            </span>
                                        </span>
                                    </div>
                                </div>
                                {isExpanded ? (
                                    <ChevronUp size={20} className="text-slate-400" />
                                ) : (
                                    <ChevronDown size={20} className="text-slate-400" />
                                )}
                            </button>

                            {isExpanded && (
                                <div className="p-4 bg-slate-900/50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {cuotas.map((cuota) => (
                                            <div
                                                key={`${cuota.bloque_codigo}-${cuota.periodo}`}
                                                className="bg-slate-800 rounded-lg p-3 border border-slate-700"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-slate-100 flex items-center">
                                                        <Package size={16} className="mr-1 text-blue-400" />
                                                        {cuota.bloque_codigo}
                                                    </span>
                                                    <span className={`text-sm font-medium ${cuota.utilizacion_pct > 80
                                                        ? 'text-red-400'
                                                        : cuota.utilizacion_pct > 60
                                                            ? 'text-yellow-400'
                                                            : 'text-green-400'
                                                        }`}>
                                                        {isNaN(cuota.utilizacion_pct) ? '0.0' : cuota.utilizacion_pct.toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Cuota:</span>
                                                        <span className="text-slate-200">{cuota.cuota_camiones || 0}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Capacidad:</span>
                                                        <span className="text-slate-200">{cuota.capacidad_maxima || 0}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
                                                    <div
                                                        className="h-2 rounded-full transition-all duration-300"
                                                        style={{
                                                            width: `${Math.min(100, Math.max(0, cuota.utilizacion_pct || 0))}%`,
                                                            backgroundColor: cuota.utilizacion_pct > 80
                                                                ? '#ef4444'
                                                                : cuota.utilizacion_pct > 60
                                                                    ? '#f59e0b'
                                                                    : '#10b981'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Resumen */}
            <div className="mt-6 bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-100 mb-3">Resumen Total</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-slate-400 block">Total Camiones</span>
                        <span className="text-xl font-bold text-slate-100">
                            {cuotasLimpias.reduce((sum, c) => sum + c.cuota_camiones, 0)}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-400 block">Capacidad Total</span>
                        <span className="text-xl font-bold text-slate-100">
                            {cuotasLimpias.reduce((sum, c) => sum + c.capacidad_maxima, 0)}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-400 block">Utilización Promedio</span>
                        <span className="text-xl font-bold text-blue-400">
                            {(() => {
                                const promedio = cuotasLimpias.length > 0
                                    ? cuotasLimpias.reduce((sum, c) => sum + c.utilizacion_pct, 0) / cuotasLimpias.length
                                    : 0;
                                return isNaN(promedio) ? '0.0' : promedio.toFixed(1);
                            })()}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TruckQuotasPanel;