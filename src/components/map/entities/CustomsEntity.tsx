import React from 'react';
import type { EntityProps } from '../../../types';

export const CustomsEntity: React.FC<EntityProps> = ({ filters }) => {
  if (!filters.showAduanas) return null;

  return (
    <g id="customs-building" className="cursor-pointer hover:opacity-90 transition-opacity" data-tip="Edificio de Aduanas">
      {/* Edificio principal Aduanas */}
      <path 
        id="aduana" 
        d="m81.666929 342.11822 74.309551-14.71477 6.98951 2.57509 2.94295 5.8859-6.25378 26.1187-6.25378 9.19673-8.09312 5.51804-49.294448 9.56459-6.621643-4.41443-8.093119-34.21182z" 
        style={{ fill: '#ffffff', fillOpacity: 0.9, stroke: '#333', strokeWidth: 0.7 }}
      />
      
      {/* Detalles estructura Aduanas */}
      <path 
        id="aduana-1" 
        d="m166.55271 334.94477v5.3341l52.32937 0.18394 0.092-5.88591z" 
        style={{ fill: '#ffffff', fillOpacity: 0.9, stroke: '#333', strokeWidth: 0.5 }}
      />
      
      <path 
        id="path26" 
        d="m176.94501 340.09494 0.45984 7.35738-1.56344 1.56344 1.56344-0.092-0.36787 5.97788h39.45396l-0.27591-12.13968-7.17344 0.2759 0.5518 10.9441-2.20721-0.092 0.18393-4.87427 1.10361 0.092-1.37951-2.20722-0.092-6.52967-3.58672-0.092 0.2759 6.52968-1.28754 2.20721 1.37951-0.2759-0.092 4.87426-2.02328 0.27591 0.36787-11.03608-6.34574-0.092 0.092 10.76017-2.29919-0.092 0.18394-4.32246 1.10361-0.18394-1.83935-2.11524 0.36787-6.52968-3.03492 0.092 0.18394 6.34574-1.74738 2.11525 1.47147 0.092-0.18393 4.5064-2.39115 0.092 0.36787-9.47263-5.97787 0.092-0.092 9.38066-2.11525 0.092 0.092-4.23049 1.47148-0.092-1.93132-2.75901 0.45984-6.52968z" 
        style={{ fill: '#ffffff', fillOpacity: 0.9, stroke: '#333', strokeWidth: 0.5 }}
      />
      
      <path 
        id="aduana-base" 
        d="m176.66911 354.90167-2.02328 0.18393v-11.31197l-5.61 0.2759 0.18393 10.85214-2.66705 0.092-0.18393 2.39115 53.06511-0.2759v-2.94295z" 
        style={{ fill: '#ffffff', fillOpacity: 0.9, stroke: '#333', strokeWidth: 0.5 }}
      />
      
      {/* Detalles ventanas Aduanas */}
      <path 
        id="path28" 
        d="m177.74973 349.65953 1.72438-0.092 0.046 2.02327-1.79337-0.20692z" 
        style={{ fill: '#000000', fillOpacity: 0.75381 }}
      />
      
      <path 
        id="path30" 
        d="m190.89755 350.02761 2.47116-0.065-0.0975 1.9184-2.50368-0.065z" 
        style={{ fill: '#000000', fillOpacity: 0.75381 }}
      />
      
      <path 
        id="path31" 
        d="m196.81534 350.2227 4.22699-0.0325 0.0325 2.17853-4.61718-0.19509z" 
        style={{ fill: '#000000', fillOpacity: 0.75381 }}
      />
      
      <path 
        id="path32" 
        d="m169.89264 350.28773 4.0319-0.22761 0.13006 2.34111-4.16196 0.22761z" 
        style={{ fill: '#000000', fillOpacity: 0.75381 }}
      />
      
      {/* Fondo para texto Aduanas */}
      <path 
        id="aduanas-fondo-text" 
        d="m90.5227 342.45153h16.90798l-0.39019 40.18896H90.912884z"
        style={{ fill: '#666666', stroke: '#333', strokeWidth: 0.5 }}
      />
      
      <path 
        id="path29" 
        d="m182.7362 349.63742 4.74724-0.0325-0.26013 2.1135-4.58466-0.26013z" 
        style={{ fill: '#000000', fillOpacity: 0.75381 }}
      />
      
      {/* Texto ADUANAS rotado */}
      <text 
        id="text-aduana" 
        transform="matrix(0,0.93566184,-1.0687622,0,0,0)" 
        x="387.49982" 
        y="-87.905754" 
        style={{ 
          fillOpacity: 1, 
          fill: '#ffffff', 
          fontFamily: 'Arial', 
          fontSize: '12.3501px', 
          fontWeight: 'bold', 
          lineHeight: 0.7, 
          strokeWidth: '0.51459', 
          textAlign: 'center', 
          textAnchor: 'middle'
        }}
      >
        <tspan 
          x="387.49982" 
          y="-87.905754" 
          style={{ strokeWidth: '0.51459' }}
        >
          ADUANAS
        </tspan>
      </text>
    </g>
  );
};