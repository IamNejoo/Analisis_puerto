// src/components/dashboard/congestion/BottleneckAnalysis.tsx
import React from 'react';
import { Target, AlertTriangle, Info, ArrowRightLeft } from 'lucide-react';

interface BottleneckAnalysisItem {
    location: 'gate' | 'muelle' | 'patio' | 'organizacion';
    severity: number;
    indicators: string[];
    recommendation: string;
}

interface BottleneckAnalysisProps {
    currentLevel: 'terminal' | 'patio' | 'bloque';
    currentPatio?: string;
    currentBloque?: string;
    bottleneckAnalysis: BottleneckAnalysisItem[];
}

export const BottleneckAnalysis: React.FC<BottleneckAnalysisProps> = ({
    currentLevel,
    currentPatio,
    currentBloque,
    bottleneckAnalysis
}) => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-200">
                Identificación de Cuellos de Botella
                {currentLevel !== 'terminal' && (
                    <span className="text-sm font-normal text-slate-400 ml-2">
                        - Análisis para {currentLevel === 'patio' ? `Patio ${currentPatio}` : `Bloque ${currentBloque}`}
                    </span>
                )}
            </h3>

            {bottleneckAnalysis.length === 0 ? (
                <div className="bg-green-950/30 border border-green-700 rounded-lg p-4">
                    <div className="flex items-center">
                        <Info className="text-green-400 mr-2" size={20} />
                        <p className="text-green-300">
                            No se detectan cuellos de botella significativos. El sistema opera de forma balanceada.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {bottleneckAnalysis.map((analysis, idx) => (
                        <div key={idx} className={`rounded-lg p-4 border ${analysis.severity > 80 ? 'bg-red-950/30 border-red-700' :
                                analysis.severity > 60 ? 'bg-yellow-950/30 border-yellow-700' :
                                    'bg-blue-950/30 border-blue-700'
                            }`}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center">
                                    <Target className={`mr-2 ${analysis.severity > 80 ? 'text-red-400' :
                                            analysis.severity > 60 ? 'text-yellow-400' :
                                                'text-blue-400'
                                        }`} size={20} />
                                    <h4 className="text-lg font-semibold text-slate-100">
                                        Cuello de Botella en {analysis.location.toUpperCase()}
                                    </h4>
                                </div>
                                <div className={`px-3 py-1 rounded text-sm font-medium ${analysis.severity > 80 ? 'bg-red-800 text-red-200' :
                                        analysis.severity > 60 ? 'bg-yellow-800 text-yellow-200' :
                                            'bg-blue-800 text-blue-200'
                                    }`}>
                                    Severidad: {analysis.severity}%
                                </div>
                            </div>

                            <div className="mb-3">
                                <div className="text-sm font-medium text-slate-300 mb-1">Indicadores:</div>
                                <ul className="text-sm text-slate-400 space-y-1">
                                    {analysis.indicators.map((indicator, i) => (
                                        <li key={i}>• {indicator}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-3 p-3 bg-slate-800 rounded">
                                <div className="flex items-start">
                                    <AlertTriangle className="text-cyan-400 mr-2 flex-shrink-0 mt-0.5" size={16} />
                                    <p className="text-sm text-cyan-300">
                                        {analysis.recommendation}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Diagrama de flujo visual */}
                    <div className="bg-slate-700 rounded-lg p-4 mt-6">
                        <h4 className="text-sm font-semibold text-slate-200 mb-3">
                            Flujo del Sistema y Cuellos de Botella
                        </h4>
                        <div className="flex items-center justify-between">
                            {['Muelle', 'Patio', 'Gate', 'Salida'].map((location, idx) => {
                                const bottleneck = bottleneckAnalysis.find(b =>
                                    b.location.toLowerCase() === location.toLowerCase()
                                );
                                const hasBottleneck = !!bottleneck;

                                return (
                                    <React.Fragment key={location}>
                                        <div className={`flex flex-col items-center p-3 rounded ${hasBottleneck ? 'bg-red-900/50' : 'bg-slate-800'
                                            }`}>
                                            <div className={`text-2xl font-bold ${hasBottleneck ? 'text-red-400' : 'text-slate-400'
                                                }`}>
                                                {location}
                                            </div>
                                            {hasBottleneck && (
                                                <div className="text-xs text-red-300 mt-1">
                                                    {bottleneck.severity}% congestión
                                                </div>
                                            )}
                                        </div>
                                        {idx < 3 && (
                                            <ArrowRightLeft className="text-slate-500" size={20} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};