// src/components/shared/StatusBadge.tsx
import React from 'react';

interface StatusBadgeProps {
  status: 'good' | 'normal' | 'warning' | 'critical';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colors = {
    good: 'bg-green-100 text-green-800',
    normal: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800'
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