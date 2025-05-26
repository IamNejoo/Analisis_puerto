import  type{ ShipData } from '../types';

// Datos simulados para naves
export const navesData: ShipData[] = [
  { id: 1, nombre: 'MSC CAROLINA', servicio: 'EUROSAL', eta: '05/21 17:00', etd: '05/22 03:00', sitio: 'S1', movs: 780, estado: 'En tránsito', completado: 0 },
  { id: 2, nombre: 'HAMBURG SÜDD', servicio: 'ASIA-CHILE', eta: '05/21 22:00', etd: '05/22 12:00', sitio: 'S2', movs: 920, estado: 'Programado', completado: 0 },
  { id: 3, nombre: 'MAERSK DANUBE', servicio: 'ANDES', eta: '05/22 06:00', etd: '05/22 18:00', sitio: 'S1', movs: 650, estado: 'Programado', completado: 0 },
  { id: 4, nombre: 'APL TOKYO', servicio: 'AC3', eta: '05/21 09:00', etd: '05/21 23:00', sitio: 'S1', movs: 850, estado: 'En operación', completado: 65 },
  { id: 5, nombre: 'COSCO PACIFIC', servicio: 'ASIA-CHILE', eta: '05/22 14:00', etd: '05/23 06:00', sitio: 'S2', movs: 1200, estado: 'Programado', completado: 0 },
];