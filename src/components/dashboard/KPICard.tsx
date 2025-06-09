// src/components/dashboard/KPICard.tsx
import React from 'react';
import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

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
    note
}) => {
    const getStatusColor = () => {
        switch (status) {
            case 'good':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'warning':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'critical':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getDeltaInfo = () => {
        if (delta === null || delta === undefined) return null;

        const deltaValue = delta * 100;
        const isPositive = delta > 0;
        const isGood = isInverseDelta ? !isPositive : isPositive;

        return {
            value: `${isPositive ? '+' : ''}${deltaValue.toFixed(1)}%`,
            color: isGood ? 'text-green-600' : 'text-red-600',
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
                <div className="absolute bottom-full left-0 mb-2 p-3 bg-gray-900 text-white text-xs rounded
                               opacity-0 group-hover:opacity-100 transition-opacity duration-200
                               pointer-events-none whitespace-normal w-64 z-10 shadow-lg">
                    {tooltip}
                    <div className="absolute top-full left-6 -mt-1 border-4 border-transparent
                                   border-t-gray-900"></div>
                </div>
            )}

            {/* Header con título e icono */}
            <div className="flex justify-between items-start mb-3">
                <div className="text-sm font-semibold pr-2">{title}</div>
                <div className="p-2 rounded-full bg-white bg-opacity-60 flex-shrink-0">
                    {icon}
                </div>
            </div>

            {/* Valor principal */}
            <div className="text-2xl font-bold mb-2">{value}</div>

            {/* Nota de advertencia si existe */}
            {note && (
                <div className="flex items-start mb-2 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
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