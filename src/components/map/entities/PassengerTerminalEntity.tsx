import React from 'react';

// Este componente siempre está visible, no depende de filtros
export const PassengerTerminalEntity: React.FC = () => {
  return (
    <g id="passenger-terminal" className="cursor-pointer hover:opacity-80 transition-opacity" data-tip="Terminal de Pasajeros">
      <path 
        id="PA" 
        d="m792.94174 657.56592 65.84855 0.18394 0.55181 24.83116-66.76823 0.36787z" 
        style={{ fill: '#447821', stroke: '#333', strokeWidth: 0.7 }}
      />
      
      <text 
        id="pa-text" 
        transform="scale(0.9849198,1.0153111)" 
        x="840.1701" 
        y="664.17157" 
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
          x="840.1701" 
          y="664.17157" 
          style={{ strokeWidth: '0.5898' }}
        >
          PA
        </tspan>
      </text>
      
      <text 
        id="texto-pa-t" 
        transform="scale(1.129824,0.88509363)" 
        x="640.10498" 
        y="760.88507" 
        style={{ 
          fillOpacity: 1, 
          fill: '#e6e6e6', 
          fontFamily: 'Arial', 
          fontSize: '16.1525px', 
          fontWeight: 'bold',
          lineHeight: 0.9, 
          strokeWidth: '0.673019', 
          textAlign: 'center', 
          textAnchor: 'middle'
        }}
      >
        <tspan 
          x="640.10498" 
          y="760.88507" 
          style={{ 
            fill: '#e6e6e6', 
            fontFamily: 'Arial', 
            fontSize: '16.1525px', 
            fontWeight: 'bold', 
            lineHeight: 0.9, 
            strokeWidth: '0.673019', 
            textAlign: 'center', 
            textAnchor: 'middle' 
          }}
        >
          TERMINAL
        </tspan>
        <tspan 
          x="640.10498" 
          y="775.4223" 
          style={{ 
            fill: '#e6e6e6', 
            fontFamily: 'Arial', 
            fontSize: '16.1525px', 
            fontWeight: 'bold', 
            lineHeight: 0.9, 
            strokeWidth: '0.673019', 
            textAlign: 'center', 
            textAnchor: 'middle' 
          }}
        >
          PASAJERO
        </tspan>
      </text>
    </g>
  );
};