import React from 'react';
import type { EntityProps } from '../../../types';

interface CraneProps extends EntityProps {
  id: number;
  x: number;
  isMaintenance?: boolean;
}

// Componente para una grúa individual
const Crane: React.FC<CraneProps> = ({ id, x, isMaintenance = false }) => {
  return (
    <g 
      id={`crane-sts-${id}`} 
      transform={`translate(${x},0)`} 
      className="cursor-pointer hover:opacity-80 transition-opacity" 
      data-tip={`Grúa STS-${id}: ${isMaintenance ? 'Mantenimiento' : 'Operativa'}`}
    >
      {/* Cuerpo principal de la grúa */}
      <path 
        id={`crane-body-${id}`} 
        d="m504.16453 480.71288h6.62165l0.2759-5.8859 2.75902 0.092-0.36787 19.681 3.40279-0.092-0.36787-9.28869 8.36902-0.45984 0.092 10.02443h3.77066l-0.64377-33.01624 1.83935-0.18394 0.2759-4.7823h-6.43771l-0.36787 4.7823 2.02328 0.092-0.092 9.93246-8.46098 0.2759-0.18394-2.29918-11.12804 0.2759-1.56344 1.10361z" 
        style={{ fill: '#00796B', strokeWidth: 0.8, stroke: '#333' }}
      />
      
      {/* Cabina de la grúa */}
      <path 
        id={`crane-cabin-${id}`} 
        d="m528.35192 475.65468 7.17345 0.18394 0.45984 1.1036v2.66705l-0.64377 1.47148-1.93132 1.01164-3.40279-0.2759h-1.65541z" 
        style={{ fill: '#00796B', strokeWidth: 0.5, stroke: '#333' }}
      />
      
      {/* Parte roja de la grúa */}
      <path 
        id={`crane-red-${id}`} 
        d="m527.89208 475.37396 3.59497-5.297 18.16402-0.21621 4.63562 6.16181z" 
        style={{ fill: '#e53935', strokeWidth: 0.5, stroke: '#333' }}
      />
      
      {/* Ventana o panel de la grúa */}
      <path 
        id={`crane-window-${id}`} 
        d="m517.22388 476.11452v6.34574l7.35739-0.2759 0.092-6.62165z" 
        style={{ fill: '#f4eed7', strokeWidth: 0.5, stroke: '#333' }}
      />
    </g>
  );
};

export const CraneEntity: React.FC<EntityProps> = ({ filters }) => {
  if (!filters.showGruas) return null;

  // Configuración de las grúas (posición, estado de mantenimiento)
  const cranes = [
    { id: 1, x: 0, isMaintenance: false },
    { id: 2, x: 56.93, isMaintenance: true },
    { id: 3, x: 114.29, isMaintenance: false },
    { id: 4, x: 170.11, isMaintenance: false },
    { id: 5, x: 227.75, isMaintenance: false },
    { id: 6, x: 284.29, isMaintenance: false },
    { id: 7, x: 341.64, isMaintenance: false }
  ];

  return (
    <g id="cranes-group">
      {cranes.map(crane => (
        <Crane 
          key={crane.id} 
          id={crane.id} 
          x={crane.x} 
          isMaintenance={crane.isMaintenance} 
          filters={filters}
        />
      ))}
    </g>
  );
};