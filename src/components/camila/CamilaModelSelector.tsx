import React from 'react';
import type { CamilaConfig } from '../../types';

interface CamilaModelSelectorProps {
    config: CamilaConfig;
    onChange: (config: CamilaConfig) => void;
}

export const CamilaModelSelector: React.FC<CamilaModelSelectorProps> = ({ config, onChange }) => {
    return (
        <div className="space-y-3">
            <div className="text-sm font-medium text-gray-800">
                Configuración Modelo Camila
            </div>

            {/* Tipo de modelo */}
            <div>
                <label className="text-xs text-gray-600 mb-1 block">
                    Tipo de Modelo
                </label>
                <select
                    value={config.modelType}
                    onChange={(e) => onChange({ ...config, modelType: e.target.value as 'minmax' | 'maxmin' })}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                    <option value="minmax">MinMax - Conservador</option>
                    <option value="maxmin">MaxMin - Máxima Utilización</option>
                </select>
            </div>

            {/* Con/Sin segregaciones */}
            <div>
                <label className="text-xs text-gray-600 mb-1 block">
                    Segregaciones
                </label>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onChange({ ...config, withSegregations: true })}
                        className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${config.withSegregations
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Con Segregaciones
                    </button>
                    <button
                        onClick={() => onChange({ ...config, withSegregations: false })}
                        className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${!config.withSegregations
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Sin Segregaciones
                    </button>
                </div>
            </div>

            {/* Semana/Turno */}
            <div>
                <label className="text-xs text-gray-600 mb-1 block">
                    Período: Semana {config.week}, {config.day}, Turno {config.shift}
                </label>
                <div className="text-xs text-gray-500 bg-purple-50 rounded p-2">
                    <div className="font-medium mb-1">📅 Datos disponibles:</div>
                    <div>Semana 3, Viernes, Turno 1</div>
                    <div>17 de enero 2022, 08:00-16:00</div>
                </div>
            </div>

            {/* Información del modelo */}
            <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                <div className="font-medium mb-1">ℹ️ Información:</div>
                <div>• 12 grúas RTG disponibles</div>
                <div>• 20 movimientos/hora por grúa</div>
                <div>• Bloques C1-C9 (Costanera)</div>
                <div>• {config.withSegregations ? '45+ segregaciones' : 'Sin segregaciones'}</div>
            </div>
        </div>
    );
};