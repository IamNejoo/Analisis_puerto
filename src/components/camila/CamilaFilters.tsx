// components/camila/CamilaFilters.tsx

import React, { useState, useEffect } from 'react';
import {
    Filter,
    Clock,
    Package,
    Truck,
    AlertTriangle,
    BarChart3,
    X,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { camilaAPI } from '../../services/camilaApi';
import type { CamilaConfig } from '../../types';
import type { CamilaFilters, SegregationInfo } from '../../types/camila';
interface CamilaFiltersProps {
    filters: CamilaFilters;
    onFiltersChange: (filters: CamilaFilters) => void;
    config: CamilaConfig;
    onClose?: () => void;
}

export const CamilaFiltersComponent: React.FC<CamilaFiltersProps> = ({
    filters,
    onFiltersChange,
    config,
    onClose
}) => {
    const [topSegregations, setTopSegregations] = useState<SegregationInfo[]>([]);
    const [isLoadingSegregations, setIsLoadingSegregations] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        time: true,
        resources: true,
        segregations: false,
        congestion: false,
        analysis: false
    });

    const blocks = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'];
    const gruas = Array.from({ length: 12 }, (_, i) => i + 1);

    // Cargar top segregaciones
    useEffect(() => {
        if (config.withSegregations && filters.showTopSegregations) {
            loadTopSegregations();
        }
    }, [config, filters.showTopSegregations, filters.topSegregationsCount]);

    const loadTopSegregations = async () => {
        setIsLoadingSegregations(true);
        try {
            const data = await camilaAPI.getTopSegregations(config, filters.topSegregationsCount);
            setTopSegregations(data.segregations || []);
        } catch (error) {
            console.error('Error loading segregations:', error);
        } finally {
            setIsLoadingSegregations(false);
        }
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const updateFilter = <K extends keyof CamilaFilters>(
        key: K,
        value: CamilaFilters[K]
    ) => {
        onFiltersChange({
            ...filters,
            [key]: value
        });
    };

    const resetFilters = () => {
        onFiltersChange({
            hourRange: { start: 8, end: 16 },
            selectedGruas: [],
            selectedBlocks: [],
            selectedSegregations: [],
            showTopSegregations: false,
            topSegregationsCount: 10,
            congestionLevels: [],
            viewMode: 'summary',
            compareModels: false,
            showPeakHours: false,
            showPatterns: false
        });
    };

    return (
        <div className="bg-slate-800 h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-700 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-100 flex items-center">
                        <Filter size={20} className="mr-2" />
                        Filtros Camila
                    </h3>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-100 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>
                <button
                    onClick={resetFilters}
                    className="mt-2 text-sm text-teal-400 hover:text-teal-300 transition-colors"
                >
                    Restablecer filtros
                </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
                {/* Filtros de Tiempo */}
                <FilterSection
                    title="Rango de Tiempo"
                    icon={<Clock size={16} />}
                    expanded={expandedSections.time}
                    onToggle={() => toggleSection('time')}
                >
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">
                                Hora Inicio
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="23"
                                value={filters.hourRange.start}
                                onChange={(e) => updateFilter('hourRange', {
                                    ...filters.hourRange,
                                    start: parseInt(e.target.value)
                                })}
                                className="w-full"
                            />
                            <div className="text-center text-sm text-slate-300">
                                {filters.hourRange.start}:00
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">
                                Hora Fin
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="23"
                                value={filters.hourRange.end}
                                onChange={(e) => updateFilter('hourRange', {
                                    ...filters.hourRange,
                                    end: parseInt(e.target.value)
                                })}
                                className="w-full"
                            />
                            <div className="text-center text-sm text-slate-300">
                                {filters.hourRange.end}:00
                            </div>
                        </div>
                    </div>
                </FilterSection>

                {/* Filtros de Recursos */}
                <FilterSection
                    title="Recursos"
                    icon={<Truck size={16} />}
                    expanded={expandedSections.resources}
                    onToggle={() => toggleSection('resources')}
                >
                    <div className="space-y-3">
                        {/* Grúas */}
                        <div>
                            <label className="text-xs text-slate-400 mb-2 block">
                                Grúas RTG
                            </label>
                            <div className="grid grid-cols-4 gap-1">
                                {gruas.map(grua => (
                                    <button
                                        key={grua}
                                        onClick={() => {
                                            const selected = filters.selectedGruas.includes(grua);
                                            updateFilter(
                                                'selectedGruas',
                                                selected
                                                    ? filters.selectedGruas.filter((g: number) => g !== grua)
                                                    : [...filters.selectedGruas, grua]
                                            );
                                        }}
                                        className={`
                                            px-2 py-1 text-xs rounded transition-colors
                                            ${filters.selectedGruas.includes(grua)
                                                ? 'bg-teal-600 text-white'
                                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                            }
                                        `}
                                    >
                                        G{grua}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Bloques */}
                        <div>
                            <label className="text-xs text-slate-400 mb-2 block">
                                Bloques
                            </label>
                            <div className="grid grid-cols-3 gap-1">
                                {blocks.map(block => (
                                    <button
                                        key={block}
                                        onClick={() => {
                                            const selected = filters.selectedBlocks.includes(block);
                                            updateFilter(
                                                'selectedBlocks',
                                                selected
                                                    ? filters.selectedBlocks.filter((b: string) => b !== block)
                                                    : [...filters.selectedBlocks, block]
                                            );
                                        }}
                                        className={`
                                            px-2 py-1 text-xs rounded transition-colors
                                            ${filters.selectedBlocks.includes(block)
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                            }
                                        `}
                                    >
                                        {block}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </FilterSection>

                {/* Filtros de Segregaciones */}
                {config.withSegregations && (
                    <FilterSection
                        title="Segregaciones"
                        icon={<Package size={16} />}
                        expanded={expandedSections.segregations}
                        onToggle={() => toggleSection('segregations')}
                    >
                        <div className="space-y-3">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={filters.showTopSegregations}
                                    onChange={(e) => updateFilter('showTopSegregations', e.target.checked)}
                                    className="rounded border-slate-600"
                                />
                                <span className="text-sm text-slate-300">
                                    Mostrar Top Segregaciones
                                </span>
                            </label>

                            {filters.showTopSegregations && (
                                <>
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">
                                            Cantidad: {filters.topSegregationsCount}
                                        </label>
                                        <input
                                            type="range"
                                            min="5"
                                            max="20"
                                            step="5"
                                            value={filters.topSegregationsCount}
                                            onChange={(e) => updateFilter(
                                                'topSegregationsCount',
                                                parseInt(e.target.value)
                                            )}
                                            className="w-full"
                                        />
                                    </div>

                                    {isLoadingSegregations ? (
                                        <div className="text-center py-2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-400 mx-auto"></div>
                                        </div>
                                    ) : (
                                        <div className="space-y-1 max-h-40 overflow-y-auto">
                                            {topSegregations.map(seg => (
                                                <label
                                                    key={seg.id}
                                                    className="flex items-center space-x-2 p-1 hover:bg-slate-700 rounded cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.selectedSegregations.includes(seg.id)}
                                                        onChange={() => {
                                                            const selected = filters.selectedSegregations.includes(seg.id);
                                                            updateFilter(
                                                                'selectedSegregations',
                                                                selected
                                                                    ? filters.selectedSegregations.filter((s: string) => s !== seg.id)
                                                                    : [...filters.selectedSegregations, seg.id]
                                                            );
                                                        }}
                                                        className="rounded border-slate-600"
                                                    />
                                                    <div className="flex-1 flex items-center justify-between">
                                                        <span className="text-xs text-slate-300">{seg.name}</span>
                                                        <span className="text-xs text-slate-500">
                                                            {seg.percentage.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </FilterSection>
                )}

                {/* Filtros de Congestión */}
                <FilterSection
                    title="Nivel de Congestión"
                    icon={<AlertTriangle size={16} />}
                    expanded={expandedSections.congestion}
                    onToggle={() => toggleSection('congestion')}
                >
                    <div className="space-y-2">
                        {(['low', 'medium', 'high'] as const).map(level => (
                            <label
                                key={level}
                                className="flex items-center space-x-2 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={filters.congestionLevels.includes(level)}
                                    onChange={() => {
                                        const selected = filters.congestionLevels.includes(level);
                                        updateFilter(
                                            'congestionLevels',
                                            selected
                                                ? filters.congestionLevels.filter((l: typeof level) => l !== level)
                                                : [...filters.congestionLevels, level]
                                        );
                                    }}
                                    className="rounded border-slate-600"
                                />
                                <span className={`text-sm capitalize ${level === 'low' ? 'text-green-400' :
                                    level === 'medium' ? 'text-yellow-400' :
                                        'text-red-400'
                                    }`}>
                                    {level === 'low' ? 'Baja' : level === 'medium' ? 'Media' : 'Alta'}
                                </span>
                            </label>
                        ))}
                    </div>
                </FilterSection>

                {/* Análisis y Comparación */}
                <FilterSection
                    title="Análisis"
                    icon={<BarChart3 size={16} />}
                    expanded={expandedSections.analysis}
                    onToggle={() => toggleSection('analysis')}
                >
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={filters.compareModels}
                                onChange={(e) => updateFilter('compareModels', e.target.checked)}
                                className="rounded border-slate-600"
                            />
                            <span className="text-sm text-slate-300">
                                Comparar MinMax vs MaxMin
                            </span>
                        </label>

                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={filters.showPeakHours}
                                onChange={(e) => updateFilter('showPeakHours', e.target.checked)}
                                className="rounded border-slate-600"
                            />
                            <span className="text-sm text-slate-300">
                                Mostrar Horas Pico
                            </span>
                        </label>

                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={filters.showPatterns}
                                onChange={(e) => updateFilter('showPatterns', e.target.checked)}
                                className="rounded border-slate-600"
                            />
                            <span className="text-sm text-slate-300">
                                Analizar Patrones
                            </span>
                        </label>
                    </div>
                </FilterSection>
            </div>

            {/* Footer con resumen de filtros activos */}
            <div className="p-4 border-t border-slate-700 bg-slate-900">
                <div className="text-xs text-slate-400">
                    Filtros activos: {countActiveFilters(filters)}
                </div>
            </div>
        </div>
    );
};

// Componente auxiliar para secciones
const FilterSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    expanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}> = ({ title, icon, expanded, onToggle, children }) => {
    return (
        <div className="border-b border-slate-700">
            <button
                onClick={onToggle}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
            >
                <div className="flex items-center space-x-2">
                    <span className="text-slate-400">{icon}</span>
                    <span className="text-sm font-medium text-slate-200">{title}</span>
                </div>
                {expanded ? (
                    <ChevronUp size={16} className="text-slate-400" />
                ) : (
                    <ChevronDown size={16} className="text-slate-400" />
                )}
            </button>
            {expanded && (
                <div className="px-4 pb-4">
                    {children}
                </div>
            )}
        </div>
    );
};

// Función auxiliar para contar filtros activos
const countActiveFilters = (filters: CamilaFilters): number => {
    let count = 0;

    if (filters.hourRange.start !== 8 || filters.hourRange.end !== 16) count++;
    if (filters.selectedGruas.length > 0) count += filters.selectedGruas.length;
    if (filters.selectedBlocks.length > 0) count += filters.selectedBlocks.length;
    if (filters.selectedSegregations.length > 0) count += filters.selectedSegregations.length;
    if (filters.congestionLevels.length > 0) count += filters.congestionLevels.length;
    if (filters.compareModels) count++;
    if (filters.showPeakHours) count++;
    if (filters.showPatterns) count++;

    return count;
};

export default CamilaFiltersComponent;