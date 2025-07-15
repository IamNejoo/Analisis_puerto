// components/camila/operations/TruckQuotasPanel.tsx

import React, { useMemo, useState } from 'react';
import { Truck, AlertCircle, ChevronDown, ChevronUp, Package } from 'lucide-react';

interface CuotaCamion {
    periodo: number;
    bloque_codigo: string;
    cuota_modelo: number;
    capacidad_maxima: number;
    gruas_asignadas: number;
    movimientos_reales?: number;
    utilizacion_real?: number;
    tipo_operacion: string;
    segregaciones: string[];
}

interface TruckQuotasPanelProps {
    cuotas: CuotaCamion[];
}

export const TruckQuotasPanel: React.FC<TruckQuotasPanelProps> = ({ cuotas }) => {
    const [expandedPeriod, setExpandedPeriod] = useState<number | null>(null);

    // Validar y limpiar cuotas
    const cuotasLimpias = useMemo(() => {
        if (!cuotas || !Array.isArray(cuotas)) return [];

        return cuotas.map(c => ({
            periodo: c.periodo || 0,
            bloque_codigo: c.bloque_codigo || '',
            cuota_modelo: c.cuota_modelo || 0,
            capacidad_maxima: c.capacidad_maxima || 0,
            gruas_asignadas: c.gruas_asignadas || 0,
            movimientos_reales: c.movimientos_reales || 0,
            utilizacion_real: c.utilizacion_real || 0,
            tipo_operacion: c.tipo_operacion || 'mixto',
            segregaciones: c.segregaciones || []
        }));
    }, [cuotas]);

    // Agrupar por período
    const cuotasPorPeriodo = useMemo(() => {
        const grouped = new Map<number, CuotaCamion[]>();

        cuotasLimpias.forEach(cuota => {
            const periodo = cuota.periodo;
            if (!grouped.has(periodo)) {
                grouped.set(periodo, []);
            }
            grouped.get(periodo)!.push(cuota);
        });

        return Array.from(grouped.entries())
            .sort(([a], [b]) => a - b)
            .map(([periodo, cuotasPeriodo]) => {
                const totalCuota = cuotasPeriodo.reduce((sum, c) => sum + c.cuota_modelo, 0);
                const totalCapacidad = cuotasPeriodo.reduce((sum, c) => sum + c.capacidad_maxima, 0);
                const totalReal = cuotasPeriodo.reduce((sum, c) => sum + (c.movimientos_reales || 0), 0);
                const totalGruas = cuotasPeriodo.reduce((sum, c) => sum + c.gruas_asignadas, 0);

                const utilizacionModelo = totalCapacidad > 0 ? (totalCuota / totalCapacidad * 100) : 0;
                const utilizacionReal = totalCapacidad > 0 ? (totalReal / totalCapacidad * 100) : 0;

                return {
                    periodo,
                    cuotas: cuotasPeriodo.sort((a, b) =>
                        a.bloque_codigo.localeCompare(b.bloque_codigo)
                    ),
                    totalCuota,
                    totalCapacidad,
                    totalReal,
                    totalGruas,
                    utilizacionModelo,
                    utilizacionReal,
                    tieneReales: totalReal > 0
                };
            });
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

    // Calcular si hay datos reales disponibles
    const hayDatosReales = cuotasLimpias.some(c => c.movimientos_reales && c.movimientos_reales > 0);

    return (
        <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
                <Truck className="mr-2 text-blue-400" size={20} />
                Cuotas de Camiones por Período
            </h3>

            <div className="space-y-3">
                {cuotasPorPeriodo.map(({
                    periodo,
                    cuotas,
                    totalCuota,
                    totalCapacidad,
                    totalReal,
                    totalGruas,
                    utilizacionModelo,
                    utilizacionReal,
                    tieneReales
                }) => {
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
                                            Cuota: <span className="text-slate-200 font-medium">
                                                {totalCuota}
                                            </span>
                                        </span>
                                        {tieneReales && (
                                            <span className="text-slate-400">
                                                Real: <span className="text-green-400 font-medium">
                                                    {totalReal}
                                                </span>
                                            </span>
                                        )}
                                        <span className="text-slate-400">
                                            Capacidad: <span className="text-slate-200 font-medium">
                                                {totalCapacidad}
                                            </span>
                                        </span>
                                        <span className="text-slate-400">
                                            Grúas: <span className="text-slate-200 font-medium">
                                                {totalGruas}
                                            </span>
                                        </span>
                                        <span className="text-slate-400">
                                            Utilización: <span className="text-blue-400 font-medium">
                                                {utilizacionModelo.toFixed(1)}%
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
                                        {cuotas.map((cuota) => {
                                            const utilizacionCuota = cuota.capacidad_maxima > 0
                                                ? (cuota.cuota_modelo / cuota.capacidad_maxima * 100)
                                                : 0;
                                            return (
                                                <div
                                                    key={`${cuota.bloque_codigo}-${cuota.periodo}`}
                                                    className="bg-slate-800 rounded-lg p-3 border border-slate-700"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-slate-100 flex items-center">
                                                            <Package size={16} className="mr-1 text-blue-400" />
                                                            {cuota.bloque_codigo}
                                                        </span>
                                                        <span className={`text-sm font-medium ${utilizacionCuota > 80
                                                                ? 'text-red-400'
                                                                : utilizacionCuota > 60
                                                                    ? 'text-yellow-400'
                                                                    : 'text-green-400'
                                                            }`}>
                                                            {utilizacionCuota.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-400">Cuota:</span>
                                                            <span className="text-slate-200">{cuota.cuota_modelo}</span>
                                                        </div>
                                                        {cuota.movimientos_reales > 0 && (
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-400">Real:</span>
                                                                <span className="text-green-400">{cuota.movimientos_reales}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-400">Capacidad:</span>
                                                            <span className="text-slate-200">{cuota.capacidad_maxima}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-400">Grúas:</span>
                                                            <span className="text-slate-200">{cuota.gruas_asignadas}</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
                                                        <div
                                                            className="h-2 rounded-full transition-all duration-300"
                                                            style={{
                                                                width: `${Math.min(100, Math.max(0, utilizacionCuota))}%`,
                                                                backgroundColor: utilizacionCuota > 80
                                                                    ? '#ef4444'
                                                                    : utilizacionCuota > 60
                                                                        ? '#f59e0b'
                                                                        : '#10b981'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-slate-400 block">Total Cuota Modelo</span>
                        <span className="text-xl font-bold text-slate-100">
                            {cuotasLimpias.reduce((sum, c) => sum + c.cuota_modelo, 0)}
                        </span>
                    </div>
                    {hayDatosReales && (
                        <div>
                            <span className="text-slate-400 block">Total Real</span>
                            <span className="text-xl font-bold text-green-400">
                                {cuotasLimpias.reduce((sum, c) => sum + (c.movimientos_reales || 0), 0)}
                            </span>
                        </div>
                    )}
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
                                const totalCuota = cuotasLimpias.reduce((sum, c) => sum + c.cuota_modelo, 0);
                                const totalCapacidad = cuotasLimpias.reduce((sum, c) => sum + c.capacidad_maxima, 0);
                                const utilizacion = totalCapacidad > 0 ? (totalCuota / totalCapacidad * 100) : 0;
                                return utilizacion.toFixed(1);
                            })()}%
                        </span>
                    </div>
                </div>

                {hayDatosReales && (
                    <div className="mt-4 pt-4 border-t border-slate-600">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Accuracy Modelo vs Real:</span>
                            <span className="text-lg font-bold text-green-400">
                                {(() => {
                                    const totalModelo = cuotasLimpias.reduce((sum, c) => sum + c.cuota_modelo, 0);
                                    const totalReal = cuotasLimpias.reduce((sum, c) => sum + (c.movimientos_reales || 0), 0);
                                    const accuracy = Math.min(totalModelo, totalReal) / Math.max(totalModelo, totalReal) * 100;
                                    return accuracy.toFixed(1);
                                })()}%
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TruckQuotasPanel;