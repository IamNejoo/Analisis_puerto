// components/camila/comparison/RealDataComparison.tsx

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { GitCompare, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface RealDataComparisonProps {
    comparaciones: {
        tipo_comparacion: string;
        metrica: string;
        valor_real: number;
        valor_camila: number;
        diferencia_absoluta: number;
        porcentaje_diferencia: number;
        descripcion: string;
    }[];
}

export const RealDataComparison: React.FC<RealDataComparisonProps> = ({ comparaciones }) => {
    // Agrupar comparaciones por tipo
    const comparacionesPorTipo = useMemo(() => {
        const grouped = new Map<string, typeof comparaciones>();

        comparaciones.forEach(comp => {
            if (!grouped.has(comp.tipo_comparacion)) {
                grouped.set(comp.tipo_comparacion, []);
            }
            grouped.get(comp.tipo_comparacion)!.push(comp);
        });

        return grouped;
    }, [comparaciones]);

    // Preparar datos para gráfico de barras (comparación general)
    const generalData = useMemo(() => {
        const general = comparacionesPorTipo.get('general') || [];
        return general.map(comp => ({
            metrica: comp.metrica.replace(/_/g, ' '),
            'Datos Reales': comp.valor_real,
            'Modelo Camila': comp.valor_camila,
            diferencia: comp.porcentaje_diferencia
        }));
    }, [comparacionesPorTipo]);

    // Preparar datos para radar (por bloque)
    const bloqueData = useMemo(() => {
        const porBloque = comparacionesPorTipo.get('por_bloque') || [];
        const bloques = new Map<string, { real: number; camila: number }>();

        porBloque.forEach(comp => {
            const bloque = comp.metrica.replace('movimientos_', '').toUpperCase();
            bloques.set(bloque, {
                real: comp.valor_real,
                camila: comp.valor_camila
            });
        });

        return Array.from(bloques.entries())
            .map(([bloque, valores]) => ({
                bloque,
                'Datos Reales': valores.real,
                'Modelo Camila': valores.camila
            }))
            .sort((a, b) => a.bloque.localeCompare(b.bloque));
    }, [comparacionesPorTipo]);

    // Calcular métricas de resumen
    const resumen = useMemo(() => {
        const movimientosComp = comparaciones.find(c => c.metrica === 'movimientos_totales');
        const balanceComp = comparaciones.find(c => c.tipo_comparacion === 'balance');

        return {
            movimientosReal: movimientosComp?.valor_real || 0,
            movimientosCamila: movimientosComp?.valor_camila || 0,
            cobertura: movimientosComp ? (movimientosComp.valor_camila / movimientosComp.valor_real * 100) : 0,
            mejorBalance: balanceComp && balanceComp.porcentaje_diferencia < 0
        };
    }, [comparaciones]);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-6">
                    <GitCompare className="mr-2" size={20} />
                    Comparación con Datos Reales
                </h3>

                {/* Resumen de comparación */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm text-blue-600 font-medium">Movimientos Reales</div>
                        <div className="text-2xl font-bold text-blue-900">{resumen.movimientosReal}</div>
                    </div>

                    <div className="bg-teal-50 rounded-lg p-4">
                        <div className="text-sm text-teal-600 font-medium">Capacidad Camila</div>
                        <div className="text-2xl font-bold text-teal-900">{resumen.movimientosCamila}</div>
                    </div>

                    <div className={`rounded-lg p-4 ${resumen.cobertura >= 100 ? 'bg-green-50' :
                            resumen.cobertura >= 80 ? 'bg-amber-50' : 'bg-red-50'
                        }`}>
                        <div className="text-sm font-medium text-gray-700">Cobertura</div>
                        <div className={`text-2xl font-bold ${resumen.cobertura >= 100 ? 'text-green-900' :
                                resumen.cobertura >= 80 ? 'text-amber-900' : 'text-red-900'
                            }`}>
                            {resumen.cobertura.toFixed(1)}%
                        </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-sm text-purple-600 font-medium">Balance</div>
                        <div className="text-2xl font-bold text-purple-900 flex items-center">
                            {resumen.mejorBalance ? (
                                <>
                                    <TrendingUp className="mr-1" size={20} />
                                    Mejor
                                </>
                            ) : (
                                <>
                                    <TrendingDown className="mr-1" size={20} />
                                    Peor
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Gráfico de comparación general */}
                {generalData.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-3">Métricas Generales</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={generalData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="metrica" angle={-45} textAnchor="end" height={80} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Datos Reales" fill="#3b82f6" />
                                <Bar dataKey="Modelo Camila" fill="#14b8a6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Gráfico radar por bloque */}
                {bloqueData.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium text-gray-700 mb-3">Distribución por Bloque</h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <RadarChart data={bloqueData}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis dataKey="bloque" tick={{ fontSize: 12 }} />
                                    <PolarRadiusAxis angle={90} domain={[0, 'auto']} tick={{ fontSize: 10 }} />
                                    <Radar name="Datos Reales" dataKey="Datos Reales" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                    <Radar name="Modelo Camila" dataKey="Modelo Camila" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} />
                                    <Legend />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Tabla de diferencias */}
                        <div>
                            <h4 className="font-medium text-gray-700 mb-3">Análisis de Diferencias</h4>
                            <div className="max-h-72 overflow-y-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Métrica</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Real</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Camila</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Dif %</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {comparaciones
                                            .filter(c => c.tipo_comparacion === 'por_bloque')
                                            .map((comp, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-3 py-2 text-sm text-gray-900">
                                                        {comp.metrica.replace(/_/g, ' ')}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-right text-gray-900">
                                                        {comp.valor_real}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-right text-gray-900">
                                                        {comp.valor_camila}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-right">
                                                        <span className={`inline-flex items-center ${comp.porcentaje_diferencia > 0 ? 'text-green-600' :
                                                                comp.porcentaje_diferencia < 0 ? 'text-red-600' : 'text-gray-600'
                                                            }`}>
                                                            {comp.porcentaje_diferencia > 0 ? <TrendingUp size={14} className="mr-1" /> :
                                                                comp.porcentaje_diferencia < 0 ? <TrendingDown size={14} className="mr-1" /> :
                                                                    <Minus size={14} className="mr-1" />}
                                                            {Math.abs(comp.porcentaje_diferencia).toFixed(1)}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Insights y recomendaciones */}
            <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-medium text-blue-900 mb-3">Análisis de Resultados</h4>
                <div className="space-y-2 text-sm text-blue-800">
                    {resumen.cobertura < 100 && (
                        <p>• La capacidad asignada por Camila cubre el {resumen.cobertura.toFixed(1)}% de los movimientos reales.
                            {resumen.cobertura < 80 ? ' Se requiere aumentar la capacidad de grúas.' : ' La cobertura es adecuada pero puede mejorarse.'}</p>
                    )}
                    {resumen.mejorBalance && (
                        <p>• El modelo Camila logra una mejor distribución de carga entre bloques comparado con la operación real.</p>
                    )}
                    {comparaciones.some(c => c.tipo_comparacion === 'por_bloque' && Math.abs(c.porcentaje_diferencia) > 50) && (
                        <p>• Se detectaron diferencias significativas (&gt;50%) en algunos bloques. Revisar la asignación de recursos en estos casos.</p>
                    )}
                    <p>• Es importante considerar que el modelo optimiza bajo condiciones ideales, mientras que la operación real enfrenta restricciones adicionales.</p>
                </div>
            </div>
        </div>
    );
};

export default RealDataComparison;