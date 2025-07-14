// components/camila/dashboard/CamilaHeader.tsx

import React from 'react';
import { Activity, BarChart3, Settings, GitCompare, Download, Calendar, Clock } from 'lucide-react';
import type { CamilaConfig } from '../../../types/camila';
import { camilaService } from '../../../services/camilaApi';

interface CamilaHeaderProps {
    config: CamilaConfig;
    resultado: any;
    onViewChange: (view: 'analytics' | 'operations' | 'comparison') => void;
    activeView: 'analytics' | 'operations' | 'comparison';
}

export const CamilaHeader: React.FC<CamilaHeaderProps> = ({
    config,
    resultado,
    onViewChange,
    activeView
}) => {
    const handleExport = async () => {
        try {
            await camilaService.exportarResultados(config, 'excel');
        } catch (error) {
            console.error('Error al exportar:', error);
        }
    };

    const views = [
        { id: 'analytics', label: 'Análisis', icon: BarChart3 },
        { id: 'operations', label: 'Operaciones', icon: Settings },
        { id: 'comparison', label: 'Comparación', icon: GitCompare }
    ] as const;

    return (
        <div className="bg-gradient-to-r from-teal-900 to-blue-900 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center">
                        <Activity className="mr-3" size={28} />
                        Modelo Camila - Optimización de Grúas RTG
                    </h1>
                    <div className="mt-2 flex items-center space-x-4 text-teal-100">
                        <span className="flex items-center">
                            <Calendar size={16} className="mr-1" />
                            Semana {config.semana} • Año {config.anio}
                        </span>
                        <span className="flex items-center">
                            <Clock size={16} className="mr-1" />
                            Turno {config.turno} ({resultado.turno_del_dia === 1 ? '08:00-16:00' :
                                resultado.turno_del_dia === 2 ? '16:00-24:00' : '00:00-08:00'})
                        </span>
                        <span className="bg-teal-700/50 px-2 py-1 rounded text-sm">
                            P{config.participacion}% • Dispersión {config.dispersion}
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleExport}
                    className="bg-white/20 hover:bg-white/30 transition-colors rounded-lg px-4 py-2 flex items-center space-x-2"
                >
                    <Download size={18} />
                    <span>Exportar</span>
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-6 flex space-x-1 bg-white/10 rounded-lg p-1">
                {views.map((view) => (
                    <button
                        key={view.id}
                        onClick={() => onViewChange(view.id)}
                        className={`
              flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all
              ${activeView === view.id
                                ? 'bg-white text-teal-900 shadow-sm'
                                : 'text-white/80 hover:text-white hover:bg-white/10'
                            }
            `}
                    >
                        <view.icon size={18} />
                        <span className="font-medium">{view.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CamilaHeader;