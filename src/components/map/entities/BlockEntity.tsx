import React from 'react';

const getColorForOcupacion = (value) => {
  if (value < 70) return '#7CB342'; // Verde
  if (value < 85) return '#FFA000'; // Amarillo
  return '#D32F2F'; // Rojo
};

const BlockEntity = ({ id, x, y, label, value, tip, size = 13.8, type = 'container' }) => {
  const colors = {
    container: '#008080',
    aduana: '#666666',
    imo: '#FF5722',
    tebas: '#7CB342',
    ohiggins: '#1c3b60',
    espingon: '#78309A'
  };
  
  return (
    <g className="cursor-pointer hover:opacity-80 transition-opacity" data-tip={tip}>
      <ellipse 
        id={id} 
        cx={x} 
        cy={y} 
        rx={size} 
        ry={size * 0.96} 
        style={{ fill: colors[type], paintOrder: "markers fill stroke" }}
      />
      
      <text 
        transform="scale(0.98492 1.0153)" 
        x={x} 
        y={y} 
        style={{ 
          fillOpacity: 1, 
          fill: '#f9f9f9', 
          fontFamily: 'Arial', 
          fontSize: '14.155px', 
          fontWeight: 'bold', 
          lineHeight: 0.7, 
          strokeWidth: '0.5898', 
          textAlign: 'center', 
          textAnchor: 'middle',
          dominantBaseline: 'middle'
        }}
      >
        <tspan 
          x={x} 
          y={y} 
          style={{ strokeWidth: '0.5898' }}
          dy="0.3em"
        >
          {label}
        </tspan>
      </text>
    </g>
  );
};

export default BlockEntity;