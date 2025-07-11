// src/components/optimization/ModelSelector.tsx
import React, { useEffect, useState } from 'react';
import { useTimeContext } from '../../contexts/TimeContext';
import { useAvailableConfigurations } from '../../hooks/useOptimizationData';
import type { OptimizationConfig } from '../../types/optimization';
import { Calendar, Package, Activity, AlertCircle } from 'lucide-react';

export const ModelSelector: React.FC = () => {
    const { timeState, setMagdalenaConfig } = useTimeContext();
    const { configurations, isLoading, error } = useAvailableConfigurations();

    const [localConfig, setLocalConfig] = useState<OptimizationConfig>({
        anio: timeState?.magdalenaConfig?.anio || 2022,
        semana: timeState?.magdalenaConfig?.semana || 3,
        participacion: timeState?.magdalenaConfig?.participacion || 69,
        conDispersion: true
    });

    // Obtener valores únicos de las configuraciones disponibles
    const availableYears = [...new Set(configurations.map(c => c.anio))].sort();
    const availableWeeks = [...new Set(
        configurations
            .filter(c => c.anio === localConfig.anio)
            .map(c => c.semana)
    )].sort((a, b) => a - b);
    const availableParticipations = [...new Set(
        configurations
            .filter(c => c.anio === localConfig.anio && c.semana === localConfig.semana)
            .map(c => c.participacion)
    )].sort((a, b) => a - b);

    useEffect(() => {
        // Actualizar el contexto cuando cambie la configuración local
        setMagdalenaConfig({
            ...localConfig,
            semana: localConfig.semana
        });
    }, [localConfig, setMagdalenaConfig]);

    const updateConfig = (updates: Partial<OptimizationConfig>) => {
        const newConfig = { ...localConfig, ...updates };

        // Validar que la semana existe para el año seleccionado
        if (updates.anio) {
            const weeksForYear = configurations
                .filter(c => c.anio === newConfig.anio)
                .map(c => c.semana);
            if (weeksForYear.length > 0 && !weeksForYear.includes(newConfig.semana)) {
                newConfig.semana = Math.min(...weeksForYear);
            }
        }

        // Validar que la participación existe
        if (updates.anio || updates.semana) {
            const participationsAvailable = configurations
                .filter(c => c.anio === newConfig.anio && c.semana === newConfig.semana)
                .map(c => c.participacion);
            if (participationsAvailable.length > 0 && !participationsAvailable.includes(newConfig.participacion)) {
                newConfig.participacion = participationsAvailable[0];
            }
        }

        setLocalConfig(newConfig);
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                <div className="text-sm font-medium text-slate-50">
                    Configuración del Modelo
                </div>
                <div className="animate-pulse space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-10 bg-slate-700 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-3">
                <div className="text-sm font-medium text-slate-50">
                    Configuración del Modelo
                </div>
                <div className="bg-red-950/30 border border-red-700 rounded p-3">
                    <div className="flex items-center text-red-400">
                        <AlertCircle size={16} className="mr-2" />
                        <span className="text-sm">Error cargando configuraciones</span>
                    </div>
                </div>
            </div>
        );
    }

    const hasDataForCurrentConfig = configurations.some(
        c => c.anio === localConfig.anio &&
            c.semana === localConfig.semana &&
            c.participacion === localConfig.participacion
    );

    return (
        <div className="space-y-3">
            <div className="text-sm font-medium text-slate-50">
                Configuración del Modelo
            </div>

            {/* Año */}
            <div>
                <label className="text-xs text-slate-400 mb-1 block flex items-center">
                    <Calendar size={12} className="mr-1" />
                    Año
                </label>
                <select
                    value={localConfig.anio}
                    onChange={(e) => updateConfig({ anio: Number(e.target.value) })}
                    className="w-full text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    disabled={availableYears.length === 0}
                >
                    {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            {/* Semana */}
            <div>
                <label className="text-xs text-slate-400 mb-1 block">
                    Semana {localConfig.semana}
                </label>
                <input
                    type="range"
                    min={Math.min(...availableWeeks)}
                    max={Math.max(...availableWeeks)}
                    value={localConfig.semana}
                    onChange={(e) => updateConfig({ semana: Number(e.target.value) })}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                        background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${((localConfig.semana - Math.min(...availableWeeks)) /
                                (Math.max(...availableWeeks) - Math.min(...availableWeeks))) * 100
                            }%, #334155 ${((localConfig.semana - Math.min(...availableWeeks)) /
                                (Math.max(...availableWeeks) - Math.min(...availableWeeks))) * 100
                            }%, #334155 100%)`
                    }}
                    disabled={availableWeeks.length === 0}
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>{Math.min(...availableWeeks)}</span>
                    <span>{Math.max(...availableWeeks)}</span>
                </div>
            </div>

            {/* Participación */}
            <div>
                <label className="text-xs text-slate-400 mb-1 block flex items-center">
                    <Package size={12} className="mr-1" />
                    Participación
                </label>
                <select
                    value={localConfig.participacion}
                    onChange={(e) => updateConfig({ participacion: Number(e.target.value) })}
                    className="w-full text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    disabled={availableParticipations.length === 0}
                >
                    {availableParticipations.map(part => (
                        <option key={part} value={part}>{part}%</option>
                    ))}
                </select>
            </div>

            {/* Información de disponibilidad */}
            <div className="text-xs text-slate-400 bg-slate-800 border border-slate-700 rounded p-2">
                <div className="font-medium mb-1 text-slate-300 flex items-center">
                    <Activity size={12} className="mr-1" />
                    Disponibilidad de Datos
                </div>
                <div className="space-y-1">
                    <div>{configurations.length} instancias disponibles</div>
                    <div>{availableYears.length} años ({availableYears[0]} - {availableYears[availableYears.length - 1]})</div>
                    <div className="flex items-center mt-1">
                        <div className={`w-2 h-2 rounded-full mr-1 ${hasDataForCurrentConfig ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                        <span>{hasDataForCurrentConfig ? 'Datos disponibles' : 'Sin datos'}</span>
                    </div>
                </div>
            </div>

            {/* Resumen de la configuración actual */}
            {hasDataForCurrentConfig && configurations.length > 0 && (
                <div className="text-xs bg-cyan-950/30 border border-cyan-700 rounded p-2">
                    {(() => {
                        const config = configurations.find(
                            c => c.anio === localConfig.anio &&
                                c.semana === localConfig.semana &&
                                c.participacion === localConfig.participacion
                        );
                        return config ? (
                            <>
                                <div className="font-medium text-cyan-300 mb-1">Instancia Seleccionada</div>
                                <div className="text-cyan-200">
                                    {config.totalMovimientos.toLocaleString()} movimientos
                                </div>
                                <div className="text-cyan-200">
                                    {config.totalSegregaciones} segregaciones
                                </div>
                            </>
                        ) : null;
                    })()}
                </div>
            )}
        </div>
    );
};

export default ModelSelector;