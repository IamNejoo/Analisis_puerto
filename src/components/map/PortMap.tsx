import React from 'react';
import type { Filters } from '../../types';
import { GateEntity } from './entities/GateEntity';
import { ContainerYardEntity } from './entities/ContainerYardEntity';
import { IMOEntity } from './entities/IMOEntity';
import { CustomsEntity } from './entities/CustomsEntity';
import { OHigginsEntity } from './entities/OHigginsEntity';
import { TebasEntity } from './entities/TebasEntity';
import { EspingonEntity } from './entities/EspingonEntity';
import { CraneEntity } from './entities/CraneEntity';
import { PassengerTerminalEntity } from './entities/PassengerTerminalEntity';

interface PortMapProps {
  filters: Filters;
  getColorForOcupacion: (value: number) => string;
}

export const PortMap: React.FC<PortMapProps> = ({ filters, getColorForOcupacion }) => {
  return (
    <g id="port-layer">
      {/* Caminos del terminal - Fondo estructural */}
      <path 
        id="calles-terminal" 
        d="m53.065 452.09 2.081-135.26 16.648-0.52025 52.545-70.753 13.526-4.6822 74.395-6.7632 13.526 5.7227 36.937 55.146 27.053-3.1215 17.688 2.6012 17.168 5.7227 20.29 16.648 88.442 69.713 11.966 19.249 2.081 8.8442v68.672l3.1215 13.526 9.3644 9.8847 10.405 4.162 407.87-2.6012-3.1215 133.7 6.243 6.7632 7.2834 1.0405 5.2025-2.6012 46.302-105.09 63.47-55.146-44.741-49.944 8.8442-8.8442 91.043 97.286-142.03 108.73-7.2834 16.128-11.966 10.405-9.3644 3.6417-15.087 1.5607 1.0405 24.452-191.45 1.0405v-35.897l74.395-2.081-144.11-52.545-279.89-2.6012-9.8847-2.081-5.7227-4.162-26.533-76.996-1.5607-18.209 4.6822-18.729 14.047-19.769 14.047 1.0405 43.701-26.533h49.944l-0.52024-13.526-6.243-11.445-28.093-20.81-36.417-31.735-28.093-22.371-14.567-10.405-13.006-3.6417-22.371 2.6012-25.492 3.6417-7.8037 0.52025-10.405 30.694 0.52025 31.735-54.626 21.85 4.6822 46.822h65.031l82.199-40.059 23.931-11.185 21.85-10.405 10.925-7.5436-33.816 15.087-23.411 11.185-81.158 43.961h-65.551l-21.85 4.6822 1.5607-10.405-1.5607-16.128-6.7632-13.526-9.3644-8.3239 11.445-27.573-30.694 16.128-19.769-1.5607-16.648 4.6822-14.567 11.966-8.3239 13.526-3.6417 15.087z" 
        style={{ 
          fillOpacity: 0.75381, 
          fill: '#333',
          opacity: 0.2
        }}
      />
      
      {/* CAMINOS DEL TERMINAL - Mostrar solo si showCaminos es true */}
      {filters.showCaminos && (
        <g id="roads-lines" opacity="0.6">
          <path style={{ fill: 'none', stroke: '#b3b3b3', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.9 }} d="m91.967262,306.43492 34.947558,-51.1338 8.82886,-5.51804 72.28627,-6.4377 11.77181,5.51803 31.4528,47.27118" />
          <path style={{ fill: 'none', stroke: '#b3b3b3', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.9 }} d="m 242.79357,311.03328 c 61.61807,-13.61115 74.30955,3.67869 74.30955,3.67869" />
          <path style={{ fill: 'none', stroke: '#b3b3b3', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.9 }} d="m 334.20903,318.02279 c 86.44923,67.87184 86.44923,67.87184 86.44923,67.87184" />
          <path style={{ fill: 'none', stroke: '#b3b3b3', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.9 }} d="m 328.691,323.54083 88.4725,70.44692" />
          <path style={{ fill: 'none', stroke: '#b3b3b3', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.9 }} d="m 423.60121,586.38327 -0.73574,-164.0696" />
          <path style={{ fill: 'none', stroke: '#b3b3b3', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.9 }} d="m 431.69433,585.64753 -0.36787,-30.71707" />
          <path style={{ fill: 'none', stroke: '#b3b3b3', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.9 }} d="M 448.97178,593.86012 H 609.20736" />
          <path style={{ fill: 'none', stroke: '#b3b3b3', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.9 }} d="m 606.08589,593.33988 c 17.55828,-0.78037 71.6638,22.8908 71.6638,22.8908" />
          <path style={{ fill: 'none', stroke: '#b3b3b3', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.9 }} d="m 677.22945,615.97055 103.78896,38.75829" />
          <path style={{ fill: 'none', stroke: '#b3b3b3', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.9 }} d="m 723.41449,520.90257 0.5518,86.44923" />
          <path style={{ fill: 'none', stroke: '#b3b3b3', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.9 }} d="m 870.63068,519.20491 -0.52025,126.93988" />
        </g>
      )}
      
      {/* Entidades del Puerto */}
      <GateEntity filters={filters} getColorForOcupacion={getColorForOcupacion} />
      <ContainerYardEntity filters={filters} getColorForOcupacion={getColorForOcupacion} />
      <IMOEntity filters={filters} getColorForOcupacion={getColorForOcupacion} />
      <CustomsEntity filters={filters} getColorForOcupacion={getColorForOcupacion} />
      <OHigginsEntity filters={filters} getColorForOcupacion={getColorForOcupacion} />
      <TebasEntity filters={filters} getColorForOcupacion={getColorForOcupacion} />
      <EspingonEntity filters={filters} getColorForOcupacion={getColorForOcupacion} />
      <CraneEntity filters={filters} getColorForOcupacion={getColorForOcupacion} />
      <PassengerTerminalEntity />
    </g>
  );
};