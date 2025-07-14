// components/camila/operations/GrueAssignmentMatrix.tsx

import React, { useMemo } from 'react';
import { Grid3x3, Info } from 'lucide-react';

interface GrueAssignmentMatrixProps {
    asignaciones: {
        segregacion_codigo: string;
        bloque_codigo: string;
        periodo: number;
        frecuencia: number;
    }[];
}

export const GrueAssignmentMatrix: React.FC<GrueAssignmentMatrixProps> = ({ asignaciones }) => {
    // Crear matriz de asignaciones
    const matrix = useMemo(() => {
        const result: Record<string, Record<number, number>> = {};

        // Inicializar matriz para 9 bloques (C1-C9)
        for (let b = 1; b <= 9; b++) {
            result[`C${b}`] = {};
            for (let p = 1; p <= 8; p++) {
                result[`C${b}`][p] = 0;
            }
        }

        // Llenar con datos de asignaciones
        asignaciones.forEach(asig => {
            if (result[asig.bloque_codigo]) {
                result[asig.bloque_codigo][asig.periodo] += asig.frecuencia;
            }
        });

        return result;
    }, [asignaciones]);

    // Calcular máximo para escala de colores
    const maxValue = Math.max(
        ...Object.values(matrix).flatMap(bloque =>
            Object.values(bloque)
        ),
        1 // Evitar división por cero
    );

    // Función para obtener color según intensidad
    const getColor = (value: number) => {
        if (value === 0) return 'bg-gray-50';
        const intensity = value / maxValue;
        if (intensity > 0.75) return 'bg-teal-600 text-white';
        if (intensity > 0.5) return 'bg-teal-400 text-white';
        if (intensity > 0.25) return 'bg-teal-200';
        return 'bg-teal-100';
    };

    // Calcular totales por período
    const totalsPorPeriodo = useMemo(() => {
        const totals: Record<number, number> = {};
        for (let p = 1; p <= 8; p++) {
            totals[p] = Object.values(matrix).reduce(
                (sum, bloque) => sum + (bloque[p] || 0),
                0
            );
        }
        return totals;
    }, [matrix]);

    // Calcular totales por bloque
    const totalsPorBloque = useMemo(() => {
        const totals: Record<string, number> = {};
        Object.entries(matrix).forEach(([bloque, periodos]) => {
            totals[bloque] = Object.values(periodos).reduce((sum, val) => sum + val, 0);
        });
        return totals;
    }, [matrix]);

    // Total general
    const totalGeneral = Object.values(totalsPorBloque).reduce((sum, val) => sum + val, 0);

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Grid3x3 className="mr-2" size={20} />
                    Matriz de Asignación de Grúas
                </h3>
                <div className="flex items-center text-sm text-gray-600">
                    <Info size={16} className="mr-1" />
                    Frecuencias por Bloque-Período
                </div>
            </div>

            {asignaciones.length > 0 ? (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50">
                                        Bloque
                                    </th>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(periodo => (
                                        <th
                                            key={periodo}
                                            className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50"
                                        >
                                            P{periodo}
                                        </th>
                                    ))}
                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-100">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {Object.entries(matrix).map(([bloque, periodos]) => {
                                    const total = totalsPorBloque[bloque];

                                    return (
                                        <tr key={bloque} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {bloque}
                                            </td>
                                            {Object.entries(periodos).map(([periodo, valor]) => (
                                                <td
                                                    key={periodo}
                                                    className="px-3 py-2 whitespace-nowrap text-sm text-center"
                                                >
                                                    <div className={`
                            inline-flex items-center justify-center min-w-[40px] h-10 rounded
                            ${getColor(valor)}
                          `}>
                                                        {valor > 0 ? valor : '-'}
                                                    </div>
                                                </td>
                                            ))}
                                            <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-center bg-gray-100">
                                                {total}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-50">
                                    <td className="px-3 py-2 text-sm font-medium text-gray-900">
                                        Total
                                    </td>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(periodo => (
                                        <td
                                            key={periodo}
                                            className="px-3 py-2 text-sm font-bold text-center bg-gray-50"
                                        >
                                            {totalsPorPeriodo[periodo]}
                                        </td>
                                    ))}
                                    <td className="px-3 py-2 text-sm font-bold text-center bg-gray-200">
                                        {totalGeneral}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Leyenda */}
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">Intensidad:</span>
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-gray-50 border border-gray-300 rounded"></div>
                                <span className="text-xs text-gray-600">0</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-teal-100 rounded"></div>
                                <span className="text-xs text-gray-600">Baja</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-teal-200 rounded"></div>
                                <span className="text-xs text-gray-600">Media</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-teal-400 rounded"></div>
                                <span className="text-xs text-gray-600">Alta</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-teal-600 rounded"></div>
                                <span className="text-xs text-gray-600">Máxima</span>
                            </div>
                        </div>

                        <div className="text-sm text-gray-600">
                            Máx. valor: {maxValue}
                        </div>
                    </div>

                    {/* Estadísticas adicionales */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Distribución por Período</h4>
                            <div className="space-y-1">
                                {Object.entries(totalsPorPeriodo)
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 3)
                                    .map(([periodo, total]) => (
                                        <div key={periodo} className="flex justify-between text-sm">
                                            <span className="text-gray-600">Período {periodo}:</span>
                                            <span className="font-medium text-gray-900">{total} movimientos</span>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Bloques más Activos</h4>
                            <div className="space-y-1">
                                {Object.entries(totalsPorBloque)
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 3)
                                    .map(([bloque, total]) => (
                                        <div key={bloque} className="flex justify-between text-sm">
                                            <span className="text-gray-600">{bloque}:</span>
                                            <span className="font-medium text-gray-900">{total} movimientos</span>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Resumen General</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total movimientos:</span>
                                    <span className="font-medium text-gray-900">{totalGeneral}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Bloques activos:</span>
                                    <span className="font-medium text-gray-900">
                                        {Object.values(totalsPorBloque).filter(t => t > 0).length}/9
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Períodos activos:</span>
                                    <span className="font-medium text-gray-900">
                                        {Object.values(totalsPorPeriodo).filter(t => t > 0).length}/8
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información adicional */}
                    <div className="mt-6 bg-blue-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Interpretación de la Matriz</h4>
                        <ul className="space-y-1 text-sm text-blue-700">
                            <li>• Cada celda muestra la frecuencia de visitas de grúas al bloque en ese período</li>
                            <li>• Los valores más altos indican mayor actividad y demanda de recursos</li>
                            <li>• La distribución debe ser balanceada para evitar congestión</li>
                            <li>• Los períodos corresponden a intervalos de una hora dentro del turno</li>
                        </ul>
                    </div>
                </>
            ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                    No hay asignaciones de grúas para mostrar
                </div>
            )}
        </div>
    );
};

export default GrueAssignmentMatrix;