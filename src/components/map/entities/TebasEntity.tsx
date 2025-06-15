import React from 'react';
import type { EntityProps } from '../../../types';
import { ocupacionBloqueData } from '../../../data/blockOccupancyData';

export const TebasEntity: React.FC<EntityProps> = ({ filters }) => {
  if (!filters.showTebas) return null;

  // Obtener datos de bloque por ID
  const getBlockData = (id: string) => {
    return ocupacionBloqueData.find(block => block.id === id) || { id, ocupacion: 0, tipo: 'Desconocido' };
  };

  return (
    <g id="tebas-area">
      {/* Círculos Tebas - verdes */}
      <ellipse
        id="tebas-t1"
        cx="258.33374"
        cy="339.38037"
        rx="11.380368"
        ry="10.66503"
        style={{ fillOpacity: 0.9, fill: '#7CB342' }}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        data-tip={`Tebas T1: ${getBlockData('T1').ocupacion}% ocupación`}
      />

      <ellipse
        id="tebas-t3"
        cx="258.25278"
        cy="384.51166"
        rx="11.380368"
        ry="10.66503"
        style={{ fillOpacity: 0.9, fill: '#7CB342' }}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        data-tip={`Tebas T3: ${getBlockData('T3').ocupacion}% ocupación`}
      />

      <ellipse
        id="tebas-t4"
        cx="258.88712"
        cy="407.48221"
        rx="11.380368"
        ry="10.66503"
        style={{ fillOpacity: 0.9, fill: '#7CB342' }}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        data-tip={`Tebas T4: ${getBlockData('T4').ocupacion}% ocupación`}
      />

      <ellipse
        id="tebas-t2"
        cx="258.48099"
        cy="361.53131"
        rx="11.380368"
        ry="10.66503"
        style={{ fillOpacity: 0.9, fill: '#7CB342' }}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        data-tip={`Tebas T2: ${getBlockData('T2').ocupacion}% ocupación`}
      />

      {/* Texto T1 */}
      <text
        id="text-t1"
        transform="scale(0.98491981,1.0153111)"
        x="262.40454"
        y="339.3089"
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
          x="262.40454"
          y="339.3089"
          style={{ strokeWidth: '0.5898' }}
        >
          T1
        </tspan>
      </text>

      {/* Texto T2 */}
      <text
        id="text-t2"
        transform="scale(0.9849198,1.0153111)"
        x="262.02985"
        y="361.97113"
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
          x="262.02985"
          y="361.97113"
          style={{ strokeWidth: '0.5898' }}
        >
          T2
        </tspan>
      </text>

      {/* Texto T4 */}
      <text
        id="text-t4"
        transform="scale(0.9849198,1.0153111)"
        x="263.31345"
        y="406.73849"
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
          x="263.31345"
          y="406.73849"
          style={{ strokeWidth: '0.5898' }}
        >
          T4
        </tspan>
      </text>

      {/* Texto T3 */}
      <text
        id="text-t3"
        transform="scale(0.9849198,1.0153111)"
        x="262.19296"
        y="384.09338"
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
          x="262.19296"
          y="384.09338"
          style={{ strokeWidth: '0.5898' }}
        >
          T3
        </tspan>
      </text>

      {/* Patio Tebas */}
      <path
        id="patio-tebas"
        d="m278.47687 336.41625 9.5646-11.22001 47.08723 38.25838-9.56459 10.85214z"
        style={{ fill: '#7CB342', opacity: 0.5, stroke: '#333', strokeWidth: 0.5 }}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        data-tip="Patio Tebas: 70% ocupación"
      />

      {/* Texto Patio Tebas */}
      <text
        id="text-patio-tebas"
        transform="matrix(0.75627807,0.63344684,-0.66585346,0.76455638,0,0)"
        x="468.24829"
        y="75.308319"
        style={{
          fillOpacity: 1,
          fill: '#f2f2f2',
          fontFamily: 'Arial',
          fontSize: '13.2277px',
          fontWeight: 'bold',
          lineHeight: 0.7,
          strokeWidth: '0.55115',
          textAlign: 'center',
          textAnchor: 'middle'
        }}
      >
        <tspan
          x="468.24829"
          y="75.308319"
          style={{ fill: '#f2f2f2', strokeWidth: '0.55115' }}
        >
          PATIO TEBAS
        </tspan>
      </text>
    </g>
  );
};