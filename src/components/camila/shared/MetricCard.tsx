// components/camila/shared/MetricCard.tsx

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    status?: 'success' | 'warning' | 'error' | 'info';
}

export const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    trendValue,
    status = 'info'
}) => {
    const statusColors = {
        success: 'bg-green-50 border-green-200 text-green-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    const trendIcons = {
        up: <TrendingUp size={16} className="text-green-600" />,
        down: <TrendingDown size={16} className="text-red-600" />,
        neutral: <Minus size={16} className="text-gray-600" />
    };

    return (
        <div className={`rounded-lg border p-6 ${statusColors[status]}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium opacity-80">{title}</p>
                    <p className="text-3xl font-bold mt-2">{value}</p>
                    {subtitle && (
                        <p className="text-sm mt-1 opacity-70">{subtitle}</p>
                    )}
                    {trend && trendValue && (
                        <div className="flex items-center mt-2 space-x-1">
                            {trendIcons[trend]}
                            <span className="text-sm font-medium">{trendValue}</span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className="opacity-50">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MetricCard;