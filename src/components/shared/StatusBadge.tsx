import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'estado' | 'area' | 'alerta';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'estado' }) => {
  let bgColorClass = '';
  let textColorClass = '';
  
  if (type === 'estado') {
    switch (status) {
      case 'En operación':
        bgColorClass = 'bg-green-100';
        textColorClass = 'text-green-800';
        break;
      case 'En tránsito':
        bgColorClass = 'bg-blue-100';
        textColorClass = 'text-blue-800';
        break;
      default:
        bgColorClass = 'bg-gray-100';
        textColorClass = 'text-gray-800';
    }
  } else if (type === 'area') {
    switch (status) {
      case 'Patio':
        bgColorClass = 'bg-green-100';
        textColorClass = 'text-green-800';
        break;
      case 'Gate':
        bgColorClass = 'bg-blue-100';
        textColorClass = 'text-blue-800';
        break;
      case 'Muelle':
        bgColorClass = 'bg-purple-100';
        textColorClass = 'text-purple-800';
        break;
      case 'Equipos':
        bgColorClass = 'bg-gray-100';
        textColorClass = 'text-gray-800';
        break;
      default:
        bgColorClass = 'bg-indigo-100';
        textColorClass = 'text-indigo-800';
    }
  } else if (type === 'alerta') {
    switch (status) {
      case 'Alta':
        bgColorClass = 'bg-red-100';
        textColorClass = 'text-red-800';
        break;
      case 'Media':
        bgColorClass = 'bg-yellow-100';
        textColorClass = 'text-yellow-800';
        break;
      default:
        bgColorClass = 'bg-blue-100';
        textColorClass = 'text-blue-800';
    }
  }

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${bgColorClass} ${textColorClass}`}>
      {status}
    </span>
  );
};