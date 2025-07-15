// components/camila/analytics/WorkloadDistribution.tsx

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { CamilaDashboardData } from '../../../types/camila';

interface WorkloadDistributionProps {
    data: CamilaDashboardData;
}

export const WorkloadDistribution: React.FC<WorkloadDistributionProps> = ({ data }) => {
    const chartData = useMemo(() => {
        // Usar distribucion_bloques si está disponible
        if (data.distribucion_bloques) {
            return Object.entries(data.distribucion_bloques)
                .map(([bloque, movimientos]) => ({
                    bloque,
                    movimientos,
                    porcentaje: data.resultado.total_movimientos_modelo > 0
                        ? (movimientos / data.resultado.total_movimientos_modelo * 100).toFixed(1)
                        : 0
                }))
                .sort((a, b) => a.bloque.localeCompare(b.bloque));
        }

        // Si no, calcular desde asignaciones
        const bloqueMap = new Map<string, number>();
        data.asignaciones.forEach(asig => {
            const current = bloqueMap.get(asig.bloque_codigo) || 0;
            bloqueMap.set(asig.bloque_codigo, current + asig.movimientos_asignados);
        });

        return Array.from(bloqueMap.entries())
            .map(([bloque, movimientos]) => ({
                bloque,
                movimientos,
                porcentaje: data.resultado.total_movimientos_modelo > 0
                    ? (movimientos / data.resultado.total_movimientos_modelo * 100).toFixed(1)
                    : 0
            }))
            .sort((a, b) => a.bloque.localeCompare(b.bloque));
    }, [data]);

    // Colores según la carga
    const getColor = (value: number) => {
        const avg = data.resultado.total_movimientos_modelo / 9; // 9 bloques
        if (value > avg * 1.5) return '#ef4444'; // Rojo - Sobrecargado
        if (value > avg * 1.2) return '#f59e0b'; // Naranja - Alto
        if (value > avg * 0.8) return '#10b981'; // Verde - Normal
        return '#3b82f6'; // Azul - Bajo
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Distribución de Carga por Bloque
            </h3>

            {chartData.length > 0 ? (
                <>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="bloque"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                label={{ value: 'Movimientos', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px'
                                }}
                                formatter={(value: any) => [`${value} movimientos`, 'Total']}
                            />
                            <Bar dataKey="movimientos" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getColor(entry.movimientos)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Estadísticas</h4>
                            <div className="space-y-1 text-gray-600">
                                <div>Total bloques activos: {chartData.filter(d => d.movimientos > 0).length}</div>
                                <div>Promedio por bloque: {(data.resultado.total_movimientos_modelo / 9).toFixed(0)} mov</div>
                                <div>Máximo: {Math.max(...chartData.map(d => d.movimientos))} mov</div>
                                <div>Mínimo: {Math.min(...chartData.map(d => d.movimientos))} mov</div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Leyenda</h4>
                            <div className="space-y-1">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                                    <span className="text-gray-600">Sobrecargado (&gt;150% promedio)</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-amber-500 rounded mr-2"></div>
                                    <span className="text-gray-600">Alto (120-150% promedio)</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-emerald-500 rounded mr-2"></div>
                                    <span className="text-gray-600">Normal (80-120% promedio)</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                                    <span className="text-gray-600">Bajo (&lt;80% promedio)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                    No hay asignaciones de movimientos para mostrar
                </div>
            )}
        </div>
    );
};

export default WorkloadDistribution;