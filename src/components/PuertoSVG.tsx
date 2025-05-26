import React, { useState} from 'react';
import { AlertTriangle, Activity, Calendar, Clock, BarChart2,  User, Settings, ChevronLeft, ChevronRight, Search, Eye, EyeOff, TrendingDown as ArrowDown, TrendingUp as ArrowUp, RefreshCw, Maximize2, } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, BarChart as ReBarChart, Bar, Cell } from 'recharts';

// Datos simulados para los KPIs
const ocupacionData = [
  { name: '05/15', value: 65 },
  { name: '05/16', value: 72 },
  { name: '05/17', value: 78 },
  { name: '05/18', value: 74 },
  { name: '05/19', value: 68 },
  { name: '05/20', value: 63 },
  { name: '05/21', value: 72 },
];

const productividadData = [
  { name: '05/15', bmph: 72, gmph: 27 },
  { name: '05/16', bmph: 68, gmph: 26 },
  { name: '05/17', bmph: 75, gmph: 28 },
  { name: '05/18', bmph: 82, gmph: 30 },
  { name: '05/19', bmph: 78, gmph: 29 },
  { name: '05/20', bmph: 76, gmph: 28 },
  { name: '05/21', bmph: 80, gmph: 29 },
];

const tiempoCamionData = [
  { name: '05/15', tiempo: 42 },
  { name: '05/16', tiempo: 38 },
  { name: '05/17', tiempo: 35 },
  { name: '05/18', tiempo: 37 },
  { name: '05/19', tiempo: 36 },
  { name: '05/20', tiempo: 34 },
  { name: '05/21', tiempo: 33 },
];

const ocupacionPatioData = [
  { name: 'Importación', value: 68 },
  { name: 'Exportación', value: 75 },
  { name: 'Vacíos', value: 45 },
  { name: 'Refrigerados', value: 82 },
];

const ocupacionBloqueData = [
  { id: 'C1', ocupacion: 82, tipo: 'Contenedores' },
  { id: 'C2', ocupacion: 75, tipo: 'Contenedores' },
  { id: 'C3', ocupacion: 90, tipo: 'Contenedores' },
  { id: 'C4', ocupacion: 65, tipo: 'Contenedores' },
  { id: 'C5', ocupacion: 70, tipo: 'Contenedores' },
  { id: 'C6', ocupacion: 95, tipo: 'Contenedores' },
  { id: 'C7', ocupacion: 80, tipo: 'Contenedores' },
  { id: 'C8', ocupacion: 60, tipo: 'Contenedores' },
  { id: 'C9', ocupacion: 85, tipo: 'Contenedores' },
  { id: 'H1', ocupacion: 72, tipo: 'OHiggins' },
  { id: 'H2', ocupacion: 65, tipo: 'OHiggins' },
  { id: 'H3', ocupacion: 85, tipo: 'OHiggins' },
  { id: 'H4', ocupacion: 60, tipo: 'OHiggins' },
  { id: 'H5', ocupacion: 78, tipo: 'OHiggins' },
  { id: 'T1', ocupacion: 55, tipo: 'Tebas' },
  { id: 'T2', ocupacion: 75, tipo: 'Tebas' },
  { id: 'T3', ocupacion: 82, tipo: 'Tebas' },
  { id: 'T4', ocupacion: 68, tipo: 'Tebas' },
  { id: 'I1', ocupacion: 90, tipo: 'IMO' },
  { id: 'I2', ocupacion: 85, tipo: 'IMO' },
  { id: 'E1', ocupacion: 75, tipo: 'Espingon' },
  { id: 'E2', ocupacion: 80, tipo: 'Espingon' },
  { id: 'SE', ocupacion: 65, tipo: 'Especial' },
];

const alertasData = [
  { id: 1, titulo: 'Ocupación crítica C6', tipo: 'Alta', tiempo: '10 min', mensaje: 'El bloque C6 ha alcanzado 95% de ocupación', area: 'Patio' },
  { id: 2, titulo: 'Tiempo de espera camiones', tipo: 'Media', tiempo: '25 min', mensaje: 'Aumento en tiempo de espera antepuerto +15 min', area: 'Gate' },
  { id: 3, titulo: 'Cierre por marejadas', tipo: 'Alta', tiempo: '45 min', mensaje: 'Posible cierre de puerto en próximas 2 horas', area: 'Muelle' },
  { id: 4, titulo: 'Retraso nave Eurosal', tipo: 'Media', tiempo: '1h 20m', mensaje: 'Nave retrasada por condiciones climáticas', area: 'Operaciones' },
  { id: 5, titulo: 'Mantenimiento grúa STS-2', tipo: 'Baja', tiempo: '2h 15m', mensaje: 'Mantenimiento preventivo programado', area: 'Equipos' },
];

const navesData = [
  { id: 1, nombre: 'MSC CAROLINA', servicio: 'EUROSAL', eta: '05/21 17:00', etd: '05/22 03:00', sitio: 'S1', movs: 780, estado: 'En tránsito', completado: 0 },
  { id: 2, nombre: 'HAMBURG SÜDD', servicio: 'ASIA-CHILE', eta: '05/21 22:00', etd: '05/22 12:00', sitio: 'S2', movs: 920, estado: 'Programado', completado: 0 },
  { id: 3, nombre: 'MAERSK DANUBE', servicio: 'ANDES', eta: '05/22 06:00', etd: '05/22 18:00', sitio: 'S1', movs: 650, estado: 'Programado', completado: 0 },
  { id: 4, nombre: 'APL TOKYO', servicio: 'AC3', eta: '05/21 09:00', etd: '05/21 23:00', sitio: 'S1', movs: 850, estado: 'En operación', completado: 65 },
  { id: 5, nombre: 'COSCO PACIFIC', servicio: 'ASIA-CHILE', eta: '05/22 14:00', etd: '05/23 06:00', sitio: 'S2', movs: 1200, estado: 'Programado', completado: 0 },
];

// Componente Dashboard
const DashboardPuerto = () => {
  // Estados
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('operativo');
interface Filters {
  showGates: boolean;
  showContainers: boolean;
  showAduanas: boolean;
  showTebas: boolean;
  showIMO: boolean;
  showOHiggins: boolean;
  showEspingon: boolean;
  showGruas: boolean;
  showCaminos: boolean;
  [key: string]: boolean; // Esta línea permite cualquier cadena como clave
}

const [filters, setFilters] = useState<Filters>({
  showGates: true,
  showContainers: true,
  showAduanas: true,
  showTebas: true,
  showIMO: true,
  showOHiggins: true,
  showEspingon: true,
  showGruas: true,
  showCaminos: true
});

const toggleFilter = (filter: string) => {
  setFilters({
    ...filters,
    [filter]: !filters[filter as keyof typeof filters]
  });
};

  const toggleMenu = () => {
    setIsMenuCollapsed(!isMenuCollapsed);
  };

  const getColorForOcupacion = (value: number): string => {
    if (value < 70) return '#7CB342'; // Verde
    if (value < 85) return '#FFA000'; // Amarillo
    return '#D32F2F'; // Rojo
  };
  
  // Componente de gauge para ocupación
  const GaugeChart = ({ value, size = 120, strokeWidth = 10 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = value / 100 * circumference;
    const remaining = circumference - progress;
    const color = getColorForOcupacion(value);
    
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <circle
            cx={size/2}
            cy={size/2}
            r={radius}
            fill="none"
            stroke="#e6e6e6"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size/2}
            cy={size/2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={remaining}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{value}%</span>
          <span className="text-xs text-gray-500">Ocupación</span>
        </div>
      </div>
    );
  };
  
  // Componente PortMap
  const PortMap = () => {
    return (
      <div className="w-full h-full overflow-hidden bg-gray-100 rounded-lg shadow-md flex items-center justify-center">
        <svg 
          id="svg1" 
          width="100%" 
          height="100%" 
          viewBox="0 0 1165.9 595.22" 
          className="max-h-full"
          style={{ maxHeight: 'calc(100vh - 230px)' }}
        >
          <g id="layer3" transform="translate(-19.249 -158.67)">
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
              <g id="g164" opacity="0.6">
                {/* Numerosos path de caminos omitidos por brevedad */}
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
            
            {/* SECCIÓN GATES */}
            {filters.showGates && (
              <>
                {/* Gate In - Círculo verde */}
                <g className="cursor-pointer hover:opacity-90 transition-opacity" data-tip="Gate In: Entrada de camiones al terminal">
                  <ellipse 
                    id="gate-in" 
                    cx="102.75" 
                    cy="451.83" 
                    rx="49.163" 
                    ry="51.244" 
                    style={{ fillOpacity: 0.9, fill: '#1E8A5E' }}
                  />
                  
                  {/* Texto Gate In */}
                  <text 
                    id="text-gate-in" 
                    transform="scale(1.107 0.90332)" 
                    x="95.89505" 
                    y="502.04626" 
                    style={{ 
                      fillOpacity: 1, 
                      fill: '#FFFFFF', 
                      fontFamily: 'Arial', 
                      fontSize: '40.893px', 
                      fontWeight: 'bold',
                      lineHeight: 0.7, 
                      strokeWidth: '1.7039',
                      textAlign: 'center',
                      textAnchor: 'middle'
                    }}
                  >
                    <tspan 
                      x="95.89505" 
                      y="502.04626" 
                      style={{ 
                        fill: '#FFFFFF', 
                        fontFamily: 'Arial', 
                        fontSize: '40.893px', 
                        fontWeight: 'bold', 
                        lineHeight: 0.7, 
                        strokeWidth: '1.7039', 
                        textAlign: 'center', 
                        textAnchor: 'middle' 
                      }}
                    >
                      Gate 
                    </tspan>
                    <tspan 
                      x="95.89505" 
                      y="530.67114" 
                      style={{ 
                        fill: '#FFFFFF', 
                        fontFamily: 'Arial', 
                        fontSize: '40.893px', 
                        fontWeight: 'bold', 
                        lineHeight: 0.7, 
                        strokeWidth: '1.7039', 
                        textAlign: 'center', 
                        textAnchor: 'middle' 
                      }}
                    >
                      In
                    </tspan>
                  </text>
                  
                  {/* Flecha Gate In */}
                  <path 
                    id="path13" 
                    d="m116.53 402.67 29.654-15.607-10.405 26.533z" 
                    style={{ fillOpacity: 0.9, fill: '#1E8A5E' }}
                  />
                </g>
                
                {/* Grupo Gate Out */}
                <g className="cursor-pointer hover:opacity-90 transition-opacity" data-tip="Gate Out: Salida de camiones del terminal">
                  {/* Gate Out - Círculo rojo */}
                  <ellipse 
                    id="gate-out" 
                    cx="69.193" 
                    cy="207.84" 
                    rx="49.944" 
                    ry="49.163" 
                    style={{ fillOpacity: 0.9, fill: '#D72E30' }}
                  />
                  
                  {/* Texto Gate Out */}
                  <text 
                    id="text-gate-out" 
                    transform="scale(1.107 0.90332)" 
                    x="66.781822" 
                    y="232.1998" 
                    style={{ 
                      fillOpacity: 1, 
                      fill: '#FFFFFF', 
                      fontFamily: 'Arial', 
                      fontSize: '40.893px', 
                      fontWeight: 'bold',
                      lineHeight: 0.7, 
                      strokeWidth: '1.7039',
                      textAlign: 'center',
                      textAnchor: 'middle'
                    }}
                  >
                    <tspan 
                      x="66.781822" 
                      y="232.1998" 
                      style={{ 
                        fill: '#FFFFFF', 
                        fontFamily: 'Arial', 
                        fontSize: '40.893px', 
                        fontWeight: 'bold', 
                        lineHeight: 0.7, 
                        strokeWidth: '1.7039', 
                        textAlign: 'center', 
                        textAnchor: 'middle' 
                      }}
                    >
                      Gate 
                    </tspan>
                    <tspan 
                      x="66.781822" 
                      y="260.82468" 
                      style={{ 
                        fill: '#FFFFFF', 
                        fontFamily: 'Arial', 
                        fontSize: '40.893px', 
                        fontWeight: 'bold', 
                        lineHeight: 0.7, 
                        strokeWidth: '1.7039', 
                        textAlign: 'center', 
                        textAnchor: 'middle' 
                      }}
                    >
                      Out
                    </tspan>
                  </text>
                  
                  {/* Flecha Gate Out */}
                  <path 
                    id="path16" 
                    d="m99.887 245.04 5.7227 28.614-18.729-20.29z" 
                    style={{ fillOpacity: 0.9, fill: '#D72E30' }}
                  />
                </g>
              </>
            )}
            
            {/* SECCIÓN DE CONTENEDORES */}
            {filters.showContainers && (
              <g id="g187">
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
<ellipse 
                  id="costanera-c1" 
                  cx="518.14" 
                  cy="533.78" 
                  rx="13.795" 
                  ry="13.243" 
                  style={{ fill: "#008080", paintOrder: "markers fill stroke" }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="Contenedores C1: 82% ocupación"
                />
                
                <ellipse 
                  id="costanera-c6" 
                  cx="801.5" 
                  cy="534.11" 
                  rx="13.795" 
                  ry="13.243" 
                  style={{ fill: "#008080", paintOrder: "markers fill stroke" }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="Contenedores C6: 95% ocupación"
                />
                
                <ellipse 
                  id="costanera-c3" 
                  cx="660" 
                  cy="533.37" 
                  rx="13.795" 
                  ry="13.243" 
                  style={{ fill: "#008080", paintOrder: "markers fill stroke" }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="Contenedores C3: 90% ocupación"
                />
                
                <ellipse 
                  id="costanera-c9" 
                  cx="835.59" 
                  cy="635.09" 
                  rx="13.795" 
                  ry="13.243" 
                  style={{ fill: "#008080", paintOrder: "markers fill stroke" }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="Contenedores C9: 85% ocupación"
                />
                
                <ellipse 
                  id="costanera-se" 
                  cx="780.4" 
                  cy="633" 
                  rx="11.036" 
                  ry="10.852" 
                  style={{ fill: "#008080", paintOrder: "markers fill stroke" }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="Carga Especial: 65% ocupación"
                />
                
                <ellipse 
                  id="costanera-c8" 
                  cx="797.82" 
                  cy="604.56" 
                  rx="11.22" 
                  ry="11.036" 
                  style={{ fill: "#008080", paintOrder: "markers fill stroke" }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="Contenedores C8: 60% ocupación"
                />
                
                <ellipse 
                  id="costanera-c5" 
                  cx="690.03" 
                  cy="598.81" 
                  rx="9.7485" 
                  ry="9.0128" 
                  style={{ fill: "#008080", paintOrder: "markers fill stroke" }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="Contenedores C5: 70% ocupación"
                />
                
                <ellipse 
                  id="costanera-c2" 
                  cx="517.14" 
                  cy="572.37" 
                  rx="13.795" 
                  ry="13.243" 
                  style={{ fill: "#008080", paintOrder: "markers fill stroke" }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="Contenedores C2: 75% ocupación"
                />
                
                <ellipse 
                  id="costanera-c4" 
                  cx="661.64" 
                  cy="572.05" 
                  rx="13.795" 
                  ry="13.243" 
                  style={{ fill: "#008080", paintOrder: "markers fill stroke" }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="Contenedores C4: 65% ocupación"
                />
                
                <ellipse 
                  id="costanera-c7" 
                  cx="801.03" 
                  cy="570.94" 
                  rx="12.14" 
                  ry="11.772" 
                  style={{ fill: "#008080", paintOrder: "markers fill stroke" }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="Contenedores C7: 80% ocupación"
                />
                
                {/* Etiquetas de contenedores */}
                <text 
                  id="text-c2" 
                  transform="scale(0.98492 1.0153)" 
                  x="526.49792" 
                  y="568.55206" 
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
                    x="526.49792" 
                    y="568.55206" 
                    style={{ strokeWidth: '0.5898' }}
                  >
                    C2
                  </tspan>
                </text>
                
                <text 
                  id="text-c1" 
                  transform="scale(0.98492 1.0153)" 
                  x="525.97723" 
                  y="531.33044" 
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
                    x="525.97723" 
                    y="531.33044" 
                    style={{ strokeWidth: '0.5898' }}
                  >
                    C1
                  </tspan>
                </text>
                
                <text 
                  id="text-c3" 
                  transform="scale(0.98492 1.0153)" 
                  x="669.04364" 
                  y="531.2536" 
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
                    x="669.04364" 
                    y="531.2536" 
                    style={{ strokeWidth: '0.5898' }}
                  >
                    C3
                  </tspan>
                </text>
                
                <text 
                  id="text-c4" 
                  transform="scale(0.98492 1.0153)" 
                  x="671.54358" 
                  y="568.90863" 
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
                    x="671.54358" 
                    y="568.90863" 
                    style={{ strokeWidth: '0.5898' }}
                  >
                    C4
                  </tspan>
                </text>
                
                <text 
                  id="text-c6" 
                  transform="scale(0.98492 1.0153)" 
                  x="814.22113" 
                  y="531.53906" 
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
                    x="814.22113" 
                    y="531.53906" 
                    style={{ strokeWidth: '0.5898' }}
                  >
                    C6
                  </tspan>
                </text>
                
                <text 
                  id="text-c7" 
                  transform="scale(0.98492 1.0153)" 
                  x="812.83496" 
                  y="568.12775" 
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
                    x="812.83496" 
                    y="568.12775" 
                    style={{ strokeWidth: '0.5898' }}
                  >
                    C7
                  </tspan>
                </text>
                
                <text 
                  id="text-c8" 
                  transform="scale(0.98492 1.0153)" 
                  x="810.08331" 
                  y="601.27338" 
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
                    x="810.08331" 
                    y="601.27338" 
                    style={{ strokeWidth: '0.5898' }}
                  >
                    C8
                  </tspan>
                </text>
                
                <text 
                  id="text-se" 
                  transform="scale(0.98492 1.0153)" 
                  x="792.8656" 
                  y="628.89697" 
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
                    x="792.8656" 
                    y="628.89697" 
                    style={{ strokeWidth: '0.5898' }}
                  >
                    SE
                  </tspan>
                </text>
                
                <text 
                  id="text-c9" 
                  transform="scale(0.98492 1.0153)" 
                  x="848.86957" 
                  y="632.15332" 
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
                    x="848.86957" 
                    y="632.15332" 
                    style={{ strokeWidth: '0.5898' }}
                  >
                    C9
                  </tspan>
                </text>
                
                <text 
                  id="text-c5" 
                  transform="scale(0.98492 1.0153)" 
                  x="700.79382" 
                  y="595.72156" 
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
                    x="700.79382" 
                    y="595.72156" 
                    style={{ strokeWidth: '0.5898' }}
                  >
                    C5
                  </tspan>
                </text>
              </g>
            )}

            {/* SECCIÓN DE ZONA IMO */}
            {filters.showIMO && (
              <g id="g25" className="cursor-pointer hover:opacity-90 transition-opacity" data-tip="Zona IMO: Mercancías Peligrosas - 90% ocupación">
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
            )}

            {/* SECCIÓN DE TEBAS */}
            {filters.showTebas && (
              <g id="g50">
                {/* Círculos Tebas - verdes */}
                <ellipse 
                  id="tebas" 
                  cx="258.33374" 
                  cy="339.38037" 
                  rx="11.380368" 
                  ry="10.66503" 
                  style={{ fillOpacity: 0.9, fill: '#7CB342' }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="Tebas T1: 55% ocupación"
                />
                
                <ellipse 
                  id="path33-9" 
                  cx="258.25278" 
                  cy="384.51166" 
                  rx="11.380368" 
                  ry="10.66503" 
                  style={{ fillOpacity: 0.9, fill: '#7CB342' }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="Tebas T3: 82% ocupación"
                />
                
                <ellipse 
                  id="path33" 
                  cx="258.88712" 
                  cy="407.48221" 
                  rx="11.380368" 
                  ry="10.66503" 
                  style={{ fillOpacity: 0.9, fill: '#7CB342' }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="Tebas T4: 68% ocupación"
                />
                
                <ellipse 
                  id="path33-2" 
                  cx="258.48099" 
                  cy="361.53131" 
                  rx="11.380368" 
                  ry="10.66503" 
                  style={{ fillOpacity: 0.9, fill: '#7CB342' }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="Tebas T2: 75% ocupación"
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
            )}

            {/* SECCIÓN DE ADUANAS */}
            {filters.showAduanas && (
              <g id="g49" className="cursor-pointer hover:opacity-90 transition-opacity" data-tip="Edificio de Aduanas">
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
            )}

            {/* SECCIÓN DE O'HIGGINS */}
            {filters.showOHiggins && (
              <g id="g163">
                {/* Áreas O'Higgins - azules */}
                <path 
                  id="ohiggins-h1" 
                  d="m367.50118 437.76417 41.75314-0.91967 3.49475 1.28754 1.83935 1.47147 1.10361 1.10361 0.18393 14.8987-0.73574 2.02328-1.65541 1.65541-1.83934 1.47147-80.56333-0.18393c0 0-4.23049-1.47148 2.02328-4.41443 6.25378-2.94295 34.39576-18.39345 34.39576-18.39345z" 
                  style={{ fill: '#2196F3', opacity: 0.9, stroke: '#333', strokeWidth: 0.5 }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="O'Higgins H1: 72% ocupación"
                />
                
                <path 
                  id="ohiggins-h2" 
                  d="m302.02049 490.18551 114.77514 0.91967 0.18394-17.65771-0.36787-1.83935-1.10361-1.47147-1.28754-1.47148-2.02328-1.28754h-89.76005l-4.23049 0.73574-3.49476 1.47147-2.75902 2.57509-2.75901 2.39114-2.57509 4.04656-2.39115 4.96624-1.83934 4.23049z" 
                  style={{ fill: '#2196F3', opacity: 0.9, stroke: '#333', strokeWidth: 0.5 }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="O'Higgins H2: 65% ocupación"
                />
                
                <path 
                  id="ohiggins-h3" 
                  d="m302.75623 499.1983h114.0394l0.36787 24.46329-109.62497-0.73574-1.47148-2.75901-2.20721-8.46099z" 
                  style={{ fill: '#2196F3', opacity: 0.9, stroke: '#333', strokeWidth: 0.5 }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="O'Higgins H3: 85% ocupación"
                />
                
                <path 
                  id="ohiggins-h4" 
                  d="m308.09033 525.317 5.70197 20.60067 1.83934 1.65541 2.75902 1.83935 4.2305 0.73573 88.10463 0.18394 3.12689-1.47148 2.57508-2.57508 1.47148-3.31082v-17.84165z" 
                  style={{ fill: '#2196F3', opacity: 0.9, stroke: '#333', strokeWidth: 0.5 }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="O'Higgins H4: 60% ocupación"
                />
                
                <path 
                  id="ohiggins-h5" 
                  d="m323.54083 557.87341 91.59939-0.36786 2.57509 1.83934 1.1036 2.94295-0.5518 21.15247-3.12689 3.49476-2.57508 0.73574-78.17217 0.36787-4.2305-1.10361-1.83934-2.75902-8.64493-20.41673v-2.39115l1.28755-2.39115z" 
                  style={{ fill: '#2196F3', opacity: 0.9, stroke: '#333', strokeWidth: 0.5 }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="O'Higgins H5: 78% ocupación"
                />
                
                {/* Círculos identificadores O'Higgins */}
                <ellipse 
                  id="ohiggins" 
                  cx="363.51993" 
                  cy="511.06543" 
                  rx="11.380368" 
                  ry="10.795092" 
                  style={{ fill: "#1c3b60", paintOrder: "markers fill stroke" }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="O'Higgins H3: 85% ocupación"
                />
                
                <ellipse 
                  id="path160-58" 
                  cx="364.6738" 
                  cy="478.96393" 
                  rx="11.380368" 
                  ry="10.795092" 
                  style={{ fill: "#1c3b60", paintOrder: "markers fill stroke" }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="O'Higgins H2: 65% ocupación"
                />
                
                <ellipse 
                  id="path160-2" 
                  cx="381.27448" 
                  cy="448.7485" 
                  rx="11.380368" 
                  ry="10.795092" 
                  style={{ fill: "#1c3b60", paintOrder: "markers fill stroke" }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="O'Higgins H1: 72% ocupación"
                />
                
                <ellipse 
                  id="path160-9" 
                  cx="364.13248" 
                  cy="537.6925" 
                  rx="11.380368" 
                  ry="10.795092" 
                  style={{ fill: "#1c3b60", paintOrder: "markers fill stroke" }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="O'Higgins H4: 60% ocupación"
                />
                
                <ellipse 
                  id="path160-5" 
                  cx="369.67117" 
                  cy="572.59021" 
                  rx="11.380368" 
                  ry="10.795092" 
                  style={{ fill: "#1c3b60", paintOrder: "markers fill stroke" }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="O'Higgins H5: 78% ocupación"
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
            )}

            {/* SECCIÓN DE ESPINGÓN */}
            {filters.showEspingon && (
              <g id="g179">
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
                  data-tip="Espingón E1: 75% ocupación"
                />
                
                <path 
                  id="espingon-e2" 
                  d="m982.73111 532.54494 30.53309-25.38297 4.5984 0.18394 12.6915 16.0023 0.1839 5.3341-29.0617 24.09542h-6.43769l-12.8754-16.0023z" 
                  style={{ fill: '#78309A', opacity: 0.9, stroke: '#333', strokeWidth: 0.5 }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="Espingón E2: 80% ocupación"
                />
                
                {/* Textos E1 y E2 (etiquetados como H1 y H2 en el SVG) */}
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
            )}

            {/* SECCIÓN DE GRÚAS */}
            {filters.showGruas && (
              <>
                {/* Grúa 1 */}
                <g id="g202" className="cursor-pointer hover:opacity-80 transition-opacity" data-tip="Grúa STS-1: Operativa">
                  {/* Cuerpo principal de la grúa */}
                  <path 
                    id="path195" 
                    d="m504.16453 480.71288h6.62165l0.2759-5.8859 2.75902 0.092-0.36787 19.681 3.40279-0.092-0.36787-9.28869 8.36902-0.45984 0.092 10.02443h3.77066l-0.64377-33.01624 1.83935-0.18394 0.2759-4.7823h-6.43771l-0.36787 4.7823 2.02328 0.092-0.092 9.93246-8.46098 0.2759-0.18394-2.29918-11.12804 0.2759-1.56344 1.10361z" 
                    style={{ fill: '#00796B', strokeWidth: 0.8, stroke: '#333' }}
                  />
                  
                  {/* Cabina de la grúa */}
                  <path 
                    id="path196" 
                    d="m528.35192 475.65468 7.17345 0.18394 0.45984 1.1036v2.66705l-0.64377 1.47148-1.93132 1.01164-3.40279-0.2759h-1.65541z" 
                    style={{ fill: '#00796B', strokeWidth: 0.5, stroke: '#333' }}
                  />
                  
                  {/* Parte roja de la grúa */}
                  <path 
                    id="path197" 
                    d="m527.89208 475.37396 3.59497-5.297 18.16402-0.21621 4.63562 6.16181z" 
                    style={{ fill: '#e53935', strokeWidth: 0.5, stroke: '#333' }}
                  />
                  
                  {/* Ventana o panel de la grúa */}
                  <path 
                    id="path198" 
                    d="m517.22388 476.11452v6.34574l7.35739-0.2759 0.092-6.62165z" 
                    style={{ fill: '#f4eed7', strokeWidth: 0.5, stroke: '#333' }}
                  />
                </g>
                
                {/* Grúa 2 */}
                <g id="g202-5" transform="translate(56.929819,0.66485772)" className="cursor-pointer hover:opacity-80 transition-opacity" data-tip="Grúa STS-2: Mantenimiento">
                  <path 
                    id="path195-6" 
                    d="m504.16453 480.71288h6.62165l0.2759-5.8859 2.75902 0.092-0.36787 19.681 3.40279-0.092-0.36787-9.28869 8.36902-0.45984 0.092 10.02443h3.77066l-0.64377-33.01624 1.83935-0.18394 0.2759-4.7823h-6.43771l-0.36787 4.7823 2.02328 0.092-0.092 9.93246-8.46098 0.2759-0.18394-2.29918-11.12804 0.2759-1.56344 1.10361z" 
                    style={{ fill: '#00796B', strokeWidth: 0.8, stroke: '#333' }}
                  />
                  <path 
                    id="path196-6" 
                    d="m528.35192 475.65468 7.17345 0.18394 0.45984 1.1036v2.66705l-0.64377 1.47148-1.93132 1.01164-3.40279-0.2759h-1.65541z" 
                    style={{ fill: '#00796B', strokeWidth: 0.5, stroke: '#333' }}
                  />
                  <path 
                    id="path197-6" 
                    d="m527.89208 475.37396 3.59497-5.297 18.16402-0.21621 4.63562 6.16181z" 
                    style={{ fill: '#e53935', strokeWidth: 0.5, stroke: '#333' }}
                  />
                  <path 
                    id="path198-7" 
                    d="m517.22388 476.11452v6.34574l7.35739-0.2759 0.092-6.62165z" 
                    style={{ fill: '#f4eed7', strokeWidth: 0.5, stroke: '#333' }}
                  />
                </g>
                
                {/* Grúa 3 */}
                <g id="g202-7" transform="translate(114.29424,0.43295584)" className="cursor-pointer hover:opacity-80 transition-opacity" data-tip="Grúa STS-3: Operativa">
                  <path 
                    id="path195-2" 
                    d="m504.16453 480.71288h6.62165l0.2759-5.8859 2.75902 0.092-0.36787 19.681 3.40279-0.092-0.36787-9.28869 8.36902-0.45984 0.092 10.02443h3.77066l-0.64377-33.01624 1.83935-0.18394 0.2759-4.7823h-6.43771l-0.36787 4.7823 2.02328 0.092-0.092 9.93246-8.46098 0.2759-0.18394-2.29918-11.12804 0.2759-1.56344 1.10361z" 
                    style={{ fill: '#00796B', strokeWidth: 0.8, stroke: '#333' }}
                  />
                  <path 
                    id="path196-7" 
                    d="m528.35192 475.65468 7.17345 0.18394 0.45984 1.1036v2.66705l-0.64377 1.47148-1.93132 1.01164-3.40279-0.2759h-1.65541z" 
                    style={{ fill: '#00796B', strokeWidth: 0.5, stroke: '#333' }}
                  />
                  <path 
                    id="path197-65" 
                    d="m527.89208 475.37396 3.59497-5.297 18.16402-0.21621 4.63562 6.16181z" 
                    style={{ fill: '#e53935', strokeWidth: 0.5, stroke: '#333' }}
                  />
                  <path 
                    id="path198-1" 
                    d="m517.22388 476.11452v6.34574l7.35739-0.2759 0.092-6.62165z" 
                    style={{ fill: '#f4eed7', strokeWidth: 0.5, stroke: '#333' }}
                  />
                </g>
                
                {/* Grúa 4 */}
                <g id="g202-3" transform="translate(170.11019,-0.64557179)" className="cursor-pointer hover:opacity-80 transition-opacity" data-tip="Grúa STS-4: Operativa">
                  <path 
                    id="path195-24" 
                    d="m504.16453 480.71288h6.62165l0.2759-5.8859 2.75902 0.092-0.36787 19.681 3.40279-0.092-0.36787-9.28869 8.36902-0.45984 0.092 10.02443h3.77066l-0.64377-33.01624 1.83935-0.18394 0.2759-4.7823h-6.43771l-0.36787 4.7823 2.02328 0.092-0.092 9.93246-8.46098 0.2759-0.18394-2.29918-11.12804 0.2759-1.56344 1.10361z" 
                    style={{ fill: '#00796B', strokeWidth: 0.8, stroke: '#333' }}
                  />
                  <path 
                    id="path196-4" 
                    d="m528.35192 475.65468 7.17345 0.18394 0.45984 1.1036v2.66705l-0.64377 1.47148-1.93132 1.01164-3.40279-0.2759h-1.65541z" 
                    style={{ fill: '#00796B', strokeWidth: 0.5, stroke: '#333' }}
                  />
                  <path 
                    id="path197-4" 
                    d="m527.89208 475.37396 3.59497-5.297 18.16402-0.21621 4.63562 6.16181z" 
                    style={{ fill: '#e53935', strokeWidth: 0.5, stroke: '#333' }}
                  />
<path 
  id="path198-2" 
  d="m517.22388 476.11452v6.34574l7.35739-0.2759 0.092-6.62165z" 
  style={{ fill: '#f4eed7', strokeWidth: 0.5, stroke: '#333' }}
/>
                </g>
                
                {/* Grúa 5 */}
                <g id="g202-8" transform="translate(227.74822,-0.61980494)" className="cursor-pointer hover:opacity-80 transition-opacity" data-tip="Grúa STS-5: Operativa">
                  <path 
                    id="path195-5" 
                    d="m504.16453 480.71288h6.62165l0.2759-5.8859 2.75902 0.092-0.36787 19.681 3.40279-0.092-0.36787-9.28869 8.36902-0.45984 0.092 10.02443h3.77066l-0.64377-33.01624 1.83935-0.18394 0.2759-4.7823h-6.43771l-0.36787 4.7823 2.02328 0.092-0.092 9.93246-8.46098 0.2759-0.18394-2.29918-11.12804 0.2759-1.56344 1.10361z" 
                    style={{ fill: '#00796B', strokeWidth: 0.8, stroke: '#333' }}
                  />
                  <path 
                    id="path196-8" 
                    d="m528.35192 475.65468 7.17345 0.18394 0.45984 1.1036v2.66705l-0.64377 1.47148-1.93132 1.01164-3.40279-0.2759h-1.65541z" 
                    style={{ fill: '#00796B', strokeWidth: 0.5, stroke: '#333' }}
                  />
                  <path 
                    id="path197-3" 
                    d="m527.89208 475.37396 3.59497-5.297 18.16402-0.21621 4.63562 6.16181z" 
                    style={{ fill: '#e53935', strokeWidth: 0.5, stroke: '#333' }}
                  />
                  <path 
                    id="path198-24" 
                    d="m517.22388 476.11452v6.34574l7.35739-0.2759 0.092-6.62165z" 
                    style={{ fill: '#f4eed7', strokeWidth: 0.5, stroke: '#333' }}
                  />
                </g>
                
                {/* Grúa 6 */}
                <g id="g202-4" transform="translate(284.2881,-0.44066383)" className="cursor-pointer hover:opacity-80 transition-opacity" data-tip="Grúa STS-6: Operativa">
                  <path 
                    id="path195-53" 
                    d="m504.16453 480.71288h6.62165l0.2759-5.8859 2.75902 0.092-0.36787 19.681 3.40279-0.092-0.36787-9.28869 8.36902-0.45984 0.092 10.02443h3.77066l-0.64377-33.01624 1.83935-0.18394 0.2759-4.7823h-6.43771l-0.36787 4.7823 2.02328 0.092-0.092 9.93246-8.46098 0.2759-0.18394-2.29918-11.12804 0.2759-1.56344 1.10361z" 
                    style={{ fill: '#00796B', strokeWidth: 0.8, stroke: '#333' }}
                  />
                  <path 
                    id="path196-0" 
                    d="m528.35192 475.65468 7.17345 0.18394 0.45984 1.1036v2.66705l-0.64377 1.47148-1.93132 1.01164-3.40279-0.2759h-1.65541z" 
                    style={{ fill: '#00796B', strokeWidth: 0.5, stroke: '#333' }}
                  />
                  <path 
                    id="path197-8" 
                    d="m527.89208 475.37396 3.59497-5.297 18.16402-0.21621 4.63562 6.16181z" 
                    style={{ fill: '#e53935', strokeWidth: 0.5, stroke: '#333' }}
                  />
                  <path 
                    id="path198-9" 
                    d="m517.22388 476.11452v6.34574l7.35739-0.2759 0.092-6.62165z" 
                    style={{ fill: '#f4eed7', strokeWidth: 0.5, stroke: '#333' }}
                  />
                </g>
                
                {/* Grúa 7 */}
                <g id="g202-81" transform="translate(341.64393,-1.0014)" className="cursor-pointer hover:opacity-80 transition-opacity" data-tip="Grúa STS-7: Operativa">
                  <path 
                    id="path195-0" 
                    d="m504.16453 480.71288h6.62165l0.2759-5.8859 2.75902 0.092-0.36787 19.681 3.40279-0.092-0.36787-9.28869 8.36902-0.45984 0.092 10.02443h3.77066l-0.64377-33.01624 1.83935-0.18394 0.2759-4.7823h-6.43771l-0.36787 4.7823 2.02328 0.092-0.092 9.93246-8.46098 0.2759-0.18394-2.29918-11.12804 0.2759-1.56344 1.10361z" 
                    style={{ fill: '#00796B', strokeWidth: 0.8, stroke: '#333' }}
                  />
                  <path 
                    id="path196-3" 
                    d="m528.35192 475.65468 7.17345 0.18394 0.45984 1.1036v2.66705l-0.64377 1.47148-1.93132 1.01164-3.40279-0.2759h-1.65541z" 
                    style={{ fill: '#00796B', strokeWidth: 0.5, stroke: '#333' }}
                  />
                  <path 
                    id="path197-1" 
                    d="m527.89208 475.37396 3.59497-5.297 18.16402-0.21621 4.63562 6.16181z" 
                    style={{ fill: '#e53935', strokeWidth: 0.5, stroke: '#333' }}
                  />
                  <path 
                    id="path198-5" 
                    d="m517.22388 476.11452v6.34574l7.35739-0.2759 0.092-6.62165z" 
                    style={{ fill: '#f4eed7', strokeWidth: 0.5, stroke: '#333' }}
                  />
                </g>
              </>
            )}

            {/* Zona PA (Terminal de Pasajeros) - Siempre visible */}
            <g id="g192" className="cursor-pointer hover:opacity-80 transition-opacity" data-tip="Terminal de Pasajeros">
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
          </g>
        </svg>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white py-2 px-4 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img src="/api/placeholder/48/48" alt="DP World Logo" className="mr-4" />
            <h1 className="text-xl font-bold">Terminal Operation System</h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Clock size={20} />
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar size={20} />
              <span>{new Date().toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
            </div>
            <div className="border-l pl-6 flex items-center space-x-2">
              <User size={20} />
              <span>Juan Martínez</span>
              <span className="bg-blue-700 text-xs px-2 py-0.5 rounded-full">Operador</span>
            </div>
            <Settings size={20} className="cursor-pointer" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`bg-gray-800 text-white transition-all ${isMenuCollapsed ? 'w-16' : 'w-64'} flex flex-col shadow-xl`}>
          {/* Toggle Button */}
          <button onClick={toggleMenu} className="p-3 flex justify-end">
            {isMenuCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>
          
          {/* Sidebar Header */}
          <div className="px-4 py-3 border-b border-gray-700">
            <div className="flex items-center">
              <img src="/api/placeholder/40/40" alt="DP World Logo" className={`rounded-full ${isMenuCollapsed ? '' : 'mr-3'}`} />
              {!isMenuCollapsed && (
                <div>
                  <h2 className="font-bold text-lg">DP World</h2>
                  <p className="text-xs text-gray-400">San Antonio Terminal</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul>
              <li className={`py-2 px-4 ${activeTab === 'operativo' ? 'bg-blue-700' : 'hover:bg-gray-700'} rounded-lg mx-2 mb-1 transition-colors cursor-pointer`} onClick={() => setActiveTab('operativo')}>
                <div className="flex items-center">
                  <Activity size={20} className="flex-shrink-0" />
                  {!isMenuCollapsed && <span className="ml-3">Operativo</span>}
                </div>
              </li>
              <li className={`py-2 px-4 ${activeTab === 'analitico' ? 'bg-blue-700' : 'hover:bg-gray-700'} rounded-lg mx-2 mb-1 transition-colors cursor-pointer`} onClick={() => setActiveTab('analitico')}>
                <div className="flex items-center">
                  <BarChart2 size={20} className="flex-shrink-0" />
                  {!isMenuCollapsed && <span className="ml-3">Analítico</span>}
                </div>
              </li>
              <li className={`py-2 px-4 ${activeTab === 'planificacion' ? 'bg-blue-700' : 'hover:bg-gray-700'} rounded-lg mx-2 mb-1 transition-colors cursor-pointer`} onClick={() => setActiveTab('planificacion')}>
                <div className="flex items-center">
                  <Calendar size={20} className="flex-shrink-0" />
                  {!isMenuCollapsed && <span className="ml-3">Planificación</span>}
                </div>
              </li>
            </ul>
            
            {!isMenuCollapsed && (
              <div className="mt-6 px-4">
                <h3 className="text-xs uppercase text-gray-400 font-bold mb-2">Filtros del Mapa</h3>
                <div className="space-y-1">
                  {Object.keys(filters).map((filter) => (
                    <div key={filter} className="flex items-center text-sm">
                      <button
                        className={`flex items-center py-1 px-2 rounded ${filters[filter] ? 'text-blue-300' : 'text-gray-400'}`}
                        onClick={() => toggleFilter(filter)}
                      >
                        {filters[filter] ? <Eye size={16} className="mr-2" /> : <EyeOff size={16} className="mr-2" />}
                        {filter.replace('show', '')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </nav>
          
          {/* KPIs Section */}
          {!isMenuCollapsed && (
            <div className="border-t border-gray-700 p-4">
              <h3 className="text-xs uppercase text-gray-400 font-bold mb-3">KPIs Críticos</h3>
              
              <div className="space-y-4">
                {/* Gauge Ocupación de Sitio */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">Ocupación de sitio</h4>
                    <div className="flex items-center">
                      <span className="text-xl font-bold">{ocupacionData[ocupacionData.length - 1].value}%</span>
                      <span className="ml-2 text-xs text-green-400 flex items-center">
                        <ArrowUp size={12} className="mr-1" />4%
                      </span>
                    </div>
                  </div>
                  <GaugeChart value={ocupacionData[ocupacionData.length - 1].value} size={60} strokeWidth={6} />
                </div>
                
                {/* Productividad de muelle */}
                <div>
                  <h4 className="text-sm font-semibold">Productividad de muelle</h4>
                  <div className="flex items-center">
                    <span className="text-xl font-bold">{productividadData[productividadData.length - 1].bmph}</span>
                    <span className="text-sm text-gray-400 ml-1">BMPH</span>
                    <span className="ml-2 text-xs text-green-400 flex items-center">
                      <ArrowUp size={12} className="mr-1" />5%
                    </span>
                  </div>
                </div>
                
                {/* Tiempo de ciclo de camión */}
                <div>
                  <h4 className="text-sm font-semibold">Tiempo de ciclo camión</h4>
                  <div className="flex items-center">
                    <span className="text-xl font-bold">{tiempoCamionData[tiempoCamionData.length - 1].tiempo}</span>
                    <span className="text-sm text-gray-400 ml-1">min</span>
                    <span className="ml-2 text-xs text-green-400 flex items-center">
                      <ArrowDown size={12} className="mr-1" />2.4
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Panel */}
        <main className="flex-1 overflow-auto p-4">
          {/* Dashboard Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Vista Operacional - Terminal San Antonio</h2>
              <p className="text-gray-500">Monitoreo en tiempo real de operaciones portuarias</p>
            </div>
            <div className="flex space-x-2">
              <button className="bg-white p-2 rounded-md shadow-sm border border-gray-200">
                <RefreshCw size={20} className="text-gray-600" />
              </button>
              <button className="bg-white p-2 rounded-md shadow-sm border border-gray-200">
                <Maximize2 size={20} className="text-gray-600" />
              </button>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Dashboard Content */}
          <div className="grid grid-cols-12 gap-4">
            {/* Map Panel - 8 columns wide */}
            <div className="col-span-8 bg-white rounded-lg shadow-md p-4 h-full">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg text-gray-800">Mapa de Terminal</h3>
                <div className="flex space-x-1">
                  <button className={`px-3 py-1 rounded text-sm ${activeTab === 'operativo' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setActiveTab('operativo')}>
                    Operativo
                  </button>
                  <button className={`px-3 py-1 rounded text-sm ${activeTab === 'analitico' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setActiveTab('analitico')}>
                    Analítico
                  </button>
                  <button className={`px-3 py-1 rounded text-sm ${activeTab === 'planificacion' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setActiveTab('planificacion')}>
                    Planificación
                  </button>
                </div>
              </div>
              {/* Map Component */}
              <PortMap />
              
              {/* Map Legend */}
              <div className="mt-3 flex flex-wrap items-center text-sm text-gray-600">
                <div className="flex items-center mr-4 mb-1">
                  <span className="inline-block w-3 h-3 bg-green-600 rounded-full mr-1"></span>
                  <span>Disponible (&lt;70%)</span>
                </div>
                <div className="flex items-center mr-4 mb-1">
                  <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>
                  <span>Moderado (70-85%)</span>
                </div>
                <div className="flex items-center mr-4 mb-1">
                  <span className="inline-block w-3 h-3 bg-red-600 rounded-full mr-1"></span>
                  <span>Crítico (&gt;85%)</span>
                </div>
                <div className="flex items-center mr-4 mb-1">
                  <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
                  <span>O'Higgins</span>
                </div>
                <div className="flex items-center mr-4 mb-1">
                  <span className="inline-block w-3 h-3 bg-purple-700 rounded-full mr-1"></span>
                  <span>Espingón</span>
                </div>
                <div className="flex items-center mr-4 mb-1">
                  <span className="inline-block w-3 h-3 bg-teal-600 rounded-full mr-1"></span>
                  <span>Grúas</span>
                </div>
              </div>
            </div>
            
            {/* Right sidebar - 4 columns wide */}
            <div className="col-span-4 space-y-4">
              {/* KPIs */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-bold text-lg text-gray-800 mb-4">KPIs Operativos</h3>
                
                {/* Ocupación */}
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Ocupación de Sitio</span>
                    <span className={`text-sm font-semibold ${getColorForOcupacion(ocupacionData[ocupacionData.length - 1].value) === '#7CB342' ? 'text-green-600' : getColorForOcupacion(ocupacionData[ocupacionData.length - 1].value) === '#FFA000' ? 'text-yellow-600' : 'text-red-600'}`}>
                      {ocupacionData[ocupacionData.length - 1].value}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full" 
                         style={{ width: `${ocupacionData[ocupacionData.length - 1].value}%`, backgroundColor: getColorForOcupacion(ocupacionData[ocupacionData.length - 1].value) }}>
                    </div>
                  </div>
                </div>
                
                {/* Productividad */}
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Productividad de Muelle (BMPH)</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {productividadData[productividadData.length - 1].bmph}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full bg-blue-600" 
                         style={{ width: `${(productividadData[productividadData.length - 1].bmph / 100) * 100}%` }}>
                    </div>
                  </div>
                </div>
                
                {/* Tiempo de ciclo */}
                <div className="mb-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Tiempo de Ciclo Camión (min)</span>
                    <span className="text-sm font-semibold text-green-600">
                      {tiempoCamionData[tiempoCamionData.length - 1].tiempo}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full bg-green-600" 
                         style={{ width: `${(tiempoCamionData[tiempoCamionData.length - 1].tiempo / 60) * 100}%` }}>
                    </div>
                  </div>
                </div>
                
                {/* Ocupación por tipo */}
                <div className="mt-5">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Ocupación de Patio por Tipo</h4>
                  <div className="flex justify-between">
                    {ocupacionPatioData.map((item, index) => (
                      <div key={index} className="text-center">
                        <div className="inline-block w-16 h-16 relative mb-1">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-semibold">{item.value}%</span>
                          </div>
                          <svg className="w-16 h-16 transform -rotate-90">
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              fill="none"
                              stroke="#f3f4f6"
                              strokeWidth="8"
                            />
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              fill="none"
                              stroke={getColorForOcupacion(item.value)}
                              strokeWidth="8"
                              strokeDasharray={`${item.value * 1.76} 176`}
                            />
                          </svg>
                        </div>
                        <p className="text-xs text-gray-600">{item.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Alertas */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg text-gray-800">Alertas Operativas</h3>
                  <span className="bg-red-100 text-red-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                    {alertasData.length} activas
                  </span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {alertasData.map((alerta) => (
                    <div key={alerta.id} className={`p-2 rounded-md border-l-4 ${
                      alerta.tipo === 'Alta' ? 'border-red-500 bg-red-50' : 
                      alerta.tipo === 'Media' ? 'border-yellow-500 bg-yellow-50' : 
                      'border-blue-500 bg-blue-50'
                    }`}>
                      <div className="flex items-start">
                        <AlertTriangle size={18} className={`flex-shrink-0 mr-2 ${
                          alerta.tipo === 'Alta' ? 'text-red-500' : 
                          alerta.tipo === 'Media' ? 'text-yellow-500' : 
                          'text-blue-500'
                        }`} />
                        <div>
                          <div className="flex items-center">
                            <h4 className="text-sm font-semibold">{alerta.titulo}</h4>
                            <span className="ml-2 text-xs text-gray-500">{alerta.tiempo}</span>
                          </div>
                          <p className="text-xs text-gray-600">{alerta.mensaje}</p>
                          <div className="flex items-center mt-1">
<span className={`text-xs px-2 py-0.5 rounded-full ${
  alerta.area === 'Patio' ? 'bg-green-100 text-green-800' :
  alerta.area === 'Gate' ? 'bg-blue-100 text-blue-800' :
  alerta.area === 'Muelle' ? 'bg-purple-100 text-purple-800' :
  alerta.area === 'Equipos' ? 'bg-gray-100 text-gray-800' :
  'bg-indigo-100 text-indigo-800'
}`}>
  {alerta.area}
</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-center">
                  <button className="text-blue-600 text-sm hover:underline font-medium">
                    Ver todas las alertas
                  </button>
                </div>
              </div>
              
              {/* Próximas Naves */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-bold text-lg text-gray-800 mb-3">Próximas Naves</h3>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {navesData.map((nave) => (
                    <div key={nave.id} className="border rounded-md p-2 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-sm">{nave.nombre}</h4>
                          <p className="text-xs text-gray-500">{nave.servicio} | {nave.sitio}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            nave.estado === 'En operación' ? 'bg-green-100 text-green-800' :
                            nave.estado === 'En tránsito' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {nave.estado}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-600">
                        <div className="flex space-x-4">
                          <div>
                            <span>ETA: {nave.eta}</span>
                          </div>
                          <div>
                            <span>ETD: {nave.etd}</span>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">{nave.movs} mov.</span>
                        </div>
                      </div>
                      {nave.estado === 'En operación' && (
                        <div className="mt-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progreso</span>
                            <span>{nave.completado}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-green-600" style={{ width: `${nave.completado}%` }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-center">
                  <button className="text-blue-600 text-sm hover:underline font-medium">
                    Ver todas las naves
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-12 gap-4 mt-4">
            {/* Ocupación Sitio Chart */}
            <div className="col-span-4 bg-white rounded-lg shadow-md p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-3">Tendencia de Ocupación</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={ocupacionData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    fill="#93C5FD" 
                    fillOpacity={0.5} 
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>Última semana</span>
                <div className="flex items-center">
                  <ArrowUp size={16} className="text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+4.2%</span>
                </div>
              </div>
            </div>
            
            {/* Productividad Chart */}
            <div className="col-span-4 bg-white rounded-lg shadow-md p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-3">Productividad</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={productividadData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="bmph" 
                    name="BMPH" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="gmph" 
                    name="GMPH" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>Última semana</span>
                <div className="flex items-center">
                  <ArrowUp size={16} className="text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+5.8%</span>
                </div>
              </div>
            </div>
            
            {/* Tiempo Camión Chart */}
            <div className="col-span-4 bg-white rounded-lg shadow-md p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-3">Tiempo de Ciclo Camión</h3>
              <ResponsiveContainer width="100%" height={200}>
                <ReBarChart
                  data={tiempoCamionData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar 
                    dataKey="tiempo" 
                    name="Minutos" 
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  >
                    {tiempoCamionData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.tiempo > 40 ? '#EF4444' : entry.tiempo > 35 ? '#F59E0B' : '#10B981'} 
                      />
                    ))}
                  </Bar>
                </ReBarChart>
              </ResponsiveContainer>
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>Última semana</span>
                <div className="flex items-center">
                  <ArrowDown size={16} className="text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">-9.8%</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPuerto;