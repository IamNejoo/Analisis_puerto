import React from 'react';
import type { EntityProps } from '../../../types';

export const IMOEntity: React.FC<EntityProps> = ({ filters }) => {
  if (!filters.showIMO) return null;

  return (
    <g id="imo-zone" className="cursor-pointer hover:opacity-90 transition-opacity" data-tip="Zona IMO: Mercancías Peligrosas - 90% ocupación">
      {/* Círculo I1 - rojo */}
      <ellipse 
        id="i1" 
        cx="193.27116" 
        cy="421.13867" 
        rx="13.786503" 
        ry="13.266257" 
        style={{ fillOpacity: 0.9, fill: '#FF5722' }}
      />
      
      {/* Rectángulo zona IMO */}
      <path 
        id="zona-imo" 
        d="m178.44417 439.15024h60.34847v14.56687l-60.34847 0.52024z" 
        style={{ fillOpacity: 0.9, fill: '#FF5722', stroke: "#333", strokeWidth: 0.5 }}
      />
      
      {/* Círculo I2 - rojo */}
      <ellipse 
        id="i2" 
        cx="225.02332" 
        cy="421.51535" 
        rx="13.786503" 
        ry="13.266257" 
        style={{ fillOpacity: 0.9, fill: '#FF5722' }}
      />
      
      {/* Texto I2 */}
      <text 
        id="text-i2" 
        x="225.26627" 
        y="430.76318" 
        style={{ 
          fillOpacity: 1, 
          fill: '#f9f9f9', 
          fontFamily: 'Arial', 
          fontSize: '24px', 
          fontWeight: 'bold', 
          lineHeight: 0.7, 
          textAlign: 'center', 
          textAnchor: 'middle'
        }}
      >
        <tspan 
          x="225.26627" 
          y="430.76318"
        >
          I2
        </tspan>
      </text>
      
      {/* Texto zona IMO */}
      <text 
        id="text18-2" 
        transform="scale(0.90623446,1.1034672)" 
        x="228.87749" 
        y="409.02771" 
        style={{ 
          fillOpacity: 1, 
          fill: '#FFFFFF', 
          fontFamily: 'Arial', 
          fontSize: '14.2158px', 
          fontWeight: 'bold', 
          lineHeight: 0.7,
          strokeWidth: '0.592328',
          textAlign: 'center',
          textAnchor: 'middle'
        }}
      >
        <tspan 
          x="228.87749" 
          y="409.02771" 
          style={{ fill: '#FFFFFF', strokeWidth: '0.592328' }}
        >
          ZONA IMO
        </tspan>
      </text>
      
      {/* Texto I1 */}
      <text 
        id="text-i1" 
        x="193.78113" 
        y="430.31161" 
        style={{ 
          fillOpacity: 1, 
          fill: '#f9f9f9', 
          fontFamily: 'Arial', 
          fontSize: '24px', 
          fontWeight: 'bold', 
          lineHeight: 0.7, 
          textAlign: 'center', 
          textAnchor: 'middle'
        }}
      >
        <tspan 
          x="193.78113" 
          y="430.31161"
        >
          I1
        </tspan>
      </text>
    </g>
  );
};