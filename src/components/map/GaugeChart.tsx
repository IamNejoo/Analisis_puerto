import React from 'react';
import type { GaugeChartProps } from '../../types';

export const GaugeChart: React.FC<GaugeChartProps> = ({ value, size = 120, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = value / 100 * circumference;
  const remaining = circumference - progress;
  
  const getColorForOcupacion = (value: number): string => {
    if (value < 70) return '#7CB342'; // Verde
    if (value < 85) return '#FFA000'; // Amarillo
    return '#D32F2F'; // Rojo
  };
  
  const color = getColorForOcupacion(value);
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          fill="none"
          stroke="#e6e6e6"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={remaining}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{value}%</span>
        <span className="text-xs text-gray-500">Ocupación</span>
      </div>
    </div>
  );
};