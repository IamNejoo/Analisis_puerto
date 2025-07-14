// components/camila/comparison/FeasibilityAnalysis.tsx

import React, { useMemo } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import type { CamilaDashboardData } from '../../../types/camila';

interface FeasibilityAnalysisProps {
    data: CamilaDashboardData;
}

export const FeasibilityAnalysis: React.FC<FeasibilityAnalysisProps> = ({ data }) => {
    const analysis = useMemo(() => {
        const hasSolution = data.resultado.total_movimientos > 0;
        const comparaciones = data.comparaciones || [];

        // Analizar diferencias con datos reales
        const movimientosReales = comparaciones.find(c => c.metrica === 'movimientos_totales')?.valor_real || 0;
        const movimientosCamila = data.resultado.total_movimientos;
        const cobertura = movimientosReales > 0 ? (movimientosCamila / movimientosReales * 100) : 0;

        // Identificar problemas potenciales
        const problemas = [];

        if (!hasSolution) {
            problemas.push({
                tipo: 'critical',
                mensaje: 'No se encontró solución factible para este turno',
                sugerencia: 'Revisar restricciones del modelo o aumentar capacidad disponible'
            });
        }

        if (cobertura < 80 && cobertura > 0) {
            problemas.push({
                tipo: 'warning',
                mensaje: `Cobertura insuficiente: ${cobertura.toFixed(1)}% de movimientos reales`,
                sugerencia: 'Considerar aumentar el número de grúas o extender horarios'
            });
        }

        if (data.resultado.coeficiente_variacion > 50) {
            problemas.push({
                tipo: 'warning',
                mensaje: `Alto desbalance de carga (CV: ${data.resultado.coeficiente_variacion.toFixed(1)}%)`,
                sugerencia: 'Redistribuir asignaciones para equilibrar carga entre grúas'
            });
        }

        // Bloques con diferencias significativas
        const bloquesProblematicos = comparaciones
            .filter((c: any) => c.tipo_comparacion === 'por_bloque' && Math.abs(c.porcentaje_diferencia) > 50)
            .map((c: any) => ({
                bloque: c.metrica.replace('movimientos_', '').toUpperCase(),
                diferencia: c.porcentaje_diferencia
            }));

        return {
            hasSolution,
            cobertura,
            problemas,
            bloquesProblematicos,
            movimientosReales,
            movimientosCamila
        };
    }, [data]);

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Análisis de Factibilidad
            </h3>

            {/* Estado general */}
            <div className={`rounded-lg p-4 mb-6 ${analysis.hasSolution ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                <div className="flex items-start">
                    {analysis.hasSolution ? (
                        <CheckCircle className="text-green-600 mt-0.5 mr-3" size={24} />
                    ) : (
                        <XCircle className="text-red-600 mt-0.5 mr-3" size={24} />
                    )}
                    <div className="flex-1">
                        <h4 className={`font-medium ${analysis.hasSolution ? 'text-green-900' : 'text-red-900'
                            }`}>
                            {analysis.hasSolution ? 'Solución Factible Encontrada' : 'Sin Solución Factible'}
                        </h4>
                        <p className={`text-sm mt-1 ${analysis.hasSolution ? 'text-green-700' : 'text-red-700'
                            }`}>
                            {analysis.hasSolution
                                ? `El modelo asignó ${analysis.movimientosCamila} movimientos con ${data.metricas_gruas.filter((g: { utilizacion_pct: number }) => g.utilizacion_pct > 0).length} grúas activas`
                                : 'El modelo no pudo encontrar una asignación válida bajo las restricciones actuales'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Métricas de factibilidad */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Movimientos Planificados</div>
                    <div className="text-2xl font-bold text-gray-900">{analysis.movimientosReales}</div>
                    <div className="text-xs text-gray-500">Por datos reales</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Capacidad Asignada</div>
                    <div className="text-2xl font-bold text-gray-900">{analysis.movimientosCamila}</div>
                    <div className="text-xs text-gray-500">Por Camila</div>
                </div>

                <div className={`rounded-lg p-4 ${analysis.cobertura >= 100 ? 'bg-green-50' :
                    analysis.cobertura >= 80 ? 'bg-amber-50' : 'bg-red-50'
                    }`}>
                    <div className="text-sm text-gray-600 mb-1">Cobertura</div>
                    <div className={`text-2xl font-bold ${analysis.cobertura >= 100 ? 'text-green-900' :
                        analysis.cobertura >= 80 ? 'text-amber-900' : 'text-red-900'
                        }`}>
                        {analysis.cobertura.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">De demanda real</div>
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

            {/* Bloques problemáticos */}
            {analysis.bloquesProblematicos.length > 0 && (
                <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3">Bloques con Diferencias Significativas</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {analysis.bloquesProblematicos.map((bloque: { bloque: string; diferencia: number }) => (
                            <div key={bloque.bloque} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-900">{bloque.bloque}</span>
                                    <span className={`text-sm font-medium ${bloque.diferencia > 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {bloque.diferencia > 0 ? '+' : ''}{bloque.diferencia.toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recomendaciones */}
            <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start">
                    <Info className="text-blue-600 mt-0.5 mr-3" size={20} />
                    <div>
                        <h4 className="font-medium text-blue-900 mb-2">Recomendaciones para Mejorar Factibilidad</h4>
                        <ul className="space-y-1 text-sm text-blue-700">
                            <li>• Validar que los parámetros de demanda reflejen la realidad operacional</li>
                            <li>• Considerar flexibilizar restricciones de capacidad en períodos pico</li>
                            <li>• Evaluar la posibilidad de redistribuir carga entre turnos adyacentes</li>
                            <li>• Revisar la disponibilidad real de grúas y sus restricciones de movimiento</li>
                            {!analysis.hasSolution && (
                                <li className="font-medium">• URGENTE: Revisar logs del solver para identificar restricciones conflictivas</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeasibilityAnalysis;