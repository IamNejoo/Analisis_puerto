// src/components/shared/StatusBadge.tsx
import React from 'react';

interface StatusBadgeProps {
  status: 'good' | 'normal' | 'warning' | 'critical';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colors = {
    good: 'bg-green-950/30 text-green-300 border border-green-700',
    normal: 'bg-blue-950/30 text-blue-300 border border-blue-700',
    warning: 'bg-yellow-950/30 text-yellow-300 border border-yellow-700',
    critical: 'bg-red-950/30 text-red-300 border border-red-700'
  };

  const labels = {
    good: 'Óptimo',
    normal: 'Normal',
    warning: 'Alerta',
    critical: 'Crítico'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {labels[status]}
    </span>
  );
};

// Exportación por defecto también si la prefieres
export default StatusBadge;