import React, { useEffect, useState } from 'react';
import { useMagdalenaContext } from '../../contexts/MagdalenaContext';
import { useAvailableConfigurations } from '../../hooks/useAvailableConfigurations';
import type { OptimizationConfig, AvailableConfiguration } from '../../types/optimization';
import { Calendar, Package, Activity, AlertCircle } from 'lucide-react';

export const ModelSelector: React.FC = () => {
    const { config, updateConfig } = useMagdalenaContext();
    const { configurations, isLoading, error } = useAvailableConfigurations();

    // Obtener valores únicos de las configuraciones disponibles con tipos correctos
    const availableYears = [...new Set(configurations.map((c: AvailableConfiguration) => c.anio))].sort();
    const availableWeeks = [...new Set(
        configurations
            .filter((c: AvailableConfiguration) => c.anio === config.anio)
            .map((c: AvailableConfiguration) => c.semana)
    )].sort((a: number, b: number) => a - b);
    const availableParticipations = [...new Set(
        configurations
            .filter((c: AvailableConfiguration) => c.anio === config.anio && c.semana === config.semana)
            .map((c: AvailableConfiguration) => c.participacion)
    )].sort((a: number, b: number) => a - b);

    const handleConfigUpdate = (updates: Partial<OptimizationConfig>) => {
        const newConfig = { ...config, ...updates };

        // Validar que la semana existe para el año seleccionado
        if (updates.anio) {
            const weeksForYear = configurations
                .filter((c: AvailableConfiguration) => c.anio === newConfig.anio)
                .map((c: AvailableConfiguration) => c.semana);
            if (weeksForYear.length > 0 && !weeksForYear.includes(newConfig.semana)) {
                newConfig.semana = Math.min(...weeksForYear);
            }
        }

        // Validar que la participación existe
        if (updates.anio || updates.semana) {
            const participationsAvailable = configurations
                .filter((c: AvailableConfiguration) => c.anio === newConfig.anio && c.semana === newConfig.semana)
                .map((c: AvailableConfiguration) => c.participacion);
            if (participationsAvailable.length > 0 && !participationsAvailable.includes(newConfig.participacion)) {
                newConfig.participacion = participationsAvailable[0];
            }
        }

        updateConfig(newConfig);
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
        (c: AvailableConfiguration) => c.anio === config.anio &&
            c.semana === config.semana &&
            c.participacion === config.participacion
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
                    value={config.anio}
                    onChange={(e) => handleConfigUpdate({ anio: Number(e.target.value) })}
                    className="w-full text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    disabled={availableYears.length === 0}
                >
                    {availableYears.map((year: number) => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            {/* Semana */}
            <div>
                <label className="text-xs text-slate-400 mb-1 block">
                    Semana {config.semana}
                </label>
                <input
                    type="range"
                    min={Math.min(...availableWeeks) || 1}
                    max={Math.max(...availableWeeks) || 52}
                    value={config.semana}
                    onChange={(e) => handleConfigUpdate({ semana: Number(e.target.value) })}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                        background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${((config.semana - (Math.min(...availableWeeks) || 1)) /
                            ((Math.max(...availableWeeks) || 52) - (Math.min(...availableWeeks) || 1))) * 100
                            }%, #334155 ${((config.semana - (Math.min(...availableWeeks) || 1)) /
                                ((Math.max(...availableWeeks) || 52) - (Math.min(...availableWeeks) || 1))) * 100
                            }%, #334155 100%)`
                    }}
                    disabled={availableWeeks.length === 0}
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>{Math.min(...availableWeeks) || 1}</span>
                    <span>{Math.max(...availableWeeks) || 52}</span>
                </div>
            </div>

            {/* Participación */}
            <div>
                <label className="text-xs text-slate-400 mb-1 block flex items-center">
                    <Package size={12} className="mr-1" />
                    Participación
                </label>
                <select
                    value={config.participacion}
                    onChange={(e) => handleConfigUpdate({ participacion: Number(e.target.value) })}
                    className="w-full text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    disabled={availableParticipations.length === 0}
                >
                    {availableParticipations.map((part: number) => (
                        <option key={part} value={part}>{part}%</option>
                    ))}
                </select>
            </div>

            {/* Dispersión */}
            <div>
                <label className="text-xs text-slate-400 mb-1 block">
                    Dispersión
                </label>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleConfigUpdate({ conDispersion: true })}
                        className={`flex-1 text-sm px-3 py-1.5 rounded transition-colors ${config.conDispersion
                            ? 'bg-cyan-500 text-white'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                    >
                        Con dispersión
                    </button>
                    <button
                        onClick={() => handleConfigUpdate({ conDispersion: false })}
                        className={`flex-1 text-sm px-3 py-1.5 rounded transition-colors ${!config.conDispersion
                            ? 'bg-cyan-500 text-white'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                    >
                        Sin dispersión
                    </button>
                </div>
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
                        const configData = configurations.find(
                            (c: AvailableConfiguration) => c.anio === config.anio &&
                                c.semana === config.semana &&
                                c.participacion === config.participacion &&
                                (config.conDispersion ? c.dispersion === 'K' : c.dispersion === 'N')
                        );
                        return configData ? (
                            <>
                                <div className="font-medium text-cyan-300 mb-1">Instancia Seleccionada</div>
                                <div className="text-cyan-200">
                                    {configData.totalMovimientos.toLocaleString()} movimientos
                                </div>
                                <div className="text-cyan-200">
                                    {configData.totalSegregaciones} segregaciones
                                </div>
                                <div className="text-cyan-200 text-xs mt-1">
                                    {new Date(configData.fechaInicio).toLocaleDateString()} - {new Date(configData.fechaFin).toLocaleDateString()}
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