// components/camila/CamilaModelSelector.tsx - Versión mejorada

import React, { useState, useEffect } from 'react';
import { ChevronDown, AlertCircle, Calendar, Clock, Loader, Database, AlertTriangle } from 'lucide-react';
import type { CamilaConfig } from '../../types';

interface CamilaModelSelectorProps {
    config: CamilaConfig;
    onChange: (config: CamilaConfig) => void;
}

interface AvailableConfiguration {
    week: number;
    day: string;
    shift: number;
    modelType: string;
    withSegregations: boolean;
    totalMovements: number;
    workloadBalance: number;
    hasRealData?: boolean;
}

export const CamilaModelSelector: React.FC<CamilaModelSelectorProps> = ({ config, onChange }) => {
    const [availableConfigs, setAvailableConfigs] = useState<AvailableConfiguration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [dataWarning, setDataWarning] = useState<string | null>(null);

    useEffect(() => {
        const loadAvailableConfigurations = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/v1/camila/configurations');

                if (!response.ok) {
                    throw new Error('Error al cargar configuraciones');
                }

                const data: AvailableConfiguration[] = await response.json();

                // Logging detallado
                console.log('📊 Configuraciones disponibles:', data);
                console.log('📊 Total configuraciones:', data.length);

                // Analizar qué datos están realmente disponibles
                const weeks = [...new Set(data.map(c => c.week))];
                const days = [...new Set(data.map(c => c.day))];
                const shifts = [...new Set(data.map(c => c.shift))];

                console.log('📊 Semanas únicas:', weeks);
                console.log('📊 Días únicos:', days);
                console.log('📊 Turnos únicos:', shifts);

                // Detectar si hay limitaciones en los datos
                if (data.length === 1 || (weeks.length === 1 && days.length === 1 && shifts.length === 1)) {
                    setDataWarning('Solo hay datos disponibles para una configuración. Los cambios en día/turno mostrarán los mismos datos.');
                } else if (shifts.length === 1) {
                    setDataWarning(`Solo hay datos para el turno ${shifts[0]}. Otros turnos mostrarán información vacía.`);
                }

                setAvailableConfigs(data);
                setError(null);
            } catch (err) {
                console.error('Error cargando configuraciones:', err);
                setError('No se pudieron cargar las configuraciones disponibles');
                // Datos de fallback para desarrollo
                setAvailableConfigs([{
                    week: 3,
                    day: 'Monday',
                    shift: 1,
                    modelType: 'minmax',
                    withSegregations: true,
                    totalMovements: 674,
                    workloadBalance: 85
                }]);
            } finally {
                setIsLoading(false);
            }
        };

        loadAvailableConfigurations();
    }, []);

    const isConfigAvailable = availableConfigs.some(
        avail =>
            avail.week === config.week &&
            avail.day === config.day &&
            avail.shift === config.shift &&
            avail.modelType === config.modelType &&
            avail.withSegregations === config.withSegregations
    );

    const currentConfig = availableConfigs.find(
        avail =>
            avail.week === config.week &&
            avail.day === config.day &&
            avail.shift === config.shift &&
            avail.modelType === config.modelType &&
            avail.withSegregations === config.withSegregations
    );

    const availableWeeks = [...new Set(availableConfigs.map(c => c.week))].sort((a, b) => a - b);
    const availableDays = [...new Set(
        availableConfigs
            .filter(c => c.week === config.week)
            .map(c => c.day)
    )];
    const availableShifts = [...new Set(
        availableConfigs
            .filter(c => c.week === config.week && c.day === config.day)
            .map(c => c.shift)
    )].sort((a, b) => a - b);

    const getWeekDate = (week: number): string => {
        const year = 2022;
        const firstDay = new Date(year, 0, 1);
        const days = (week - 1) * 7;
        firstDay.setDate(firstDay.getDate() + days);
        return firstDay.toLocaleDateString('es-CL', { month: 'short', day: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                <div className="text-sm font-medium text-gray-800">
                    Configuración Modelo Camila
                </div>
                <div className="flex items-center justify-center p-8">
                    <Loader className="animate-spin text-purple-600" size={24} />
                    <span className="ml-2 text-gray-600">Cargando configuraciones...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="text-sm font-medium text-gray-800 flex items-center">
                <Database size={16} className="mr-2 text-purple-600" />
                Configuración Modelo Camila
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded p-2 flex items-center text-xs text-red-700">
                    <AlertCircle size={14} className="mr-1" />
                    {error}
                </div>
            )}

            {dataWarning && (
                <div className="bg-amber-50 border border-amber-200 rounded p-3 flex items-start text-xs text-amber-800">
                    <AlertTriangle size={14} className="mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                        <strong>Datos limitados:</strong> {dataWarning}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-3 gap-2">
                <div>
                    <label className="text-xs text-gray-600 mb-1 block">Semana</label>
                    <select
                        value={config.week}
                        onChange={(e) => {
                            const newWeek = parseInt(e.target.value);
                            const firstAvailable = availableConfigs.find(c => c.week === newWeek);
                            onChange({
                                ...config,
                                week: newWeek,
                                day: firstAvailable?.day || 'Monday',
                                shift: firstAvailable?.shift || 1
                            });
                        }}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        disabled={availableWeeks.length <= 1}
                    >
                        {availableWeeks.length === 0 ? (
                            <option value={3}>Semana 3 (predeterminado)</option>
                        ) : (
                            availableWeeks.map(week => (
                                <option key={`week-${week}`} value={week}>
                                    Semana {week} ({getWeekDate(week)})
                                </option>
                            ))
                        )}
                    </select>
                </div>

                <div>
                    <label className="text-xs text-gray-600 mb-1 block">Día</label>
                    <select
                        value={config.day}
                        onChange={(e) => {
                            const newDay = e.target.value;
                            const firstAvailable = availableConfigs.find(
                                c => c.week === config.week && c.day === newDay
                            );
                            onChange({
                                ...config,
                                day: newDay,
                                shift: firstAvailable?.shift || 1
                            });
                        }}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        disabled={availableDays.length <= 1}
                    >
                        {availableDays.length === 0 ? (
                            <option value="Monday">Lunes (sin datos)</option>
                        ) : (
                            availableDays.map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))
                        )}
                    </select>
                </div>

                <div>
                    <label className="text-xs text-gray-600 mb-1 block">Turno</label>
                    <select
                        value={config.shift}
                        onChange={(e) => onChange({ ...config, shift: parseInt(e.target.value) })}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        disabled={availableShifts.length <= 1}
                    >
                        {availableShifts.length === 0 ? (
                            <option value={1}>Turno 1 (sin datos)</option>
                        ) : (
                            availableShifts.map(shift => (
                                <option key={shift} value={shift}>
                                    Turno {shift} ({shift === 1 ? '08:00-16:00' : shift === 2 ? '16:00-24:00' : '00:00-08:00'})
                                </option>
                            ))
                        )}
                    </select>
                </div>
            </div>

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

            <div className={`rounded p-2 text-xs ${isConfigAvailable
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                <div className="flex items-center">
                    {isConfigAvailable ? (
                        <>
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="font-medium">Datos disponibles</span>
                            {currentConfig && (
                                <span className="ml-auto text-green-600">
                                    {currentConfig.totalMovements.toLocaleString()} movimientos
                                </span>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                            <span className="font-medium">Sin datos para esta configuración</span>
                        </>
                    )}
                </div>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 rounded">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full p-2 flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                    <span className="font-medium">ℹ️ Información del modelo</span>
                    <ChevronDown
                        size={14}
                        className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                </button>

                {isExpanded && (
                    <div className="p-2 pt-0 space-y-1">
                        <div>• 12 grúas RTG disponibles</div>
                        <div>• 20 movimientos/hora por grúa</div>
                        <div>• Bloques C1-C9 (Costanera)</div>
                        <div>• {config.withSegregations ? '52 segregaciones' : 'Sin segregaciones'}</div>
                        <div className="pt-1 mt-1 border-t border-gray-200">
                            <strong>Configuraciones disponibles:</strong> {availableConfigs.length}
                        </div>
                        {availableConfigs.length === 1 && (
                            <div className="text-amber-600 font-medium">
                                ⚠️ Solo hay datos para una configuración
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CamilaModelSelector;