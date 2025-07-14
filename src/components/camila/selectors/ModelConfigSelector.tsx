// components/camila/selectors/ModelConfigSelector.tsx

import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Percent, Shuffle, RefreshCw } from 'lucide-react';
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
    const { data: disponibles, loading } = useResultadosDisponibles();
    const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);
    const [availableParticipations, setAvailableParticipations] = useState<number[]>([]);

    useEffect(() => {
        if (!disponibles || disponibles.length === 0) return;

        const yearData = disponibles.find(d => d.anio === config.anio);
        if (yearData) {
            setAvailableWeeks(yearData.semanas);
            setAvailableParticipations(yearData.participaciones);
        }
    }, [disponibles, config.anio]);

    const handleAnioChange = (anio: number) => {
        const yearData = disponibles.find(d => d.anio === anio);
        if (yearData) {
            onChange({
                ...config,
                anio,
                semana: yearData.semanas[0] || 1,
                participacion: yearData.participaciones[0] || 68
            });
        }
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
                        {disponibles.map(d => (
                            <option key={d.anio} value={d.anio}>
                                {d.anio}
                            </option>
                        ))}
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
                        {availableWeeks.map(semana => (
                            <option key={semana} value={semana}>
                                Semana {semana}
                            </option>
                        ))}
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
                        {availableParticipations.map(participacion => (
                            <option key={participacion} value={participacion}>
                                {participacion}%
                            </option>
                        ))}
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
                            K
                        </button>
                        <button
                            onClick={() => onChange({ ...config, dispersion: 'N' })}
                            className={`flex-1 py-2 px-3 rounded-lg border transition-colors ${config.dispersion === 'N'
                                ? 'bg-teal-600 text-white border-teal-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            N
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                    <span className="font-medium">Configuración actual:</span> Año {config.anio},
                    Semana {config.semana}, Turno {config.turno},
                    Participación {config.participacion}%, Dispersión {config.dispersion}
                </p>
            </div>
        </div>
    );
};

export default ModelConfigSelector;