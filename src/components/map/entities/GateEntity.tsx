import React from 'react';
import type { EntityProps } from '../../../types';

export const GateEntity: React.FC<EntityProps> = ({ filters }) => {
  if (!filters.showGates) return null;

  return (
    <>
      {/* Gate In - Círculo verde */}
      <g className="cursor-pointer hover:opacity-90 transition-opacity" data-tip="Gate In: Entrada de camiones al terminal">
        <ellipse 
          id="gate-in" 
          cx="102.75" 
          cy="451.83" 
          rx="49.163" 
          ry="51.244" 
          style={{ fillOpacity: 0.9, fill: '#1E8A5E' }}
        />
        
        {/* Texto Gate In */}
        <text 
          id="text-gate-in" 
          transform="scale(1.107 0.90332)" 
          x="95.89505" 
          y="502.04626" 
          style={{ 
            fillOpacity: 1, 
            fill: '#FFFFFF', 
            fontFamily: 'Arial', 
            fontSize: '40.893px', 
            fontWeight: 'bold',
            lineHeight: 0.7, 
            strokeWidth: '1.7039',
            textAlign: 'center',
            textAnchor: 'middle'
          }}
        >
          <tspan 
            x="95.89505" 
            y="502.04626" 
            style={{ 
              fill: '#FFFFFF', 
              fontFamily: 'Arial', 
              fontSize: '40.893px', 
              fontWeight: 'bold', 
              lineHeight: 0.7, 
              strokeWidth: '1.7039', 
              textAlign: 'center', 
              textAnchor: 'middle' 
            }}
          >
            Gate 
          </tspan>
          <tspan 
            x="95.89505" 
            y="530.67114" 
            style={{ 
              fill: '#FFFFFF', 
              fontFamily: 'Arial', 
              fontSize: '40.893px', 
              fontWeight: 'bold', 
              lineHeight: 0.7, 
              strokeWidth: '1.7039', 
              textAlign: 'center', 
              textAnchor: 'middle' 
            }}
          >
            In
          </tspan>
        </text>
        
        {/* Flecha Gate In */}
        <path 
          id="path13" 
          d="m116.53 402.67 29.654-15.607-10.405 26.533z" 
          style={{ fillOpacity: 0.9, fill: '#1E8A5E' }}
        />
      </g>
      
      {/* Grupo Gate Out */}
      <g className="cursor-pointer hover:opacity-90 transition-opacity" data-tip="Gate Out: Salida de camiones del terminal">
        {/* Gate Out - Círculo rojo */}
        <ellipse 
          id="gate-out" 
          cx="69.193" 
          cy="207.84" 
          rx="49.944" 
          ry="49.163" 
          style={{ fillOpacity: 0.9, fill: '#D72E30' }}
        />
        
        {/* Texto Gate Out */}
        <text 
          id="text-gate-out" 
          transform="scale(1.107 0.90332)" 
          x="66.781822" 
          y="232.1998" 
          style={{ 
            fillOpacity: 1, 
            fill: '#FFFFFF', 
            fontFamily: 'Arial', 
            fontSize: '40.893px', 
            fontWeight: 'bold',
            lineHeight: 0.7, 
            strokeWidth: '1.7039',
            textAlign: 'center',
            textAnchor: 'middle'
          }}
        >
          <tspan 
            x="66.781822" 
            y="232.1998" 
            style={{ 
              fill: '#FFFFFF', 
              fontFamily: 'Arial', 
              fontSize: '40.893px', 
              fontWeight: 'bold', 
              lineHeight: 0.7, 
              strokeWidth: '1.7039', 
              textAlign: 'center', 
              textAnchor: 'middle' 
            }}
          >
            Gate 
          </tspan>
          <tspan 
            x="66.781822" 
            y="260.82468" 
            style={{ 
              fill: '#FFFFFF', 
              fontFamily: 'Arial', 
              fontSize: '40.893px', 
              fontWeight: 'bold', 
              lineHeight: 0.7, 
              strokeWidth: '1.7039', 
              textAlign: 'center', 
              textAnchor: 'middle' 
            }}
          >
            Out
          </tspan>
        </text>
        
        {/* Flecha Gate Out */}
        <path 
          id="path16" 
          d="m99.887 245.04 5.7227 28.614-18.729-20.29z" 
          style={{ fillOpacity: 0.9, fill: '#D72E30' }}
        />
      </g>
    </>
  );
};