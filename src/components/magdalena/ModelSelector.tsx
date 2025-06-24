// src/components/magdalena/ModelSelector.tsx - VERSIÓN COMPACTA
import React from 'react';
import { useTimeContext } from '../../contexts/TimeContext';
import type { MagdalenaConfig } from '../../types';

export const ModelSelector: React.FC = () => {
    const { timeState, setMagdalenaConfig } = useTimeContext();

    const config = timeState?.magdalenaConfig || {
        participacion: 69,
        conDispersion: true,
        semana: 3
    };

    const updateConfig = (updates: Partial<MagdalenaConfig>) => {
        setMagdalenaConfig({ ...config, ...updates });
    };

    return (
        <div className="space-y-3">
            <div className="text-sm font-medium text-slate-50">
                Configuración del Modelo
            </div>

            {/* Participación */}
            <div>
                <label className="text-xs text-slate-400 mb-1 block">
                    Participación
                </label>
                <select
                    value={config.participacion}
                    onChange={(e) => updateConfig({ participacion: Number(e.target.value) as 68 | 69 | 70 })}
                    className="w-full text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                    <option value={68}>68% - Balanceado</option>
                    <option value={69}>69% - Estándar</option>
                    <option value={70}>70% - Máximo</option>
                </select>
            </div>

            {/* Estrategia */}
            <div>
                <label className="text-xs text-slate-400 mb-1 block">
                    Estrategia
                </label>
                <div className="flex space-x-2">
                    <button
                        onClick={() => updateConfig({ conDispersion: true })}
                        className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${config.conDispersion
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                    >
                        Dispersión
                    </button>
                    <button
                        onClick={() => updateConfig({ conDispersion: false })}
                        className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${!config.conDispersion
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                    >
                        Centralizada
                    </button>
                </div>
            </div>

            {/* Semana */}
            <div>
                <label className="text-xs text-slate-400 mb-1 block">
                    Semana: {config.semana}
                </label>
                <input
                    type="range"
                    min="1"
                    max="52"
                    value={config.semana || 3}
                    onChange={(e) => updateConfig({ semana: Number(e.target.value) })}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                        background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${((config.semana - 1) / 51) * 100}%, #334155 ${((config.semana - 1) / 51) * 100}%, #334155 100%)`
                    }}
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>1</span>
                    <span>26</span>
                    <span>52</span>
                </div>
            </div>

            {/* Archivos disponibles */}
            <div className="text-xs text-slate-400 bg-slate-800 border border-slate-700 rounded p-2">
                <div className="font-medium mb-1 text-slate-300">📁 Archivos disponibles:</div>
                <div>5 semanas de datos</div>
                <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    <span>Datos disponibles</span>
                </div>
            </div>
        </div>
    );
};