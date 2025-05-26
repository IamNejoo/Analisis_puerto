import type { AlertData } from '../types';

// Datos simulados para alertas
export const alertasData: AlertData[] = [
  { id: 1, titulo: 'Ocupación crítica C6', tipo: 'Alta', tiempo: '10 min', mensaje: 'El bloque C6 ha alcanzado 95% de ocupación', area: 'Patio' },
  { id: 2, titulo: 'Tiempo de espera camiones', tipo: 'Media', tiempo: '25 min', mensaje: 'Aumento en tiempo de espera antepuerto +15 min', area: 'Gate' },
  { id: 3, titulo: 'Cierre por marejadas', tipo: 'Alta', tiempo: '45 min', mensaje: 'Posible cierre de puerto en próximas 2 horas', area: 'Muelle' },
  { id: 4, titulo: 'Retraso nave Eurosal', tipo: 'Media', tiempo: '1h 20m', mensaje: 'Nave retrasada por condiciones climáticas', area: 'Operaciones' },
  { id: 5, titulo: 'Mantenimiento grúa STS-2', tipo: 'Baja', tiempo: '2h 15m', mensaje: 'Mantenimiento preventivo programado', area: 'Equipos' },
];