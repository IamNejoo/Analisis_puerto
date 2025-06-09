// src/components/dashboard/CongestionKPICard.tsx
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CongestionKPICardProps {
    title: string;
    value: string | number;
    unit?: string;
    icon: React.ReactNode;
    status: 'good' | 'warning' | 'critical' | 'normal';
    trend?: 'up' | 'down' | 'stable';
    trendValue?: number;
    description: string;
    isInverseTrend?: boolean; // true si valores bajos son mejores
}

export const CongestionKPICard: React.FC<CongestionKPICardProps> = ({
    title,
    value,
    unit,
    icon,
    status,
    trend,
    trendValue,
    description,
    isInverseTrend = false
}) => {
    const getStatusColor = () => {
        switch (status) {
            case 'good': return 'text-green-600 bg-green-50';
            case 'warning': return 'text-yellow-600 bg-yellow-50';
            case 'critical': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getTrendIcon = () => {
        if (!trend) return null;

        switch (trend) {
            case 'up':
                return <TrendingUp size={16} className={isInverseTrend ? 'text-red-500' : 'text-green-500'} />;
            case 'down':
                return <TrendingDown size={16} className={isInverseTrend ? 'text-green-500' : 'text-red-500'} />;
            case 'stable':
                return <Minus size={16} className="text-gray-500" />;
        }
    };

    return (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${getStatusColor()}`}>
                    {icon}
                </div>
                {trend && (
                    <div className="flex items-center space-x-1">
                        {getTrendIcon()}
                        {trendValue !== undefined && (
                            <span className="text-sm font-medium">
                                {trendValue > 0 ? '+' : ''}{trendValue}%
                            </span>
                        )}
                    </div>
                )}
            </div>

            <h3 className="text-sm font-medium text-gray-700 mb-1">{title}</h3>

            <div className="flex items-baseline space-x-1 mb-2">
                <span className={`text-2xl font-bold ${status === 'good' ? 'text-green-600' :
                        status === 'warning' ? 'text-yellow-600' :
                            status === 'critical' ? 'text-red-600' :
                                'text-gray-800'
                    }`}>
                    {value}
                </span>
                {unit && <span className="text-sm text-gray-500">{unit}</span>}
            </div>

            <p className="text-xs text-gray-500">{description}</p>
        </div>
    );
};