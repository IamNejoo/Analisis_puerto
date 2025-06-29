// src/components/dashboard/congestion/CongestionPatternsAnalysis.tsx
import React from 'react';
import { Info, AlertTriangle } from 'lucide-react';

interface CongestionPattern {
    dayOfWeek: string;
    hourOfDay: number;
    avgCongestion: number;
    peakCongestion: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface CongestionPatternsAnalysisProps {
    currentLevel: 'terminal' | 'patio' | 'bloque';
    currentPatio?: string;
    currentBloque?: string;
    congestionPatterns: CongestionPattern[];
}

export const CongestionPatternsAnalysis: React.FC<CongestionPatternsAnalysisProps> = ({
    currentLevel,
    currentPatio,
    currentBloque,
    congestionPatterns
}) => {
    return (
        <div className="space-y-6">
            {/* Heatmap de patrones */}
            <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-200 mb-3">
                    Patrones de Congestión por Día y Hora
                    {currentLevel !== 'terminal' && (
                        <span className="text-xs font-normal text-slate-400 ml-2">
                            - Datos filtrados para {currentLevel === 'patio' ? `Patio ${currentPatio}` : `Bloque ${currentBloque}`}
                        </span>
                    )}
                </h3>

                {/* Grid de heatmap */}
                <div className="overflow-x-auto">
                    <div className="grid grid-cols-25 gap-1 min-w-[600px]">
                        {/* Header de horas */}
                        <div className="col-span-1"></div>
                        {Array.from({ length: 24 }, (_, i) => (
                            <div key={`hour-${i}`} className="text-xs text-slate-400 text-center">
                                {i}
                            </div>
                        ))}

                        {/* Filas por día */}
                        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                            <React.Fragment key={day}>
                                <div className="text-xs text-slate-400 pr-2">{day}</div>
                                {Array.from({ length: 24 }, (_, hour) => {
                                    const pattern = congestionPatterns.find(
                                        p => p.dayOfWeek === day.toLowerCase() && p.hourOfDay === hour
                                    );
                                    const color = !pattern ? '#1e293b' :
                                        pattern.riskLevel === 'critical' ? '#dc2626' :
                                            pattern.riskLevel === 'high' ? '#f59e0b' :
                                                pattern.riskLevel === 'medium' ? '#3b82f6' :
                                                    '#10b981';

                                    return (
                                        <div
                                            key={`${day}-${hour}`}
                                            className="aspect-square rounded"
                                            style={{ backgroundColor: color }}
                                            title={pattern ?
                                                `${day} ${hour}:00 - Promedio: ${pattern.avgCongestion.toFixed(0)} cont/h` :
                                                'Sin datos'
                                            }
                                        />
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Leyenda */}
                <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                        <span className="text-slate-400">Bajo</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                        <span className="text-slate-400">Medio</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                        <span className="text-slate-400">Alto</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-600 rounded mr-2"></div>
                        <span className="text-slate-400">Crítico</span>
                    </div>
                </div>
            </div>

            {/* Predicciones y recomendaciones */}
            <div className="bg-blue-950/20 rounded-lg p-4 border border-blue-800">
                <h3 className="text-sm font-semibold text-blue-300 mb-3 flex items-center">
                    <Info className="mr-2" size={16} />
                    Recomendaciones Basadas en Patrones
                </h3>
                <ul className="space-y-2 text-sm text-blue-200">
                    {congestionPatterns
                        .filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high')
                        .slice(0, 3)
                        .map((pattern, index) => (
                            <li key={index} className="flex items-start">
                                <AlertTriangle className="mr-2 flex-shrink-0 mt-0.5" size={14} />
                                <span>
                                    {pattern.dayOfWeek} a las {pattern.hourOfDay}:00 presenta congestión
                                    {pattern.riskLevel === 'critical' ? ' crítica' : ' alta'}.
                                    Considerar redistribuir {pattern.avgCongestion > 40 ? 'urgentemente' : ''}
                                    las operaciones.
                                </span>
                            </li>
                        ))}
                </ul>
            </div>

            {/* Resumen de patrones por nivel */}
            {currentLevel !== 'terminal' && (
                <div className="bg-slate-700 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-slate-200 mb-3">
                        Resumen de Patrones - {currentLevel === 'patio' ? `Patio ${currentPatio}` : `Bloque ${currentBloque}`}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-xs text-slate-400 mb-1">Horas con mayor congestión</div>
                            <div className="space-y-1">
                                {congestionPatterns
                                    .sort((a, b) => b.avgCongestion - a.avgCongestion)
                                    .slice(0, 3)
                                    .map((p, idx) => (
                                        <div key={idx} className="text-sm text-slate-300">
                                            {p.dayOfWeek} {p.hourOfDay}:00 - {p.avgCongestion.toFixed(0)} cont/h
                                        </div>
                                    ))}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-400 mb-1">Distribución de riesgo</div>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-red-400">Crítico:</span>
                                    <span className="text-slate-300">
                                        {congestionPatterns.filter(p => p.riskLevel === 'critical').length} horas
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-yellow-400">Alto:</span>
                                    <span className="text-slate-300">
                                        {congestionPatterns.filter(p => p.riskLevel === 'high').length} horas
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-400">Medio:</span>
                                    <span className="text-slate-300">
                                        {congestionPatterns.filter(p => p.riskLevel === 'medium').length} horas
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};