import React from 'react';
import type { EntityProps } from '../../../types';
import { ocupacionBloqueData } from '../../../data/blockOccupancyData';

export const ContainerYardEntity: React.FC<EntityProps> = ({ filters}) => {
  if (!filters.showContainers) return null;

  // Función para obtener el color según el valor de ocupación si no se proporciona
  //const getColor = getColorForOcupacion || ((value: number): string => {
   // if (value < 70) return '#7CB342'; // Verde
   // if (value < 85) return '#FFA000'; // Amarillo
  //  return '#D32F2F'; // Rojo
//  });
//
  // Obtener datos de bloque por ID
  const getBlockData = (id: string) => {
    return ocupacionBloqueData.find(block => block.id === id) || { id, ocupacion: 0, tipo: 'Desconocido' };
  };

  return (
    <g id="container-yards">
      {/* Contenedores amarillos principales */}
      <path 
        id="patio-costanera" 
        d="m447.51 521.45-0.73574 24.279 1.8394 2.3911 2.943 1.4715 131.88-0.5518 3.4948-2.3912 1.4715-1.6554-0.36787-22.256-1.2876-2.943-1.8393-1.1036-134.27-0.91967-2.2072 1.2875z" 
        style={{ fill: '#F5AB00', strokeWidth: 1, stroke: '#34495E', opacity: 0.9, cursor: 'pointer' }}
        className="hover:opacity-80 transition-opacity"
        data-tip="Patio de contenedores - Bloque 1"
      />
      
      <path 
        id="path179" 
        d="m451.19 556.59 131.33-0.18393 3.1269 0.91967 1.4715 2.0233 0.18394 25.199-1.4715 2.3912-2.943 1.6554-132.8-0.5518-2.759-1.4715-0.91967-2.2072 0.36787-23.911 2.0233-2.759z" 
        style={{ fill: '#F5AB00', strokeWidth: 1, stroke: '#34495E', opacity: 0.9, cursor: 'pointer' }}
        className="hover:opacity-80 transition-opacity"
        data-tip="Patio de contenedores - Bloque 2"
      />
      
      <path 
        id="path180" 
        d="m609.56 518.88 103.74-0.18393 4.2305 2.3912 0.91967 3.8626-0.18393 19.865-1.1036 2.759-2.759 1.6554h-100.98l-4.2305-0.91967-2.0233-2.0233-0.55181-1.1036 0.18394-24.095z" 
        style={{ fill: '#F5AB00', strokeWidth: 1, stroke: '#34495E', opacity: 0.9, cursor: 'pointer' }}
        className="hover:opacity-80 transition-opacity"
        data-tip="Patio de contenedores - Bloque 3"
      />
      
      <path 
        id="path181" 
        d="m607.26 560.3v25.232l0.52025 1.3006 0.91043 0.78037 2.211 0.26012 107.82 0.13006-0.26012-27.443-1.6908-2.081-2.8614-1.1706-102.49-0.52024-1.9509 0.65031-1.1706 0.6503z" 
        style={{ fill: '#F5AB00', strokeWidth: 1, stroke: '#34495E', opacity: 0.9, cursor: 'pointer' }}
        className="hover:opacity-80 transition-opacity"
        data-tip="Patio de contenedores - Bloque 4"
      />
      
      <path 
        id="path182" 
        d="m623.12 590.35 52.025 17.558 37.328 0.39018 3.9018-3.1215 1.9509-3.3816v-11.706z" 
        style={{ fill: '#F5AB00', strokeWidth: 1, stroke: '#34495E', opacity: 0.9, cursor: 'pointer' }}
        className="hover:opacity-80 transition-opacity"
        data-tip="Patio de contenedores - Bloque 5"
      />
      
      <path 
        id="path183" 
        d="m747.51 549.41 112.02-0.18394 3.3108-1.6554 1.6554-3.1269v-21.152l-2.2072-3.4948-3.6787-1.6554-108.71 0.18393-3.8626 0.91967-1.8393 1.4715-1.6554 3.1269 0.18393 22.256 1.2875 1.8394z" 
        style={{ fill: '#F5AB00', strokeWidth: 1, stroke: '#34495E', opacity: 0.9, cursor: 'pointer' }}
        className="hover:opacity-80 transition-opacity"
        data-tip="Patio de contenedores - Bloque 6"
      />
      
      <path 
        id="path184" 
        d="m748.61 556.77 108.89-0.18394 3.1269 1.2875 2.2072 1.6554 1.1036 3.1269 0.18394 18.026-0.91967 2.2072-1.1036 1.4715-2.943 0.91967-112.94-0.18394-2.3912-1.1036-0.91967-2.0233 0.5518-20.785 0.91967-2.3912 1.8394-0.91968z" 
        style={{ fill: '#F5AB00', strokeWidth: 1, stroke: '#34495E', opacity: 0.9, cursor: 'pointer' }}
        className="hover:opacity-80 transition-opacity"
        data-tip="Patio de contenedores - Bloque 7"
      />
      
      <path 
        id="path185" 
        d="m745.12 591.9 115.33-0.18393 3.1269 1.8393 0.36787 3.3108-0.18393 16.37-1.4715 2.3911-1.8393 0.91968-2.0233 0.18393-109.81 1.1036-3.3108-0.91967-1.8393-2.5751-0.18393-18.945 0.73573-1.8394z" 
        style={{ fill: '#F5AB00', strokeWidth: 1, stroke: '#34495E', opacity: 0.9, cursor: 'pointer' }}
        className="hover:opacity-80 transition-opacity"
        data-tip="Patio de contenedores - Bloque 8"
      />
      
      <path 
        id="path186" 
        d="m856.22 618.76-107.42 0.91967-3.6787 1.6554-1.4715 2.5751-0.18393 3.3108 0.5518 3.4948 1.4715 2.3911 2.0233 2.5751 3.4948 1.4715 36.971 13.795 72.286 0.55181 3.3108-1.2875 1.2876-3.4948-0.18394-22.44-1.4715-2.759-2.5751-1.8394z" 
        style={{ fill: '#F5AB00', strokeWidth: 1, stroke: '#34495E', opacity: 0.9, cursor: 'pointer' }}
        className="hover:opacity-80 transition-opacity"
        data-tip="Patio de contenedores - Bloque 9"
      />
      
      {/* Círculos identificadores de contenedores */}
      {[
        { id: "C1", cx: 518.14, cy: 533.78, rx: 13.795, ry: 13.243 },
        { id: "C2", cx: 517.14, cy: 572.37, rx: 13.795, ry: 13.243 },
        { id: "C3", cx: 660, cy: 533.37, rx: 13.795, ry: 13.243 },
        { id: "C4", cx: 661.64, cy: 572.05, rx: 13.795, ry: 13.243 },
        { id: "C5", cx: 690.03, cy: 598.81, rx: 9.7485, ry: 9.0128 },
        { id: "C6", cx: 801.5, cy: 534.11, rx: 13.795, ry: 13.243 },
        { id: "C7", cx: 801.03, cy: 570.94, rx: 12.14, ry: 11.772 },
        { id: "C8", cx: 797.82, cy: 604.56, rx: 11.22, ry: 11.036 },
        { id: "C9", cx: 835.59, cy: 635.09, rx: 13.795, ry: 13.243 },
        { id: "SE", cx: 780.4, cy: 633, rx: 11.036, ry: 10.852 }
      ].map(block => {
        const blockData = getBlockData(block.id);
        return (
          <ellipse 
            key={block.id}
            id={`costanera-${block.id.toLowerCase()}`}
            cx={block.cx}
            cy={block.cy}
            rx={block.rx}
            ry={block.ry}
            style={{ fill: "#008080", paintOrder: "markers fill stroke" }}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            data-tip={`Contenedores ${block.id}: ${blockData.ocupacion}% ocupación`}
          />
        );
      })}
      
      {/* Etiquetas de contenedores */}
      {[
        { id: "C1", x: 525.97723, y: 531.33044 },
        { id: "C2", x: 526.49792, y: 568.55206 },
        { id: "C3", x: 669.04364, y: 531.2536 },
        { id: "C4", x: 671.54358, y: 568.90863 },
        { id: "C5", x: 700.79382, y: 595.72156 },
        { id: "C6", x: 814.22113, y: 531.53906 },
        { id: "C7", x: 812.83496, y: 568.12775 },
        { id: "C8", x: 810.08331, y: 601.27338 },
        { id: "C9", x: 848.86957, y: 632.15332 },
        { id: "SE", x: 792.8656, y: 628.89697 }
      ].map(label => (
        <text 
          key={label.id}
          id={`text-${label.id.toLowerCase()}`}
          transform="scale(0.98492 1.0153)" 
          x={label.x}
          y={label.y}
          style={{ 
            fillOpacity: 1, 
            fill: '#f9f9f9', 
            fontFamily: 'Arial', 
            fontSize: '14.155px', 
            fontWeight: 'bold', 
            lineHeight: 0.7, 
            strokeWidth: '0.5898', 
            textAlign: 'center', 
            textAnchor: 'middle' 
          }}
        >
          <tspan 
            x={label.x}
            y={label.y}
            style={{ strokeWidth: '0.5898' }}
          >
            {label.id}
          </tspan>
        </text>
      ))}
    </g>
  );
};