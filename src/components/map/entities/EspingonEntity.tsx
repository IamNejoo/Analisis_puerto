import React from 'react';
import type { EntityProps } from '../../../types';
import { ocupacionBloqueData } from '../../../data/blockOccupancyData';

export const EspingonEntity: React.FC<EntityProps> = ({ filters }) => {
  if (!filters.showEspingon) return null;

  // Obtener datos de bloque por ID
  const getBlockData = (id: string) => {
    return ocupacionBloqueData.find(block => block.id === id) || { id, ocupacion: 0, tipo: 'Desconocido' };
  };

  return (
    <g id="espingon-area">
      {/* Áreas principales Espingón */}
      <path 
        id="espingon-base1" 
        d="m952.60498 549.381-7.02332 10.92515-22.11043 55.14602 1.30062 0.78036 55.14598-42.66012 1.8209-6.24294-1.3006-5.7227-2.081-3.64172-3.1215-4.16196-2.8613-2.60123-3.38162-2.34111-5.7227-1.30061-4.42209 0.52025h-2.3411z" 
        style={{ fill: '#ffffff', opacity: 0.5, stroke: '#333', strokeWidth: 0.5 }}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        data-tip="Espingón: área de operaciones"
      />
      
      <path 
        id="espingon-base2" 
        d="m965.23113 540.58146 8.8441 2.34111 5.4626 3.12147 3.9019 4.42209 3.6417 5.46257 1.8208 4.42209 1.8209 5.7227 50.72387-40.31902-24.1914-24.19141h-3.1215l-4.4221 0.78037z" 
        style={{ fill: '#ffffff', opacity: 0.5, stroke: '#333', strokeWidth: 0.5 }}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        data-tip="Espingón: área de operaciones"
      />
      
      {/* Área gris de Espingón */}
      <path 
        id="espingon" 
        d="m988.46414 444.20188 53.52496 56.4679 17.6577-16.92198-53.8928-57.0197z" 
        style={{ fill: '#78309A', opacity: 0.2, stroke: '#333', strokeWidth: 0.5 }}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        data-tip="Espingón: área de operaciones"
      />
      
      {/* Texto Espingón rotado */}
      <text 
        id="text-patio-espingon" 
        transform="matrix(0.6663652,0.72743993,-0.76065398,0.67030799,0,0)" 
        x="1039.4923" 
        y="-431.67581" 
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
          x="1039.4923" 
          y="-431.67581" 
          style={{ fill: '#f2f2f2', strokeWidth: '0.55115' }}
        >
          ESPINGON
        </tspan>
      </text>
      
      {/* Texto Romana rotado */}
      <text 
        id="text-patio-romana" 
        transform="matrix(0.73807132,-0.65676668,0.68010442,0.7496973,0,0)" 
        x="327.17737" 
        y="1056.545" 
        style={{ 
          fillOpacity: 1, 
          fill: '#1a1a1a', 
          fontFamily: 'Arial', 
          fontSize: '11.5527px', 
          fontWeight: 'bold', 
          lineHeight: 0.7, 
          strokeWidth: '0.48136', 
          textAlign: 'center', 
          textAnchor: 'middle'
        }}
      >
        <tspan 
          x="327.17737" 
          y="1056.545" 
          style={{ fill: '#1a1a1a', strokeWidth: '0.48136' }}
        >
          ROMANA
        </tspan>
      </text>
      
      {/* Áreas moradas E1 y E2 */}
      <path 
        id="espingon-e1" 
        d="m946.711 493.12846 30.53313-25.38297 4.59837 0.18394 12.69149 16.0023 0.1839 5.3341-29.06163 24.09542h-6.43771l-12.87542-16.0023z" 
        style={{ fill: '#78309A', opacity: 0.9, stroke: '#333', strokeWidth: 0.5 }}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        data-tip={`Espingón E1: ${getBlockData('E1').ocupacion}% ocupación`}
      />
      
      <path 
        id="espingon-e2" 
        d="m982.73111 532.54494 30.53309-25.38297 4.5984 0.18394 12.6915 16.0023 0.1839 5.3341-29.0617 24.09542h-6.43769l-12.8754-16.0023z" 
        style={{ fill: '#78309A', opacity: 0.9, stroke: '#333', strokeWidth: 0.5 }}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        data-tip={`Espingón E2: ${getBlockData('E2').ocupacion}% ocupación`}
      />
      
      {/* Textos E1 y E2 */}
      <text 
        id="text-e1" 
        transform="matrix(0.77824,-0.60366,0.62229,0.80225,0,0)" 
        x="473.41052" 
        y="974.4483" 
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
          x="473.41052" 
          y="974.4483" 
          style={{ strokeWidth: '0.5898' }}
        >
          E1
        </tspan>
      </text>
      
      <text 
        id="text-e2" 
        transform="matrix(0.77824,-0.60366,0.62229,0.80225,0,0)" 
        x="477.12732" 
        y="1025.2814" 
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
          x="477.12732" 
          y="1025.2814" 
          style={{ strokeWidth: '0.5898' }}
        >
          E2
        </tspan>
      </text>
    </g>
  );
};