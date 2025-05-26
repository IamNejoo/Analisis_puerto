import React from 'react';
import type { EntityProps } from '../../../types';
import { ocupacionBloqueData } from '../../../data/blockOccupancyData';

export const OHigginsEntity: React.FC<EntityProps> = ({ filters }) => {
  if (!filters.showOHiggins) return null;

  // Obtener datos de bloque por ID
  const getBlockData = (id: string) => {
    return ocupacionBloqueData.find(block => block.id === id) || { id, ocupacion: 0, tipo: 'Desconocido' };
  };

  return (
    <g id="ohiggins-area">
      {/* Áreas O'Higgins - azules */}
      <path 
        id="ohiggins-h1" 
        d="m367.50118 437.76417 41.75314-0.91967 3.49475 1.28754 1.83935 1.47147 1.10361 1.10361 0.18393 14.8987-0.73574 2.02328-1.65541 1.65541-1.83934 1.47147-80.56333-0.18393c0 0-4.23049-1.47148 2.02328-4.41443 6.25378-2.94295 34.39576-18.39345 34.39576-18.39345z" 
        style={{ fill: '#2196F3', opacity: 0.9, stroke: '#333', strokeWidth: 0.5 }}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        data-tip={`O'Higgins H1: ${getBlockData('H1').ocupacion}% ocupación`}
      />
      
      <path 
        id="ohiggins-h2" 
        d="m302.02049 490.18551 114.77514 0.91967 0.18394-17.65771-0.36787-1.83935-1.10361-1.47147-1.28754-1.47148-2.02328-1.28754h-89.76005l-4.23049 0.73574-3.49476 1.47147-2.75902 2.57509-2.75901 2.39114-2.57509 4.04656-2.39115 4.96624-1.83934 4.23049z" 
        style={{ fill: '#2196F3', opacity: 0.9, stroke: '#333', strokeWidth: 0.5 }}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        data-tip={`O'Higgins H2: ${getBlockData('H2').ocupacion}% ocupación`}
      />
      
      <path 
        id="ohiggins-h3" 
        d="m302.75623 499.1983h114.0394l0.36787 24.46329-109.62497-0.73574-1.47148-2.75901-2.20721-8.46099z" 
        style={{ fill: '#2196F3', opacity: 0.9, stroke: '#333', strokeWidth: 0.5 }}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        data-tip={`O'Higgins H3: ${getBlockData('H3').ocupacion}% ocupación`}
      />
      
      <path 
        id="ohiggins-h4" 
        d="m308.09033 525.317 5.70197 20.60067 1.83934 1.65541 2.75902 1.83935 4.2305 0.73573 88.10463 0.18394 3.12689-1.47148 2.57508-2.57508 1.47148-3.31082v-17.84165z" 
        style={{ fill: '#2196F3', opacity: 0.9, stroke: '#333', strokeWidth: 0.5 }}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        data-tip={`O'Higgins H4: ${getBlockData('H4').ocupacion}% ocupación`}
      />
      
      <path 
        id="ohiggins-h5" 
        d="m323.54083 557.87341 91.59939-0.36786 2.57509 1.83934 1.1036 2.94295-0.5518 21.15247-3.12689 3.49476-2.57508 0.73574-78.17217 0.36787-4.2305-1.10361-1.83934-2.75902-8.64493-20.41673v-2.39115l1.28755-2.39115z" 
        style={{ fill: '#2196F3', opacity: 0.9, stroke: '#333', strokeWidth: 0.5 }}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        data-tip={`O'Higgins H5: ${getBlockData('H5').ocupacion}% ocupación`}
      />
      
      {/* Círculos identificadores O'Higgins */}
      <ellipse 
        id="ohiggins-h3-circle" 
        cx="363.51993" 
        cy="511.06543" 
        rx="11.380368" 
        ry="10.795092" 
        style={{ fill: "#1c3b60", paintOrder: "markers fill stroke" }}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        data-tip={`O'Higgins H3: ${getBlockData('H3').ocupacion}% ocupación`}
      />
      
      <ellipse 
        id="ohiggins-h2-circle" 
        cx="364.6738" 
        cy="478.96393" 
        rx="11.380368" 
        ry="10.795092" 
        style={{ fill: "#1c3b60", paintOrder: "markers fill stroke" }}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        data-tip={`O'Higgins H2: ${getBlockData('H2').ocupacion}% ocupación`}
      />
      
      <ellipse 
        id="ohiggins-h1-circle" 
        cx="381.27448" 
        cy="448.7485" 
        rx="11.380368" 
        ry="10.795092" 
        style={{ fill: "#1c3b60", paintOrder: "markers fill stroke" }}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        data-tip={`O'Higgins H1: ${getBlockData('H1').ocupacion}% ocupación`}
      />
      
      <ellipse 
        id="ohiggins-h4-circle" 
        cx="364.13248" 
        cy="537.6925" 
        rx="11.380368" 
        ry="10.795092" 
        style={{ fill: "#1c3b60", paintOrder: "markers fill stroke" }}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        data-tip={`O'Higgins H4: ${getBlockData('H4').ocupacion}% ocupación`}
      />
      
      <ellipse 
        id="ohiggins-h5-circle" 
        cx="369.67117" 
        cy="572.59021" 
        rx="11.380368" 
        ry="10.795092" 
        style={{ fill: "#1c3b60", paintOrder: "markers fill stroke" }}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        data-tip={`O'Higgins H5: ${getBlockData('H5').ocupacion}% ocupación`}
      />
      
      {/* Etiquetas H1-H5 */}
      <text 
        id="text-h1" 
        transform="scale(0.9849198,1.0153111)" 
        x="387.23337" 
        y="447.68738" 
        style={{ 
          fillOpacity: 1, 
          fill: '#f9f9f9', 
          fontFamily: 'Arial', 
          fontSize: '14.1552px', 
          fontWeight: 'bold', 
          lineHeight: 0.7, 
          strokeWidth: '0.5898', 
          textAlign: 'center', 
          textAnchor: 'middle'
        }}
      >
        <tspan 
          x="387.23337" 
          y="447.68738" 
          style={{ strokeWidth: '0.5898' }}
        >
          H1
        </tspan>
      </text>
      
      <text 
        id="text-h3" 
        transform="scale(0.9849198,1.0153111)" 
        x="369.2991" 
        y="508.55545" 
        style={{ 
          fillOpacity: 1, 
          fill: '#f9f9f9', 
          fontFamily: 'Arial', 
          fontSize: '14.1552px', 
          fontWeight: 'bold', 
          lineHeight: 0.7, 
          strokeWidth: '0.5898', 
          textAlign: 'center', 
          textAnchor: 'middle'
        }}
      >
        <tspan 
          x="369.2991" 
          y="508.55545" 
          style={{ strokeWidth: '0.5898' }}
        >
          H3
        </tspan>
      </text>
      
      <text 
        id="text-h5" 
        transform="scale(0.9849198,1.0153111)" 
        x="375.90796" 
        y="568.9884" 
        style={{ 
          fillOpacity: 1, 
          fill: '#f9f9f9', 
          fontFamily: 'Arial', 
          fontSize: '14.1552px', 
          fontWeight: 'bold', 
          lineHeight: 0.7, 
          strokeWidth: '0.5898', 
          textAlign: 'center', 
          textAnchor: 'middle'
        }}
      >
        <tspan 
          x="375.90796" 
          y="568.9884" 
          style={{ strokeWidth: '0.5898' }}
        >
          H5
        </tspan>
      </text>
      
      <text 
        id="text-h4" 
        transform="scale(0.9849198,1.0153111)" 
        x="370.74487" 
        y="535.0733" 
        style={{ 
          fillOpacity: 1, 
          fill: '#f9f9f9', 
          fontFamily: 'Arial', 
          fontSize: '14.1552px', 
          fontWeight: 'bold', 
          lineHeight: 0.7, 
          strokeWidth: '0.5898', 
          textAlign: 'center', 
          textAnchor: 'middle'
        }}
      >
        <tspan 
          x="370.74487" 
          y="535.0733" 
          style={{ strokeWidth: '0.5898' }}
        >
          H4
        </tspan>
      </text>
      
      <text 
        id="text-h2" 
        transform="scale(0.9849198,1.0153111)" 
        x="370.9679" 
        y="476.9111" 
        style={{ 
          fillOpacity: 1, 
          fill: '#f9f9f9', 
          fontFamily: 'Arial', 
          fontSize: '14.1552px', 
          fontWeight: 'bold', 
          lineHeight: 0.7, 
          strokeWidth: '0.5898', 
          textAlign: 'center', 
          textAnchor: 'middle'
        }}
      >
        <tspan 
          x="370.9679" 
          y="476.9111" 
          style={{ strokeWidth: '0.5898' }}
        >
          H2
        </tspan>
      </text>
    </g>
  );
};