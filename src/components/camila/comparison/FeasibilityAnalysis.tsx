// components/camila/comparison/FeasibilityAnalysis.tsx - Actualizado para datos reales

import React, { useMemo } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, Target, TrendingUp, BarChart3 } from 'lucide-react';
import type { CamilaDashboardData } from '../../../types/camila';

interface FeasibilityAnalysisProps {
    data: CamilaDashboardData;
}

export const FeasibilityAnalysis: React.FC<FeasibilityAnalysisProps> = ({ data }) => {
    const analysis = useMemo(() => {
        const { resultado, comparaciones_real } = data;
        const hasSolution = resultado.total_movimientos_modelo > 0;

        // Análisis de cobertura
        const cobertura = resultado.total_movimientos_real > 0
            ? (resultado.total_movimientos_modelo / resultado.total_movimientos_real * 100)
            : 0;

        // Identificar problemas potenciales
        const problemas = [];

        if (!hasSolution) {
            problemas.push({
                tipo: 'critical',
                mensaje: 'No se encontró solución factible para este turno',
                sugerencia: 'Revisar restricciones del modelo o aumentar capacidad disponible'
            });
        }

        if (resultado.accuracy_global < 50 && resultado.accuracy_global > 0) {
            problemas.push({
                tipo: 'critical',
                mensaje: `Accuracy crítica: ${resultado.accuracy_global.toFixed(1)}%`,
                sugerencia: 'El modelo requiere recalibración urgente de parámetros'
            });
        }

        if (cobertura < 80 && cobertura > 0) {
            problemas.push({
                tipo: 'warning',
                mensaje: `Cobertura insuficiente: ${cobertura.toFixed(1)}% de demanda real`,
                sugerencia: 'Considerar aumentar el número de grúas o extender horarios'
            });
        }

        if (resultado.coeficiente_variacion > 50) {
            problemas.push({
                tipo: 'warning',
                mensaje: `Alto desbalance de carga (CV: ${resultado.coeficiente_variacion.toFixed(1)}%)`,
                sugerencia: 'Redistribuir asignaciones para equilibrar carga entre grúas'
            });
        }

        if (Math.abs(resultado.brecha_movimientos) > 100) {
            problemas.push({
                tipo: 'warning',
                mensaje: `Brecha significativa: ${Math.abs(resultado.brecha_movimientos)} movimientos`,
                sugerencia: resultado.brecha_movimientos > 0
                    ? 'Modelo subestima capacidad - revisar restricciones'
                    : 'Modelo sobreestima capacidad - validar parámetros operacionales'
            });
        }

        // Análisis por periodo
        const periodosCriticos = comparaciones_real
            .filter(c => c.tipo_comparacion === 'por_periodo' && c.accuracy < 50)
            .map(c => ({
                periodo: c.dimension,
                accuracy: c.accuracy,
                diferencia: c.diferencia_absoluta
            }));

        // Bloques problemáticos
        const bloquesProblematicos = comparaciones_real
            .filter(c => c.tipo_comparacion === 'por_bloque' && Math.abs(c.diferencia_porcentual) > 50)
            .map(c => ({
                bloque: c.dimension || '',
                diferencia: c.diferencia_porcentual,
                tipo: c.diferencia_porcentual > 0 ? 'subestimado' : 'sobreestimado'
            }));

        return {
            hasSolution,
            cobertura,
            problemas,
            periodosCriticos,
            bloquesProblematicos,
            movimientosReal: resultado.total_movimientos_real,
            movimientosModelo: resultado.total_movimientos_modelo,
            accuracy: resultado.accuracy_global,
            utilizacionModelo: resultado.utilizacion_modelo,
            capacidadTeorica: resultado.capacidad_teorica
        };
    }, [data]);

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Análisis de Factibilidad y Precisión
            </h3>

            {/* Estado general */}
            <div className={`rounded-lg p-4 mb-6 ${analysis.hasSolution && analysis.accuracy >= 70 ? 'bg-green-50 border border-green-200' :
                    analysis.hasSolution && analysis.accuracy >= 50 ? 'bg-amber-50 border border-amber-200' :
                        'bg-red-50 border border-red-200'
                }`}>
                <div className="flex items-start">
                    {analysis.hasSolution && analysis.accuracy >= 70 ? (
                        <CheckCircle className="text-green-600 mt-0.5 mr-3" size={24} />
                    ) : analysis.hasSolution && analysis.accuracy >= 50 ? (
                        <AlertTriangle className="text-amber-600 mt-0.5 mr-3" size={24} />
                    ) : (
                        <XCircle className="text-red-600 mt-0.5 mr-3" size={24} />
                    )}
                    <div className="flex-1">
                        <h4 className={`font-medium ${analysis.hasSolution && analysis.accuracy >= 70 ? 'text-green-900' :
                                analysis.hasSolution && analysis.accuracy >= 50 ? 'text-amber-900' :
                                    'text-red-900'
                            }`}>
                            {!analysis.hasSolution ? 'Sin Solución Factible' :
                                analysis.accuracy >= 70 ? 'Modelo Preciso y Factible' :
                                    analysis.accuracy >= 50 ? 'Modelo Factible con Precisión Media' :
                                        'Modelo Factible pero Impreciso'}
                        </h4>
                        <p className={`text-sm mt-1 ${analysis.hasSolution && analysis.accuracy >= 70 ? 'text-green-700' :
                                analysis.hasSolution && analysis.accuracy >= 50 ? 'text-amber-700' :
                                    'text-red-700'
                            }`}>
                            {analysis.hasSolution
                                ? `Accuracy: ${analysis.accuracy.toFixed(1)}% | Cobertura: ${analysis.cobertura.toFixed(1)}% | ${data.metricas_gruas.filter(g => g.utilizacion_pct > 0).length} grúas activas`
                                : 'El modelo no pudo encontrar una asignación válida bajo las restricciones actuales'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Métricas de factibilidad */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                        <BarChart3 size={14} className="mr-1" />
                        Demanda Real
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        {analysis.movimientosReal.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">movimientos/turno</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                        <TrendingUp size={14} className="mr-1" />
                        Capacidad Modelo
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        {analysis.movimientosModelo.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">optimizado</div>
                </div>

                <div className={`rounded-lg p-4 ${analysis.accuracy >= 80 ? 'bg-green-50' :
                        analysis.accuracy >= 60 ? 'bg-amber-50' :
                            analysis.accuracy >= 40 ? 'bg-orange-50' : 'bg-red-50'
                    }`}>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Target size={14} className="mr-1" />
                        Accuracy
                    </div>
                    <div className={`text-2xl font-bold ${analysis.accuracy >= 80 ? 'text-green-900' :
                            analysis.accuracy >= 60 ? 'text-amber-900' :
                                analysis.accuracy >= 40 ? 'text-orange-900' : 'text-red-900'
                        }`}>
                        {analysis.accuracy.toFixed(1)}%
                    </div>
                    <div className="text-xs">
                        {analysis.accuracy >= 80 ? 'Excelente' :
                            analysis.accuracy >= 60 ? 'Buena' :
                                analysis.accuracy >= 40 ? 'Regular' : 'Baja'}
                    </div>
                </div>

                <div className={`rounded-lg p-4 ${analysis.cobertura >= 100 ? 'bg-green-50' :
                        analysis.cobertura >= 80 ? 'bg-blue-50' : 'bg-amber-50'
                    }`}>
                    <div className="text-sm text-gray-600 mb-1">Cobertura</div>
                    <div className={`text-2xl font-bold ${analysis.cobertura >= 100 ? 'text-green-900' :
                            analysis.cobertura >= 80 ? 'text-blue-900' : 'text-amber-900'
                        }`}>
                        {analysis.cobertura.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">de demanda</div>
                </div>
            </div>

            {/* Problemas identificados */}
            {analysis.problemas.length > 0 && (
                <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3">Problemas Identificados</h4>
                    <div className="space-y-3">
                        {analysis.problemas.map((problema, idx) => (
                            <div key={idx} className={`rounded-lg p-4 border ${problema.tipo === 'critical'
                                    ? 'bg-red-50 border-red-200'
                                    : 'bg-amber-50 border-amber-200'
                                }`}>
                                <div className="flex items-start">
                                    <AlertTriangle className={`mt-0.5 mr-3 ${problema.tipo === 'critical' ? 'text-red-600' : 'text-amber-600'
                                        }`} size={20} />
                                    <div className="flex-1">
                                        <p className={`font-medium ${problema.tipo === 'critical' ? 'text-red-900' : 'text-amber-900'
                                            }`}>
                                            {problema.mensaje}
                                        </p>
                                        <p className={`text-sm mt-1 ${problema.tipo === 'critical' ? 'text-red-700' : 'text-amber-700'
                                            }`}>
                                            <strong>Sugerencia:</strong> {problema.sugerencia}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Periodos críticos */}
            {analysis.periodosCriticos.length > 0 && (
                <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3">Periodos Críticos (Accuracy &lt; 50%)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {analysis.periodosCriticos.map((periodo) => (
                            <div key={periodo.periodo} className="bg-red-50 rounded-lg p-3 border border-red-200">
                                <div className="font-medium text-red-900">Periodo {periodo.periodo}</div>
                                <div className="text-sm text-red-700">
                                    Accuracy: {periodo.accuracy.toFixed(1)}%
                                </div>
                                <div className="text-xs text-red-600">
                                    Brecha: {periodo.diferencia > 0 ? '+' : ''}{periodo.diferencia}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bloques problemáticos */}
            {analysis.bloquesProblematicos.length > 0 && (
                <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3">Bloques con Diferencias Significativas</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {analysis.bloquesProblematicos.map((bloque) => (
                            <div key={bloque.bloque} className={`rounded-lg p-3 ${bloque.tipo === 'subestimado' ? 'bg-orange-50' : 'bg-blue-50'
                                }`}>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-900">{bloque.bloque}</span>
                                    <span className={`text-sm font-medium ${bloque.tipo === 'subestimado' ? 'text-orange-600' : 'text-blue-600'
                                        }`}>
                                        {bloque.diferencia > 0 ? '+' : ''}{bloque.diferencia.toFixed(0)}%
                                    </span>
                                </div>
                                <div className={`text-xs mt-1 ${bloque.tipo === 'subestimado' ? 'text-orange-700' : 'text-blue-700'
                                    }`}>
                                    Modelo {bloque.tipo}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Análisis de capacidad */}
            <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Análisis de Capacidad</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Capacidad teórica total:</span>
                            <span className="font-medium">{analysis.capacidadTeorica} movimientos</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Utilización del modelo:</span>
                            <span className="font-medium">{analysis.utilizacionModelo.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Utilización real estimada:</span>
                            <span className="font-medium">
                                {((analysis.movimientosReal / analysis.capacidadTeorica) * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Capacidad no utilizada:</span>
                            <span className="font-medium text-amber-600">
                                {(analysis.capacidadTeorica - analysis.movimientosModelo).toLocaleString()} movimientos
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recomendaciones */}
            <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start">
                    <Info className="text-blue-600 mt-0.5 mr-3" size={20} />
                    <div>
                        <h4 className="font-medium text-blue-900 mb-2">
                            Recomendaciones para Mejorar Factibilidad y Accuracy
                        </h4>
                        <ul className="space-y-1 text-sm text-blue-700">
                            {analysis.accuracy < 60 && (
                                <li className="font-medium">
                                    • PRIORIDAD ALTA: Recalibrar parámetros μ, K y W basándose en datos históricos
                                </li>
                            )}
                            {analysis.cobertura < 100 && (
                                <li>• Aumentar capacidad en {(100 - analysis.cobertura).toFixed(0)}% para cubrir demanda total</li>
                            )}
                            {analysis.periodosCriticos.length > 0 && (
                                <li>• Revisar asignaciones en los {analysis.periodosCriticos.length} periodos críticos identificados</li>
                            )}
                            {analysis.bloquesProblematicos.filter(b => b.tipo === 'subestimado').length > 0 && (
                                <li>• Aumentar recursos en bloques subestimados: {
                                    analysis.bloquesProblematicos
                                        .filter(b => b.tipo === 'subestimado')
                                        .map(b => b.bloque)
                                        .join(', ')
                                }</li>
                            )}
                            <li>• Validar restricciones operacionales contra la práctica real</li>
                            <li>• Considerar patrones temporales de demanda no capturados por el modelo</li>
                            {!analysis.hasSolution && (
                                <li className="font-medium text-red-700">
                                    • URGENTE: Revisar logs del solver para identificar restricciones conflictivas
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeasibilityAnalysis;