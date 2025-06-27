// src/components/dashboard/KPICard.tsx
import React from 'react';
import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    status: 'good' | 'warning' | 'critical' | 'normal';
    delta?: number | null;
    description: string;
    isInverseDelta?: boolean;
    tooltip?: string;
    note?: string;
    subtitle?: string;
    showInfoIcon?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    icon,
    status,
    delta,
    description,
    isInverseDelta = false,
    tooltip,
    note,
    subtitle,
    showInfoIcon = false
}) => {
    const getStatusColor = () => {
        switch (status) {
            case 'good':
                return 'bg-green-950/30 text-green-300 border-green-700';
            case 'warning':
                return 'bg-yellow-950/30 text-yellow-300 border-yellow-700';
            case 'critical':
                return 'bg-red-950/30 text-red-300 border-red-700';
            default:
                return 'bg-slate-800 text-slate-300 border-slate-700';
        }
    };

    const getDeltaInfo = () => {
        if (delta === null || delta === undefined) return null;

        const deltaValue = delta * 100;
        const isPositive = delta > 0;
        const isGood = isInverseDelta ? !isPositive : isPositive;

        return {
            value: `${isPositive ? '+' : ''}${deltaValue.toFixed(1)}%`,
            color: isGood ? 'text-green-400' : 'text-red-400',
            icon: isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />
        };
    };

    const deltaInfo = getDeltaInfo();

    return (
        <div
            className={`rounded-lg border p-4 h-full flex flex-col ${getStatusColor()} relative group`}
            title={tooltip}
        >
            {/* Tooltip mejorado */}
            {tooltip && (
                <div className="absolute bottom-full left-0 mb-2 p-3 bg-slate-900 text-white text-xs rounded
                               opacity-0 group-hover:opacity-100 transition-opacity duration-200
                               pointer-events-none whitespace-normal w-64 z-10 shadow-lg border border-slate-700">
                    {tooltip}
                    <div className="absolute top-full left-6 -mt-1 border-4 border-transparent
                                   border-t-slate-900"></div>
                </div>
            )}

            {/* Header con título e icono */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                    <span className="text-sm font-semibold pr-2">{title}</span>
                    {showInfoIcon && (
                        <Info size={14} className="text-slate-400 hover:text-slate-300 cursor-help" />
                    )}
                </div>
                <div className="p-2 rounded-full bg-slate-700/60 flex-shrink-0">
                    {icon}
                </div>
            </div>

            {/* Valor principal */}
            <div className="text-2xl font-bold mb-2">{value}</div>

            {/* Subtítulo si existe */}
            {subtitle && (
                <div className="text-xs text-slate-400 mb-2">
                    {subtitle}
                </div>
            )}

            {/* Nota de advertencia si existe */}
            {note && (
                <div className="flex items-start mb-2 p-2 bg-yellow-950/30 rounded text-xs text-yellow-300 border border-yellow-800">
                    <AlertTriangle size={14} className="mr-1 flex-shrink-0 mt-0.5" />
                    <span>{note}</span>
                </div>
            )}

            {/* Footer con descripción y delta */}
            <div className="mt-auto">
                <div className="text-xs text-opacity-80 mb-1">{description}</div>

                {deltaInfo && (
                    <div className={`flex items-center ${deltaInfo.color} text-xs`}>
                        {deltaInfo.icon}
                        <span className="ml-1">{deltaInfo.value}</span>
                    </div>
                )}
            </div>
        </div>
    );
};