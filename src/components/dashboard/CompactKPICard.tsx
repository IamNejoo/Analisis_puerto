// src/components/dashboard/CompactKPICard.tsx - CÓDIGO COMPLETO
import React from 'react';

interface CompactKPICardProps {
    title: string;
    value: string | number;
    icon: React.ReactElement<{ size?: number }>;
    status: 'good' | 'warning' | 'critical' | 'normal';
    unit?: string;
}

export const CompactKPICard: React.FC<CompactKPICardProps> = ({
    title,
    value,
    icon,
    status,
    unit = ''
}) => {
    const getStatusColor = () => {
        switch (status) {
            case 'good': return 'border-green-400 bg-green-50';
            case 'warning': return 'border-yellow-400 bg-yellow-50';
            case 'critical': return 'border-red-400 bg-red-50';
            default: return 'border-gray-300 bg-white';
        }
    };

    return (
        <div className={`rounded-md border-2 p-2 ${getStatusColor()}`}>
            <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-medium text-gray-700 truncate">
                    {title}
                </div>
                <div className="flex-shrink-0">
                    {React.cloneElement(icon, { size: 14 })}
                </div>
            </div>
            <div className="text-lg font-bold text-gray-900">
                {value}{unit}
            </div>
        </div>
    );
};