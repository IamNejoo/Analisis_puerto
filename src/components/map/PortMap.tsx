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
      {/* Caminos del terminal - CAMBIADO A GRIS */}
      <path
        id="calles-terminal"
        d="m 53.065031,452.09325 2.080981,-135.2638 16.647853,-0.52025 52.544785,-70.75337 13.52638,-4.68221 74.39509,-6.76319 13.52638,5.7227 36.93743,55.14601 27.05276,-3.12147 17.68834,2.60123 17.1681,5.7227 20.28957,16.64785 88.44172,69.71288 11.96564,19.24908 2.08098,8.84417 v 68.6724 l 3.12148,13.52638 9.36441,9.88466 10.40491,4.16196 407.87239,-2.60123 -3.12147,133.70307 6.24295,6.76319 7.28343,1.04049 5.20246,-2.60122 46.30184,-105.08957 63.46996,-55.14602 -44.74113,-49.94355 8.84417,-8.84418 91.04296,97.28589 -142.02701,108.73129 -7.28343,16.12761 -11.96565,10.40491 -9.36441,3.64171 -15.08712,1.56074 1.04049,24.45153 -191.45031,1.0405 V 655.5092 l 74.3951,-2.08098 -144.10798,-52.54478 -279.89202,-2.60123 -9.88467,-2.08098 -5.7227,-4.16197 -26.53251,-76.99631 -1.56074,-18.20859 4.68221,-18.72884 14.04663,-19.76932 14.04662,1.04049 43.70062,-26.53252 h 49.94355 l -0.52024,-13.52638 -6.24295,-11.4454 -28.09325,-20.80981 -35.63681,-29.65399 -28.87362,-24.45153 -17.1681,-8.06381 -10.4049,-5.98282 25.49202,9.88467 68.93252,58.26747 -150.0908,-61.38895 146.7092,59.82822 -56.70674,26.53252 -80.63804,43.7006 -69.19264,1.0405 h 65.03067 l 81.83091,-43.55366 19.7008,-9.34592 26.44866,-11.69245 -6.79026,2.96144 -16.10053,7.52506 -23.41105,11.18528 -75.64024,42.85713 -68.86175,0.36787 -24.05752,5.41795 1.56074,-10.40491 -1.56074,-16.12761 -6.76319,-13.52638 -9.36442,-8.32392 11.4454,-27.57301 -30.69448,16.12761 -19.769321,-1.56074 -16.647853,4.68221 -14.566871,11.96565 -8.323927,13.52638 -3.641717,15.08711 z M 115.32695,281.41982 222.56078,226.4234"
        style={{
          fillOpacity: 0.5,
          fill: '#9ca3af',  // GRIS - gray-400
          opacity: 0.5
        }}
      />
      {/* CAMINOS DEL TERMINAL - LÍNEAS EN GRIS */}
      {filters.showCaminos && (
        <g id="roads-lines" opacity="0.7">
          {/* Caminos originales */}
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'round', strokeWidth: '2', strokeOpacity: 0.6 }} d="m91.967262,306.43492 34.947558,-51.1338 8.82886,-5.51804 72.28627,-6.4377 11.77181,5.51803 31.4528,47.27118" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'round', strokeWidth: '2', strokeOpacity: 0.6 }} d="m 242.79357,311.03328 c 61.61807,-13.61115 74.30955,3.67869 74.30955,3.67869" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'round', strokeWidth: '2', strokeOpacity: 0.6 }} d="m 334.20903,318.02279 c 86.44923,67.87184 86.44923,67.87184 86.44923,67.87184" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'round', strokeWidth: '2', strokeOpacity: 0.6 }} d="m 328.691,323.54083 88.4725,70.44692" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'round', strokeWidth: '2', strokeOpacity: 0.6 }} d="m 423.60121,586.38327 -0.73574,-164.0696" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'round', strokeWidth: '2', strokeOpacity: 0.6 }} d="m 431.69433,585.64753 -0.36787,-30.71707" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'round', strokeWidth: '2', strokeOpacity: 0.6 }} d="M 448.97178,593.86012 H 609.20736" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'round', strokeWidth: '2', strokeOpacity: 0.6 }} d="m 606.08589,593.33988 c 17.55828,-0.78037 71.6638,22.8908 71.6638,22.8908" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'round', strokeWidth: '2', strokeOpacity: 0.6 }} d="m 677.22945,615.97055 103.78896,38.75829" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'round', strokeWidth: '2', strokeOpacity: 0.6 }} d="m 723.41449,520.90257 0.5518,86.44923" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'round', strokeWidth: '2', strokeOpacity: 0.6 }} d="m 870.63068,519.20491 -0.52025,126.93988" />

          {/* Nuevos caminos del SVG de Inkscape */}
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m242.79 311.03c61.618-13.611 74.31 3.6787 74.31 3.6787" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m334.21 318.02 86.449 67.872" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m328.69 323.54 88.472 70.447" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m323.72 329.79 88.656 70.447" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m423.6 586.38-0.73574-164.07" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m431.69 585.65-0.36787-30.717" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m431.69 549.96v-127.83" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m439.6 585.83v-164.07" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m592.82 519.43 0.18394 69.343" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m597.6 519.43 0.36787 69.895" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m602.57 518.88 0.73574 70.447" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m326.48 462.78c-53.01 8.0266-23.049 70.747-12.14 100.98" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m314.16 563.58 9.8405 24.371" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m324 587.95c4.2158 6.3764 9.5715 5.8383 16.83 5.9779" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m340.74 593.92 72.562-0.45984" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m411.92 399.87c6.2869 4.8804 9.0538 14.654 10.852 22.992" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m416.7 393.53c8.2704 6.1053 12.958 17.922 15.267 29.246" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m420.57 385.53c10.382 10.908 17.079 21.803 19.313 36.603" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m91.967 306.43 34.948-51.134 8.8289-5.518 72.286-6.4377 11.772 5.518 31.453 47.271" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m449.23 593.34h157.63" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m606.09 593.34c17.558-0.78037 71.664 22.891 71.664 22.891" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m677.23 615.97 103.79 38.758" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m723.41 520.9 0.5518 86.449" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m730.59 520.53 0.18394 86.449" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m737.76 520.9-0.36787 86.081" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m870.63 519.2-0.52025 126.94" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m739.59 600.66c-0.72319-7.0087 0.0408-11.909 7.6411-11.836" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m881.3 658.37c26.079-3.6408 31.834-34.141 40.969-57.097" />
          <path style={{ fill: 'none', stroke: '#6b7280', strokeLinecap: 'square', strokeWidth: '1.5', strokeOpacity: 0.6 }} d="m931.5 577.86c11.784-36.978 43.401-56.417 72.444-80.378" />
        </g>
      )}

      {/* Entidades del Puerto con props actualizadas para colores marinos */}
      <g id="port-entities" filter="url(#portEntityGlow)">
        <defs>
          <filter id="portEntityGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

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
    </g>
  );
};