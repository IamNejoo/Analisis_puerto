// components/camila/selectors/ModelConfigSelector.tsx

import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Percent, Shuffle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import type { CamilaConfig } from '../../../types/camila';
import { useResultadosDisponibles } from '../../../hooks/useCamilaData';

interface ModelConfigSelectorProps {
    config: CamilaConfig;
    onChange: (config: CamilaConfig) => void;
}

export const ModelConfigSelector: React.FC<ModelConfigSelectorProps> = ({
    config,
    onChange
}) => {
    const { data: resultadosList, loading } = useResultadosDisponibles();
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);
    const [availableParticipations, setAvailableParticipations] = useState<number[]>([]);

    useEffect(() => {
        if (!resultadosList || !resultadosList.resultados || resultadosList.resultados.length === 0) return;

        // Extraer años únicos
        const years = [...new Set(resultadosList.resultados.map(r => r.anio))].sort();
        setAvailableYears(years);

        // Filtrar por año actual
        const yearResults = resultadosList.resultados.filter(r => r.anio === config.anio);

        // Extraer semanas únicas para el año
        const weeks = [...new Set(yearResults.map(r => r.semana))].sort((a, b) => a - b);
        setAvailableWeeks(weeks);

        // Extraer participaciones únicas
        const participations = [...new Set(resultadosList.resultados.map(r => r.participacion))].sort((a, b) => a - b);
        setAvailableParticipations(participations);
    }, [resultadosList, config.anio]);

    const handleAnioChange = (anio: number) => {
        // Al cambiar el año, ajustar semana si es necesario
        const yearResults = resultadosList?.resultados.filter(r => r.anio === anio) || [];
        const weeks = [...new Set(yearResults.map(r => r.semana))].sort((a, b) => a - b);

        onChange({
            ...config,
            anio,
            semana: weeks.includes(config.semana) ? config.semana : (weeks[0] || 1)
        });
    };

    const turnos = Array.from({ length: 21 }, (_, i) => i + 1);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <RefreshCw className="animate-spin text-teal-600 mr-2" size={20} />
                <span className="text-gray-600">Cargando configuraciones disponibles...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Configuración del Modelo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Año */}
                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Calendar size={16} className="mr-1" />
                        Año
                    </label>
                    <select
                        value={config.anio}
                        onChange={(e) => handleAnioChange(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                        {availableYears.length > 0 ? (
                            availableYears.map(anio => (
                                <option key={anio} value={anio}>
                                    {anio}
                                </option>
                            ))
                        ) : (
                            <option value={2022}>2022</option>
                        )}
                    </select>
                </div>

                {/* Semana */}
                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Calendar size={16} className="mr-1" />
                        Semana
                    </label>
                    <select
                        value={config.semana}
                        onChange={(e) => onChange({ ...config, semana: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                        {availableWeeks.length > 0 ? (
                            availableWeeks.map(semana => (
                                <option key={semana} value={semana}>
                                    Semana {semana}
                                </option>
                            ))
                        ) : (
                            Array.from({ length: 52 }, (_, i) => i + 1).map(semana => (
                                <option key={semana} value={semana}>
                                    Semana {semana}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                {/* Turno */}
                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Clock size={16} className="mr-1" />
                        Turno
                    </label>
                    <select
                        value={config.turno}
                        onChange={(e) => onChange({ ...config, turno: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                        {turnos.map(turno => (
                            <option key={turno} value={turno}>
                                Turno {turno}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Participación */}
                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Percent size={16} className="mr-1" />
                        Participación
                    </label>
                    <select
                        value={config.participacion}
                        onChange={(e) => onChange({ ...config, participacion: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                        {availableParticipations.length > 0 ? (
                            availableParticipations.map(participacion => (
                                <option key={participacion} value={participacion}>
                                    {participacion}%
                                </option>
                            ))
                        ) : (
                            [60, 65, 68, 70, 75, 80].map(participacion => (
                                <option key={participacion} value={participacion}>
                                    {participacion}%
                                </option>
                            ))
                        )}
                    </select>
                </div>

                {/* Dispersión */}
                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Shuffle size={16} className="mr-1" />
                        Dispersión
                    </label>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onChange({ ...config, dispersion: 'K' })}
                            className={`flex-1 py-2 px-3 rounded-lg border transition-colors ${config.dispersion === 'K'
                                ? 'bg-teal-600 text-white border-teal-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            Con
                        </button>
                        <button
                            onClick={() => onChange({ ...config, dispersion: 'N' })}
                            className={`flex-1 py-2 px-3 rounded-lg border transition-colors ${config.dispersion === 'N'
                                ? 'bg-teal-600 text-white border-teal-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            Sin
                        </button>
                    </div>
                </div>
            </div>

            {/* Resumen de configuración con indicadores */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                    <span className="font-medium">Configuración actual:</span> Año {config.anio},
                    Semana {config.semana}, Turno {config.turno},
                    Participación {config.participacion}%, {config.dispersion === 'K' ? 'Con' : 'Sin'} Dispersión
                </p>

                {/* Mostrar si hay datos para esta configuración */}
                {resultadosList && resultadosList.resultados && (
                    <div className="mt-2">
                        {resultadosList.resultados.find(r =>
                            r.anio === config.anio &&
                            r.semana === config.semana &&
                            r.turno === config.turno &&
                            r.participacion === config.participacion &&
                            r.dispersion === config.dispersion
                        ) ? (
                            <span className="inline-flex items-center text-xs text-green-600">
                                <CheckCircle size={14} className="mr-1" />
                                Datos disponibles
                            </span>
                        ) : (
                            <span className="inline-flex items-center text-xs text-gray-500">
                                <XCircle size={14} className="mr-1" />
                                Sin datos para esta configuración
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModelConfigSelector;